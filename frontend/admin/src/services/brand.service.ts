import { Brand } from '@/types';
import { mockBrands } from '@/mock-data/brands';

let brands: Brand[] = [...mockBrands];

export const brandService = {
  getAll: (): Brand[] => [...brands].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getById: (id: string): Brand | undefined => brands.find(b => b.id === id),
  create: (data: Omit<Brand, 'id' | 'isActive' | 'createdAt'>): Brand => {
    if (brands.length >= 10) throw new Error('Maximum 10 brands allowed');
    const brand: Brand = { ...data, id: crypto.randomUUID(), isActive: true, createdAt: new Date().toISOString().split('T')[0] };
    brands = [...brands, brand];
    return brand;
  },
  update: (id: string, data: Partial<Brand>): Brand => {
    brands = brands.map(b => b.id === id ? { ...b, ...data } : b);
    return brands.find(b => b.id === id)!;
  },
  delete: (id: string): void => { brands = brands.filter(b => b.id !== id); },
  getCount: (): number => brands.length,
};
