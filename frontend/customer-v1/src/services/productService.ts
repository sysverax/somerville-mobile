import { products } from '@/src/mock-data/products';
import type { Product, ProductDocument } from '@/src/types';
import { getSeriesById } from './seriesService';

const normalizeProduct = (product: ProductDocument): Product => {
  const series = getSeriesById(product.seriesId);
  return {
    id: product.id,
    seriesId: product.seriesId,
    categoryId: series?.categoryId ?? '',
    brandId: series?.brandId ?? '',
    name: product.name,
    description: product.description,
    specifications: {},
    iconImage: product.imageUrl ?? '/mock-images/default/placeholder.png',
    galleryImages: product.imageUrl ? [product.imageUrl] : [],
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    imageUrl: product.imageUrl,
  };
};

export const getAllProducts = (): Product[] => {
  return products.map(normalizeProduct);
};

export const getActiveProducts = (): Product[] => {
  return products.filter(p => p.isActive).map(normalizeProduct);
};

export const getProductById = (id: string): Product | undefined => {
  const product = products.find(p => p.id === id);
  return product ? normalizeProduct(product) : undefined;
};

export const getProductsBySeries = (seriesId: string): Product[] => {
  return products.filter(p => p.seriesId === seriesId && p.isActive).map(normalizeProduct);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products
    .map(normalizeProduct)
    .filter(p => p.categoryId === categoryId && p.isActive);
};

export const getProductsByBrand = (brandId: string): Product[] => {
  return products
    .map(normalizeProduct)
    .filter(p => p.brandId === brandId && p.isActive);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.map(normalizeProduct).filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  );
};

export const getFeaturedProducts = (): Product[] => {
  return products.slice(0, 8).map(normalizeProduct);
};
