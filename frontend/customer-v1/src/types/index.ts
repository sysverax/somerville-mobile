// =============================================
// Core domain types for the application
// =============================================

export interface Brand {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  iconImage: string;
  mainImage?: string;
  iconImageUrl?: string | null;
  bannerImageUrl?: string | null;
}

export interface BrandDocument {
  id: string;
  name: string;
  description: string;
  iconImageUrl: string | null;
  bannerImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  brandId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  image: string;
  imageUrl?: string | null;
}

export interface CategoryDocument {
  id: string;
  brandId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Series {
  id: string;
  categoryId: string;
  brandId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  image: string;
  imageUrl?: string | null;
}

export interface SeriesDocument {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  seriesId: string;
  categoryId: string;
  brandId: string;
  name: string;
  description: string;
  specifications: Record<string, string>;
  iconImage: string;
  galleryImages: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  imageUrl?: string | null;
}

export interface ProductDocument {
  id: string;
  seriesId: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StockVariant {
  id: string;
  stockTypeId: string;
  name: string;
  price: number;
  description: string;
  isActive: boolean;
}

export interface ProductStockType {
  id: string;
  productId: string;
  name: string;
  isEnabled: boolean;
  isPublicVisible: boolean;
  price: number;
  variants: StockVariant[];
}

export interface ServiceRecord {
  id: string;
  name: string;
  description: string;
  level: 'brand' | 'category' | 'series' | 'product';
  levelId: string;
  basePrice: number;
  estimatedTime: number;
  isActive: boolean;
  parentServiceId?: string | null;
  isVariant?: boolean;
  isParent?: boolean;
  createdAt: string;
}

export interface ServiceRecordResolved extends ServiceRecord {
  brandId: string;
  categoryId?: string;
  seriesId?: string;
  productId?: string;
  parentServiceId?: string | null;
  isVariant?: boolean;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  estimatedTime: number;
  serviceType: string;
  isActive: boolean;
}

export interface ServiceAssignment {
  id: string;
  templateId: string;
  level: string;
  levelId: string;
  price: number;
  estimatedTime: number;
  descriptionOverride: string;
  isActive: boolean;
}

export interface ServiceProductOverride {
  id: string;
  serviceId: string;
  productId: string;
  price: number;
  estimatedTime: number;
  isActive?: boolean;
}

export interface BookingSlot {
  date: string;
  time: string;
  available: boolean;
}

export interface Booking {
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
