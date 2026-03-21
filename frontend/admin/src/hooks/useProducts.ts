import { useState, useCallback, useEffect, useRef } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/product.service';

export const useProducts = ({ autoFetch = true } = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastFilters = useRef<{ brandId?: string; categoryId?: string; seriesId?: string; page?: number; limit?: number } | undefined>();

  const refresh = useCallback(async (filters?: { brandId?: string; categoryId?: string; seriesId?: string; page?: number; limit?: number }) => {
    try {
      setIsLoading(true);
      if (filters !== undefined) lastFilters.current = filters;
      const result = await productService.getAll(lastFilters.current);
      setProducts(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to refresh products:', error);
      setProducts([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refresh().catch(() => {
        setProducts([]);
        setIsLoading(false);
      });
    }
  }, [refresh, autoFetch]);

  const create = useCallback(async (data: Omit<Product, 'id' | 'isActive' | 'createdAt'>) => {
    await productService.create(data);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<Product>) => {
    await productService.update(id, data);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await productService.delete(id);
    await refresh();
  }, [refresh]);

  const toggleActive = useCallback(async (id: string) => {
    const p = await productService.getById(id);
    if (p) {
      await productService.update(id, { isActive: !p.isActive });
      await refresh();
    }
  }, [refresh]);

  return { products, total, create, update, remove, toggleActive, refresh, count: products.length, isLoading };
};
