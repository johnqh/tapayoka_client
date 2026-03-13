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

  describe('vendor device endpoints', () => {
    it('getDevices calls correct URL with auth headers', async () => {
      const result = await client.getDevices(slug, token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/devices`,
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
      const result = await client.getDevice(slug, '0xabc', token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/devices/0xabc`,
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
      await client.createDevice(slug, data as any, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/devices`,
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
      await client.updateDevice(slug, '0xabc', data as any, token);
      expect(network.put).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/devices/0xabc`,
        data,
        { headers: expectedHeaders }
      );
    });

    it('deleteDevice calls delete', async () => {
      await client.deleteDevice(slug, '0xabc', token);
      expect(network.delete).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/devices/0xabc`,
        { headers: expectedHeaders }
      );
    });

    it('assignDeviceInstallations puts installation IDs', async () => {
      const data = { installationIds: ['uuid-1'] };
      network.put.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {},
        success: true,
      });
      await client.assignDeviceInstallations(slug, '0xabc', data, token);
      expect(network.put).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/devices/0xabc/services`,
        data,
        { headers: expectedHeaders }
      );
    });
  });

  describe('vendor installation endpoints', () => {
    it('getInstallations calls correct URL', async () => {
      await client.getInstallations(slug, token);
      expect(network.get).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/services`,
        { headers: expectedHeaders }
      );
    });

    it('createInstallation posts data', async () => {
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
        data: { success: true, data: { id: 'inst-1', ...data } },
      });
      await client.createInstallation(slug, data as any, token);
      expect(network.post).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/services`,
        data,
        { headers: expectedHeaders }
      );
    });

    it('deleteInstallation calls delete', async () => {
      await client.deleteInstallation(slug, 'inst-1', token);
      expect(network.delete).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/entities/${slug}/services/inst-1`,
        { headers: expectedHeaders }
      );
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
        data: { success: true, data: { device: {}, installations: [] } },
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
        installationId: 'inst-1',
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
        data: { success: true, data: { id: 'order-1', status: 'PAID' } },
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
        data: { success: true, data: { authorization: {}, payload: {}, serverSignature: '0x' } },
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
        data: { success: true, data: { authorization: {}, payload: {}, serverSignature: '0x' } },
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
      await expect(client.getDevices(slug, token)).rejects.toThrow(
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
      await expect(client.getDevices(slug, token)).rejects.toThrow(
        'Failed to get devices'
      );
    });
  });
});
