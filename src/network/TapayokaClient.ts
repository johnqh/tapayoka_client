import type { NetworkClient, BaseResponse } from '@sudobility/types';
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
import type { FirebaseIdToken } from '../types';
import { buildUrl, createAuthHeaders, handleApiError } from '../utils/index';

export class TapayokaClient {
  private readonly baseUrl: string;
  private readonly networkClient: NetworkClient;

  constructor(config: { networkClient: NetworkClient; baseUrl: string }) {
    this.baseUrl = config.baseUrl;
    this.networkClient = config.networkClient;
  }

  // =========================================================================
  // Vendor: Devices
  // =========================================================================

  async getDevices(token: FirebaseIdToken): Promise<BaseResponse<Device[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Device[]>>(
      buildUrl(this.baseUrl, 'vendor/devices'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get devices');
    }
    return response.data;
  }

  async getDevice(
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Device>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Device>>(
      buildUrl(this.baseUrl, `vendor/devices/${walletAddress}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get device');
    }
    return response.data;
  }

  async createDevice(
    data: DeviceCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Device>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Device>>(
      buildUrl(this.baseUrl, 'vendor/devices'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create device');
    }
    return response.data;
  }

  async updateDevice(
    walletAddress: string,
    data: DeviceUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Device>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<Device>>(
      buildUrl(this.baseUrl, `vendor/devices/${walletAddress}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update device');
    }
    return response.data;
  }

  async deleteDevice(
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      buildUrl(this.baseUrl, `vendor/devices/${walletAddress}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete device');
    }
  }

  async getDeviceServices(
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Service[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Service[]>>(
      buildUrl(this.baseUrl, `vendor/devices/${walletAddress}/services`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get device services');
    }
    return response.data;
  }

  async assignDeviceServices(
    walletAddress: string,
    data: DeviceServiceAssignRequest,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put(
      buildUrl(this.baseUrl, `vendor/devices/${walletAddress}/services`),
      data,
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'assign device services');
    }
  }

  // =========================================================================
  // Vendor: Services
  // =========================================================================

  async getServices(token: FirebaseIdToken): Promise<BaseResponse<Service[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Service[]>>(
      buildUrl(this.baseUrl, 'vendor/services'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get services');
    }
    return response.data;
  }

  async getService(
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Service>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Service>>(
      buildUrl(this.baseUrl, `vendor/services/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get service');
    }
    return response.data;
  }

  async createService(
    data: ServiceCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Service>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Service>>(
      buildUrl(this.baseUrl, 'vendor/services'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create service');
    }
    return response.data;
  }

  async updateService(
    id: string,
    data: ServiceUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Service>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<Service>>(
      buildUrl(this.baseUrl, `vendor/services/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update service');
    }
    return response.data;
  }

  async deleteService(id: string, token: FirebaseIdToken): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      buildUrl(this.baseUrl, `vendor/services/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete service');
    }
  }

  // =========================================================================
  // Vendor: Orders & Analytics
  // =========================================================================

  async getOrders(
    token: FirebaseIdToken,
    limit = 50
  ): Promise<BaseResponse<OrderDetailed[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<OrderDetailed[]>
    >(buildUrl(this.baseUrl, `vendor/orders?limit=${limit}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get orders');
    }
    return response.data;
  }

  async getOrderStats(
    token: FirebaseIdToken
  ): Promise<BaseResponse<DashboardStats>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<DashboardStats>
    >(buildUrl(this.baseUrl, 'vendor/orders/stats'), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get order stats');
    }
    return response.data;
  }

  async generateQr(
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<QrCodeResponse>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<QrCodeResponse>
    >(buildUrl(this.baseUrl, `vendor/qr/${walletAddress}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'generate QR');
    }
    return response.data;
  }

  // =========================================================================
  // Buyer: Devices
  // =========================================================================

  async verifyDevice(
    data: DeviceVerifyRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DeviceVerifyResponse>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<DeviceVerifyResponse>
    >(buildUrl(this.baseUrl, 'buyer/devices/verify'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'verify device');
    }
    return response.data;
  }

  // =========================================================================
  // Buyer: Orders & Payments
  // =========================================================================

  async createOrder(
    data: CreateOrderRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Order>>(
      buildUrl(this.baseUrl, 'buyer/orders'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create order');
    }
    return response.data;
  }

  async getOrder(
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Order>>(
      buildUrl(this.baseUrl, `buyer/orders/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get order');
    }
    return response.data;
  }

  async processPayment(
    data: ProcessPaymentRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Order>>(
      buildUrl(this.baseUrl, `buyer/orders/${data.orderId}/pay`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'process payment');
    }
    return response.data;
  }

  // =========================================================================
  // Buyer: Authorizations
  // =========================================================================

  async createAuthorization(
    data: CreateAuthorizationRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<AuthorizationResponse>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<AuthorizationResponse>
    >(buildUrl(this.baseUrl, 'buyer/authorizations'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create authorization');
    }
    return response.data;
  }

  async getAuthorization(
    orderId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<AuthorizationResponse>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<AuthorizationResponse>
    >(buildUrl(this.baseUrl, `buyer/authorizations/${orderId}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get authorization');
    }
    return response.data;
  }

  // =========================================================================
  // Buyer: Telemetry
  // =========================================================================

  async reportTelemetry(
    data: TelemetryEventRequest,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post(
      buildUrl(this.baseUrl, 'buyer/telemetry'),
      data,
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'report telemetry');
    }
  }
}
