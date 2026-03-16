import type { Brand, BrandDocument } from '@/src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const normalizeBrand = (brand: BrandDocument): Brand => ({
  id: brand.id,
  name: brand.name,
  description: brand.description,
  isActive: brand.isActive,
  createdAt: brand.createdAt,
  updatedAt: brand.updatedAt,
  iconImage: brand.iconImageUrl || '/mock-images/default/placeholder.png',
  mainImage: brand.bannerImageUrl || brand.iconImageUrl || '/mock-images/default/placeholder.png',
  iconImageUrl: brand.iconImageUrl,
  bannerImageUrl: brand.bannerImageUrl,
});

let brandsPromise: Promise<Brand[]> | null = null;

export const getAllBrands = async (sortOrder?: 'asc' | 'desc'): Promise<Brand[]> => {
  if (brandsPromise) return brandsPromise;

  brandsPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brands${sortOrder ? `?sortOrder=${sortOrder}` : ''}`, {
        headers: {
          'x-user-role': 'public',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const brands: BrandDocument[] = json.data?.brands || [];
      return brands.filter(b => b.isActive).map(normalizeBrand);
    } catch (error) {
      console.error('Failed to fetch brands from API:', error);
      brandsPromise = null;
      return [];
    }
  })();

  return brandsPromise;
};

export const getActiveBrands = getAllBrands;

const brandCache = new Map<string, Promise<Brand | undefined>>();

export const getBrandById = async (id: string): Promise<Brand | undefined> => {
  if (brandCache.has(id)) return brandCache.get(id)!;

  const promise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/brands/${id}`, {
        headers: {
          'x-user-role': 'public',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const brand: BrandDocument = json.data;
      return brand ? normalizeBrand(brand) : undefined;
    } catch (error) {
      console.error(`Failed to fetch brand ${id}:`, error);
      brandCache.delete(id);
      return undefined;
    }
  })();

  brandCache.set(id, promise);
  return promise;
};
