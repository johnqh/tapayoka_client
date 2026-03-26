import { useState, useCallback } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { Order, PiCommand } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export const useAuthorizations = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });

  const createAuthorization = useCallback(
    async (
      orderId: string
    ): Promise<{ order: Order; pi?: PiCommand } | null> => {
      if (!token) return null;
      try {
        setIsLoading(true);
        setError(null);
        const response = await client.createAuthorization({ orderId }, token);
        if (!response.data) return null;
        return { order: response.data, pi: response.pi };
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to create authorization'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const getAuthorization = useCallback(
    async (
      orderId: string
    ): Promise<{ order: Order; pi?: PiCommand } | null> => {
      if (!token) return null;
      try {
        setIsLoading(true);
        setError(null);
        const response = await client.getAuthorization(orderId, token);
        if (!response.data) return null;
        return { order: response.data, pi: response.pi };
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to get authorization'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    createAuthorization,
    getAuthorization,
    clearError,
  };
};
