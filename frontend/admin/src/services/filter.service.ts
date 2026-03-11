import { FilterOptionsResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

type ApiEnvelope<T> = {
  message: string;
  data: T;
  error: any;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
};

export const filterService = {
  getOptions: async (): Promise<FilterOptionsResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/filters/options`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    return parseResponse<FilterOptionsResponse>(response);
  },
};
