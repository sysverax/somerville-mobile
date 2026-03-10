import { ServiceDocument, ServiceRecord, ServiceProduct } from '@/types';
import { mockServices, mockServiceProductOverrides } from '@/mock-data/services';
import { mockCategories } from '@/mock-data/categories';
import { mockSeries } from '@/mock-data/series';
import { mockProducts } from '@/mock-data/products';

const categoriesById = new Map(mockCategories.map(c => [c.id, c]));
const seriesById = new Map(mockSeries.map(s => [s.id, s]));
const productsById = new Map(mockProducts.map(p => [p.id, p]));

const normalizeServiceRecord = (service: ServiceDocument): ServiceRecord => {
  let brandId = '';
  let categoryId: string | undefined;
  let seriesId: string | undefined;
  let productId: string | undefined;

  switch (service.level) {
    case 'brand': {
      brandId = service.levelId;
      break;
    }
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

const inferLevelId = (service: Partial<ServiceRecord>): string => {
  if (service.levelId) return service.levelId;
  switch (service.level) {
    case 'brand':
      return service.brandId || '';
    case 'category':
      return service.categoryId || '';
    case 'series':
      return service.seriesId || '';
    case 'product':
      return service.productId || '';
    default:
      return '';
  }
};

let services: ServiceRecord[] = mockServices.map(normalizeServiceRecord);
let overrides: ServiceProduct[] = mockServiceProductOverrides.map(o => ({ ...o, isActive: o.isActive ?? true }));

// Helper: Get products that inherit a service based on its level
const getLinkedProductsForService = (service: ServiceRecord): string[] => {
  switch (service.level) {
    case 'brand':
      return mockProducts.filter(p => {
        const series = seriesById.get(p.seriesId);
        const category = series ? categoriesById.get(series.categoryId) : undefined;
        return category?.brandId === service.levelId;
      }).map(p => p.id);
    case 'category':
      return mockProducts.filter(p => {
        const series = seriesById.get(p.seriesId);
        return series?.categoryId === service.levelId;
      }).map(p => p.id);
    case 'series':
      return mockProducts.filter(p => p.seriesId === service.levelId).map(p => p.id);
    case 'product':
      return service.levelId ? [service.levelId] : [];
    default:
      return [];
  }
};

// Helper: Auto-create product_service records for a service
const autoPopulateProductServices = (service: ServiceRecord): void => {
  if (service.basePrice <= 0 || service.estimatedTime <= 0) return;

  const linkedProducts = getLinkedProductsForService(service);
  linkedProducts.forEach(productId => {
    // Only create if doesn't already exist
    const exists = overrides.some(o => o.serviceId === service.id && o.productId === productId);
    if (!exists) {
      const productService: ServiceProduct = {
        id: crypto.randomUUID(),
        serviceId: service.id,
        productId,
        price: service.basePrice,
        estimatedTime: service.estimatedTime,
        isActive: true,
      };
      overrides.push(productService);
    }
  });
};

export const serviceService = {
  // New ServiceRecord CRUD
  getAll: (): ServiceRecord[] => [...services].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getById: (id: string): ServiceRecord | undefined => services.find(s => s.id === id),
  getParentServices: (): ServiceRecord[] => services.filter(s => !s.isVariant),
  getVariants: (parentId: string): ServiceRecord[] => services.filter(s => s.parentServiceId === parentId && s.isVariant),
  hasVariants: (parentId: string): boolean => services.some(s => s.parentServiceId === parentId && s.isVariant),
  create: (data: Omit<ServiceRecord, 'id' | 'createdAt' | 'levelId'> & { levelId?: string }): ServiceRecord => {
    const levelId = inferLevelId(data);
    const record = normalizeServiceRecord({
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      basePrice: data.basePrice,
      estimatedTime: data.estimatedTime,
      isActive: data.isActive,
      level: data.level,
      levelId,
      parentServiceId: data.parentServiceId,
      isVariant: data.isVariant,
      createdAt: new Date().toISOString().split('T')[0],
    });
    services = [...services, record];
    autoPopulateProductServices(record);
    return record;
  },
  update: (id: string, data: Partial<ServiceRecord>): ServiceRecord => {
    services = services.map(s => {
      if (s.id !== id) return s;
      const merged: ServiceRecord = { ...s, ...data };
      const levelId = inferLevelId(merged);
      return normalizeServiceRecord({
        id: merged.id,
        name: merged.name,
        description: merged.description,
        basePrice: merged.basePrice,
        estimatedTime: merged.estimatedTime,
        isActive: merged.isActive,
        level: merged.level,
        levelId,
        parentServiceId: merged.parentServiceId,
        isVariant: merged.isVariant,
        createdAt: merged.createdAt,
      });
    });
    return services.find(s => s.id === id)!;
  },
  delete: (id: string): void => {
    overrides = overrides.filter(o => o.serviceId !== id);
    services = services.filter(s => s.id !== id);
  },
  getCount: (): number => services.length,

  // Product overrides
  getOverrides: (): ServiceProduct[] => [...overrides],
  getOverridesByService: (serviceId: string): ServiceProduct[] => overrides.filter(o => o.serviceId === serviceId),
  getOverridesByProduct: (productId: string): ServiceProduct[] => overrides.filter(o => o.productId === productId),
  upsertOverride: (data: Omit<ServiceProduct, 'id'>): ServiceProduct => {
    const existing = overrides.find(o => o.serviceId === data.serviceId && o.productId === data.productId);
    if (existing) {
      overrides = overrides.map(o => o.id === existing.id ? { ...o, ...data, isActive: data.isActive ?? true } : o);
      return overrides.find(o => o.id === existing.id)!;
    }
    const override: ServiceProduct = { ...data, id: crypto.randomUUID(), isActive: data.isActive ?? true };
    overrides = [...overrides, override];
    return override;
  },
  deleteOverride: (id: string): void => { overrides = overrides.filter(o => o.id !== id); },
};