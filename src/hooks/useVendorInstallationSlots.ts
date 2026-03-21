import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorInstallationSlot,
  VendorInstallationSlotCreateRequest,
  VendorInstallationSlotUpdateRequest,
  VendorInstallationSlotBulkCreateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorInstallationSlotsReturn {
  slots: VendorInstallationSlot[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createSlot: (
    data: VendorInstallationSlotCreateRequest
  ) => Promise<VendorInstallationSlot | null>;
  bulkCreateSlots: (
    data: VendorInstallationSlotBulkCreateRequest
  ) => Promise<VendorInstallationSlot[] | null>;
  updateSlot: (
    slotId: string,
    data: VendorInstallationSlotUpdateRequest
  ) => Promise<VendorInstallationSlot | null>;
  deleteSlot: (slotId: string) => Promise<boolean>;
  deleteAllSlots: () => Promise<boolean>;
  clearError: () => void;
}

export const useVendorInstallationSlots = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  installationWalletAddress: string | null,
  options?: { enabled?: boolean }
): UseVendorInstallationSlotsReturn => {
  const [slots, setSlots] = useState<VendorInstallationSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled =
    options?.enabled !== false &&
    !!token &&
    !!entitySlug &&
    !!installationWalletAddress;

  const refresh = useCallback(async () => {
    if (!enabled || !token || !installationWalletAddress) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorInstallationSlots(
        entitySlug!,
        installationWalletAddress,
        token
      );
      setSlots(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load slots');
    } finally {
      setIsLoading(false);
    }
  }, [token, entitySlug, enabled, installationWalletAddress]);

  const createSlot = useCallback(
    async (
      data: VendorInstallationSlotCreateRequest
    ): Promise<VendorInstallationSlot | null> => {
      if (!token || !installationWalletAddress) return null;
      try {
        setError(null);
        const response = await client.createVendorInstallationSlot(
          entitySlug!,
          installationWalletAddress,
          data,
          token
        );
        const slot = response.data ?? null;
        if (slot) setSlots(prev => [...prev, slot]);
        return slot;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to create slot';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug, installationWalletAddress]
  );

  const bulkCreateSlots = useCallback(
    async (
      data: VendorInstallationSlotBulkCreateRequest
    ): Promise<VendorInstallationSlot[] | null> => {
      if (!token || !installationWalletAddress) return null;
      try {
        setError(null);
        const response = await client.bulkCreateVendorInstallationSlots(
          entitySlug!,
          installationWalletAddress,
          data,
          token
        );
        const newSlots = response.data ?? [];
        setSlots(newSlots);
        return newSlots;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to bulk create slots';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug, installationWalletAddress]
  );

  const updateSlot = useCallback(
    async (
      slotId: string,
      data: VendorInstallationSlotUpdateRequest
    ): Promise<VendorInstallationSlot | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorInstallationSlot(
          entitySlug!,
          slotId,
          data,
          token
        );
        const updated = response.data ?? null;
        if (updated)
          setSlots(prev => prev.map(s => (s.id === slotId ? updated : s)));
        return updated;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to update slot';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug]
  );

  const deleteSlot = useCallback(
    async (slotId: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorInstallationSlot(entitySlug!, slotId, token);
        setSlots(prev => prev.filter(s => s.id !== slotId));
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete slot';
        setError(message);
        throw err;
      }
    },
    [token, entitySlug]
  );

  const deleteAllSlots = useCallback(async (): Promise<boolean> => {
    if (!token || !installationWalletAddress) return false;
    try {
      setError(null);
      await client.deleteAllVendorInstallationSlots(
        entitySlug!,
        installationWalletAddress,
        token
      );
      setSlots([]);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete all slots';
      setError(message);
      throw err;
    }
  }, [token, entitySlug, installationWalletAddress]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    slots,
    isLoading,
    error,
    refresh,
    createSlot,
    bulkCreateSlots,
    updateSlot,
    deleteSlot,
    deleteAllSlots,
    clearError,
  };
};
