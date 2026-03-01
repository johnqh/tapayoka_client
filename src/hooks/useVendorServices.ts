import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorService,
  VendorServiceCreateRequest,
  VendorServiceUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorServicesReturn {
  services: VendorService[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createService: (data: VendorServiceCreateRequest) => Promise<VendorService | null>;
  updateService: (id: string, data: VendorServiceUpdateRequest) => Promise<VendorService | null>;
  deleteService: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVendorServices = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null,
  parentId: string | null,
  parentType: 'location' | 'category',
  options?: { enabled?: boolean }
): UseVendorServicesReturn => {
  const [services, setServices] = useState<VendorService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!parentId;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !parentId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response =
        parentType === 'location'
          ? await client.getVendorLocationServices(parentId, token)
          : await client.getVendorEquipmentCategoryServices(parentId, token);
      setServices(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, [token, enabled, parentId, parentType]);

  const createService = useCallback(
    async (data: VendorServiceCreateRequest): Promise<VendorService | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorService(data, token);
        const service = response.data ?? null;
        if (service) setServices(prev => [...prev, service]);
        return service;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create service');
        return null;
      }
    },
    [token]
  );

  const updateService = useCallback(
    async (id: string, data: VendorServiceUpdateRequest): Promise<VendorService | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorService(id, data, token);
        const updated = response.data ?? null;
        if (updated) setServices(prev => prev.map(s => (s.id === id ? updated : s)));
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update service');
        return null;
      }
    },
    [token]
  );

  const deleteService = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorService(id, token);
        setServices(prev => prev.filter(s => s.id !== id));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete service');
        return false;
      }
    },
    [token]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { services, isLoading, error, refresh, createService, updateService, deleteService, clearError };
};
