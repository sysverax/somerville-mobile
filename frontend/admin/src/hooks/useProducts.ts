import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/product.service';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(productService.getAll());
  const refresh = useCallback(() => setProducts(productService.getAll()), []);

  const create = useCallback((data: Omit<Product, 'id' | 'isActive' | 'createdAt'>) => {
    productService.create(data);
    refresh();
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Product>) => {
    productService.update(id, data);
    refresh();
  }, [refresh]);

  const remove = useCallback((id: string) => {
    productService.delete(id);
    refresh();
  }, [refresh]);

  const toggleActive = useCallback((id: string) => {
    const p = productService.getById(id);
    if (p) { productService.update(id, { isActive: !p.isActive }); refresh(); }
  }, [refresh]);

  return { products, create, update, remove, toggleActive, refresh, count: products.length };
};
