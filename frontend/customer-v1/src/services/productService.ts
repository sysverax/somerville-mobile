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

let productsPromise: Promise<Product[]> | null = null;

export const getAllProducts = async (): Promise<Product[]> => {
  if (productsPromise) return productsPromise;

  productsPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
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
      const normalized = rawProducts.map(normalizeProduct);
      return normalized;
    } catch (error) {
      console.error('Failed to fetch products from API:', error);
      productsPromise = null;
      return [];
    }
  })();

  return productsPromise;
};

export const getActiveProducts = async (): Promise<Product[]> => {
  const all = await getAllProducts();
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
  const all = await getActiveProducts();
  return all.filter(p => p.seriesId === seriesId);
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const all = await getActiveProducts();
  return all.filter(p => p.categoryId === categoryId);
};

export const getProductsByBrand = async (brandId: string): Promise<Product[]> => {
  const all = await getActiveProducts();
  return all.filter(p => p.brandId === brandId);
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const all = await getActiveProducts();
  const lowerQuery = query.toLowerCase();
  return all.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  );
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const all = await getActiveProducts();
  return all.slice(0, 8);
};
