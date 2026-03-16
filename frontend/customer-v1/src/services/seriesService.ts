import type { Series, SeriesDocument } from '@/src/types';
import { getCategoryById } from './categoryService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const normalizeSeries = (series: any): Series => {
  return {
    id: series.id,
    categoryId: series.category?.id || series.categoryId || '',
    brandId: series.brand?.id || series.brandId || '',
    name: series.name,
    description: series.description,
    isActive: series.isActive,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
    image: series.imageUrl || '/mock-images/default/placeholder.png',
    imageUrl: series.imageUrl,
  };
};

let seriesPromise: Promise<Series[]> | null = null;

export const getAllSeries = async (sortOrder?: 'asc' | 'desc'): Promise<Series[]> => {
  if (seriesPromise) return seriesPromise;

  seriesPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/series${sortOrder ? `?sortOrder=${sortOrder}` : ''}`, {
        headers: {
          'x-user-role': 'public',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const rawSeries: SeriesDocument[] = json.data?.series || [];
      const normalized = rawSeries.map(normalizeSeries);
      return normalized;
    } catch (error) {
      console.error('Failed to fetch series from API:', error);
      seriesPromise = null;
      return [];
    }
  })();

  return seriesPromise;
};

export const getActiveSeries = async (sortOrder?: 'asc' | 'desc'): Promise<Series[]> => {
  const all = await getAllSeries(sortOrder);
  return all.filter(s => s.isActive);
};

const seriesCache = new Map<string, Promise<Series | undefined>>();

export const getSeriesById = async (id: string): Promise<Series | undefined> => {
  if (seriesCache.has(id)) return seriesCache.get(id)!;

  const promise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/series/${id}`, {
        headers: {
          'x-user-role': 'public',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const series: SeriesDocument = json.data;
      return series ? normalizeSeries(series) : undefined;
    } catch (error) {
      console.error(`Failed to fetch series ${id}:`, error);
      seriesCache.delete(id);
      return undefined;
    }
  })();

  seriesCache.set(id, promise);
  return promise;
};

export const getSeriesByCategory = async (categoryId: string, sortOrder?: 'asc' | 'desc'): Promise<Series[]> => {
  const all = await getActiveSeries(sortOrder);
  return all.filter(s => s.categoryId === categoryId);
};

export const getSeriesByBrand = async (brandId: string, sortOrder?: 'asc' | 'desc'): Promise<Series[]> => {
  const all = await getActiveSeries(sortOrder);
  return all.filter(s => s.brandId === brandId);
};

export const searchSeries = async (query: string, sortOrder?: 'asc' | 'desc'): Promise<Series[]> => {
  const all = await getActiveSeries(sortOrder);
  const lowerQuery = query.toLowerCase();
  return all.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery)
  );
};
