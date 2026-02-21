import { Series } from '@/types';
import { mockSeries } from '@/mock-data/series';

let seriesList: Series[] = [...mockSeries];

export const seriesService = {
  getAll: (): Series[] => [...seriesList],
  getByCategory: (categoryId: string): Series[] => seriesList.filter(s => s.categoryId === categoryId),
  getById: (id: string): Series | undefined => seriesList.find(s => s.id === id),
  create: (data: Omit<Series, 'id' | 'isActive' | 'createdAt'>): Series => {
    const series: Series = { ...data, id: crypto.randomUUID(), isActive: true, createdAt: new Date().toISOString().split('T')[0] };
    seriesList = [...seriesList, series];
    return series;
  },
  update: (id: string, data: Partial<Series>): Series => {
    seriesList = seriesList.map(s => s.id === id ? { ...s, ...data } : s);
    return seriesList.find(s => s.id === id)!;
  },
  delete: (id: string): void => { seriesList = seriesList.filter(s => s.id !== id); },
  getCount: (): number => seriesList.length,
};
