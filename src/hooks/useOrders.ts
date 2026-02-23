import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type { Order, OrderDetailed, CreateOrderRequest, ProcessPaymentRequest } from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export const useOrders = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
) => {
  const [orders, setOrders] = useState<OrderDetailed[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true); setError(null);
      const response = await client.getOrders(token);
      setOrders(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally { setIsLoading(false); }
  }, [token, enabled]);

  const createOrder = useCallback(async (data: CreateOrderRequest): Promise<Order | null> => {
    if (!token) return null;
    try {
      setError(null);
      const response = await client.createOrder(data, token);
      return response.data ?? null;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      return null;
    }
  }, [token]);

  const processPayment = useCallback(async (data: ProcessPaymentRequest): Promise<Order | null> => {
    if (!token) return null;
    try {
      setError(null);
      const response = await client.processPayment(data, token);
      return response.data ?? null;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
      return null;
    }
  }, [token]);

  const clearError = useCallback(() => setError(null), []);
  useEffect(() => { refresh(); }, [refresh]);

  return { orders, isLoading, error, refresh, createOrder, processPayment, clearError };
};
