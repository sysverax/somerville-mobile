import { Category, CategoryDocument } from '@/types';
import { mockCategories } from '@/mock-data/categories';

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

type CategoryApiDocument = Omit<CategoryDocument, 'brandId'> & {
  brand: {
    id: string;
    name: string;
    isActive: boolean | null;
  };
};

type CategoryListPayload = {
  categories: CategoryApiDocument[];
  totalCategories: number;
  currentPage: number;
  pageSize: number;
};

type CategoryMutationInput = {
  brandId: string;
  name: string;
  description: string;
  image: string | null;
};

const normalizeCategory = (category: CategoryDocument): Category => ({
  ...category,
  image: category.imageUrl ?? '/mock-images/default/placeholder.png',
});

let categories: CategoryDocument[] = [...mockCategories];

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
};

const mapApiCategory = (category: CategoryApiDocument): CategoryDocument => ({
  id: category.id,
  brandId: category.brand?.id,
  name: category.name,
  description: category.description,
  imageUrl: category.imageUrl,
  isActive: category.isActive,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
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

export const categoryService = {
  getAll: async (filters: { brandId?: string; page?: number; limit?: number } = {}): Promise<Category[]> => {
    const params = new URLSearchParams();
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 10));
    if (filters.brandId && filters.brandId !== 'all') {
      params.append('brandId', filters.brandId);
    }

    const response = await fetch(`${API_BASE_URL}/api/categories?${params.toString()}`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    const data = await parseResponse<CategoryListPayload>(response);
    categories = data.categories.map(mapApiCategory);
    return [...categories].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(normalizeCategory);
  },
  getByBrand: (brandId: string): Category[] => categories.filter(c => c.brandId === brandId).map(normalizeCategory),
  getById: (id: string): Category | undefined => {
    const category = categories.find(c => c.id === id);
    return category ? normalizeCategory(category) : undefined;
  },
  create: async (data: CategoryMutationInput): Promise<Category> => {
    const formData = new FormData();
    formData.append('body', JSON.stringify({
      brandId: data.brandId,
      name: data.name,
      description: data.description || '',
    }));

    const iconFile = data.image ? await imageValueToFile(data.image, 'category-icon') : null;
    if (!iconFile) {
      throw new Error('Category image is required');
    }
    formData.append('iconImage', iconFile);

    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const created = await parseResponse<CategoryApiDocument>(response);
    const mapped = mapApiCategory(created);
    categories = [mapped, ...categories];
    return normalizeCategory(mapped);
  },
  update: async (id: string, data: Partial<CategoryMutationInput & Pick<Category, 'isActive'>>): Promise<Category> => {
    if (data.isActive !== undefined && Object.keys(data).length === 1) {
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: data.isActive }),
      });
      const updated = await parseResponse<CategoryApiDocument>(response);
      const mapped = mapApiCategory(updated);
      categories = categories.map(c => (c.id === id ? mapped : c));
      return normalizeCategory(mapped);
    }

    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    
    let hasFile = false;
    const formData = new FormData();

    if (data.image && data.image.startsWith('data:')) {
      const file = await imageValueToFile(data.image, 'category-icon');
      if (file) {
        formData.append('iconImage', file);
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

    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, fetchOptions);
    const updated = await parseResponse<CategoryApiDocument>(response);
    const mapped = mapApiCategory(updated);
    categories = categories.map(c => (c.id === id ? mapped : c));
    return normalizeCategory(mapped);
  },
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await parseResponse<null>(response);
    categories = categories.filter(c => c.id !== id);
  },
  getCount: (): number => categories.length,
};
