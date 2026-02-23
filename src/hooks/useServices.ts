import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { Service, ServiceCreateRequest, ServiceUpdateRequest } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export const useServices = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true); setError(null);
      const response = await client.getServices(token);
      setServices(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally { setIsLoading(false); }
  }, [token, enabled]);

  const createService = useCallback(async (data: ServiceCreateRequest) => {
    if (!token) return null;
    try {
      setError(null);
      const response = await client.createService(data, token);
      const svc = response.data ?? null;
      if (svc) setServices(prev => [...prev, svc]);
      return svc;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
      return null;
    }
  }, [token]);

  const updateService = useCallback(async (id: string, data: ServiceUpdateRequest) => {
    if (!token) return null;
    try {
      setError(null);
      const response = await client.updateService(id, data, token);
      const updated = response.data ?? null;
      if (updated) setServices(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
      return null;
    }
  }, [token]);

  const deleteService = useCallback(async (id: string) => {
    if (!token) return false;
    try {
      setError(null);
      await client.deleteService(id, token);
      setServices(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
      return false;
    }
  }, [token]);

  const clearError = useCallback(() => setError(null), []);
  useEffect(() => { refresh(); }, [refresh]);

  return { services, isLoading, error, refresh, createService, updateService, deleteService, clearError };
};
