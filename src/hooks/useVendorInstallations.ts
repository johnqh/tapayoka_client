import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorInstallation,
  VendorInstallationCreateRequest,
  VendorInstallationUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorInstallationsReturn {
  installations: VendorInstallation[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createInstallation: (data: VendorInstallationCreateRequest) => Promise<VendorInstallation | null>;
  updateInstallation: (id: string, data: VendorInstallationUpdateRequest) => Promise<VendorInstallation | null>;
  deleteInstallation: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVendorInstallations = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  parentId: string | null,
  parentType: 'location' | 'model',
  options?: { enabled?: boolean }
): UseVendorInstallationsReturn => {
  const [installations, setInstallations] = useState<VendorInstallation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!entitySlug && !!parentId;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !parentId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response =
        parentType === 'location'
          ? await client.getVendorLocationInstallations(entitySlug!, parentId, token)
          : await client.getVendorModelInstallations(entitySlug!, parentId, token);
      setInstallations(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load installations');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled, parentId, parentType]);

  const createInstallation = useCallback(
    async (data: VendorInstallationCreateRequest): Promise<VendorInstallation | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorInstallation(entitySlug!, data, token);
        const installation = response.data ?? null;
        if (installation) setInstallations(prev => [...prev, installation]);
        return installation;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create installation');
        return null;
      }
    },
    [token, entitySlug]
  );

  const updateInstallation = useCallback(
    async (id: string, data: VendorInstallationUpdateRequest): Promise<VendorInstallation | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorInstallation(entitySlug!, id, data, token);
        const updated = response.data ?? null;
        if (updated) setInstallations(prev => prev.map(s => (s.id === id ? updated : s)));
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update installation');
        return null;
      }
    },
    [token, entitySlug]
  );

  const deleteInstallation = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorInstallation(entitySlug!, id, token);
        setInstallations(prev => prev.filter(s => s.id !== id));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete installation');
        return false;
      }
    },
    [token, entitySlug]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { installations, isLoading, error, refresh, createInstallation, updateInstallation, deleteInstallation, clearError };
};
