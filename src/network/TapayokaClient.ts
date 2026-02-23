import type { NetworkClient } from '@sudobility/types';
import type {
  Device,
  Service,
  Order,
  DeviceVerifyResponse,
  AuthorizationResponse,
  DashboardStats,
  OrderDetailed,
  QrCodeResponse,
  DeviceCreateRequest,
  DeviceUpdateRequest,
  ServiceCreateRequest,
  ServiceUpdateRequest,
  DeviceVerifyRequest,
  CreateOrderRequest,
  ProcessPaymentRequest,
  CreateAuthorizationRequest,
  TelemetryEventRequest,
  DeviceServiceAssignRequest,
} from '@sudobility/tapayoka_types';

function authHeaders(token: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class TapayokaClient {
  constructor(
    private networkClient: NetworkClient,
    private baseUrl: string
  ) {}

  private url(path: string, entitySlug?: string | null): string {
    const prefix = entitySlug ? `${this.baseUrl}/${entitySlug}` : this.baseUrl;
    return `${prefix}${path}`;
  }

  // =========================================================================
  // Vendor: Devices
  // =========================================================================

  async getDevices(token: string | null): Promise<Device[]> {
    const res = await this.networkClient.get(this.url('/vendor/devices'), {
      headers: authHeaders(token),
    });
    return res.data;
  }

  async getDevice(walletAddress: string, token: string | null): Promise<Device> {
    const res = await this.networkClient.get(
      this.url(`/vendor/devices/${walletAddress}`),
      { headers: authHeaders(token) }
    );
    return res.data;
  }

  async createDevice(data: DeviceCreateRequest, token: string | null): Promise<Device> {
    const res = await this.networkClient.post(this.url('/vendor/devices'), data, {
      headers: authHeaders(token),
    });
    return res.data;
  }

  async updateDevice(
    walletAddress: string,
    data: DeviceUpdateRequest,
    token: string | null
  ): Promise<Device> {
    const res = await this.networkClient.put(
      this.url(`/vendor/devices/${walletAddress}`),
      data,
      { headers: authHeaders(token) }
    );
    return res.data;
  }

  async deleteDevice(walletAddress: string, token: string | null): Promise<void> {
    await this.networkClient.delete(this.url(`/vendor/devices/${walletAddress}`), {
      headers: authHeaders(token),
    });
  }

  async getDeviceServices(walletAddress: string, token: string | null): Promise<Service[]> {
    const res = await this.networkClient.get(
      this.url(`/vendor/devices/${walletAddress}/services`),
      { headers: authHeaders(token) }
    );
    return res.data;
  }

  async assignDeviceServices(
    walletAddress: string,
    data: DeviceServiceAssignRequest,
    token: string | null
  ): Promise<void> {
    await this.networkClient.put(
      this.url(`/vendor/devices/${walletAddress}/services`),
      data,
      { headers: authHeaders(token) }
    );
  }

  // =========================================================================
  // Vendor: Services
  // =========================================================================

  async getServices(token: string | null): Promise<Service[]> {
    const res = await this.networkClient.get(this.url('/vendor/services'), {
      headers: authHeaders(token),
    });
    return res.data;
  }

  async getService(id: string, token: string | null): Promise<Service> {
    const res = await this.networkClient.get(this.url(`/vendor/services/${id}`), {
      headers: authHeaders(token),
    });
    return res.data;
  }

  async createService(data: ServiceCreateRequest, token: string | null): Promise<Service> {
    const res = await this.networkClient.post(this.url('/vendor/services'), data, {
      headers: authHeaders(token),
    });
    return res.data;
  }

  async updateService(
    id: string,
    data: ServiceUpdateRequest,
    token: string | null
  ): Promise<Service> {
    const res = await this.networkClient.put(this.url(`/vendor/services/${id}`), data, {
      headers: authHeaders(token),
    });
    return res.data;
  }

  async deleteService(id: string, token: string | null): Promise<void> {
    await this.networkClient.delete(this.url(`/vendor/services/${id}`), {
      headers: authHeaders(token),
    });
  }

  // =========================================================================
  // Vendor: Orders & Analytics
  // =========================================================================

  async getOrders(token: string | null, limit = 50): Promise<OrderDetailed[]> {
    const res = await this.networkClient.get(
      this.url(`/vendor/orders?limit=${limit}`),
      { headers: authHeaders(token) }
    );
    return res.data;
  }

  async getOrderStats(token: string | null): Promise<DashboardStats> {
    const res = await this.networkClient.get(this.url('/vendor/orders/stats'), {
      headers: authHeaders(token),
    });
    return res.data;
  }

  async generateQr(walletAddress: string, token: string | null): Promise<QrCodeResponse> {
    const res = await this.networkClient.get(
      this.url(`/vendor/qr/${walletAddress}`),
      { headers: authHeaders(token) }
    );
    return res.data;
  }

  // =========================================================================
  // Buyer: Devices
  // =========================================================================

  async verifyDevice(data: DeviceVerifyRequest, token: string | null): Promise<DeviceVerifyResponse> {
    const res = await this.networkClient.post(this.url('/buyer/devices/verify'), data, {
      headers: authHeaders(token),
    });
    return res.data;
  }

  // =========================================================================
  // Buyer: Orders & Payments
  // =========================================================================

  async createOrder(data: CreateOrderRequest, token: string | null): Promise<Order> {
    const res = await this.networkClient.post(this.url('/buyer/orders'), data, {
      headers: authHeaders(token),
    });
    return res.data;
  }

  async getOrder(id: string, token: string | null): Promise<Order> {
    const res = await this.networkClient.get(this.url(`/buyer/orders/${id}`), {
      headers: authHeaders(token),
    });
    return res.data;
  }

  async processPayment(data: ProcessPaymentRequest, token: string | null): Promise<Order> {
    const res = await this.networkClient.post(
      this.url(`/buyer/orders/${data.orderId}/pay`),
      data,
      { headers: authHeaders(token) }
    );
    return res.data;
  }

  // =========================================================================
  // Buyer: Authorizations
  // =========================================================================

  async createAuthorization(
    data: CreateAuthorizationRequest,
    token: string | null
  ): Promise<AuthorizationResponse> {
    const res = await this.networkClient.post(
      this.url('/buyer/authorizations'),
      data,
      { headers: authHeaders(token) }
    );
    return res.data;
  }

  async getAuthorization(orderId: string, token: string | null): Promise<AuthorizationResponse> {
    const res = await this.networkClient.get(
      this.url(`/buyer/authorizations/${orderId}`),
      { headers: authHeaders(token) }
    );
    return res.data;
  }

  // =========================================================================
  // Buyer: Telemetry
  // =========================================================================

  async reportTelemetry(data: TelemetryEventRequest, token: string | null): Promise<void> {
    await this.networkClient.post(this.url('/buyer/telemetry'), data, {
      headers: authHeaders(token),
    });
  }
}
