import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorModel,
  VendorModelCreateRequest,
  VendorModelUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorModelsReturn {
  models: VendorModel[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createModel: (data: VendorModelCreateRequest) => Promise<VendorModel | null>;
  updateModel: (id: string, data: VendorModelUpdateRequest) => Promise<VendorModel | null>;
  deleteModel: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVendorModels = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
): UseVendorModelsReturn => {
  const [models, setModels] = useState<VendorModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!entitySlug;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorModels(entitySlug!, token);
      setModels(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled]);

  const createModel = useCallback(
    async (data: VendorModelCreateRequest): Promise<VendorModel | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorModel(entitySlug!, data, token);
        const model = response.data ?? null;
        if (model) setModels(prev => [...prev, model]);
        return model;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create model');
        return null;
      }
    },
    [token, entitySlug]
  );

  const updateModel = useCallback(
    async (id: string, data: VendorModelUpdateRequest): Promise<VendorModel | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorModel(entitySlug!, id, data, token);
        const updated = response.data ?? null;
        if (updated) setModels(prev => prev.map(c => (c.id === id ? updated : c)));
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update model');
        return null;
      }
    },
    [token, entitySlug]
  );

  const deleteModel = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorModel(entitySlug!, id, token);
        setModels(prev => prev.filter(c => c.id !== id));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete model');
        return false;
      }
    },
    [token, entitySlug]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { models, isLoading, error, refresh, createModel, updateModel, deleteModel, clearError };
};
