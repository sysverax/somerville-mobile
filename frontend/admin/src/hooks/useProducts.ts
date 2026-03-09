import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/product.service';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const refresh = useCallback(async () => {
    const allProducts = await productService.getAll();
    setProducts(allProducts);
  }, []);

  useEffect(() => {
    refresh().catch(() => setProducts([]));
  }, [refresh]);

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

  return { products, create, update, remove, toggleActive, refresh, count: products.length };
};
