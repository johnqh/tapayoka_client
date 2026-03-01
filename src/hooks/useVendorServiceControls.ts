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
  _entitySlug: string | null,
  token: FirebaseIdToken | null,
  serviceId: string | null,
  options?: { enabled?: boolean }
): UseVendorServiceControlsReturn => {
  const [controls, setControls] = useState<VendorServiceControl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!serviceId;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !serviceId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorServiceControls(serviceId, token);
      setControls(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load service controls');
    } finally {
      setIsLoading(false);
    }
  }, [token, enabled, serviceId]);

  const createControl = useCallback(
    async (data: VendorServiceControlCreateRequest): Promise<VendorServiceControl | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorServiceControl(data, token);
        const control = response.data ?? null;
        if (control) setControls(prev => [...prev, control]);
        return control;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create service control');
        return null;
      }
    },
    [token]
  );

  const updateControl = useCallback(
    async (id: string, data: VendorServiceControlUpdateRequest): Promise<VendorServiceControl | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorServiceControl(id, data, token);
        const updated = response.data ?? null;
        if (updated) setControls(prev => prev.map(c => (c.id === id ? updated : c)));
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update service control');
        return null;
      }
    },
    [token]
  );

  const deleteControl = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorServiceControl(id, token);
        setControls(prev => prev.filter(c => c.id !== id));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete service control');
        return false;
      }
    },
    [token]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { controls, isLoading, error, refresh, createControl, updateControl, deleteControl, clearError };
};
