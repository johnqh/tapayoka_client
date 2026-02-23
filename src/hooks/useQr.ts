import { useState, useCallback } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { QrCodeResponse } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export const useQr = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null
) => {
  const [qrData, setQrData] = useState<QrCodeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });

  const generateQr = useCallback(async (walletAddress: string): Promise<QrCodeResponse | null> => {
    if (!token) return null;
    try {
      setIsLoading(true); setError(null);
      const response = await client.generateQr(walletAddress, token);
      const data = response.data ?? null;
      setQrData(data);
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR');
      return null;
    } finally { setIsLoading(false); }
  }, [token]);

  const clearError = useCallback(() => setError(null), []);

  return { qrData, isLoading, error, generateQr, clearError };
};
