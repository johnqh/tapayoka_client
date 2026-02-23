import { useState, useCallback } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { FirebaseIdToken } from '../types';

/** Placeholder - to be integrated with @sudobility/entity_service */
export const useEntities = (
  _networkClient: NetworkClient,
  _baseUrl: string,
  _entitySlug: string | null,
  _token: FirebaseIdToken | null
) => {
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  return { isLoading, error, clearError };
};
