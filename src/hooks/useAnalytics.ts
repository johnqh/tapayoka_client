import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { DashboardStats } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export const useAnalytics = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean; autoRefreshMs?: number }
) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true); setError(null);
      const response = await client.getOrderStats(token);
      setStats(response.data ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally { setIsLoading(false); }
  }, [token, enabled]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!options?.autoRefreshMs || !enabled) return;
    const interval = setInterval(refresh, options.autoRefreshMs);
    return () => clearInterval(interval);
  }, [refresh, options?.autoRefreshMs, enabled]);

  return { stats, isLoading, error, refresh, clearError };
};
