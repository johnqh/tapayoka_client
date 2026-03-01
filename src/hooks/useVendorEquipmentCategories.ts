import { useState, useCallback, useEffect } from 'react';
import type { NetworkClient } from '@sudobility/types';
import type {
  VendorEquipmentCategory,
  VendorEquipmentCategoryCreateRequest,
  VendorEquipmentCategoryUpdateRequest,
} from '@sudobility/tapayoka_types';
import { TapayokaClient } from '../network/TapayokaClient';
import type { FirebaseIdToken } from '../types';

export interface UseVendorEquipmentCategoriesReturn {
  categories: VendorEquipmentCategory[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createCategory: (data: VendorEquipmentCategoryCreateRequest) => Promise<VendorEquipmentCategory | null>;
  updateCategory: (id: string, data: VendorEquipmentCategoryUpdateRequest) => Promise<VendorEquipmentCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useVendorEquipmentCategories = (
  networkClient: NetworkClient,
  baseUrl: string,
  _entitySlug: string | null,
  token: FirebaseIdToken | null,
  options?: { enabled?: boolean }
): UseVendorEquipmentCategoriesReturn => {
  const [categories, setCategories] = useState<VendorEquipmentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = new TapayokaClient({ networkClient, baseUrl });
  const enabled = options?.enabled !== false && !!token;

  const refresh = useCallback(async () => {
    if (!enabled || !token) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await client.getVendorEquipmentCategories(token);
      setCategories(response.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [token, enabled]);

  const createCategory = useCallback(
    async (data: VendorEquipmentCategoryCreateRequest): Promise<VendorEquipmentCategory | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.createVendorEquipmentCategory(data, token);
        const category = response.data ?? null;
        if (category) setCategories(prev => [...prev, category]);
        return category;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create category');
        return null;
      }
    },
    [token]
  );

  const updateCategory = useCallback(
    async (id: string, data: VendorEquipmentCategoryUpdateRequest): Promise<VendorEquipmentCategory | null> => {
      if (!token) return null;
      try {
        setError(null);
        const response = await client.updateVendorEquipmentCategory(id, data, token);
        const updated = response.data ?? null;
        if (updated) setCategories(prev => prev.map(c => (c.id === id ? updated : c)));
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update category');
        return null;
      }
    },
    [token]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<boolean> => {
      if (!token) return false;
      try {
        setError(null);
        await client.deleteVendorEquipmentCategory(id, token);
        setCategories(prev => prev.filter(c => c.id !== id));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete category');
        return false;
      }
    },
    [token]
  );

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { categories, isLoading, error, refresh, createCategory, updateCategory, deleteCategory, clearError };
};
