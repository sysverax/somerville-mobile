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

// Legacy type alias for backwards compatibility
export type ServiceProductOverride = ServiceProduct;

// Keep legacy exports for compatibility
export type ServiceType = 'Repair' | 'Replacement' | 'Diagnostic';

export interface ServiceTemplate {
  id: string;
  name: string;
  description: string;
  estimatedTime: number;
  serviceType: ServiceType;
  isActive: boolean;
}

export interface ServiceAssignment {
  id: string;
  templateId: string;
  level: AssignmentLevel;
  levelId: string;
  price: number;
  estimatedTime: number;
  descriptionOverride: string;
  isActive: boolean;
}
