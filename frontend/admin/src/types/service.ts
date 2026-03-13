export type AssignmentLevel = 'brand' | 'category' | 'series' | 'product';

export interface ServiceDocument {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedTime: number;
  isActive: boolean;
  level: AssignmentLevel;
  levelId: string;
  parentServiceId?: string | null;
  isVariant?: boolean;
  isParent?: boolean;
  createdAt: string;
  linkedProductsCount: number;
  assignedTo: string;
}

export interface ServiceRecord extends ServiceDocument {
  brandId: string;
  categoryId?: string;
  seriesId?: string;
  productId?: string;
  parentServiceId?: string | null;
  isVariant: boolean;
}

export interface ServiceProduct {
  id: string;
  serviceId: string;
  productId: string;
  price: number;
  estimatedTime: number;
  isActive?: boolean;
}
