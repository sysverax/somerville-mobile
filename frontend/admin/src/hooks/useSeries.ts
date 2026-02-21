import { useState, useCallback } from 'react';
import { Series } from '@/types';
import { seriesService } from '@/services/series.service';

export const useSeriesData = () => {
  const [seriesList, setSeriesList] = useState<Series[]>(seriesService.getAll());
  const refresh = useCallback(() => setSeriesList(seriesService.getAll()), []);

  const create = useCallback((data: Omit<Series, 'id' | 'isActive' | 'createdAt'>) => {
    seriesService.create(data);
    refresh();
  }, [refresh]);

  const update = useCallback((id: string, data: Partial<Series>) => {
    seriesService.update(id, data);
    refresh();
  }, [refresh]);

  const remove = useCallback((id: string) => {
    seriesService.delete(id);
    refresh();
  }, [refresh]);

  const toggleActive = useCallback((id: string) => {
    const s = seriesService.getById(id);
    if (s) { seriesService.update(id, { isActive: !s.isActive }); refresh(); }
  }, [refresh]);

  return { seriesList, create, update, remove, toggleActive, refresh, count: seriesList.length };
};
