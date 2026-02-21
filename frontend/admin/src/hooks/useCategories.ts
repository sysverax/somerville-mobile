import { useState, useCallback } from 'react';
import { Category } from '@/types';
import { categoryService } from '@/services/category.service';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(categoryService.getAll());
  const refresh = useCallback(() => setCategories(categoryService.getAll()), []);

  const create = useCallback((data: Omit<Category, 'id' | 'isActive' | 'createdAt'>) => {
    categoryService.create(data);
    refresh();
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Category>) => {
    categoryService.update(id, data);
    refresh();
  }, [refresh]);

  const remove = useCallback((id: string) => {
    categoryService.delete(id);
    refresh();
  }, [refresh]);

  const toggleActive = useCallback((id: string) => {
    const cat = categoryService.getById(id);
    if (cat) { categoryService.update(id, { isActive: !cat.isActive }); refresh(); }
  }, [refresh]);

  return { categories, create, update, remove, toggleActive, refresh, count: categories.length };
};
