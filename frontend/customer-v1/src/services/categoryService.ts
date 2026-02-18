import { categories } from '@/src/mock-data/categories';
import type { Category } from '@/src/types';

export const getAllCategories = (): Category[] => {
  return categories;
};

export const getActiveCategories = (): Category[] => {
  return categories.filter(c => c.isActive);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(c => c.id === id);
};

export const getCategoriesByBrand = (brandId: string): Category[] => {
  return categories.filter(c => c.brandId === brandId && c.isActive);
};

export const searchCategories = (query: string): Category[] => {
  const lowerQuery = query.toLowerCase();
  return categories.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery)
  );
};
