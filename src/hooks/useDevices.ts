import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { Device, DeviceCreateRequest, DeviceUpdateRequest } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseDevicesReturn {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createDevice: (data: DeviceCreateRequest) => Promise<Device | null>;
  updateDevice: (walletAddress: string, data: DeviceUpdateRequest) => Promise<Device | null>;
  deleteDevice: (walletAddress: string) => Promise<boolean>;
  clearError: () => void;
}

export const useDevices = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
): UseDevicesReturn => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getDevices(token);
      setDevices(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, [token, enabled]);

  const createDevice = useCallback(async (data: DeviceCreateRequest): Promise<Device | null> => {
    if (!token) return null;
    try {
      setError(null);
      const response = await client.createDevice(data, token);
      const device = response.data ?? null;
      if (device) setDevices(prev => [...prev, device]);
      return device;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create device');
      return null;
    }
  }, [token]);

  const updateDevice = useCallback(async (walletAddress: string, data: DeviceUpdateRequest): Promise<Device | null> => {
    if (!token) return null;
    try {
      setError(null);
      const response = await client.updateDevice(walletAddress, data, token);
      const updated = response.data ?? null;
      if (updated) setDevices(prev => prev.map(d => d.walletAddress === walletAddress ? updated : d));
      return updated;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update device');
      return null;
    }
  }, [token]);

  const deleteDevice = useCallback(async (walletAddress: string): Promise<boolean> => {
    if (!token) return false;
    try {
      setError(null);
      await client.deleteDevice(walletAddress, token);
      setDevices(prev => prev.filter(d => d.walletAddress !== walletAddress));
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
      return false;
    }
  }, [token]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => { refresh(); }, [refresh]);

  return { devices, isLoading, error, refresh, createDevice, updateDevice, deleteDevice, clearError };
};
