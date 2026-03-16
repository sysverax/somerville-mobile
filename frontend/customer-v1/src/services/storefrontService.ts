/**
 * Storefront service: provides UI-ready data shapes by combining
 * raw mock-data with stock, service, and pricing logic.
 * 
 * This is the main service layer for storefront pages.
 */

import { getActiveBrands, getBrandById } from './brandService';
import { getActiveCategories, getCategoriesByBrand, getCategoryById } from './categoryService';
import { getActiveSeries, getSeriesByCategory, getSeriesById } from './seriesService';
import { getActiveProducts, getProductById as getRawProductById, getProductsBySeries as getRawProductsBySeries, searchProducts as rawSearchProducts, getFeaturedProducts as rawFeaturedProducts } from './productService';
import { getStockByProduct } from './stockService';
import { getServicesForProduct, getServicesForProductFromAPI } from './serviceService';
import { generateBookingSlots, addBooking as rawAddBooking } from './bookingService';
import type { Booking } from '@/src/types';

// ---- Storefront interfaces ----

export type StockCondition = 'new' | 'refurbished' | 'used';

export interface StockInfo {
  condition: StockCondition;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  color: string;
  storage?: string;
  price: number;
  stock: number;
}

export interface StorefrontProduct {
  id: string;
  seriesId: string;
  name: string;
  description: string;
  specifications: Record<string, string>;
  images: string[];
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  variants?: ProductVariant[];
  stockOptions?: StockInfo[];
}

export interface StorefrontBrand {
  id: string;
  name: string;
  logo: string;
  description: string;
  isActive: boolean;
}

export interface StorefrontCategory {
  id: string;
  brandId: string;
  name: string;
  description: string;
  image: string;
}

export interface StorefrontSeries {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  banner: string;
  releaseYear: number;
}

export interface StorefrontService {
  id: string;
  serviceId: string;
  productId: string;
  parentServiceId?: string | null;
  isVariant: boolean;
  level: 'brand' | 'category' | 'series' | 'product';
  name: string;
  description: string;
  estimatedTime: number;
  duration: string;
  price: number;
  isAvailable: boolean;
  isParent?: boolean;
}

export interface BookingSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface StorefrontBooking {
  id: string;
  productId: string;
  serviceId: string;
  parentServiceId?: string | null;
  price?: number;
  estimatedTime?: number;
  date: string;
  time: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

// ---- Brand helpers ----

export const getStorefrontBrands = async (): Promise<StorefrontBrand[]> => {
  const brands = await getActiveBrands('asc');
  return brands.map(b => ({
    id: b.id,
    name: b.name,
    logo: b.iconImage,
    description: b.description,
    isActive: b.isActive,
  }));
};

export const getStorefrontBrandById = async (id: string): Promise<StorefrontBrand | undefined> => {
  const b = await getBrandById(id);
  if (!b || !b.isActive) return undefined;
  return {
    id: b.id,
    name: b.name,
    logo: b.iconImage,
    description: b.description,
    isActive: b.isActive,
  };
};

// ---- Category helpers ----

export const getStorefrontCategories = async (): Promise<StorefrontCategory[]> => {
  const categories = await getActiveCategories('asc');
  return categories.map(c => ({
    id: c.id,
    brandId: c.brandId,
    name: c.name,
    description: c.description,
    image: c.image,
  }));
};

export const getStorefrontCategoriesByBrand = async (brandId: string): Promise<StorefrontCategory[]> => {
  const categories = await getCategoriesByBrand(brandId, 'asc');
  return categories.map(c => ({
    id: c.id,
    brandId: c.brandId,
    name: c.name,
    description: c.description,
    image: c.image,
  }));
};

export const getStorefrontCategoryById = async (id: string): Promise<StorefrontCategory | undefined> => {
  const c = await getCategoryById(id);
  if (!c) return undefined;
  return {
    id: c.id,
    brandId: c.brandId,
    name: c.name,
    description: c.description,
    image: c.image,
  };
};

// ---- Series helpers ----

export const getStorefrontSeries = async (sortOrder: 'asc' | 'desc' = 'asc'): Promise<StorefrontSeries[]> => {
  const series = await getActiveSeries(sortOrder);
  return series.map(s => ({
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    description: s.description,
    banner: s.image,
    releaseYear: 2024,
  }));
};

export const getStorefrontSeriesByCategory = async (categoryId: string): Promise<StorefrontSeries[]> => {
  const series = await getSeriesByCategory(categoryId, 'asc');
  return series.map(s => ({
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    description: s.description,
    banner: s.image,
    releaseYear: 2024,
  }));
};

export const getStorefrontSeriesById = async (id: string): Promise<StorefrontSeries | undefined> => {
  const s = await getSeriesById(id);
  if (!s) return undefined;
  return {
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    description: s.description,
    banner: s.image,
    releaseYear: 2024,
  };
};

// ---- Product helpers ----

const conditionMap: Record<string, StockCondition> = {
  'Brand New': 'new',
  'Used': 'used',
  'Refurbished': 'refurbished',
};

const mapProduct = (p: any): StorefrontProduct | null => {
  if (!p || !p.isActive) return null;

  const productStock = getStockByProduct(p.id);

  // Derive price
  let price = 0;
  for (const st of productStock) {
    if (st.variants.length > 0) {
      const activeVariant = st.variants.find(v => v.isActive);
      if (activeVariant) { price = activeVariant.price; break; }
    }
    if (st.price > 0) { price = st.price; break; }
  }

  // Stock options
  const stockOptions: StockInfo[] = productStock.map(st => {
    const condition = conditionMap[st.name] || 'new';
    let stockPrice = st.price;
    if (st.variants.length > 0) {
      const activeVariant = st.variants.find(v => v.isActive);
      if (activeVariant) stockPrice = activeVariant.price;
    }
    return { condition, price: stockPrice, inStock: true };
  });

  // Variants
  const variants: ProductVariant[] = [];
  for (const st of productStock) {
    for (const v of st.variants) {
      if (v.isActive) {
        variants.push({
          id: v.id,
          name: `${st.name} - ${v.name}`,
          color: st.name,
          storage: v.name,
          price: v.price,
          stock: 1,
        });
      }
    }
  }

  return {
    id: p.id,
    seriesId: p.seriesId,
    name: p.name,
    description: p.description,
    specifications: p.specifications || {},
    images: [p.iconImage, ...(p.galleryImages || []).filter((img: string) => img !== p.iconImage)],
    price: price || 0,
    stock: 1,
    sku: (p.id || '').toUpperCase(),
    ...(variants.length > 0 ? { variants } : {}),
    ...(stockOptions.length > 0 ? { stockOptions } : {}),
  };
};

export const getStorefrontProducts = async (): Promise<StorefrontProduct[]> => {
  const products = await getActiveProducts('asc');
  return products.map(mapProduct).filter(Boolean) as StorefrontProduct[];
};

export const getStorefrontProductById = async (id: string): Promise<StorefrontProduct | undefined> => {
  const p = await getRawProductById(id);
  return mapProduct(p) || undefined;
};

export const getStorefrontProductsBySeries = async (seriesId: string): Promise<StorefrontProduct[]> => {
  const products = await getRawProductsBySeries(seriesId, 'asc');
  return products.map(mapProduct).filter(Boolean) as StorefrontProduct[];
};

export const storefrontSearchProducts = async (query: string): Promise<StorefrontProduct[]> => {
  const products = await rawSearchProducts(query, 'asc');
  return products.map(mapProduct).filter(Boolean) as StorefrontProduct[];
};

export const getStorefrontFeaturedProducts = async (): Promise<StorefrontProduct[]> => {
  const products = await rawFeaturedProducts('asc');
  return products.map(mapProduct).filter(Boolean) as StorefrontProduct[];
};

export const getStorefrontLatestSeries = async (): Promise<StorefrontSeries[]> => {
  return getStorefrontSeries('desc');
};

// ---- Service helpers ----

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  const days = Math.floor(minutes / 1440);
  return days === 1 ? '1 day' : `${days} days`;
};

export const getStorefrontServicesByProduct = async (productId: string): Promise<StorefrontService[]> => {
  const backendServices = await getServicesForProductFromAPI(productId);
  
  // Flatten variants if they exist in the response
  const flattened: StorefrontService[] = [];
  
  backendServices.forEach((svc: any) => {
    if (svc.variants && svc.variants.length > 0) {
      // Add the parent service as a non-variant marker for grouping in UI
      flattened.push({
        id: svc.id,
        serviceId: svc.serviceId || svc.id,
        productId,
        parentServiceId: null,
        isVariant: false,
        isParent: true,
        level: svc.level,
        name: svc.name,
        description: svc.description,
        estimatedTime: 0,
        duration: '',
        price: 0,
        isAvailable: true,
      });

      svc.variants.forEach((v: any) => {
        flattened.push({
          id: v.id,
          serviceId: v.serviceId || v.id,
          productId,
          parentServiceId: v.parentServiceId || svc.id,
          isVariant: true,
          isParent: false,
          level: v.level || svc.level,
          name: `${svc.name} - ${v.name}`, // Standard full name for flat lists
          description: v.description || svc.description,
          estimatedTime: v.estimatedTime,
          duration: formatDuration(v.estimatedTime),
          price: v.price,
          isAvailable: v.isActive,
        });
      });
    } else {
      flattened.push({
        id: svc.id,
        serviceId: svc.serviceId || svc.id,
        productId,
        parentServiceId: svc.parentServiceId || null,
        isVariant: svc.isVariant || false,
        isParent: false,
        level: svc.level,
        name: svc.name,
        description: svc.description,
        estimatedTime: svc.estimatedTime,
        duration: formatDuration(svc.estimatedTime),
        price: svc.price,
        isAvailable: svc.isActive,
      });
    }
  });

  return flattened;
};

export const getAllStorefrontServices = async (): Promise<StorefrontService[]> => {
  const products = await getActiveProducts('asc');
  const servicePromises = products.map(p => getStorefrontServicesByProduct(p.id));
  const results = await Promise.all(servicePromises);
  return results.flat();
};

export const getStorefrontMinServicePrice = (productId: string): number | null => null;
export const getStorefrontServiceCount = (productId: string): number => 0;

export const addStorefrontBooking = async (booking: Omit<StorefrontBooking, 'id' | 'createdAt'>): Promise<StorefrontBooking> => {
  const result = await rawAddBooking(booking as any);
  return result as StorefrontBooking;
};
