import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TapayokaClient } from '../network/TapayokaClient';

function createMockNetworkClient() {
  const okResponse = (innerData: unknown = {}) => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: {},
    success: true,
    data: { success: true, data: innerData },
  });

  return {
    request: vi.fn().mockResolvedValue(okResponse()),
    get: vi.fn().mockResolvedValue(okResponse([])),
    post: vi.fn().mockResolvedValue(okResponse({})),
    put: vi.fn().mockResolvedValue(okResponse({})),
    delete: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: {},
      success: true,
    }),
  };
}

describe('TapayokaClient', () => {
  let client: TapayokaClient;
  let network: ReturnType<typeof createMockNetworkClient>;
  const baseUrl = 'https://api.example.com';
  const token = 'test-firebase-token';
  const slug = 'my-org';

  const expectedHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  beforeEach(() => {
    network = createMockNetworkClient();
    client = new TapayokaClient({
      networkClient: network as any,
      baseUrl,
    });
  });

  describe('vendor orders & analytics', () => {
    it('getOrders uses default limit', async () => {
      await client.getOrders(slug, token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/orders?limit=50`,
        { headers: expectedHeaders }
      );
    });

    it('getOrders uses custom limit', async () => {
      await client.getOrders(slug, token, 10);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/orders?limit=10`,
        { headers: expectedHeaders }
      );
    });

    it('getOrderStats calls stats endpoint', async () => {
      network.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
        data: { success: true, data: { totalDevices: 0 } },
      });
      await client.getOrderStats(slug, token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/orders/stats`,
        { headers: expectedHeaders }
      );
    });

    it('generateQr calls correct endpoint', async () => {
      network.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
        data: { success: true, data: { qrData: 'svg' } },
      });
      await client.generateQr(slug, '0xabc', token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/qr/0xabc`,
        { headers: expectedHeaders }
      );
    });
  });

  describe('buyer device endpoints', () => {
    it('verifyDevice posts verification data', async () => {
      const data = {
        deviceWalletAddress: '0xabc',
        signedPayload: '{}',
        signature: '0xsig',
      };
      network.post.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
        data: { success: true, data: { device: {}, offerings: [] } },
      });
      await client.verifyDevice(data, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/buyer/devices/verify`,
        data,
        { headers: expectedHeaders }
      );
    });
  });

  describe('buyer order endpoints', () => {
    it('createOrder posts order data', async () => {
      const data = {
        deviceWalletAddress: '0xabc',
        pricingTierId: 'tier-1',
        amountCents: 100,
      };
      network.post.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: {},
        success: true,
        data: { success: true, data: { id: 'order-1' } },
      });
      await client.createOrder(data, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/buyer/orders`,
        data,
        { headers: expectedHeaders }
      );
    });

    it('getOrder fetches by ID', async () => {
      network.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
        data: { success: true, data: { id: 'order-1' } },
      });
      await client.getOrder('order-1', token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/buyer/orders/order-1`,
        { headers: expectedHeaders }
      );
    });

    it('processPayment posts to pay endpoint', async () => {
      const data = { orderId: 'order-1', paymentMethodId: 'pm_test' };
      network.post.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
        data: {
          success: true,
          data: { id: 'order-1', status: 'AUTHORIZED' },
          pi: {
            command: 'EXECUTE',
            data: { orderId: 'order-1' },
            signing: { walletAddress: '0x', message: '{}', signature: '0x' },
          },
        },
      });
      await client.processPayment(data, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/buyer/orders/order-1/pay`,
        data,
        { headers: expectedHeaders }
      );
    });
  });

  describe('buyer authorization endpoints', () => {
    it('createAuthorization posts order ID', async () => {
      const data = { orderId: 'order-1' };
      network.post.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: {},
        success: true,
        data: {
          success: true,
          data: { id: 'auth-1', orderId: 'order-1' },
          pi: {
            command: 'EXECUTE',
            data: {},
            signing: { walletAddress: '0x', message: '{}', signature: '0x' },
          },
        },
      });
      await client.createAuthorization(data, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/buyer/authorizations`,
        data,
        { headers: expectedHeaders }
      );
    });

    it('getAuthorization fetches by order ID', async () => {
      network.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
        data: {
          success: true,
          data: { id: 'auth-1', orderId: 'order-1' },
          pi: {
            command: 'EXECUTE',
            data: {},
            signing: { walletAddress: '0x', message: '{}', signature: '0x' },
          },
        },
      });
      await client.getAuthorization('order-1', token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/buyer/authorizations/order-1`,
        { headers: expectedHeaders }
      );
    });
  });

  describe('buyer telemetry', () => {
    it('reportTelemetry posts event data', async () => {
      const data = {
        deviceWalletAddress: '0xabc',
        direction: 'PI_TO_SRV' as const,
        ok: true,
        details: 'activated',
      };
      await client.reportTelemetry(data, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/buyer/telemetry`,
        data,
        { headers: expectedHeaders }
      );
    });
  });

  describe('error handling', () => {
    it('throws TapayokaApiError on failed response', async () => {
      network.get.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {},
        success: false,
        error: 'Not found',
      });
      await expect(client.getOrders(slug, token)).rejects.toThrow(
        'Failed to get orders'
      );
    });

    it('throws when response data is missing', async () => {
      network.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
        data: null,
      });
      await expect(client.getOrders(slug, token)).rejects.toThrow(
        'Failed to get orders'
      );
    });
  });
});
