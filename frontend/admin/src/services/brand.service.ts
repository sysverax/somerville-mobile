import { Brand, BrandDocument } from '@/types';
import { mockBrands } from '@/mock-data/brands';

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

type BrandListPayload = {
  brands: BrandDocument[];
  totalBrands: number;
  currentPage: number;
  pageSize: number;
};

type BrandMutationInput = {
  name: string;
  description: string;
  iconImage: string | null;
  bannerImage?: string | null;
};

const normalizeBrand = (brand: BrandDocument): Brand => ({
  ...brand,
  iconImage: brand.iconImageUrl ?? '/mock-images/default/placeholder.png',
  bannerImage: brand.bannerImageUrl,
});

let brands: BrandDocument[] = [...mockBrands];

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
};

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

export const brandService = {
  getAll: async (filters: { page?: number; limit?: number } = {}): Promise<{ data: Brand[]; total: number }> => {
    const params = new URLSearchParams();
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 10));

    const response = await fetch(`${API_BASE_URL}/api/brands?${params.toString()}`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    const data = await parseResponse<BrandListPayload>(response);
    brands = data.brands;
    return {
      data: [...brands].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(normalizeBrand),
      total: data.totalBrands || 0
    };
  },
  getById: (id: string): Brand | undefined => {
    const brand = brands.find(b => b.id === id);
    return brand ? normalizeBrand(brand) : undefined;
  },
  create: async (data: BrandMutationInput): Promise<Brand> => {
    const formData = new FormData();
    formData.append('body', JSON.stringify({
      name: data.name,
      description: data.description || '',
    }));

    const iconFile = data.iconImage ? await imageValueToFile(data.iconImage, 'brand-icon') : null;
    if (!iconFile) {
      throw new Error('Icon image is required');
    }

    formData.append('iconImage', iconFile);
    formData.append('bannerImage', iconFile);

    const response = await fetch(`${API_BASE_URL}/api/brands`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const created = await parseResponse<BrandDocument>(response);
    brands = [created, ...brands];
    return normalizeBrand(created);
  },
  update: async (id: string, data: Partial<BrandMutationInput & Pick<Brand, 'isActive'>>): Promise<Brand> => {
    if (data.isActive !== undefined && Object.keys(data).length === 1) {
      const response = await fetch(`${API_BASE_URL}/api/brands/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: data.isActive }),
      });
      const updated = await parseResponse<BrandDocument>(response);
      brands = brands.map(b => (b.id === id ? updated : b));
      return normalizeBrand(updated);
    }

    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    
    let hasFile = false;
    const formData = new FormData();

    if (data.iconImage && data.iconImage.startsWith('data:')) {
      const file = await imageValueToFile(data.iconImage, 'brand-icon');
      if (file) {
        formData.append('iconImage', file);
        hasFile = true;
      }
    }

    if (data.bannerImage && data.bannerImage.startsWith('data:')) {
      const file = await imageValueToFile(data.bannerImage, 'brand-banner');
      if (file) {
        formData.append('bannerImage', file);
        hasFile = true;
      }
    }

    let fetchOptions: RequestInit;
    if (hasFile) {
      formData.append('body', JSON.stringify(payload));
      fetchOptions = {
        method: 'PATCH',
        body: formData,
        credentials: 'include',
      };
    } else {
      fetchOptions = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/brands/${id}`, fetchOptions);
    const updated = await parseResponse<BrandDocument>(response);
    brands = brands.map(b => (b.id === id ? updated : b));
    return normalizeBrand(updated);
  },
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await parseResponse<null>(response);
    brands = brands.filter(b => b.id !== id);
  },
  getCount: (): number => brands.length,
};
