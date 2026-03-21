import type { Category, CategoryDocument } from '@/src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const normalizeCategory = (category: any): Category => ({
  id: category.id,
  brandId: category.brand?.id || category.brandId || '',
  name: category.name,
  description: category.description,
  isActive: category.isActive,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
  image: category.imageUrl || '/mock-images/default/placeholder.png',
  imageUrl: category.imageUrl,
});

const categoriesPromiseCache = new Map<string, Promise<Category[]>>();

export const getAllCategories = async (sortOrder: 'asc' | 'desc' = 'asc'): Promise<Category[]> => {
  const key = sortOrder;
  if (categoriesPromiseCache.has(key)) return categoriesPromiseCache.get(key)!;

  const promise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories?sortOrder=${sortOrder}&limit=100`, {
        headers: {
          'x-user-role': 'public',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const categories: CategoryDocument[] = json.data?.categories || [];
      return categories.map(normalizeCategory);
    } catch (error) {
      console.error('Failed to fetch categories from API:', error);
      categoriesPromiseCache.delete(key);
      return [];
    }
  })();

  categoriesPromiseCache.set(key, promise);
  return promise;
};

export const getActiveCategories = async (): Promise<Category[]> => {
  const all = await getAllCategories();
  return all.filter(c => c.isActive);
};

const categoryCache = new Map<string, Promise<Category | undefined>>();

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  if (categoryCache.has(id)) return categoryCache.get(id)!;

  const promise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        headers: {
          'x-user-role': 'public',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const category: CategoryDocument = json.data;
      return category ? normalizeCategory(category) : undefined;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      categoryCache.delete(id);
      return undefined;
    }
  })();

  categoryCache.set(id, promise);
  return promise;
};

export const getCategoriesByBrand = async (brandId: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories?brandId=${brandId}&limit=100&sortOrder=${sortOrder}`, {
      headers: {
        'x-user-role': 'public',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    const categories: CategoryDocument[] = json.data?.categories || [];
    return categories.map(normalizeCategory);
  } catch (error) {
    console.error(`Failed to fetch categories for brand ${brandId}:`, error);
    return [];
  }
};

export const searchCategories = async (query: string): Promise<Category[]> => {
  const all = await getActiveCategories();
  const lowerQuery = query.toLowerCase();
  return all.filter(c =>
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery)
  );
};
