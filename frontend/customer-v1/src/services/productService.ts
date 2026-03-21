import type { Product, ProductDocument } from '@/src/types';
import { getSeriesById } from './seriesService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const normalizeProduct = (product: any): Product => {
  return {
    id: product.id,
    seriesId: product.series?.id || product.seriesId || '',
    categoryId: product.category?.id || product.categoryId || '',
    brandId: product.brand?.id || product.brandId || '',
    name: product.name,
    description: product.description,
    specifications: {},
    iconImage: product.imageUrl || '/mock-images/default/placeholder.png',
    galleryImages: product.imageUrl ? [product.imageUrl] : [],
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    imageUrl: product.imageUrl,
  };
};

const productsPromiseCache = new Map<string, Promise<Product[]>>();

export const getAllProducts = async (
  seriesId?: string, 
  categoryId?: string, 
  brandId?: string,
  search?: string
): Promise<Product[]> => {
  const key = `${seriesId || ''}-${categoryId || ''}-${brandId || ''}-${search || ''}`;
  if (productsPromiseCache.has(key)) return productsPromiseCache.get(key)!;

  const promise = (async () => {
    try {
      const params = new URLSearchParams();
      if (seriesId) params.append('seriesId', seriesId);
      if (categoryId) params.append('categoryId', categoryId);
      if (brandId) params.append('brandId', brandId);
      if (search) params.append('search', search);
      params.append('limit', '100');

      const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`, {
        headers: {
          'x-user-role': 'public',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const rawProducts: ProductDocument[] = json.data?.products || [];
      return rawProducts.map(normalizeProduct);
    } catch (error) {
      console.error('Failed to fetch products from API:', error);
      productsPromiseCache.delete(key);
      return [];
    }
  })();

  productsPromiseCache.set(key, promise);
  return promise;
};

export const getActiveProducts = async (
  seriesId?: string, 
  categoryId?: string, 
  brandId?: string,
  search?: string
): Promise<Product[]> => {
  const all = await getAllProducts(seriesId, categoryId, brandId, search);
  return all.filter(p => p.isActive);
};

const productCache = new Map<string, Promise<Product | undefined>>();

export const getProductById = async (id: string): Promise<Product | undefined> => {
  if (productCache.has(id)) return productCache.get(id)!;

  const promise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        headers: {
          'x-user-role': 'public',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const product: ProductDocument = json.data;
      return product ? normalizeProduct(product) : undefined;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      productCache.delete(id);
      return undefined;
    }
  })();

  productCache.set(id, promise);
  return promise;
};

export const getProductsBySeries = async (seriesId: string): Promise<Product[]> => {
  return getActiveProducts(seriesId);
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  return getActiveProducts(undefined, categoryId);
};

export const getProductsByBrand = async (brandId: string): Promise<Product[]> => {
  return getActiveProducts(undefined, undefined, brandId);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  return getActiveProducts(undefined, undefined, undefined, query);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const all = await getActiveProducts();
  return all.slice(0, 8);
};
