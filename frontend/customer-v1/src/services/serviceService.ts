import { serviceRecords, serviceProductOverrides } from '@/src/mock-data';
import { categories } from '@/src/mock-data/categories';
import { seriesList } from '@/src/mock-data/series';
import { products } from '@/src/mock-data/products';
import { getProductById } from '@/src/services/productService';
import type { ServiceRecord, ServiceRecordResolved, ServiceProductOverride } from '@/src/types';

const categoriesById = new Map(categories.map(c => [c.id, c]));
const seriesById = new Map(seriesList.map(s => [s.id, s]));
const productsById = new Map(products.map(p => [p.id, p]));

const resolveServiceRecord = (service: ServiceRecord): ServiceRecordResolved => {
  let brandId = '';
  let categoryId: string | undefined;
  let seriesId: string | undefined;
  let productId: string | undefined;

  switch (service.level) {
    case 'brand':
      brandId = service.levelId;
      break;
    case 'category': {
      const category = categoriesById.get(service.levelId);
      brandId = category?.brandId || '';
      categoryId = service.levelId;
      break;
    }
    case 'series': {
      const series = seriesById.get(service.levelId);
      const category = series ? categoriesById.get(series.categoryId) : undefined;
      brandId = category?.brandId || '';
      categoryId = series?.categoryId;
      seriesId = service.levelId;
      break;
    }
    case 'product': {
      const product = productsById.get(service.levelId);
      const series = product ? seriesById.get(product.seriesId) : undefined;
      const category = series ? categoriesById.get(series.categoryId) : undefined;
      brandId = category?.brandId || '';
      categoryId = series?.categoryId;
      seriesId = product?.seriesId;
      productId = service.levelId;
      break;
    }
    default:
      break;
  }

  return {
    ...service,
    brandId,
    categoryId,
    seriesId,
    productId,
    parentServiceId: service.parentServiceId ?? null,
    isVariant: service.isVariant ?? false,
  };
};

const records = (serviceRecords as ServiceRecord[]).map(resolveServiceRecord);
const overrides = (serviceProductOverrides as ServiceProductOverride[]).map(o => ({ ...o, isActive: o.isActive ?? true }));

export const getAllServiceRecords = (): ServiceRecordResolved[] => {
  return records;
};

export const getServiceRecordById = (id: string): ServiceRecordResolved | undefined => {
  return records.find((s: ServiceRecordResolved) => s.id === id);
};

/**
 * Get all services applicable to a specific product.
 * This resolves the hierarchy: brand → category → series → product level services.
 */
export const getServicesForProduct = (productId: string): ServiceRecordResolved[] => {
  const product = getProductById(productId);
  if (!product) return [];

  return records.filter((svc: ServiceRecordResolved) => {
    if (!svc.isActive) return false;

    switch (svc.level) {
      case 'brand':
        return svc.levelId === product.brandId;
      case 'category':
        return svc.levelId === product.categoryId;
      case 'series':
        return svc.levelId === product.seriesId;
      case 'product':
        return svc.levelId === productId;
      default:
        return false;
    }
  });
};

export const isServiceDisabledForProduct = (serviceId: string, productId: string): boolean => {
  const override = overrides.find(
    (o: ServiceProductOverride) => o.serviceId === serviceId && o.productId === productId
  );
  return override?.isActive === false;
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
