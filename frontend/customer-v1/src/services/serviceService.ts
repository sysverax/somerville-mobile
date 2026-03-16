import type { ServiceRecord, ServiceRecordResolved, ServiceProductOverride } from '@/src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface BackendService {
  id: string;
  name: string;
  description: string;
  level: 'brand' | 'category' | 'series' | 'product';
  levelId: string;
  basePrice: number;
  estimatedTime: number;
  isActive: boolean;
  isParent: boolean;
  isVariant: boolean;
  parentServiceId?: string | null;
  variants?: BackendService[];
}

export const getAllServices = async (params: { 
  productId?: string;
  seriesId?: string;
  categoryId?: string;
  brandId?: string;
  limit?: number;
} = {}): Promise<BackendService[]> => {
  try {
    const query = new URLSearchParams();
    if (params.productId) query.append('productId', params.productId);
    if (params.seriesId) query.append('seriesId', params.seriesId);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.brandId) query.append('brandId', params.brandId);
    query.append('limit', (params.limit || 100).toString());

    const response = await fetch(`${API_BASE_URL}/api/services?${query.toString()}`, {
      headers: { 'x-user-role': 'public' },
      credentials: 'include',
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const json = await response.json();
    return json.data?.services || [];
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
};

const productServicesCache = new Map<string, Promise<any[]>>();

export const getServicesForProductFromAPI = async (productId: string): Promise<any[]> => {
  if (productServicesCache.has(productId)) {
    return productServicesCache.get(productId)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/product-services/product/${productId}`, {
        headers: { 'x-user-role': 'public' },
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      return json.data?.services || [];
    } catch (error) {
      console.error(`Failed to fetch services for product ${productId}:`, error);
      productServicesCache.delete(productId);
      return [];
    }
  })();

  productServicesCache.set(productId, promise);
  return promise;
};

// Compatibility export for existing code that might still use the old functions
// Note: These will return empty or throw if not handled, but we'll migrate storefrontService away from these.
export const getServicesForProduct = (productId: string): ServiceRecordResolved[] => {
  console.warn('getServicesForProduct is deprecated. Use async alternatives.');
  return [];
};

export const getEffecticeServicePrice = (serviceId: string, productId: string): number => 0;
export const getEffectiveServiceTime = (serviceId: string, productId: string): number => 0;
export const getAllServiceProductOverrides = (): any[] => [];
