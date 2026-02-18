import { products } from '@/src/mock-data/products';
import type { Product } from '@/src/types';

export const getAllProducts = (): Product[] => {
  return products;
};

export const getActiveProducts = (): Product[] => {
  return products.filter(p => p.isActive);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsBySeries = (seriesId: string): Product[] => {
  return products.filter(p => p.seriesId === seriesId && p.isActive);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(p => p.categoryId === categoryId && p.isActive);
};

export const getProductsByBrand = (brandId: string): Product[] => {
  return products.filter(p => p.brandId === brandId && p.isActive);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  );
};

export const getFeaturedProducts = (): Product[] => {
  return products.slice(0, 8);
};
