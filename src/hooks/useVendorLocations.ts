import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorLocation,
  VendorLocationCreateRequest,
  VendorLocationUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorLocationsReturn {
  locations: VendorLocation[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createLocation: (data: VendorLocationCreateRequest) => Promise<VendorLocation | null>;
  updateLocation: (id: string, data: VendorLocationUpdateRequest) => Promise<VendorLocation | null>;
  deleteLocation: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVendorLocations = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
): UseVendorLocationsReturn => {
  const [locations, setLocations] = useState<VendorLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorLocations(token);
      setLocations(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  }, [token, enabled]);

  const createLocation = useCallback(
    async (data: VendorLocationCreateRequest): Promise<VendorLocation | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorLocation(data, token);
        const location = response.data ?? null;
        if (location) setLocations(prev => [...prev, location]);
        return location;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create location');
        return null;
      }
    },
    [token]
  );

  const updateLocation = useCallback(
    async (id: string, data: VendorLocationUpdateRequest): Promise<VendorLocation | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorLocation(id, data, token);
        const updated = response.data ?? null;
        if (updated) setLocations(prev => prev.map(l => (l.id === id ? updated : l)));
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update location');
        return null;
      }
    },
    [token]
  );

  const deleteLocation = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorLocation(id, token);
        setLocations(prev => prev.filter(l => l.id !== id));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete location');
        return false;
      }
    },
    [token]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { locations, isLoading, error, refresh, createLocation, updateLocation, deleteLocation, clearError };
};
