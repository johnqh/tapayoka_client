import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  Offering,
  OfferingCreateRequest,
  OfferingUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export const useOfferings = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
) => {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!entitySlug;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getOfferings(entitySlug!, token);
      setOfferings(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load offerings');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled]);

  const createOffering = useCallback(
    async (data: OfferingCreateRequest) => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createOffering(entitySlug!, data, token);
        const inst = response.data ?? null;
        if (inst) setOfferings(prev => [...prev, inst]);
        return inst;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to create offering'
        );
        return null;
      }
    },
    [token, entitySlug]
  );

  const updateOffering = useCallback(
    async (id: string, data: OfferingUpdateRequest) => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateOffering(
          entitySlug!,
          id,
          data,
          token
        );
        const updated = response.data ?? null;
        if (updated)
          setOfferings(prev => prev.map(s => (s.id === id ? updated : s)));
        return updated;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to update offering'
        );
        return null;
      }
    },
    [token, entitySlug]
  );

  const deleteOffering = useCallback(
    async (id: string) => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteOffering(entitySlug!, id, token);
        setOfferings(prev => prev.filter(s => s.id !== id));
        return true;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete offering'
        );
        return false;
      }
    },
    [token, entitySlug]
  );

  const clearError = useCallback(() => setError(null), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    offerings,
    isLoading,
    error,
    refresh,
    createOffering,
    updateOffering,
    deleteOffering,
    clearError,
  };
};
