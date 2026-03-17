import { useState, useCallback, useEffect, useRef } from 'react';
import { ServiceRecord } from '@/types';
import { serviceService, GetServicesFilters, CreateServiceInput, UpdateServiceInput } from '@/services/service.service';

export const useServices = (initialFilters: GetServicesFilters = {}) => {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFilters = useRef<GetServicesFilters | undefined>();

  const fetchServices = useCallback(async (filters?: GetServicesFilters) => {
    setError(null);
    try {
      if (filters !== undefined) lastFilters.current = filters;
      const result = await serviceService.getAll(lastFilters.current || initialFilters);
      setServices(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      setServices([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = useCallback(async (data: CreateServiceInput): Promise<ServiceRecord> => {
    const created = await serviceService.create(data);
    await fetchServices();
    return created as ServiceRecord;
  }, [fetchServices]);

  const updateService = useCallback(async (id: string, data: UpdateServiceInput): Promise<ServiceRecord> => {
    const updated = await serviceService.update(id, data);
    await fetchServices();
    return updated as ServiceRecord;
  }, [fetchServices]);

  const updateServiceStatus = useCallback(async (id: string, isActive: boolean): Promise<void> => {
    await serviceService.updateStatus(id, isActive);
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive } : s));
  }, []);

  const deleteService = useCallback(async (id: string): Promise<void> => {
    await serviceService.delete(id);
    await fetchServices();
  }, [fetchServices]);

  // Variant helpers (derived from local state)
  const getVariants = useCallback((parentId: string) => {
    return services.filter(s => s.parentServiceId === parentId && s.isVariant);
  }, [services]);

  const hasVariants = useCallback((parentId: string) => {
    return services.some(s => s.parentServiceId === parentId && s.isVariant);
  }, [services]);

  const getParentServices = useCallback(() => {
    return services.filter(s => !s.isVariant);
  }, [services]);

  return {
    services,
    total,
    isLoading,
    error,
    refresh: fetchServices,
    createService,
    updateService,
    updateServiceStatus,
    deleteService,
    getVariants,
    hasVariants,
    getParentServices,
  };
};
