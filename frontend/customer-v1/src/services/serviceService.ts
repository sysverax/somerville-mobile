import { serviceRecords, serviceProductOverrides } from '@/src/mock-data/services';
import { getProductById } from '@/src/services/productService';
import type { ServiceRecord, ServiceProductOverride } from '@/src/types';

export const getAllServiceRecords = (): ServiceRecord[] => {
  return serviceRecords;
};

export const getServiceRecordById = (id: string): ServiceRecord | undefined => {
  return serviceRecords.find(s => s.id === id);
};

/**
 * Get all services applicable to a specific product.
 * This resolves the hierarchy: brand → category → series → product level services.
 */
export const getServicesForProduct = (productId: string): ServiceRecord[] => {
  const product = getProductById(productId);
  if (!product) return [];

  return serviceRecords.filter(svc => {
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

/**
 * Get the effective price for a service on a specific product,
 * considering product-level overrides.
 */
export const getEffectiveServicePrice = (serviceId: string, productId: string): number => {
  const override = serviceProductOverrides.find(
    o => o.serviceId === serviceId && o.productId === productId
  );
  if (override) return override.priceOverride;

  const service = getServiceRecordById(serviceId);
  return service?.basePrice ?? 0;
};

/**
 * Get the effective estimated time for a service on a specific product.
 */
export const getEffectiveServiceTime = (serviceId: string, productId: string): number => {
  const override = serviceProductOverrides.find(
    o => o.serviceId === serviceId && o.productId === productId
  );
  if (override) return override.estimatedTimeOverride;

  const service = getServiceRecordById(serviceId);
  return service?.estimatedTime ?? 0;
};

/**
 * Get service count for a product (all applicable services).
 */
export const getServiceCountForProduct = (productId: string): number => {
  return getServicesForProduct(productId).length;
};

/**
 * Get minimum service price for a product.
 */
export const getMinServicePriceForProduct = (productId: string): number | null => {
  const services = getServicesForProduct(productId);
  if (services.length === 0) return null;

  const prices = services.map(s => getEffectiveServicePrice(s.id, productId));
  return Math.min(...prices);
};

/**
 * Get all product overrides.
 */
export const getAllServiceProductOverrides = (): ServiceProductOverride[] => {
  return serviceProductOverrides;
};

/**
 * Get overrides for a specific service.
 */
export const getOverridesForService = (serviceId: string): ServiceProductOverride[] => {
  return serviceProductOverrides.filter(o => o.serviceId === serviceId);
};
