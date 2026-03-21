import { useState, useCallback, useEffect, useRef } from 'react';
import { Category } from '@/types';
import { categoryService } from '@/services/category.service';

export const useCategories = ({ autoFetch = true } = {}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastFilters = useRef<{ brandId?: string; page?: number; limit?: number } | undefined>();

  const refresh = useCallback(async (filters?: { brandId?: string; page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      if (filters !== undefined) lastFilters.current = filters;
      const result = await categoryService.getAll(lastFilters.current);
      setCategories(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to refresh categories:', error);
      setCategories([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refresh().catch(() => {
        setCategories([]);
        setIsLoading(false);
      });
    }
  }, [refresh, autoFetch]);

  const create = useCallback(async (data: { brandId: string; name: string; image: string | null; description: string }) => {
    await categoryService.create(data);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<{ brandId: string; name: string; image: string | null; description: string; isActive: boolean }>) => {
    await categoryService.update(id, data);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await categoryService.delete(id);
    await refresh();
  }, [refresh]);

  const toggleActive = useCallback(async (id: string) => {
    const cat = categoryService.getById(id);
    if (cat) {
      await categoryService.update(id, { isActive: !cat.isActive });
      await refresh();
    }
  }, [refresh]);

  return { categories, total, create, update, remove, toggleActive, refresh, count: categories.length, isLoading };
};
