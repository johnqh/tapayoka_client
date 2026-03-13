import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorInstallationControl,
  VendorInstallationControlCreateRequest,
  VendorInstallationControlUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorInstallationControlsReturn {
  controls: VendorInstallationControl[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createControl: (data: VendorInstallationControlCreateRequest) => Promise<VendorInstallationControl | null>;
  updateControl: (id: string, data: VendorInstallationControlUpdateRequest) => Promise<VendorInstallationControl | null>;
  deleteControl: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVendorInstallationControls = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  installationId: string | null,
  options?: { enabled?: boolean }
): UseVendorInstallationControlsReturn => {
  const [controls, setControls] = useState<VendorInstallationControl[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!entitySlug && !!installationId;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !installationId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorInstallationControls(entitySlug!, installationId, token);
      setControls(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load installation controls');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled, installationId]);

  const createControl = useCallback(
    async (data: VendorInstallationControlCreateRequest): Promise<VendorInstallationControl | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorInstallationControl(entitySlug!, data, token);
        const control = response.data ?? null;
        if (control) setControls(prev => [...prev, control]);
        return control;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create installation control');
        return null;
      }
    },
    [token, entitySlug]
  );

  const updateControl = useCallback(
    async (id: string, data: VendorInstallationControlUpdateRequest): Promise<VendorInstallationControl | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorInstallationControl(entitySlug!, id, data, token);
        const updated = response.data ?? null;
        if (updated) setControls(prev => prev.map(c => (c.id === id ? updated : c)));
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update installation control');
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
        await client.deleteVendorInstallationControl(entitySlug!, id, token);
        setControls(prev => prev.filter(c => c.id !== id));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete installation control');
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
