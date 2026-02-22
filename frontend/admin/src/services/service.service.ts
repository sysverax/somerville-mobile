import { ServiceRecord, ServiceTemplate, ServiceAssignment, ServiceProduct, ServiceProductOverride } from '@/types';
import { mockServices, mockServiceTemplates, mockServiceAssignments, mockServiceProductOverrides } from '@/mock-data/services';
import { mockProducts } from '@/mock-data/products';

let services: ServiceRecord[] = [...mockServices];
let templates: ServiceTemplate[] = [...mockServiceTemplates];
let assignments: ServiceAssignment[] = [...mockServiceAssignments];
let overrides: ServiceProduct[] = [...mockServiceProductOverrides];

// Helper: Get products that inherit a service based on its level
const getLinkedProductsForService = (service: ServiceRecord): string[] => {
  switch (service.level) {
    case 'brand':
      return mockProducts.filter(p => p.brandId === service.brandId).map(p => p.id);
    case 'category':
      return mockProducts.filter(p => p.categoryId === service.categoryId).map(p => p.id);
    case 'series':
      return mockProducts.filter(p => p.seriesId === service.seriesId).map(p => p.id);
    case 'product':
      return service.productId ? [service.productId] : [];
    default:
      return [];
  }
};

// Helper: Auto-create product_service records for a service
const autoPopulateProductServices = (service: ServiceRecord): void => {
  // Only create for non-variant services or variants with prices
  if (service.basePrice === 0 && service.estimatedTime === 0) return;

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
      };
      overrides.push(productService);
    }
  });
};

export const serviceService = {
  // New ServiceRecord CRUD
  getAll: (): ServiceRecord[] => [...services],
  getById: (id: string): ServiceRecord | undefined => services.find(s => s.id === id),
  getParentServices: (): ServiceRecord[] => services.filter(s => !s.isVariant),
  getVariants: (parentId: string): ServiceRecord[] => services.filter(s => s.parentServiceId === parentId && s.isVariant),
  hasVariants: (parentId: string): boolean => services.some(s => s.parentServiceId === parentId && s.isVariant),
  create: (data: Omit<ServiceRecord, 'id' | 'createdAt'>): ServiceRecord => {
    const record: ServiceRecord = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] };
    services = [...services, record];
    // Auto-create product_service records for all linked products
    autoPopulateProductServices(record);
    return record;
  },
  update: (id: string, data: Partial<ServiceRecord>): ServiceRecord => {
    services = services.map(s => s.id === id ? { ...s, ...data } : s);
    return services.find(s => s.id === id)!;
  },
  delete: (id: string): void => {
    // Also delete child variants and their overrides
    const children = services.filter(s => s.parentServiceId === id);
    children.forEach(c => {
      overrides = overrides.filter(o => o.serviceId !== c.id);
    });
    overrides = overrides.filter(o => o.serviceId !== id);
    services = services.filter(s => s.id !== id && s.parentServiceId !== id);
  },
  getCount: (): number => services.length,

  // Product overrides
  getOverrides: (): ServiceProduct[] => [...overrides],
  getOverridesByService: (serviceId: string): ServiceProduct[] => overrides.filter(o => o.serviceId === serviceId),
  getOverridesByProduct: (productId: string): ServiceProduct[] => overrides.filter(o => o.productId === productId),
  upsertOverride: (data: Omit<ServiceProduct, 'id'>): ServiceProduct => {
    const existing = overrides.find(o => o.serviceId === data.serviceId && o.productId === data.productId);
    if (existing) {
      overrides = overrides.map(o => o.id === existing.id ? { ...o, ...data } : o);
      return overrides.find(o => o.id === existing.id)!;
    }
    const override: ServiceProduct = { ...data, id: crypto.randomUUID() };
    overrides = [...overrides, override];
    return override;
  },
  deleteOverride: (id: string): void => { overrides = overrides.filter(o => o.id !== id); },

  // Legacy template/assignment APIs
  getTemplates: (): ServiceTemplate[] => [...templates],
  getTemplateById: (id: string): ServiceTemplate | undefined => templates.find(t => t.id === id),
  createTemplate: (data: Omit<ServiceTemplate, 'id' | 'isActive'>): ServiceTemplate => {
    const template: ServiceTemplate = { ...data, id: crypto.randomUUID(), isActive: true };
    templates = [...templates, template];
    return template;
  },
  updateTemplate: (id: string, data: Partial<ServiceTemplate>): ServiceTemplate => {
    templates = templates.map(t => t.id === id ? { ...t, ...data } : t);
    return templates.find(t => t.id === id)!;
  },
  deleteTemplate: (id: string): void => { templates = templates.filter(t => t.id !== id); },
  getTemplateCount: (): number => templates.length,
  getAssignments: (): ServiceAssignment[] => [...assignments],
  getAssignmentsByTemplate: (templateId: string): ServiceAssignment[] => assignments.filter(a => a.templateId === templateId),
  createAssignment: (data: Omit<ServiceAssignment, 'id' | 'isActive'>): ServiceAssignment => {
    const assignment: ServiceAssignment = { ...data, id: crypto.randomUUID(), isActive: true };
    assignments = [...assignments, assignment];
    return assignment;
  },
  updateAssignment: (id: string, data: Partial<ServiceAssignment>): ServiceAssignment => {
    assignments = assignments.map(a => a.id === id ? { ...a, ...data } : a);
    return assignments.find(a => a.id === id)!;
  },
  deleteAssignment: (id: string): void => { assignments = assignments.filter(a => a.id !== id); },
};
