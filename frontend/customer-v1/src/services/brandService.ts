import { brands } from '@/src/mock-data/brands';
import type { Brand, BrandDocument } from '@/src/types';

const normalizeBrand = (brand: BrandDocument): Brand => ({
  id: brand.id,
  name: brand.name,
  description: brand.description,
  isActive: brand.isActive,
  createdAt: brand.createdAt,
  updatedAt: brand.updatedAt,
  iconImage: brand.iconImageUrl ?? '/mock-images/default/placeholder.png',
  mainImage: brand.bannerImageUrl ?? brand.iconImageUrl ?? '/mock-images/default/placeholder.png',
  iconImageUrl: brand.iconImageUrl,
  bannerImageUrl: brand.bannerImageUrl,
});

export const getAllBrands = (): Brand[] => {
  return brands.map(normalizeBrand);
};

export const getActiveBrands = (): Brand[] => {
  return brands.filter(b => b.isActive).map(normalizeBrand);
};

export const getBrandById = (id: string): Brand | undefined => {
  const brand = brands.find(b => b.id === id);
  return brand ? normalizeBrand(brand) : undefined;
};

export const searchBrands = (query: string): Brand[] => {
  const lowerQuery = query.toLowerCase();
  return brands.filter(b =>
    b.name.toLowerCase().includes(lowerQuery) ||
    b.description.toLowerCase().includes(lowerQuery)
  ).map(normalizeBrand);
};
