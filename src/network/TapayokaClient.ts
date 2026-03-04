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
  VendorLocation,
  VendorEquipmentCategory,
  VendorService,
  VendorServiceControl,
  VendorEquipment,
  VendorLocationCreateRequest,
  VendorLocationUpdateRequest,
  VendorEquipmentCategoryCreateRequest,
  VendorEquipmentCategoryUpdateRequest,
  VendorServiceCreateRequest,
  VendorServiceUpdateRequest,
  VendorServiceControlCreateRequest,
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
      `entities/${encodeURIComponent(entitySlug)}/${path}`
    );
  }

  // =========================================================================
  // User
  // =========================================================================

  async getMe(token: FirebaseIdToken): Promise<BaseResponse<UserProfile>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<UserProfile>>(
      buildUrl(this.baseUrl, 'me'),
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
      buildUrl(this.baseUrl, 'entities'),
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

  async getDeviceServices(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Service[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Service[]>>(
      this.entityUrl(entitySlug, `devices/${walletAddress}/services`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get device services');
    }
    return response.data;
  }

  async assignDeviceServices(
    entitySlug: string,
    walletAddress: string,
    data: DeviceServiceAssignRequest,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put(
      this.entityUrl(entitySlug, `devices/${walletAddress}/services`),
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

  async getServices(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Service[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Service[]>>(
      this.entityUrl(entitySlug, 'services'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get services');
    }
    return response.data;
  }

  async getService(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Service>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Service>>(
      this.entityUrl(entitySlug, `services/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get service');
    }
    return response.data;
  }

  async createService(
    entitySlug: string,
    data: ServiceCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Service>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<Service>>(
      this.entityUrl(entitySlug, 'services'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create service');
    }
    return response.data;
  }

  async updateService(
    entitySlug: string,
    id: string,
    data: ServiceUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<Service>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<Service>>(
      this.entityUrl(entitySlug, `services/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update service');
    }
    return response.data;
  }

  async deleteService(
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
      throw handleApiError(response, 'delete service');
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
    const response = await this.networkClient.get<
      BaseResponse<DashboardStats>
    >(this.entityUrl(entitySlug, 'orders/stats'), { headers });
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
    const response = await this.networkClient.get<
      BaseResponse<QrCodeResponse>
    >(this.entityUrl(entitySlug, `qr/${walletAddress}`), { headers });
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

  // =========================================================================
  // Vendor: Locations
  // =========================================================================

  async getVendorLocations(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorLocation[]>>(
      this.entityUrl(entitySlug, 'locations'),
      { headers }
    );
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
    const response = await this.networkClient.post<BaseResponse<VendorLocation>>(
      this.entityUrl(entitySlug, 'locations'),
      data,
      { headers }
    );
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

  async getVendorLocationServices(
    entitySlug: string,
    locationId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorService[]>>(
      this.entityUrl(entitySlug, `locations/${locationId}/services`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor location services');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Equipment Categories
  // =========================================================================

  async getVendorEquipmentCategories(
    entitySlug: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipmentCategory[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorEquipmentCategory[]>
    >(this.entityUrl(entitySlug, 'equipment-categories'), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor equipment categories');
    }
    return response.data;
  }

  async getVendorEquipmentCategory(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipmentCategory>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorEquipmentCategory>
    >(this.entityUrl(entitySlug, `equipment-categories/${id}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor equipment category');
    }
    return response.data;
  }

  async createVendorEquipmentCategory(
    entitySlug: string,
    data: VendorEquipmentCategoryCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipmentCategory>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorEquipmentCategory>
    >(this.entityUrl(entitySlug, 'equipment-categories'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor equipment category');
    }
    return response.data;
  }

  async updateVendorEquipmentCategory(
    entitySlug: string,
    id: string,
    data: VendorEquipmentCategoryUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipmentCategory>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<
      BaseResponse<VendorEquipmentCategory>
    >(this.entityUrl(entitySlug, `equipment-categories/${id}`), data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor equipment category');
    }
    return response.data;
  }

  async deleteVendorEquipmentCategory(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `equipment-categories/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor equipment category');
    }
  }

  async getVendorEquipmentCategoryServices(
    entitySlug: string,
    categoryId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorService[]>>(
      this.entityUrl(entitySlug, `equipment-categories/${categoryId}/services`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor equipment category services');
    }
    return response.data;
  }

  // =========================================================================
  // Vendor: Vendor Services (new model)
  // =========================================================================

  async getVendorService(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorService>>(
      this.entityUrl(entitySlug, `vendor-services/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor service');
    }
    return response.data;
  }

  async createVendorService(
    entitySlug: string,
    data: VendorServiceCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<VendorService>>(
      this.entityUrl(entitySlug, 'vendor-services'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor service');
    }
    return response.data;
  }

  async updateVendorService(
    entitySlug: string,
    id: string,
    data: VendorServiceUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorService>>(
      this.entityUrl(entitySlug, `vendor-services/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor service');
    }
    return response.data;
  }

  async deleteVendorService(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `vendor-services/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor service');
    }
  }

  // =========================================================================
  // Vendor: Service Controls
  // =========================================================================

  async getVendorServiceControls(
    entitySlug: string,
    serviceId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorServiceControl[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorServiceControl[]>
    >(this.entityUrl(entitySlug, `service-controls/service/${serviceId}`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor service controls');
    }
    return response.data;
  }

  async createVendorServiceControl(
    entitySlug: string,
    data: VendorServiceControlCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorServiceControl>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorServiceControl>
    >(this.entityUrl(entitySlug, 'service-controls'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor service control');
    }
    return response.data;
  }

  async updateVendorServiceControl(
    entitySlug: string,
    id: string,
    data: { pinNumber?: number; duration?: number },
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorServiceControl>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<
      BaseResponse<VendorServiceControl>
    >(this.entityUrl(entitySlug, `service-controls/${id}`), data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor service control');
    }
    return response.data;
  }

  async deleteVendorServiceControl(
    entitySlug: string,
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `service-controls/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor service control');
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
