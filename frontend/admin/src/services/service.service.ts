import { ServiceRecord, ServiceTemplate, ServiceAssignment, ServiceProductOverride } from '@/types';
import { mockServices, mockServiceTemplates, mockServiceAssignments, mockServiceProductOverrides } from '@/mock-data/services';

let services: ServiceRecord[] = [...mockServices];
let templates: ServiceTemplate[] = [...mockServiceTemplates];
let assignments: ServiceAssignment[] = [...mockServiceAssignments];
let overrides: ServiceProductOverride[] = [...mockServiceProductOverrides];

export const serviceService = {
  // New ServiceRecord CRUD
  getAll: (): ServiceRecord[] => [...services],
  getById: (id: string): ServiceRecord | undefined => services.find(s => s.id === id),
  create: (data: Omit<ServiceRecord, 'id' | 'createdAt'>): ServiceRecord => {
    const record: ServiceRecord = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString().split('T')[0] };
    services = [...services, record];
    return record;
  },
  update: (id: string, data: Partial<ServiceRecord>): ServiceRecord => {
    services = services.map(s => s.id === id ? { ...s, ...data } : s);
    return services.find(s => s.id === id)!;
  },
  delete: (id: string): void => { services = services.filter(s => s.id !== id); },
  getCount: (): number => services.length,

  // Product overrides
  getOverrides: (): ServiceProductOverride[] => [...overrides],
  getOverridesByService: (serviceId: string): ServiceProductOverride[] => overrides.filter(o => o.serviceId === serviceId),
  getOverridesByProduct: (productId: string): ServiceProductOverride[] => overrides.filter(o => o.productId === productId),
  upsertOverride: (data: Omit<ServiceProductOverride, 'id'>): ServiceProductOverride => {
    const existing = overrides.find(o => o.serviceId === data.serviceId && o.productId === data.productId);
    if (existing) {
      overrides = overrides.map(o => o.id === existing.id ? { ...o, ...data } : o);
      return overrides.find(o => o.id === existing.id)!;
    }
    const override: ServiceProductOverride = { ...data, id: crypto.randomUUID() };
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
