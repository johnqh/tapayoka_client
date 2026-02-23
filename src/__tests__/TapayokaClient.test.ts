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

  describe('vendor device endpoints', () => {
    it('getDevices calls correct URL with auth headers', async () => {
      const result = await client.getDevices(token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/vendor/devices`,
        { headers: expectedHeaders }
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('getDevice calls correct URL', async () => {
      network.get.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
        data: { success: true, data: { walletAddress: '0xabc' } },
      });
      const result = await client.getDevice('0xabc', token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/vendor/devices/0xabc`,
        { headers: expectedHeaders }
      );
      expect(result.data).toEqual({ walletAddress: '0xabc' });
    });

    it('createDevice posts data', async () => {
      const data = { walletAddress: '0xabc', label: 'Test' };
      network.post.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: {},
        success: true,
        data: { success: true, data: { walletAddress: '0xabc', label: 'Test' } },
      });
      await client.createDevice(data as any, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/vendor/devices`,
        data,
        { headers: expectedHeaders }
      );
    });

    it('updateDevice puts data', async () => {
      const data = { label: 'Updated' };
      network.put.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
        data: { success: true, data: { label: 'Updated' } },
      });
      await client.updateDevice('0xabc', data as any, token);
      expect(network.put).toHaveBeenCalledWith(
        `${baseUrl}/vendor/devices/0xabc`,
        data,
        { headers: expectedHeaders }
      );
    });

    it('deleteDevice calls delete', async () => {
      await client.deleteDevice('0xabc', token);
      expect(network.delete).toHaveBeenCalledWith(
        `${baseUrl}/vendor/devices/0xabc`,
        { headers: expectedHeaders }
      );
    });

    it('assignDeviceServices puts service IDs', async () => {
      const data = { serviceIds: ['uuid-1'] };
      network.put.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
      });
      await client.assignDeviceServices('0xabc', data, token);
      expect(network.put).toHaveBeenCalledWith(
        `${baseUrl}/vendor/devices/0xabc/services`,
        data,
        { headers: expectedHeaders }
      );
    });
  });

  describe('vendor service endpoints', () => {
    it('getServices calls correct URL', async () => {
      await client.getServices(token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/vendor/services`,
        { headers: expectedHeaders }
      );
    });

    it('createService posts data', async () => {
      const data = {
        name: 'Wash',
        type: 'FIXED' as const,
        priceCents: 200,
      };
      network.post.mockResolvedValueOnce({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: {},
        success: true,
        data: { success: true, data: { id: 'svc-1', ...data } },
      });
      await client.createService(data as any, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/vendor/services`,
        data,
        { headers: expectedHeaders }
      );
    });

    it('deleteService calls delete', async () => {
      await client.deleteService('svc-1', token);
      expect(network.delete).toHaveBeenCalledWith(
        `${baseUrl}/vendor/services/svc-1`,
        { headers: expectedHeaders }
      );
    });
  });

  describe('vendor orders & analytics', () => {
    it('getOrders uses default limit', async () => {
      await client.getOrders(token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/vendor/orders?limit=50`,
        { headers: expectedHeaders }
      );
    });

    it('getOrders uses custom limit', async () => {
      await client.getOrders(token, 10);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/vendor/orders?limit=10`,
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
      await client.getOrderStats(token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/vendor/orders/stats`,
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
      await client.generateQr('0xabc', token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/vendor/qr/0xabc`,
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
        data: { success: true, data: { device: {}, services: [] } },
      });
      await client.verifyDevice(data, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/buyer/devices/verify`,
        data,
        { headers: expectedHeaders }
      );
    });
  });

  describe('buyer order endpoints', () => {
    it('createOrder posts order data', async () => {
      const data = {
        deviceWalletAddress: '0xabc',
        serviceId: 'svc-1',
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
        `${baseUrl}/buyer/orders`,
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
        `${baseUrl}/buyer/orders/order-1`,
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
        data: { success: true, data: { id: 'order-1', status: 'PAID' } },
      });
      await client.processPayment(data, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/buyer/orders/order-1/pay`,
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
        data: { success: true, data: { authorization: {}, payload: {}, serverSignature: '0x' } },
      });
      await client.createAuthorization(data, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/buyer/authorizations`,
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
        data: { success: true, data: { authorization: {}, payload: {}, serverSignature: '0x' } },
      });
      await client.getAuthorization('order-1', token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/buyer/authorizations/order-1`,
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
        `${baseUrl}/buyer/telemetry`,
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
      await expect(client.getDevices(token)).rejects.toThrow(
        'Failed to get devices'
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
      await expect(client.getDevices(token)).rejects.toThrow(
        'Failed to get devices'
      );
    });
  });
});
