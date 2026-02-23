import { useState, useCallback } from 'react';
import { ServiceRecord, ServiceProduct, } from '@/types';
import { serviceService } from '@/services/service.service';

export const useServices = () => {
  const [services, setServices] = useState<ServiceRecord[]>(serviceService.getAll());
  const [overrides, setOverrides] = useState<ServiceProduct[]>(serviceService.getOverrides());

  const refreshServices = useCallback(() => setServices(serviceService.getAll()), []);
  const refreshOverrides = useCallback(() => setOverrides(serviceService.getOverrides()), []);
  const refresh = useCallback(() => { refreshServices(); refreshOverrides(); }, [refreshServices, refreshOverrides]);

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
  const upsertOverride = useCallback((data: Omit<ServiceProduct, 'id'>) => {
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

  return {
    services, createService, updateService, deleteService,
    getVariants, hasVariants, getParentServices,
    overrides, upsertOverride, deleteOverride, getOverridesByService, getOverridesByProduct, toggleServiceForProduct, refresh,
  };
};
