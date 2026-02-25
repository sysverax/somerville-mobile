import { Product } from '@/types';
import { mockProducts } from '@/mock-data/products';

let products: Product[] = [...mockProducts];

export const productService = {
  getAll: (): Product[] => [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getBySeries: (seriesId: string): Product[] => products.filter(p => p.seriesId === seriesId),
  getById: (id: string): Product | undefined => products.find(p => p.id === id),
  create: (data: Omit<Product, 'id' | 'isActive' | 'createdAt'>): Product => {
    const product: Product = { ...data, id: crypto.randomUUID(), isActive: true, createdAt: new Date().toISOString().split('T')[0] };
    products = [...products, product];
    return product;
  },
  update: (id: string, data: Partial<Product>): Product => {
    products = products.map(p => p.id === id ? { ...p, ...data } : p);
    return products.find(p => p.id === id)!;
  },
  delete: (id: string): void => { products = products.filter(p => p.id !== id); },
  getCount: (): number => products.length,
};
