import { Category } from '@/types';
import { mockCategories } from '@/mock-data/categories';

let categories: Category[] = [...mockCategories];

export const categoryService = {
  getAll: (): Category[] => [...categories].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getByBrand: (brandId: string): Category[] => categories.filter(c => c.brandId === brandId),
  getById: (id: string): Category | undefined => categories.find(c => c.id === id),
  create: (data: Omit<Category, 'id' | 'isActive' | 'createdAt'>): Category => {
    const category: Category = { ...data, id: crypto.randomUUID(), isActive: true, createdAt: new Date().toISOString().split('T')[0] };
    categories = [...categories, category];
    return category;
  },
  update: (id: string, data: Partial<Category>): Category => {
    categories = categories.map(c => c.id === id ? { ...c, ...data } : c);
    return categories.find(c => c.id === id)!;
  },
  delete: (id: string): void => { categories = categories.filter(c => c.id !== id); },
  getCount: (): number => categories.length,
};
