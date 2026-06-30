import { useState, useCallback } from 'react';
import type { NetworkClient } from '@sudobility/types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseTosReturn {
  /**
   * Accept the terms of service and create the user's organization entity.
   * Returns true on success; on failure sets `error` and returns false
   * (does not throw).
   */
  acceptTosAndCreateEntity: (
    token: FirebaseIdToken,
    displayName?: string
  ) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Network hook for the terms-of-service acceptance flow. Keeps the
 * `TapayokaClient` instantiation and HTTP call out of the UI layer.
 */
export const useTos = (
  networkClient: NetworkClient,
  baseUrl: string
): UseTosReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptTosAndCreateEntity = useCallback(
    async (token: FirebaseIdToken, displayName?: string): Promise<boolean> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const client = new TapayokaClient({ networkClient, baseUrl });
        await client.acceptTosAndCreateEntity(
          { acceptTos: true, ...(displayName ? { displayName } : {}) },
          token
        );
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to accept terms');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [networkClient, baseUrl]
  );

  const clearError = useCallback(() => setError(null), []);

  return { acceptTosAndCreateEntity, isSubmitting, error, clearError };
};
