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
}

export interface ServiceProductOverride {
  id: string;
  serviceId: string;
  productId: string;
  priceOverride: number;
  estimatedTimeOverride: number;
  isDisabled?: boolean;
}

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
