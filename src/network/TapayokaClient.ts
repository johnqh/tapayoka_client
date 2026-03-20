import type { NetworkClient, BaseResponse } from '@sudobility/types';
import type {
  Device,
  Offering,
  Order,
  DeviceVerifyResponse,
  AuthorizationResponse,
  DashboardStats,
  OrderDetailed,
  QrCodeResponse,
  DeviceCreateRequest,
  DeviceUpdateRequest,
  OfferingCreateRequest,
  OfferingUpdateRequest,
  DeviceVerifyRequest,
  CreateOrderRequest,
  ProcessPaymentRequest,
  CreateAuthorizationRequest,
  TelemetryEventRequest,
  DeviceOfferingAssignRequest,
  VendorLocation,
  VendorModel,
  VendorOffering,
  VendorEquipment,
  VendorLocationCreateRequest,
  VendorLocationUpdateRequest,
  VendorModelCreateRequest,
  VendorModelUpdateRequest,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
  VendorEquipmentCreateRequest,
  VendorEquipmentUpdateRequest,
  UserProfile,
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

  private entityUrl(entitySlug: string, path: string): string {
    return buildUrl(
      this.baseUrl,
      `/api/v1/entities/${encodeURIComponent(entitySlug)}/${path}`
    );
  }

  // =========================================================================
  // User
  // =========================================================================

  async getMe(token: FirebaseIdToken): Promise<BaseResponse<UserProfile>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<UserProfile>>(
      buildUrl(this.baseUrl, '/api/v1/me'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get me');
    }
    return response.data;
  }

  async acceptTosAndCreateEntity(
    data: { displayName?: string; acceptTos: true },
    token: FirebaseIdToken
  ): Promise<BaseResponse<unknown>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<unknown>>(
      buildUrl(this.baseUrl, '/api/v1/entities'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'accept TOS and create entity');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Devices
  // =========================================================================

  async getDevices(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Device[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Device[]>>(
      this.entityUrl(entitySlug, 'devices'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get devices');
    }
    return response.data;
  }

  async getDevice(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Device>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Device>>(
      this.entityUrl(entitySlug, `devices/${walletAddress}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get device');
    }
    return response.data;
  }

  async createDevice(
    entitySlug: string,
    data: DeviceCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Device>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Device>>(
      this.entityUrl(entitySlug, 'devices'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create device');
    }
    return response.data;
  }

  async updateDevice(
    entitySlug: string,
    walletAddress: string,
    data: DeviceUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Device>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<Device>>(
      this.entityUrl(entitySlug, `devices/${walletAddress}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update device');
    }
    return response.data;
  }

  async deleteDevice(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `devices/${walletAddress}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete device');
    }
  }

  async getDeviceOfferings(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Offering[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Offering[]>>(
      this.entityUrl(entitySlug, `devices/${walletAddress}/services`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get device offerings');
    }
    return response.data;
  }

  async assignDeviceOfferings(
    entitySlug: string,
    walletAddress: string,
    data: DeviceOfferingAssignRequest,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put(
      this.entityUrl(entitySlug, `devices/${walletAddress}/services`),
      data,
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'assign device offerings');
    }
  }

  // =========================================================================
  // Vendor: Offerings
  // =========================================================================

  async getOfferings(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Offering[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Offering[]>>(
      this.entityUrl(entitySlug, 'services'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get offerings');
    }
    return response.data;
  }

  async getOffering(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Offering>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Offering>>(
      this.entityUrl(entitySlug, `services/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get offering');
    }
    return response.data;
  }

  async createOffering(
    entitySlug: string,
    data: OfferingCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Offering>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Offering>>(
      this.entityUrl(entitySlug, 'services'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create offering');
    }
    return response.data;
  }

  async updateOffering(
    entitySlug: string,
    id: string,
    data: OfferingUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Offering>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<Offering>>(
      this.entityUrl(entitySlug, `services/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update offering');
    }
    return response.data;
  }

  async deleteOffering(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `services/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete offering');
    }
  }

  // =========================================================================
  // Vendor: Orders & Analytics
  // =========================================================================

  async getOrders(
    entitySlug: string,
    token: FirebaseIdToken,
    limit = 50
  ): Promise<BaseResponse<OrderDetailed[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<OrderDetailed[]>
    >(this.entityUrl(entitySlug, `orders?limit=${limit}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get orders');
    }
    return response.data;
  }

  async getOrderStats(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<DashboardStats>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<DashboardStats>>(
      this.entityUrl(entitySlug, 'orders/stats'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get order stats');
    }
    return response.data;
  }

  async generateQr(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<QrCodeResponse>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<QrCodeResponse>>(
      this.entityUrl(entitySlug, `qr/${walletAddress}`),
      { headers }
    );
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
    >(buildUrl(this.baseUrl, '/api/v1/buyer/devices/verify'), data, {
      headers,
    });
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
      buildUrl(this.baseUrl, '/api/v1/buyer/orders'),
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
      buildUrl(this.baseUrl, `/api/v1/buyer/orders/${id}`),
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
      buildUrl(this.baseUrl, `/api/v1/buyer/orders/${data.orderId}/pay`),
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
    >(buildUrl(this.baseUrl, '/api/v1/buyer/authorizations'), data, {
      headers,
    });
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
    >(buildUrl(this.baseUrl, `/api/v1/buyer/authorizations/${orderId}`), {
      headers,
    });
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
      buildUrl(this.baseUrl, '/api/v1/buyer/telemetry'),
      data,
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'report telemetry');
    }
  }

  // =========================================================================
  // Vendor: Locations
  // =========================================================================

  async getVendorLocations(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorLocation[]>
    >(this.entityUrl(entitySlug, 'locations'), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor locations');
    }
    return response.data;
  }

  async getVendorLocation(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorLocation>>(
      this.entityUrl(entitySlug, `locations/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor location');
    }
    return response.data;
  }

  async createVendorLocation(
    entitySlug: string,
    data: VendorLocationCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorLocation>
    >(this.entityUrl(entitySlug, 'locations'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor location');
    }
    return response.data;
  }

  async updateVendorLocation(
    entitySlug: string,
    id: string,
    data: VendorLocationUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorLocation>>(
      this.entityUrl(entitySlug, `locations/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor location');
    }
    return response.data;
  }

  async deleteVendorLocation(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `locations/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor location');
    }
  }

  async getVendorLocationOfferings(
    entitySlug: string,
    locationId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorOffering[]>
    >(this.entityUrl(entitySlug, `locations/${locationId}/offerings`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor location offerings');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Models
  // =========================================================================

  async getVendorModels(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorModel[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorModel[]>>(
      this.entityUrl(entitySlug, 'models'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor models');
    }
    return response.data;
  }

  async getVendorModel(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorModel>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorModel>>(
      this.entityUrl(entitySlug, `models/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor model');
    }
    return response.data;
  }

  async createVendorModel(
    entitySlug: string,
    data: VendorModelCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorModel>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<VendorModel>>(
      this.entityUrl(entitySlug, 'models'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor model');
    }
    return response.data;
  }

  async updateVendorModel(
    entitySlug: string,
    id: string,
    data: VendorModelUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorModel>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorModel>>(
      this.entityUrl(entitySlug, `models/${id}`),
      data,
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor model');
    }
    return response.data;
  }

  async deleteVendorModel(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `models/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor model');
    }
  }

  async getVendorModelOfferings(
    entitySlug: string,
    modelId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorOffering[]>
    >(this.entityUrl(entitySlug, `models/${modelId}/offerings`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor model offerings');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Vendor Offerings
  // =========================================================================

  async getVendorOffering(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorOffering>>(
      this.entityUrl(entitySlug, `offerings/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor offering');
    }
    return response.data;
  }

  async createVendorOffering(
    entitySlug: string,
    data: VendorOfferingCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorOffering>
    >(this.entityUrl(entitySlug, 'offerings'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor offering');
    }
    return response.data;
  }

  async updateVendorOffering(
    entitySlug: string,
    id: string,
    data: VendorOfferingUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorOffering>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorOffering>>(
      this.entityUrl(entitySlug, `offerings/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor offering');
    }
    return response.data;
  }

  async deleteVendorOffering(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `offerings/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor offering');
    }
  }

  // =========================================================================
  // Vendor: Equipments
  // =========================================================================

  async getVendorEquipments(
    entitySlug: string,
    serviceId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipment[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorEquipment[]>
    >(this.entityUrl(entitySlug, `equipments/service/${serviceId}`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor equipments');
    }
    return response.data;
  }

  async createVendorEquipment(
    entitySlug: string,
    data: VendorEquipmentCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipment>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorEquipment>
    >(this.entityUrl(entitySlug, 'equipments'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor equipment');
    }
    return response.data;
  }

  async updateVendorEquipment(
    entitySlug: string,
    walletAddress: string,
    data: VendorEquipmentUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipment>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<
      BaseResponse<VendorEquipment>
    >(this.entityUrl(entitySlug, `equipments/${walletAddress}`), data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor equipment');
    }
    return response.data;
  }

  async deleteVendorEquipment(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `equipments/${walletAddress}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor equipment');
    }
  }
}
