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
  const client = new TapayokaClient(networkClient, baseUrl);
  const enabled = options?.enabled !== false && !!token;

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      setIsLoading(true); setError(null);
      const data = await client.getServices(token);
      setServices(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally { setIsLoading(false); }
  }, [token, enabled]);

  const createService = useCallback(async (data: ServiceCreateRequest) => {
    try {
      setError(null);
      const svc = await client.createService(data, token);
      setServices(prev => [...prev, svc]);
      return svc;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
      return null;
    }
  }, [token]);

  const updateService = useCallback(async (id: string, data: ServiceUpdateRequest) => {
    try {
      setError(null);
      const updated = await client.updateService(id, data, token);
      setServices(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
      return null;
    }
  }, [token]);

  const deleteService = useCallback(async (id: string) => {
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
