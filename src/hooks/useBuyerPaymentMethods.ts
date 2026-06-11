import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { PaymentMethod } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export const useBuyerPaymentMethods = (
  networkClient: NetworkClient,
  baseUrl: string,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getPaymentMethods(token);
      setMethods(response.data ?? []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to load payment methods'
      );
    } finally {
      setIsLoading(false);
    }
  }, [token, enabled]);

  const createSetupIntent = useCallback(async (): Promise<string | null> => {
    if (!token) return null;
    try {
      setError(null);
      const response = await client.createPaymentMethodSetupIntent(token);
      return response.data?.clientSecret ?? null;
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to create setup intent'
      );
      return null;
    }
  }, [token]);

  const deleteMethod = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deletePaymentMethod(id, token);
        setMethods(prev => prev.filter(m => m.id !== id));
        return true;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete payment method'
        );
        return false;
      }
    },
    [token]
  );

  const setDefault = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.setDefaultPaymentMethod(id, token);
        setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to set default');
        return false;
      }
    },
    [token]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    methods,
    isLoading,
    error,
    refresh,
    createSetupIntent,
    deleteMethod,
    setDefault,
    clearError,
  };
};
