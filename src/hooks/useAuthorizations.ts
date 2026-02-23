import { useState, useCallback } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { AuthorizationResponse } from '@sudobility/tapayoka_types';
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
  const client = new TapayokaClient(networkClient, baseUrl);

  const createAuthorization = useCallback(async (orderId: string): Promise<AuthorizationResponse | null> => {
    try {
      setIsLoading(true); setError(null);
      return await client.createAuthorization({ orderId }, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create authorization');
      return null;
    } finally { setIsLoading(false); }
  }, [token]);

  const getAuthorization = useCallback(async (orderId: string): Promise<AuthorizationResponse | null> => {
    try {
      setIsLoading(true); setError(null);
      return await client.getAuthorization(orderId, token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get authorization');
      return null;
    } finally { setIsLoading(false); }
  }, [token]);

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, createAuthorization, getAuthorization, clearError };
};
