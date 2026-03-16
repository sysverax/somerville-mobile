import type { BrandDocument } from '@/src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

type ApiEnvelope<T> = {
  message: string;
  data: T;
  error: {
    code: number;
    detail: string;
    solution: string;
  } | null;
};

type BrandListPayload = {
  brands: BrandDocument[];
  totalBrands: number;
  currentPage: number;
  pageSize: number;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
};

export const brandApi = {
  /**
   * Fetch all brands from the API.
   * Uses a high limit to retrieve all records in one request.
   */
  getAll: async (filters: { page?: number; limit?: number } = {}): Promise<{
    brands: BrandDocument[];
    total: number;
  }> => {
    const params = new URLSearchParams();
    params.append('page', String(filters.page ?? 1));
    params.append('limit', String(filters.limit ?? 100)); // large limit to get all brands

    const response = await fetch(`${API_BASE_URL}/api/brands?${params.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await parseResponse<BrandListPayload>(response);
    return {
      brands: data.brands,
      total: data.totalBrands ?? data.brands.length,
    };
  },

  /**
   * Fetch a single brand by ID.
   */
  getById: async (id: string): Promise<BrandDocument> => {
    const response = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    return parseResponse<BrandDocument>(response);
  },
};
