import { serviceRecords, serviceProductOverrides } from '@/src/mock-data';
import { getProductById } from '@/src/services/productService';
import type { ServiceRecord, ServiceProductOverride } from '@/src/types';

const records = serviceRecords as ServiceRecord[];
const overrides = serviceProductOverrides as ServiceProductOverride[];

export const getAllServiceRecords = (): ServiceRecord[] => {
  return records;
};

export const getServiceRecordById = (id: string): ServiceRecord | undefined => {
  return records.find((s: ServiceRecord) => s.id === id);
};

/**
 * Get all services applicable to a specific product.
 * This resolves the hierarchy: brand → category → series → product level services.
 */
export const getServicesForProduct = (productId: string): ServiceRecord[] => {
  const product = getProductById(productId);
  if (!product) return [];

  return records.filter((svc: ServiceRecord) => {
    if (!svc.isActive) return false;

    switch (svc.level) {
      case 'brand':
        return svc.brandId === product.brandId;
      case 'category':
        return svc.categoryId === product.categoryId;
      case 'series':
        return svc.seriesId === product.seriesId;
      case 'product':
        return svc.productId === productId;
      default:
        return false;
    }
  });
};

export const isServiceDisabledForProduct = (serviceId: string, productId: string): boolean => {
  const override = overrides.find(
    (o: ServiceProductOverride) => o.serviceId === serviceId && o.productId === productId
  );
  return override?.isDisabled === true;
};

/**
 * Get the effective price for a service on a specific product,
 * considering product-level overrides.
 */
export const getEffectiveServicePrice = (serviceId: string, productId: string): number => {
  const override = overrides.find(
    (o: ServiceProductOverride) => o.serviceId === serviceId && o.productId === productId
  );
  if (override) return override.price;

  const service = getServiceRecordById(serviceId);
  return service?.basePrice ?? 0;
};

/**
 * Get the effective estimated time for a service on a specific product.
 */
export const getEffectiveServiceTime = (serviceId: string, productId: string): number => {
  const override = overrides.find(
    (o: ServiceProductOverride) => o.serviceId === serviceId && o.productId === productId
  );
  if (override) return override.estimatedTime;

  const service = getServiceRecordById(serviceId);
  return service?.estimatedTime ?? 0;
};

/**
 * Get service count for a product (all applicable services).
 */
export const getServiceCountForProduct = (productId: string): number => {
  const applicable = getServicesForProduct(productId);
  return applicable.filter(s => !isServiceDisabledForProduct(s.id, productId)).length;
};

/**
 * Get minimum service price for a product.
 */
export const getMinServicePriceForProduct = (productId: string): number | null => {
  const services = getServicesForProduct(productId).filter(s => !isServiceDisabledForProduct(s.id, productId));
  if (services.length === 0) return null;

  const prices = services.map(s => getEffectiveServicePrice(s.id, productId));
  return Math.min(...prices);
};

/**
 * Get all product overrides.
 */
export const getAllServiceProductOverrides = (): ServiceProductOverride[] => {
  return overrides;
};

/**
 * Get overrides for a specific service.
 */
export const getOverridesForService = (serviceId: string): ServiceProductOverride[] => {
  return overrides.filter((o: ServiceProductOverride) => o.serviceId === serviceId);
};
