import { useState, useCallback } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { SignedData } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export type ServerSetupPayload = SignedData<{ walletAddress: string }>;

/**
 * Device provisioning: fetch a server-signed SETUP_SERVER payload to forward
 * to a device (so the device stores the server wallet it verifies commands
 * against).
 */
export const useDeviceSetup = (
  networkClient: NetworkClient,
  baseUrl: string,
  token: FirebaseIdToken | null
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });

  const getServerSetupPayload =
    useCallback(async (): Promise<ServerSetupPayload | null> => {
      if (!token) return null;
      try {
        setIsLoading(true);
        setError(null);
        const response = await client.getServerSetupPayload(token);
        return response.data ?? null;
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch server setup payload'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [token]);

  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, getServerSetupPayload, clearError };
};
