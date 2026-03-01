import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorEquipment,
  VendorEquipmentCreateRequest,
  VendorEquipmentUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorEquipmentsReturn {
  equipments: VendorEquipment[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createEquipment: (data: VendorEquipmentCreateRequest) => Promise<VendorEquipment | null>;
  updateEquipment: (walletAddress: string, data: VendorEquipmentUpdateRequest) => Promise<VendorEquipment | null>;
  deleteEquipment: (walletAddress: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVendorEquipments = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null,
  serviceId: string | null,
  options?: { enabled?: boolean }
): UseVendorEquipmentsReturn => {
  const [equipments, setEquipments] = useState<VendorEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!serviceId;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !serviceId) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorEquipments(serviceId, token);
      setEquipments(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load equipments');
    } finally {
      setIsLoading(false);
    }
  }, [token, enabled, serviceId]);

  const createEquipment = useCallback(
    async (data: VendorEquipmentCreateRequest): Promise<VendorEquipment | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorEquipment(data, token);
        const equipment = response.data ?? null;
        if (equipment) setEquipments(prev => [...prev, equipment]);
        return equipment;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create equipment');
        return null;
      }
    },
    [token]
  );

  const updateEquipment = useCallback(
    async (walletAddress: string, data: VendorEquipmentUpdateRequest): Promise<VendorEquipment | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorEquipment(walletAddress, data, token);
        const updated = response.data ?? null;
        if (updated)
          setEquipments(prev =>
            prev.map(e => (e.walletAddress === walletAddress ? updated : e))
          );
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update equipment');
        return null;
      }
    },
    [token]
  );

  const deleteEquipment = useCallback(
    async (walletAddress: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorEquipment(walletAddress, token);
        setEquipments(prev => prev.filter(e => e.walletAddress !== walletAddress));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete equipment');
        return false;
      }
    },
    [token]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { equipments, isLoading, error, refresh, createEquipment, updateEquipment, deleteEquipment, clearError };
};
