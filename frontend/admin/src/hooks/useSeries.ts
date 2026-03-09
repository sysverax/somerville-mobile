import { useState, useCallback, useEffect } from 'react';
import { Series } from '@/types';
import { seriesService } from '@/services/series.service';

export const useSeriesData = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const refresh = useCallback(async () => {
    const allSeries = await seriesService.getAll();
    setSeriesList(allSeries);
  }, []);

  useEffect(() => {
    refresh().catch(() => setSeriesList([]));
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

  return { seriesList, create, update, remove, toggleActive, refresh, count: seriesList.length };
};
