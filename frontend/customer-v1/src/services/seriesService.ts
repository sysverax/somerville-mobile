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

const seriesPromiseCache = new Map<string, Promise<Series[]>>();

export const getAllSeries = async (categoryId?: string, brandId?: string): Promise<Series[]> => {
  const key = `${categoryId || ''}-${brandId || ''}`;
  if (seriesPromiseCache.has(key)) return seriesPromiseCache.get(key)!;

  const promise = (async () => {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (brandId) params.append('brandId', brandId);
      params.append('limit', '100');

      const response = await fetch(`${API_BASE_URL}/api/series?${params.toString()}`, {
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
      return rawSeries.map(normalizeSeries);
    } catch (error) {
      console.error('Failed to fetch series from API:', error);
      seriesPromiseCache.delete(key);
      return [];
    }
  })();

  seriesPromiseCache.set(key, promise);
  return promise;
};

export const getActiveSeries = async (categoryId?: string, brandId?: string): Promise<Series[]> => {
  const all = await getAllSeries(categoryId, brandId);
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

export const getSeriesByCategory = async (categoryId: string): Promise<Series[]> => {
  return getActiveSeries(categoryId);
};

export const getSeriesByBrand = async (brandId: string): Promise<Series[]> => {
  return getActiveSeries(undefined, brandId);
};

export const searchSeries = async (query: string): Promise<Series[]> => {
  const all = await getActiveSeries();
  const lowerQuery = query.toLowerCase();
  return all.filter(s =>
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery)
  );
};
