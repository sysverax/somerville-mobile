import { brands } from '@/src/mock-data/brands';
import type { Brand } from '@/src/types';

export const getAllBrands = (): Brand[] => {
  return brands;
};

export const getActiveBrands = (): Brand[] => {
  return brands.filter(b => b.isActive);
};

export const getBrandById = (id: string): Brand | undefined => {
  return brands.find(b => b.id === id);
};

export const searchBrands = (query: string): Brand[] => {
  const lowerQuery = query.toLowerCase();
  return brands.filter(b =>
    b.name.toLowerCase().includes(lowerQuery) ||
    b.description.toLowerCase().includes(lowerQuery)
  );
};
