// =============================================
// Compatibility layer: bridges new mock-data & services
// to the legacy interface consumed by storefront pages.
// =============================================

import { brands as rawBrands } from '@/src/mock-data/brands';
import { categories as rawCategories } from '@/src/mock-data/categories';
import { seriesList } from '@/src/mock-data/series';
import { products as rawProducts } from '@/src/mock-data/products';
import { stock as rawStock } from '@/src/mock-data/stock';
import { bookings as rawBookings } from '@/src/mock-data/bookings';
import {
  getServicesForProduct,
  getEffectiveServicePrice,
  getEffectiveServiceTime,
  generateBookingSlots,
} from '@/src/services';

// ---- Legacy interfaces (kept for backward compat) ----

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  brandId: string;
  name: string;
  description: string;
  image: string;
}

export interface Series {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  banner: string;
  releaseYear: number;
}

export type StockCondition = 'new' | 'refurbished' | 'used';

export interface StockInfo {
  condition: StockCondition;
  price: number;
  originalPrice?: number;
  inStock: boolean;
}

export interface Product {
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

export interface ProductVariant {
  id: string;
  name: string;
  color: string;
  storage?: string;
  price: number;
  stock: number;
}

export interface BookingSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface Service {
  id: string;
  productId: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  isAvailable: boolean;
  bookingSlots: BookingSlot[];
}

export interface Booking {
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

// ---- Map new data → legacy shapes ----

export const brands: Brand[] = rawBrands
  .filter(b => b.isActive)
  .map(b => ({
    id: b.id,
    name: b.name,
    logo: b.iconImage,
    description: b.description,
    isActive: b.isActive,
  }));

export const categories: Category[] = rawCategories
  .filter(c => c.isActive)
  .map(c => ({
    id: c.id,
    brandId: c.brandId,
    name: c.name,
    description: c.description,
    image: c.image,
  }));

export const series: Series[] = seriesList
  .filter(s => s.isActive)
  .map(s => ({
    id: s.id,
    categoryId: s.categoryId,
    name: s.name,
    description: s.description,
    banner: s.image,
    releaseYear: 2024,
  }));

// Helper: derive price from stock data
const getProductPrice = (productId: string): number => {
  const productStock = rawStock.filter(
    s => s.productId === productId && s.isEnabled && s.isPublicVisible
  );
  for (const st of productStock) {
    if (st.variants.length > 0) {
      const activeVariant = st.variants.find((v: { isActive?: boolean; price?: number }) => v.isActive);
      if (activeVariant) return (activeVariant as { price: number }).price;
    }
    if (st.price > 0) return st.price;
  }
  return 0;
};

// Helper: derive stock options from stock data
const getStockOptions = (productId: string): StockInfo[] => {
  const productStock = rawStock.filter(
    s => s.productId === productId && s.isEnabled && s.isPublicVisible
  );
  return productStock.map(st => {
    const conditionMap: Record<string, StockCondition> = {
      'Brand New': 'new',
      'Used': 'used',
      'Refurbished': 'refurbished',
    };
    const condition = conditionMap[st.name] || 'new';
    let price = st.price;
    if (st.variants.length > 0) {
      const activeVariant = st.variants.find((v: { isActive?: boolean; price?: number }) => v.isActive);
      if (activeVariant) price = (activeVariant as { price: number }).price;
    }
    return {
      condition,
      price,
      inStock: true,
    };
  });
};

// Helper: derive variants from stock data
const getProductVariants = (productId: string): ProductVariant[] => {
  const productStock = rawStock.filter(
    s => s.productId === productId && s.isEnabled && s.isPublicVisible
  );
  const variants: ProductVariant[] = [];
  for (const st of productStock) {
    for (const v of st.variants as { id: string; name: string; isActive?: boolean; price?: number }[]) {
      if (v.isActive) {
        variants.push({
          id: v.id,
          name: `${st.name} - ${v.name}`,
          color: st.name,
          storage: v.name,
          price: v.price ?? 0,
          stock: 1,
        });
      }
    }
  }
  return variants;
};

export const products: Product[] = rawProducts
  .filter(p => p.isActive)
  .map(p => {
    const price = getProductPrice(p.id);
    const stockOptions = getStockOptions(p.id);
    const variants = getProductVariants(p.id);
    return {
      id: p.id,
      seriesId: p.seriesId,
      name: p.name,
      description: p.description,
      specifications: p.specifications,
      images: [p.iconImage, ...p.galleryImages.filter((img: string) => img !== p.iconImage)],
      price: price || 0,
      stock: 1, // Products are available if they exist
      sku: p.id.toUpperCase(),
      ...(variants.length > 0 ? { variants } : {}),
      ...(stockOptions.length > 0 ? { stockOptions } : {}),
    };
  });

// ---- Build services from hierarchical service records ----

// Cached services array built lazily
let _servicesCache: Service[] | null = null;

const buildServices = (): Service[] => {
  if (_servicesCache) return _servicesCache;

  const result: Service[] = [];
  const slots = generateBookingSlots();

  for (const product of rawProducts) {
    if (!product.isActive) continue;
    const applicableServices = getServicesForProduct(product.id);

    for (const svc of applicableServices) {
      const effectivePrice = getEffectiveServicePrice(svc.id, product.id);
      const effectiveTime = getEffectiveServiceTime(svc.id, product.id);

      // Format duration
      let duration: string;
      if (effectiveTime < 60) {
        duration = `${effectiveTime} minutes`;
      } else if (effectiveTime < 1440) {
        const hours = Math.floor(effectiveTime / 60);
        duration = hours === 1 ? '1 hour' : `${hours} hours`;
      } else {
        const days = Math.floor(effectiveTime / 1440);
        duration = days === 1 ? '1 day' : `${days} days`;
      }

      result.push({
        id: `${svc.id}-${product.id}`,
        productId: product.id,
        name: svc.name,
        description: svc.description,
        duration,
        price: effectivePrice,
        isAvailable: svc.isActive,
        bookingSlots: slots,
      });
    }
  }

  _servicesCache = result;
  return result;
};

export const services: Service[] = [];
// Lazy-init on first access via getter functions

export const bookings: Booking[] = rawBookings.map(b => ({
  id: b.id,
  productId: b.productId,
  serviceId: b.serviceId,
  date: b.date,
  time: b.time,
  customerName: b.customerName,
  customerPhone: b.customerPhone,
  customerEmail: b.customerEmail,
  status: b.status,
  createdAt: b.createdAt,
}));

// ---- Helper functions (same signatures as before) ----

export const getBrandById = (id: string) => brands.find(b => b.id === id);
export const getCategoriesByBrand = (brandId: string) => categories.filter(c => c.brandId === brandId);
export const getSeriesByCategory = (categoryId: string) => series.filter(s => s.categoryId === categoryId);
export const getProductsBySeries = (seriesId: string) => products.filter(p => p.seriesId === seriesId);
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getServicesByProduct = (productId: string) => buildServices().filter(s => s.productId === productId);
export const getSeriesById = (id: string) => series.find(s => s.id === id);
export const getCategoryById = (id: string) => categories.find(c => c.id === id);
export const getAllServices = () => buildServices();
export const getAllProducts = () => products;

export const searchProducts = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  );
};

export const getFeaturedProducts = () => products.slice(0, 8);
export const getLatestSeries = () => series;

export const getMinServicePrice = (productId: string) => {
  const productServices = buildServices().filter(s => s.productId === productId);
  if (productServices.length === 0) return null;
  return Math.min(...productServices.map(s => s.price));
};

export const getServiceCount = (productId: string) => {
  return buildServices().filter(s => s.productId === productId).length;
};

export const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>) => {
  const newBooking: Booking = {
    ...booking,
    id: `booking-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  return newBooking;
};
