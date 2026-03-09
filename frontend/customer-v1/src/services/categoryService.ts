import { categories } from '@/src/mock-data/categories';
import type { Category, CategoryDocument } from '@/src/types';

const normalizeCategory = (category: CategoryDocument): Category => ({
  id: category.id,
  brandId: category.brandId,
  name: category.name,
  description: category.description,
  isActive: category.isActive,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  image: category.imageUrl ?? '/mock-images/default/placeholder.png',
  imageUrl: category.imageUrl,
});

export const getAllCategories = (): Category[] => {
  return categories.map(normalizeCategory);
};

export const getActiveCategories = (): Category[] => {
  return categories.filter(c => c.isActive).map(normalizeCategory);
};

export const getCategoryById = (id: string): Category | undefined => {
  const category = categories.find(c => c.id === id);
  return category ? normalizeCategory(category) : undefined;
};

export const getCategoriesByBrand = (brandId: string): Category[] => {
  return categories.filter(c => c.brandId === brandId && c.isActive).map(normalizeCategory);
};

export const searchCategories = (query: string): Category[] => {
  const lowerQuery = query.toLowerCase();
  return categories.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery)
  ).map(normalizeCategory);
};
