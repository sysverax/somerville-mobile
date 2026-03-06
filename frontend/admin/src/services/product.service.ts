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
  getAll: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/api/products?page=1&limit=100`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    const data = await parseResponse<ProductListPayload>(response);
    products = data.products.map(mapApiProduct);
    return [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(normalizeProduct);
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
    formData.append('seriesId', data.seriesId);
    formData.append('name', data.name);
    formData.append('description', data.description || '');

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

    const formData = new FormData();
    if (data.seriesId !== undefined) formData.append('seriesId', data.seriesId);
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.iconImage) {
      const iconFile = await imageValueToFile(data.iconImage, 'product-icon');
      if (iconFile) {
        formData.append('iconImage', iconFile);
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PATCH',
      body: formData,
      credentials: 'include',
    });

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
