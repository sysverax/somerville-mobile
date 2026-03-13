import { useState, useCallback, useEffect, useRef } from 'react';
import { Series } from '@/types';
import { seriesService } from '@/services/series.service';

export const useSeriesData = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastFilters = useRef<{ brandId?: string; categoryId?: string; page?: number; limit?: number } | undefined>();

  const refresh = useCallback(async (filters?: { brandId?: string; categoryId?: string; page?: number; limit?: number }) => {
    try {
      if (filters !== undefined) lastFilters.current = filters;
      const result = await seriesService.getAll(lastFilters.current);
      setSeriesList(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to refresh series:', error);
      setSeriesList([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {
      setSeriesList([]);
      setIsLoading(false);
    });
  }, [refresh]);

  const create = useCallback(async (data: { categoryId: string; brandId: string; name: string; image: string | null; description: string }) => {
    await seriesService.create(data);
    await refresh();
  }, [refresh]);

  const update = useCallback(async (id: string, data: Partial<{ categoryId: string; brandId: string; name: string; image: string | null; description: string; isActive: boolean }>) => {
    await seriesService.update(id, data);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await seriesService.delete(id);
    await refresh();
  }, [refresh]);

  const toggleActive = useCallback(async (id: string) => {
    const s = seriesService.getById(id);
    if (s) {
      await seriesService.update(id, { isActive: !s.isActive });
      await refresh();
    }
  }, [refresh]);

  return { seriesList, total, create, update, remove, toggleActive, refresh, count: seriesList.length, isLoading };
};
