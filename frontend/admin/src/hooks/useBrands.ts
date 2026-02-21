import { useState, useCallback } from 'react';
import { Brand } from '@/types';
import { brandService } from '@/services/brand.service';

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>(brandService.getAll());
  const refresh = useCallback(() => setBrands(brandService.getAll()), []);

  const create = useCallback((data: Omit<Brand, 'id' | 'isActive' | 'createdAt'>) => {
    brandService.create(data);
    refresh();
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Brand>) => {
    brandService.update(id, data);
    refresh();
  }, [refresh]);

  const remove = useCallback((id: string) => {
    brandService.delete(id);
    refresh();
  }, [refresh]);

  const toggleActive = useCallback((id: string) => {
    const brand = brandService.getById(id);
    if (brand) { brandService.update(id, { isActive: !brand.isActive }); refresh(); }
  }, [refresh]);

  return { brands, create, update, remove, toggleActive, refresh, count: brands.length };
};
