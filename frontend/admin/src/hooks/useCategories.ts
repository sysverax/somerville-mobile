import { useState, useCallback, useEffect } from 'react';
import { Category } from '@/types';
import { categoryService } from '@/services/category.service';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (filters?: { brandId?: string; page?: number; limit?: number }) => {
    setIsLoading(true);
    try {
      const allCategories = await categoryService.getAll(filters);
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to refresh categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setCategories([]);
      setIsLoading(false);
    });
  }, [refresh]);

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

  return { categories, create, update, remove, toggleActive, refresh, count: categories.length, isLoading };
};
