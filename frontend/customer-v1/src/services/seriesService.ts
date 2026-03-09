import { seriesList } from '@/src/mock-data/series';
import type { Series, SeriesDocument } from '@/src/types';
import { getCategoryById } from './categoryService';

const normalizeSeries = (series: SeriesDocument): Series => {
  const category = getCategoryById(series.categoryId);
  return {
    id: series.id,
    categoryId: series.categoryId,
    brandId: category?.brandId ?? '',
    name: series.name,
    description: series.description,
    isActive: series.isActive,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
    image: series.imageUrl ?? '/mock-images/default/placeholder.png',
    imageUrl: series.imageUrl,
  };
};

export const getAllSeries = (): Series[] => {
  return seriesList.map(normalizeSeries);
};

export const getActiveSeries = (): Series[] => {
  return seriesList.filter(s => s.isActive).map(normalizeSeries);
};

export const getSeriesById = (id: string): Series | undefined => {
  const series = seriesList.find(s => s.id === id);
  return series ? normalizeSeries(series) : undefined;
};

export const getSeriesByCategory = (categoryId: string): Series[] => {
  return seriesList.filter(s => s.categoryId === categoryId && s.isActive).map(normalizeSeries);
};

export const getSeriesByBrand = (brandId: string): Series[] => {
  return seriesList
    .map(normalizeSeries)
    .filter(s => s.brandId === brandId && s.isActive);
};

export const searchSeries = (query: string): Series[] => {
  const lowerQuery = query.toLowerCase();
  return seriesList.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery)
  ).map(normalizeSeries);
};
