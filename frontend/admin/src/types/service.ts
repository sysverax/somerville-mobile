export type AssignmentLevel = 'brand' | 'category' | 'series' | 'product';

export interface ServiceRecord {
  id: string;
  name: string;
  description: string;
  level: AssignmentLevel;
  brandId: string;
  categoryId?: string;
  seriesId?: string;
  productId?: string;
  basePrice: number;
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
  parentServiceId?: string | null;
  isVariant: boolean;
}

export interface ServiceProduct {
  id: string;
  serviceId: string;
  productId: string;
  price: number;
  estimatedTime: number;
  isDisabled?: boolean;
}