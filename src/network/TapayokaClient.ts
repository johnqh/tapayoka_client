import type { NetworkClient, BaseResponse } from '@sudobility/types';
import type {
  Order,
  BuyerVerifyResponse,
  DashboardStats,
  OrderDetailed,
  QrCodeResponse,
  DeviceVerifyRequest,
  CreateOrderRequest,
  ProcessPaymentRequest,
  PiApiResponse,
  CreateAuthorizationRequest,
  TelemetryEventRequest,
  VendorLocation,
  VendorModel,
  VendorOffering,
  VendorInstallation,
  VendorLocationCreateRequest,
  VendorLocationUpdateRequest,
  VendorModelCreateRequest,
  VendorModelUpdateRequest,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
  VendorInstallationCreateRequest,
  VendorInstallationUpdateRequest,
  VendorInstallationSlot,
  VendorInstallationSlotCreateRequest,
  VendorInstallationSlotUpdateRequest,
  VendorInstallationSlotBulkCreateRequest,
  UserProfile,
} from '@sudobility/tapayoka_types';
import type { FirebaseIdToken } from '../types';
import {
  buildUrl,
  createAuthHeaders,
  createHeaders,
  handleApiError,
} from '../utils/index';

export class TapayokaClient {
  private readonly baseUrl: string;
  private readonly networkClient: NetworkClient;

  constructor(config: { networkClient: NetworkClient; baseUrl: string }) {
    this.baseUrl = config.baseUrl;
    const nc = config.networkClient;
    /* eslint-disable no-console */
    this.networkClient = {
      request: nc.request.bind(nc),
      get: (async (url: string, options?: unknown) => {
        console.log('[TapayokaClient →] GET', url);
        const res = await nc.get(url, options as never);
        console.log('[TapayokaClient ←] GET', url, res.data);
        return res;
      }) as NetworkClient['get'],
      post: (async (url: string, body?: unknown, options?: unknown) => {
        console.log('[TapayokaClient →] POST', url, body);
        const res = await nc.post(url, body, options as never);
        console.log('[TapayokaClient ←] POST', url, res.data);
        return res;
      }) as NetworkClient['post'],
      put: (async (url: string, body?: unknown, options?: unknown) => {
        console.log('[TapayokaClient →] PUT', url, body);
        const res = await nc.put(url, body, options as never);
        console.log('[TapayokaClient ←] PUT', url, res.data);
        return res;
      }) as NetworkClient['put'],
      delete: (async (url: string, options?: unknown) => {
        console.log('[TapayokaClient →] DELETE', url);
        const res = await nc.delete(url, options as never);
        console.log('[TapayokaClient ←] DELETE', url, res.data);
        return res;
      }) as NetworkClient['delete'],
    };
    /* eslint-enable no-console */
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
    token?: FirebaseIdToken | null,
    tz?: string
  ): Promise<BaseResponse<BuyerVerifyResponse>> {
    const headers = token ? createAuthHeaders(token) : createHeaders();
    const url = tz
      ? buildUrl(
          this.baseUrl,
          `/api/v1/buyer/devices/verify?tz=${encodeURIComponent(tz)}`
        )
      : buildUrl(this.baseUrl, '/api/v1/buyer/devices/verify');
    const response = await this.networkClient.post<
      BaseResponse<BuyerVerifyResponse>
    >(url, data, {
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
  ): Promise<PiApiResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<PiApiResponse<Order>>(
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
  ): Promise<PiApiResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<PiApiResponse<Order>>(
      buildUrl(this.baseUrl, '/api/v1/buyer/authorizations'),
      data,
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create authorization');
    }
    return response.data;
  }

  async getAuthorization(
    orderId: string,
    token: FirebaseIdToken
  ): Promise<PiApiResponse<Order>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<PiApiResponse<Order>>(
      buildUrl(this.baseUrl, `/api/v1/buyer/authorizations/${orderId}`),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get authorization');
    }
    return response.data;
  }

  async getMyOrders(token: FirebaseIdToken): Promise<BaseResponse<Order[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<BaseResponse<Order[]>>(
      buildUrl(this.baseUrl, '/api/v1/buyer/orders'),
      { headers }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get my orders');
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
  // Vendor: Installations
  // =========================================================================

  async getVendorInstallations(
    entitySlug: string,
    serviceId: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorInstallation[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorInstallation[]>
    >(this.entityUrl(entitySlug, `installations/service/${serviceId}`), {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor installations');
    }
    return response.data;
  }

  async createVendorInstallation(
    entitySlug: string,
    data: VendorInstallationCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorInstallation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorInstallation>
    >(this.entityUrl(entitySlug, 'installations'), data, { headers });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor installation');
    }
    return response.data;
  }

  async updateVendorInstallation(
    entitySlug: string,
    walletAddress: string,
    data: VendorInstallationUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorInstallation>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<
      BaseResponse<VendorInstallation>
    >(this.entityUrl(entitySlug, `installations/${walletAddress}`), data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor installation');
    }
    return response.data;
  }

  async deleteVendorInstallation(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `installations/${walletAddress}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor installation');
    }
  }

  // =========================================================================
  // Vendor: Installation Slots
  // =========================================================================

  async getVendorInstallationSlots(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorInstallationSlot[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.get<
      BaseResponse<VendorInstallationSlot[]>
    >(
      this.entityUrl(
        entitySlug,
        `installation-slots/installation/${walletAddress}`
      ),
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'get vendor installation slots');
    }
    return response.data;
  }

  async createVendorInstallationSlot(
    entitySlug: string,
    walletAddress: string,
    data: VendorInstallationSlotCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorInstallationSlot>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorInstallationSlot>
    >(
      this.entityUrl(
        entitySlug,
        `installation-slots/installation/${walletAddress}`
      ),
      data,
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'create vendor installation slot');
    }
    return response.data;
  }

  async bulkCreateVendorInstallationSlots(
    entitySlug: string,
    walletAddress: string,
    data: VendorInstallationSlotBulkCreateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorInstallationSlot[]>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.post<
      BaseResponse<VendorInstallationSlot[]>
    >(
      this.entityUrl(
        entitySlug,
        `installation-slots/installation/${walletAddress}/bulk`
      ),
      data,
      {
        headers,
      }
    );
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'bulk create vendor installation slots');
    }
    return response.data;
  }

  async updateVendorInstallationSlot(
    entitySlug: string,
    slotId: string,
    data: VendorInstallationSlotUpdateRequest,
    token: FirebaseIdToken
  ): Promise<BaseResponse<VendorInstallationSlot>> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.put<
      BaseResponse<VendorInstallationSlot>
    >(this.entityUrl(entitySlug, `installation-slots/${slotId}`), data, {
      headers,
    });
    if (!response.ok || !response.data) {
      throw handleApiError(response, 'update vendor installation slot');
    }
    return response.data;
  }

  async deleteVendorInstallationSlot(
    entitySlug: string,
    slotId: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(entitySlug, `installation-slots/${slotId}`),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete vendor installation slot');
    }
  }

  async deleteAllVendorInstallationSlots(
    entitySlug: string,
    walletAddress: string,
    token: FirebaseIdToken
  ): Promise<void> {
    const headers = createAuthHeaders(token);
    const response = await this.networkClient.delete(
      this.entityUrl(
        entitySlug,
        `installation-slots/installation/${walletAddress}`
      ),
      { headers }
    );
    if (!response.ok) {
      throw handleApiError(response, 'delete all vendor installation slots');
    }
  }
}
