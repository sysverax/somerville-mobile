import { seriesList } from '@/src/mock-data/series';
import type { Series } from '@/src/types';

export const getAllSeries = (): Series[] => {
  return seriesList;
};

export const getActiveSeries = (): Series[] => {
  return seriesList.filter(s => s.isActive);
};

export const getSeriesById = (id: string): Series | undefined => {
  return seriesList.find(s => s.id === id);
};

export const getSeriesByCategory = (categoryId: string): Series[] => {
  return seriesList.filter(s => s.categoryId === categoryId && s.isActive);
};

export const getSeriesByBrand = (brandId: string): Series[] => {
  return seriesList.filter(s => s.brandId === brandId && s.isActive);
};

export const searchSeries = (query: string): Series[] => {
  const lowerQuery = query.toLowerCase();
  return seriesList.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery)
  );
};
