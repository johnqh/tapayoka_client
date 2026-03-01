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

  // =========================================================================
  // Vendor: Locations
  // =========================================================================

  async getVendorLocations(
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorLocation[]>>(
      buildUrl(this.baseUrl, 'vendor/locations'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor locations');
    }
    return response.data;
  }

  async getVendorLocation(
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorLocation>>(
      buildUrl(this.baseUrl, `vendor/locations/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor location');
    }
    return response.data;
  }

  async createVendorLocation(
    data: VendorLocationCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<VendorLocation>>(
      buildUrl(this.baseUrl, 'vendor/locations'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor location');
    }
    return response.data;
  }

  async updateVendorLocation(
    id: string,
    data: VendorLocationUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorLocation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorLocation>>(
      buildUrl(this.baseUrl, `vendor/locations/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor location');
    }
    return response.data;
  }

  async deleteVendorLocation(
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      buildUrl(this.baseUrl, `vendor/locations/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor location');
    }
  }

  async getVendorLocationServices(
    locationId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorService[]>>(
      buildUrl(this.baseUrl, `vendor/locations/${locationId}/services`),
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
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipmentCategory[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorEquipmentCategory[]>
    >(buildUrl(this.baseUrl, 'vendor/equipment-categories'), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor equipment categories');
    }
    return response.data;
  }

  async getVendorEquipmentCategory(
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipmentCategory>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorEquipmentCategory>
    >(buildUrl(this.baseUrl, `vendor/equipment-categories/${id}`), { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor equipment category');
    }
    return response.data;
  }

  async createVendorEquipmentCategory(
    data: VendorEquipmentCategoryCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipmentCategory>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorEquipmentCategory>
    >(buildUrl(this.baseUrl, 'vendor/equipment-categories'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor equipment category');
    }
    return response.data;
  }

  async updateVendorEquipmentCategory(
    id: string,
    data: VendorEquipmentCategoryUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipmentCategory>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<
      BaseResponse<VendorEquipmentCategory>
    >(buildUrl(this.baseUrl, `vendor/equipment-categories/${id}`), data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor equipment category');
    }
    return response.data;
  }

  async deleteVendorEquipmentCategory(
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      buildUrl(this.baseUrl, `vendor/equipment-categories/${id}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor equipment category');
    }
  }

  async getVendorEquipmentCategoryServices(
    categoryId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorService[]>>(
      buildUrl(
        this.baseUrl,
        `vendor/equipment-categories/${categoryId}/services`
      ),
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
    id: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<VendorService>>(
      buildUrl(this.baseUrl, `vendor/vendor-services/${id}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor service');
    }
    return response.data;
  }

  async createVendorService(
    data: VendorServiceCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<BaseResponse<VendorService>>(
      buildUrl(this.baseUrl, 'vendor/vendor-services'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor service');
    }
    return response.data;
  }

  async updateVendorService(
    id: string,
    data: VendorServiceUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorService>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<BaseResponse<VendorService>>(
      buildUrl(this.baseUrl, `vendor/vendor-services/${id}`),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor service');
    }
    return response.data;
  }

  async deleteVendorService(
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      buildUrl(this.baseUrl, `vendor/vendor-services/${id}`),
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
    serviceId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorServiceControl[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorServiceControl[]>
    >(buildUrl(this.baseUrl, `vendor/service-controls/service/${serviceId}`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor service controls');
    }
    return response.data;
  }

  async createVendorServiceControl(
    data: VendorServiceControlCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorServiceControl>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorServiceControl>
    >(buildUrl(this.baseUrl, 'vendor/service-controls'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor service control');
    }
    return response.data;
  }

  async updateVendorServiceControl(
    id: string,
    data: { pinNumber?: number; duration?: number },
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorServiceControl>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<
      BaseResponse<VendorServiceControl>
    >(buildUrl(this.baseUrl, `vendor/service-controls/${id}`), data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor service control');
    }
    return response.data;
  }

  async deleteVendorServiceControl(
    id: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      buildUrl(this.baseUrl, `vendor/service-controls/${id}`),
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
    serviceId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipment[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorEquipment[]>
    >(buildUrl(this.baseUrl, `vendor/equipments/service/${serviceId}`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor equipments');
    }
    return response.data;
  }

  async createVendorEquipment(
    data: VendorEquipmentCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipment>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorEquipment>
    >(buildUrl(this.baseUrl, 'vendor/equipments'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor equipment');
    }
    return response.data;
  }

  async updateVendorEquipment(
    walletAddress: string,
    data: VendorEquipmentUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorEquipment>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<
      BaseResponse<VendorEquipment>
    >(buildUrl(this.baseUrl, `vendor/equipments/${walletAddress}`), data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor equipment');
    }
    return response.data;
  }

  async deleteVendorEquipment(
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      buildUrl(this.baseUrl, `vendor/equipments/${walletAddress}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor equipment');
    }
  }
}
