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
  getAll: async (): Promise<Brand[]> => {
    const response = await fetch(`${API_BASE_URL}/api/brands?page=1&limit=100`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    const data = await parseResponse<BrandListPayload>(response);
    brands = data.brands;
    return [...brands].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(normalizeBrand);
  },
  getById: (id: string): Brand | undefined => {
    const brand = brands.find(b => b.id === id);
    return brand ? normalizeBrand(brand) : undefined;
  },
  create: async (data: BrandMutationInput): Promise<Brand> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');

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

    const formData = new FormData();
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);

    if (data.iconImage) {
      const iconFile = await imageValueToFile(data.iconImage, 'brand-icon');
      if (iconFile) {
        formData.append('iconImage', iconFile);
      }
    }

    if (data.bannerImage) {
      const bannerFile = await imageValueToFile(data.bannerImage, 'brand-banner');
      if (bannerFile) {
        formData.append('bannerImage', bannerFile);
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
      method: 'PATCH',
      body: formData,
      credentials: 'include',
    });
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
