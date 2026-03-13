import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { Installation, InstallationCreateRequest, InstallationUpdateRequest } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export const useInstallations = (
  networkClient: NetworkClient,
  baseUrl: string,
  entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
) => {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token && !!entitySlug;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true); setError(null);
      const response = await client.getInstallations(entitySlug!, token);
      setInstallations(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load installations');
    } finally { setIsLoading(false); }
  }, [token, entitySlug, enabled]);

  const createInstallation = useCallback(async (data: InstallationCreateRequest) => {
    if (!token) return null;
    try {
      setError(null);
      const response = await client.createInstallation(entitySlug!, data, token);
      const inst = response.data ?? null;
      if (inst) setInstallations(prev => [...prev, inst]);
      return inst;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create installation');
      return null;
    }
  }, [token, entitySlug]);

  const updateInstallation = useCallback(async (id: string, data: InstallationUpdateRequest) => {
    if (!token) return null;
    try {
      setError(null);
      const response = await client.updateInstallation(entitySlug!, id, data, token);
      const updated = response.data ?? null;
      if (updated) setInstallations(prev => prev.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update installation');
      return null;
    }
  }, [token, entitySlug]);

  const deleteInstallation = useCallback(async (id: string) => {
    if (!token) return false;
    try {
      setError(null);
      await client.deleteInstallation(entitySlug!, id, token);
      setInstallations(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete installation');
      return false;
    }
  }, [token, entitySlug]);

  const clearError = useCallback(() => setError(null), []);
  useEffect(() => { refresh(); }, [refresh]);

  return { installations, isLoading, error, refresh, createInstallation, updateInstallation, deleteInstallation, clearError };
};
