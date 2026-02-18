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
import { getServicesForProduct, getEffectiveServicePrice, getEffectiveServiceTime } from './serviceService';
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
  productId: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  isAvailable: boolean;
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
  date: string;
  time: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

// ---- Brand helpers ----

export const getStorefrontBrands = (): StorefrontBrand[] => {
  return getActiveBrands().map(b => ({
    id: b.id,
    name: b.name,
    logo: b.iconImage,
    description: b.description,
    isActive: b.isActive,
  }));
};

export const getStorefrontBrandById = (id: string): StorefrontBrand | undefined => {
  const b = getBrandById(id);
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

export const getStorefrontCategories = (): StorefrontCategory[] => {
  return getActiveCategories().map(c => ({
    id: c.id,
    brandId: c.brandId,
    name: c.name,
    description: c.description,
    image: c.image,
  }));
};

export const getStorefrontCategoriesByBrand = (brandId: string): StorefrontCategory[] => {
  return getCategoriesByBrand(brandId).map(c => ({
    id: c.id,
    brandId: c.brandId,
    name: c.name,
    description: c.description,
    image: c.image,
  }));
};

export const getStorefrontCategoryById = (id: string): StorefrontCategory | undefined => {
  const c = getCategoryById(id);
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

export const getStorefrontSeries = (): StorefrontSeries[] => {
  return getActiveSeries().map(s => ({
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    description: s.description,
    banner: s.image,
    releaseYear: 2024,
  }));
};

export const getStorefrontSeriesByCategory = (categoryId: string): StorefrontSeries[] => {
  return getSeriesByCategory(categoryId).map(s => ({
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    description: s.description,
    banner: s.image,
    releaseYear: 2024,
  }));
};

export const getStorefrontSeriesById = (id: string): StorefrontSeries | undefined => {
  const s = getSeriesById(id);
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

const mapProduct = (p: ReturnType<typeof getRawProductById>): StorefrontProduct | null => {
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
    specifications: p.specifications,
    images: [p.iconImage, ...p.galleryImages.filter(img => img !== p.iconImage)],
    price: price || 0,
    stock: 1,
    sku: p.id.toUpperCase(),
    ...(variants.length > 0 ? { variants } : {}),
    ...(stockOptions.length > 0 ? { stockOptions } : {}),
  };
};

export const getStorefrontProducts = (): StorefrontProduct[] => {
  return getActiveProducts().map(mapProduct).filter(Boolean) as StorefrontProduct[];
};

export const getStorefrontProductById = (id: string): StorefrontProduct | undefined => {
  const p = getRawProductById(id);
  return mapProduct(p) || undefined;
};

export const getStorefrontProductsBySeries = (seriesId: string): StorefrontProduct[] => {
  return getRawProductsBySeries(seriesId).map(mapProduct).filter(Boolean) as StorefrontProduct[];
};

export const storefrontSearchProducts = (query: string): StorefrontProduct[] => {
  return rawSearchProducts(query).map(mapProduct).filter(Boolean) as StorefrontProduct[];
};

export const getStorefrontFeaturedProducts = (): StorefrontProduct[] => {
  return rawFeaturedProducts().map(mapProduct).filter(Boolean) as StorefrontProduct[];
};

export const getStorefrontLatestSeries = (): StorefrontSeries[] => {
  return getStorefrontSeries();
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

export const getStorefrontServicesByProduct = (productId: string): StorefrontService[] => {
  const applicableServices = getServicesForProduct(productId);
  return applicableServices.map(svc => {
    const effectivePrice = getEffectiveServicePrice(svc.id, productId);
    const effectiveTime = getEffectiveServiceTime(svc.id, productId);
    return {
      id: `${svc.id}-${productId}`,
      productId,
      name: svc.name,
      description: svc.description,
      duration: formatDuration(effectiveTime),
      price: effectivePrice,
      isAvailable: svc.isActive,
    };
  });
};

export const getAllStorefrontServices = (): StorefrontService[] => {
  const result: StorefrontService[] = [];
  for (const p of getActiveProducts()) {
    result.push(...getStorefrontServicesByProduct(p.id));
  }
  return result;
};

export const getStorefrontMinServicePrice = (productId: string): number | null => {
  const services = getStorefrontServicesByProduct(productId);
  if (services.length === 0) return null;
  return Math.min(...services.map(s => s.price));
};

export const getStorefrontServiceCount = (productId: string): number => {
  return getStorefrontServicesByProduct(productId).length;
};

// ---- Booking helpers ----

export const addStorefrontBooking = (booking: Omit<StorefrontBooking, 'id' | 'createdAt'>): StorefrontBooking => {
  const result = rawAddBooking(booking as Omit<Booking, 'id' | 'createdAt'>);
  return result as StorefrontBooking;
};
