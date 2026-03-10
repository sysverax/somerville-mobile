import { useState, useCallback, useEffect } from 'react';
import { Brand } from '@/types';
import { brandService } from '@/services/brand.service';

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const allBrands = await brandService.getAll();
      setBrands(allBrands);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setBrands([]);
      setIsLoading(false);
    });
  }, [refresh]);

  const create = useCallback(async (data: { name: string; description: string; iconImage: string | null; bannerImage?: string | null }) => {
    await brandService.create(data);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<{ name: string; description: string; iconImage: string | null; bannerImage?: string | null; isActive: boolean }>) => {
    await brandService.update(id, data);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await brandService.delete(id);
    await refresh();
  }, [refresh]);

  const toggleActive = useCallback(async (id: string) => {
    const brand = brandService.getById(id);
    if (brand) {
      await brandService.update(id, { isActive: !brand.isActive });
      await refresh();
    }
  }, [refresh]);

  return { brands, create, update, remove, toggleActive, refresh, count: brands.length, isLoading };
};
