import { Series, SeriesDocument } from '@/types';
import { mockSeries } from '@/mock-data/series';
import { categoryService } from './category.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

type ApiEnvelope<T> = {
  message: string;
  data: T;
  error: {
    code: number;
    detail: string;
    solution: string;
  } | null;
};

type SeriesApiDocument = Omit<SeriesDocument, 'categoryId'> & {
  category: {
    id: string;
    name: string;
    isActive: boolean | null;
  };
  brand?: {
    id: string;
    name: string;
    isActive: boolean | null;
  };
};

type SeriesListPayload = {
  series: SeriesApiDocument[];
  totalSeries: number;
  currentPage: number;
  pageSize: number;
};

type SeriesMutationInput = {
  categoryId: string;
  name: string;
  description: string;
  image: string | null;
};

const normalizeSeries = (series: SeriesDocument): Series => {
  const category = categoryService.getById(series.categoryId);
  return {
    ...series,
    brandId: category?.brandId ?? '',
    image: series.imageUrl ?? '/mock-images/default/placeholder.png',
  };
};

let seriesList: SeriesDocument[] = [...mockSeries];

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
};

const mapApiSeries = (series: SeriesApiDocument): SeriesDocument => ({
  id: series.id,
  categoryId: series.category?.id,
  name: series.name,
  description: series.description,
  imageUrl: series.imageUrl,
  isActive: series.isActive,
  createdAt: series.createdAt,
  updatedAt: series.updatedAt,
});

const imageValueToFile = async (imageValue: string, filename: string): Promise<File | null> => {
  if (!imageValue) return null;
  try {
    const blob = await fetch(imageValue).then((res) => res.blob());
    const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
    return new File([blob], `${filename}.${ext}`, { type: blob.type || 'image/jpeg' });
  } catch {
    return null;
  }
};

export const seriesService = {
  getAll: async (): Promise<Series[]> => {
    const response = await fetch(`${API_BASE_URL}/api/series?page=1&limit=100`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    const data = await parseResponse<SeriesListPayload>(response);
    seriesList = data.series.map(mapApiSeries);
    return [...seriesList].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(normalizeSeries);
  },
  getByCategory: (categoryId: string): Series[] => seriesList.filter(s => s.categoryId === categoryId).map(normalizeSeries),
  getById: (id: string): Series | undefined => {
    const series = seriesList.find(s => s.id === id);
    return series ? normalizeSeries(series) : undefined;
  },
  create: async (data: SeriesMutationInput): Promise<Series> => {
    const formData = new FormData();
    formData.append('categoryId', data.categoryId);
    formData.append('name', data.name);
    formData.append('description', data.description || '');

    const iconFile = data.image ? await imageValueToFile(data.image, 'series-icon') : null;
    if (!iconFile) {
      throw new Error('Series image is required');
    }
    formData.append('iconImage', iconFile);

    const response = await fetch(`${API_BASE_URL}/api/series`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const created = await parseResponse<SeriesApiDocument>(response);
    const mapped = mapApiSeries(created);
    seriesList = [mapped, ...seriesList];
    return normalizeSeries(mapped);
  },
  update: async (id: string, data: Partial<SeriesMutationInput & Pick<Series, 'isActive'>>): Promise<Series> => {
    if (data.isActive !== undefined && Object.keys(data).length === 1) {
      const response = await fetch(`${API_BASE_URL}/api/series/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: data.isActive }),
      });
      const updated = await parseResponse<SeriesApiDocument>(response);
      const mapped = mapApiSeries(updated);
      seriesList = seriesList.map(s => (s.id === id ? mapped : s));
      return normalizeSeries(mapped);
    }

    const formData = new FormData();
    if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId);
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.image) {
      const iconFile = await imageValueToFile(data.image, 'series-icon');
      if (iconFile) {
        formData.append('iconImage', iconFile);
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/series/${id}`, {
      method: 'PATCH',
      body: formData,
      credentials: 'include',
    });
    const updated = await parseResponse<SeriesApiDocument>(response);
    const mapped = mapApiSeries(updated);
    seriesList = seriesList.map(s => (s.id === id ? mapped : s));
    return normalizeSeries(mapped);
  },
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/series/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await parseResponse<null>(response);
    seriesList = seriesList.filter(s => s.id !== id);
  },
  getCount: (): number => seriesList.length,
};
