import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorOffering,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorOfferingsReturn {
  offerings: VendorOffering[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createOffering: (
    data: VendorOfferingCreateRequest
  ) => Promise<VendorOffering | null>;
  updateOffering: (
    id: string,
    data: VendorOfferingUpdateRequest
  ) => Promise<VendorOffering | null>;
  deleteOffering: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVendorOfferings = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  parentId: string | null,
  parentType: 'location' | 'model',
  options?: { enabled?: boolean }
): UseVendorOfferingsReturn => {
  const [offerings, setOfferings] = useState<VendorOffering[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled =
    options?.enabled !== false && !!token && !!entitySlug && !!parentId;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !parentId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response =
        parentType === 'location'
          ? await client.getVendorLocationOfferings(
              entitySlug!,
              parentId,
              token
            )
          : await client.getVendorModelOfferings(entitySlug!, parentId, token);
      setOfferings(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load offerings');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled, parentId, parentType]);

  const createOffering = useCallback(
    async (
      data: VendorOfferingCreateRequest
    ): Promise<VendorOffering | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorOffering(
          entitySlug!,
          data,
          token
        );
        const offering = response.data ?? null;
        if (offering) setOfferings(prev => [...prev, offering]);
        return offering;
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
    async (
      id: string,
      data: VendorOfferingUpdateRequest
    ): Promise<VendorOffering | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorOffering(
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
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorOffering(entitySlug!, id, token);
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
