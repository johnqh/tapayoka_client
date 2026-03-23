import { useState, useCallback } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  BuyerVerifyResponse,
  DeviceVerifyRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export const useBuyerDevices = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null
) => {
  const [deviceInfo, setDeviceInfo] = useState<BuyerVerifyResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });

  const verifyDevice = useCallback(
    async (
      data: DeviceVerifyRequest,
      tz?: string
    ): Promise<BuyerVerifyResponse | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await client.verifyDevice(data, token, tz);
        const result = response.data ?? null;
        setDeviceInfo(result);
        return result;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to verify device'
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const clearError = useCallback(() => setError(null), []);
  const reset = useCallback(() => {
    setDeviceInfo(null);
    setError(null);
  }, []);

  return { deviceInfo, isLoading, error, verifyDevice, clearError, reset };
};
