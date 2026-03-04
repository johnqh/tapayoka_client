import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorServiceControl,
  VendorServiceControlCreateRequest,
  VendorServiceControlUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorServiceControlsReturn {
  controls: VendorServiceControl[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createControl: (data: VendorServiceControlCreateRequest) => Promise<VendorServiceControl | null>;
  updateControl: (id: string, data: VendorServiceControlUpdateRequest) => Promise<VendorServiceControl | null>;
  deleteControl: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVendorServiceControls = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  serviceId: string | null,
  options?: { enabled?: boolean }
): UseVendorServiceControlsReturn => {
  const [controls, setControls] = useState<VendorServiceControl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!entitySlug && !!serviceId;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !serviceId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorServiceControls(entitySlug!, serviceId, token);
      setControls(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load service controls');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled, serviceId]);

  const createControl = useCallback(
    async (data: VendorServiceControlCreateRequest): Promise<VendorServiceControl | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorServiceControl(entitySlug!, data, token);
        const control = response.data ?? null;
        if (control) setControls(prev => [...prev, control]);
        return control;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create service control');
        return null;
      }
    },
    [token, entitySlug]
  );

  const updateControl = useCallback(
    async (id: string, data: VendorServiceControlUpdateRequest): Promise<VendorServiceControl | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorServiceControl(entitySlug!, id, data, token);
        const updated = response.data ?? null;
        if (updated) setControls(prev => prev.map(c => (c.id === id ? updated : c)));
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update service control');
        return null;
      }
    },
    [token, entitySlug]
  );

  const deleteControl = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorServiceControl(entitySlug!, id, token);
        setControls(prev => prev.filter(c => c.id !== id));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete service control');
        return false;
      }
    },
    [token, entitySlug]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { controls, isLoading, error, refresh, createControl, updateControl, deleteControl, clearError };
};
