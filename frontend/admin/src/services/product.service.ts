import { Product, ProductDocument } from '@/types';
import { mockProducts } from '@/mock-data/products';
import { seriesService } from './series.service';

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

type ProductApiDocument = Omit<ProductDocument, 'seriesId'> & {
  series: {
    id: string;
    name: string;
    isActive: boolean | null;
  };
  category: {
    id: string;
    name: string;
    isActive: boolean | null;
  };
  brand: {
    id: string;
    name: string;
    isActive: boolean | null;
  };
  activeServiceCount: number;
  totalServiceCount: number;
};

type ProductListPayload = {
  products: ProductApiDocument[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
};

type ProductMutationInput = {
  seriesId: string;
  name: string;
  description: string;
  iconImage: string | null;
};

type CachedProductDocument = ProductDocument & {
  brandId?: string;
  categoryId?: string;
  activeServiceCount?: number;
  totalServiceCount?: number;
};

const normalizeProduct = (product: CachedProductDocument): Product => {
  const series = seriesService.getById(product.seriesId);
  return {
    ...product,
    categoryId: product.categoryId ?? series?.categoryId ?? '',
    brandId: product.brandId ?? series?.brandId ?? '',
    iconImage: product.imageUrl ?? '/mock-images/default/placeholder.png',
    specifications: {},
    galleryImages: product.imageUrl ? [product.imageUrl] : [],
  };
};

let products: CachedProductDocument[] = [...mockProducts];

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
};

const mapApiProduct = (product: ProductApiDocument): CachedProductDocument => ({
  id: product.id,
  seriesId: product.series?.id,
  categoryId: product.category?.id,
  brandId: product.brand?.id,
  name: product.name,
  description: product.description,
  imageUrl: product.imageUrl,
  isActive: product.isActive,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  activeServiceCount: product.activeServiceCount,
  totalServiceCount: product.totalServiceCount,
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

export const productService = {
  getAll: async (filters: { brandId?: string; categoryId?: string; seriesId?: string; search?: string; page?: number; limit?: number } = {}): Promise<{ data: Product[]; total: number }> => {
    const params = new URLSearchParams();
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 10));
    if (filters.brandId && filters.brandId !== 'all') params.append('brandId', filters.brandId);
    if (filters.categoryId && filters.categoryId !== 'all') params.append('categoryId', filters.categoryId);
    if (filters.seriesId && filters.seriesId !== 'all') params.append('seriesId', filters.seriesId);
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    const data = await parseResponse<ProductListPayload>(response);
    products = data.products.map(mapApiProduct);
    return {
      data: [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(normalizeProduct),
      total: data.totalProducts || 0
    };
  },
  getBySeries: (seriesId: string): Product[] => products.filter(p => p.seriesId === seriesId).map(normalizeProduct),
  getById: async (id: string): Promise<Product | undefined> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    const data = await parseResponse<ProductApiDocument>(response);
    const mapped = mapApiProduct(data);
    const exists = products.some((p) => p.id === id);
    products = exists ? products.map((p) => (p.id === id ? mapped : p)) : [mapped, ...products];
    return normalizeProduct(mapped);
  },
  create: async (data: ProductMutationInput): Promise<Product> => {
    const formData = new FormData();
    formData.append('body', JSON.stringify({
      seriesId: data.seriesId,
      name: data.name,
      description: data.description || '',
    }));

    const iconFile = data.iconImage ? await imageValueToFile(data.iconImage, 'product-icon') : null;
    if (!iconFile) {
      throw new Error('Product image is required');
    }
    formData.append('iconImage', iconFile);

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const created = await parseResponse<ProductApiDocument>(response);
    const mapped = mapApiProduct(created);
    products = [mapped, ...products];
    return normalizeProduct(mapped);
  },
  update: async (id: string, data: Partial<ProductMutationInput & Pick<Product, 'isActive'>>): Promise<Product> => {
    if (data.isActive !== undefined && Object.keys(data).length === 1) {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: data.isActive }),
      });
      const updated = await parseResponse<ProductApiDocument>(response);
      const mapped = mapApiProduct(updated);
      products = products.map(p => (p.id === id ? mapped : p));
      return normalizeProduct(mapped);
    }

    const payload: any = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    
    let hasFile = false;
    const formData = new FormData();

    if (data.iconImage && data.iconImage.startsWith('data:')) {
      const file = await imageValueToFile(data.iconImage, 'product-icon');
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

    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, fetchOptions);

    const updated = await parseResponse<ProductApiDocument | null>(response);
    if (!updated) {
      const existing = products.find((p) => p.id === id);
      if (!existing) {
        throw new Error('Product update response did not include data');
      }
      return normalizeProduct(existing);
    }

    const mapped = mapApiProduct(updated);
    products = products.map(p => (p.id === id ? mapped : p));
    return normalizeProduct(mapped);
  },
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    await parseResponse<null>(response);
    products = products.filter(p => p.id !== id);
  },
  getCount: (): number => products.length,
};
