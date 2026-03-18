import type { StorefrontBrand, StorefrontCategory, StorefrontSeries, StorefrontProduct } from './storefrontService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface FilterOptions {
  brands: StorefrontBrand[];
  categories: StorefrontCategory[];
  series: StorefrontSeries[];
  products: StorefrontProduct[];
}

let filterOptionsPromise: Promise<FilterOptions> | null = null;

export const getFilterOptions = async (): Promise<FilterOptions> => {
  if (filterOptionsPromise) return filterOptionsPromise;

  filterOptionsPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/filters/options`, {
        headers: {
          'x-user-role': 'public',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      const data = json.data;

      // Map to storefront types
      return {
        brands: data.brands,
        categories: data.categories.map((c: any) => ({
          ...c,
          image: [c.image]
        })),
        series: data.series.map((s: any) => ({
          ...s,
        })),
        products: data.products.map((p: any) => ({
          ...p,
          description: '',
          specifications: {},
          images: [p.iconImage],
          price: 0,
          stock: 1,
          sku: p.id.toUpperCase()
        }))
      };
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      filterOptionsPromise = null;
      return { brands: [], categories: [], series: [], products: [] };
    }
  })();

  return filterOptionsPromise;
};
