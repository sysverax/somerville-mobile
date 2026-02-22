import { useState, useCallback } from 'react';
import { ServiceRecord, ServiceTemplate, ServiceAssignment, ServiceProduct, ServiceProductOverride } from '@/types';
import { serviceService } from '@/services/service.service';

export const useServices = () => {
  const [services, setServices] = useState<ServiceRecord[]>(serviceService.getAll());
  const [templates, setTemplates] = useState<ServiceTemplate[]>(serviceService.getTemplates());
  const [assignments, setAssignments] = useState<ServiceAssignment[]>(serviceService.getAssignments());
  const [overrides, setOverrides] = useState<ServiceProduct[]>(serviceService.getOverrides());

  const refreshServices = useCallback(() => setServices(serviceService.getAll()), []);
  const refreshTemplates = useCallback(() => setTemplates(serviceService.getTemplates()), []);
  const refreshAssignments = useCallback(() => setAssignments(serviceService.getAssignments()), []);
  const refreshOverrides = useCallback(() => setOverrides(serviceService.getOverrides()), []);
  const refresh = useCallback(() => { refreshServices(); refreshTemplates(); refreshAssignments(); refreshOverrides(); }, [refreshServices, refreshTemplates, refreshAssignments, refreshOverrides]);

  // ServiceRecord ops
  const createService = useCallback((data: Omit<ServiceRecord, 'id' | 'createdAt'>) => {
    const created = serviceService.create(data);
    refreshServices();
    return created;
  }, [refreshServices]);

  const updateService = useCallback((id: string, data: Partial<ServiceRecord>) => {
    serviceService.update(id, data);
    refreshServices();
  }, [refreshServices]);

  const deleteService = useCallback((id: string) => {
    serviceService.delete(id);
    refreshServices();
    refreshOverrides();
  }, [refreshServices, refreshOverrides]);

  // Variant helpers
  const getVariants = useCallback((parentId: string) => {
    return services.filter(s => s.parentServiceId === parentId && s.isVariant);
  }, [services]);

  const hasVariants = useCallback((parentId: string) => {
    return services.some(s => s.parentServiceId === parentId && s.isVariant);
  }, [services]);

  const getParentServices = useCallback(() => {
    return services.filter(s => !s.isVariant);
  }, [services]);

  // Override ops
  const upsertOverride = useCallback((data: Omit<ServiceProductOverride, 'id'>) => {
    serviceService.upsertOverride(data);
    refreshOverrides();
  }, [refreshOverrides]);

  const deleteOverride = useCallback((id: string) => {
    serviceService.deleteOverride(id);
    refreshOverrides();
  }, [refreshOverrides]);

  const getOverridesByService = useCallback((serviceId: string) => {
    return overrides.filter(o => o.serviceId === serviceId);
  }, [overrides]);

  const getOverridesByProduct = useCallback((productId: string) => {
    return overrides.filter(o => o.productId === productId);
  }, [overrides]);

  const toggleServiceForProduct = useCallback((serviceId: string, productId: string, isDisabled: boolean) => {
    const existing = overrides.find(o => o.serviceId === serviceId && o.productId === productId);
    if (existing) {
      serviceService.upsertOverride({ ...existing, isDisabled });
    } else {
      const svc = serviceService.getById(serviceId);
      serviceService.upsertOverride({
        serviceId,
        productId,
        price: svc?.basePrice ?? 0,
        estimatedTime: svc?.estimatedTime ?? 30,
        isDisabled,
      });
    }
    refreshOverrides();
  }, [overrides, refreshOverrides]);

  // Legacy template ops
  const createTemplate = useCallback((data: Omit<ServiceTemplate, 'id' | 'isActive'>) => {
    serviceService.createTemplate(data);
    refreshTemplates();
  }, [refreshTemplates]);

  const updateTemplate = useCallback((id: string, data: Partial<ServiceTemplate>) => {
    serviceService.updateTemplate(id, data);
    refreshTemplates();
  }, [refreshTemplates]);

  const deleteTemplate = useCallback((id: string) => {
    serviceService.deleteTemplate(id);
    refreshTemplates();
  }, [refreshTemplates]);

  const createAssignment = useCallback((data: Omit<ServiceAssignment, 'id' | 'isActive'>) => {
    serviceService.createAssignment(data);
    refreshAssignments();
  }, [refreshAssignments]);

  const updateAssignment = useCallback((id: string, data: Partial<ServiceAssignment>) => {
    serviceService.updateAssignment(id, data);
    refreshAssignments();
  }, [refreshAssignments]);

  const deleteAssignment = useCallback((id: string) => {
    serviceService.deleteAssignment(id);
    refreshAssignments();
  }, [refreshAssignments]);

  return {
    services, createService, updateService, deleteService,
    getVariants, hasVariants, getParentServices,
    overrides, upsertOverride, deleteOverride, getOverridesByService, getOverridesByProduct, toggleServiceForProduct,
    templates, assignments, createTemplate, updateTemplate, deleteTemplate,
    createAssignment, updateAssignment, deleteAssignment, refresh,
  };
};
