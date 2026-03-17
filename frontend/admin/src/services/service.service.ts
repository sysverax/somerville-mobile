import { ServiceDocument, ServiceRecord } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiEnvelope<T> = {
  message: string;
  data: T;
  error: {
    code: number;
    detail: string;
    solution: string;
  } | null;
};

type ServiceApiDocument = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedTime: number;
  isActive: boolean;
  level: 'brand' | 'category' | 'series' | 'product';
  levelId: string;
  isParent: boolean;
  isVariant: boolean;
  parentServiceId: string | null;
  createdAt: string;
  updatedAt: string;
  linkedProductsCount: number;
  assignedTo: string;
  variants?: ServiceApiDocument[];
};

type ServiceListPayload = {
  services: ServiceApiDocument[];
  totalServices: number;
  currentPage: number;
  pageSize: number;
};

type ServiceDetailPayload = {
  service: ServiceApiDocument;
  variants: ServiceApiDocument[];
  linkedProductsCount: number;
};

export type CreateServiceInput = {
  name: string;
  description?: string;
  level: 'brand' | 'category' | 'series' | 'product';
  levelId: string;
  isActive?: boolean;
  basePrice?: number;
  estimatedTime?: number;
  variants?: Array<{
    name: string;
    description?: string;
    basePrice: number;
    estimatedTime: number;
  }>;
};

export type UpdateServiceInput = {
  name?: string;
  description?: string;
  basePrice?: number;
  estimatedTime?: number;
  isActive?: boolean;
  level?: 'brand' | 'category' | 'series' | 'product';
  levelId?: string;
  variants?: Array<{
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    estimatedTime: number;
    isActive?: boolean;
  }>;
  removeVariants?: string[];
  newVariants?: Array<{
    name: string;
    description?: string;
    basePrice: number;
    estimatedTime: number;
    isActive?: boolean;
  }>;
};

export type GetServicesFilters = {
  page?: number;
  limit?: number;
  level?: string;
  brandId?: string;
  categoryId?: string;
  seriesId?: string;
  productId?: string;
  search?: string;
  isActive?: boolean;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
};

const mapApiService = (doc: ServiceApiDocument): ServiceDocument => ({
  id: doc.id,
  name: doc.name,
  description: doc.description ?? '',
  basePrice: doc.basePrice,
  estimatedTime: doc.estimatedTime,
  isActive: doc.isActive,
  level: doc.level,
  levelId: doc.levelId,
  isParent: doc.isParent,
  isVariant: doc.isVariant,
  parentServiceId: doc.parentServiceId ?? null,
  createdAt: doc.createdAt,
  linkedProductsCount: doc.linkedProductsCount || 0,
  assignedTo: doc.assignedTo || '',
});

let serviceCache: ServiceDocument[] = [];

export const serviceService = {

  getAll: async (filters: GetServicesFilters = {}): Promise<{ data: ServiceRecord[]; total: number }> => {
    const params = new URLSearchParams();
    params.append('page', String(filters.page || 1));
    params.append('limit', String(filters.limit || 10));
    if (filters.level) params.append('level', filters.level);
    if (filters.brandId && filters.brandId !== 'all') params.append('brandId', filters.brandId);
    if (filters.categoryId && filters.categoryId !== 'all') params.append('categoryId', filters.categoryId);
    if (filters.seriesId && filters.seriesId !== 'all') params.append('seriesId', filters.seriesId);
    if (filters.productId && filters.productId !== 'all') params.append('productId', filters.productId);
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));

    const response = await fetch(`${API_BASE_URL}/api/services?${params.toString()}`, {
      method: 'GET',
      headers: { 'x-user-role': 'admin' },
      credentials: 'include',
    });

    const data = await parseResponse<ServiceListPayload>(response);
    const allServices: ServiceDocument[] = [];
    data.services.forEach(s => {
      allServices.push(mapApiService(s));
      if (s.variants && Array.isArray(s.variants)) {
        s.variants.forEach(v => allServices.push(mapApiService(v)));
      }
    });
    serviceCache = allServices;
    return {
      data: [...serviceCache].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as ServiceRecord[],
      total: data.totalServices || 0
    };
  },

  getById: async (id: string): Promise<ServiceDetailPayload & { mappedService: ServiceDocument; mappedVariants: ServiceDocument[] }> => {
    const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
      method: 'GET',
      headers: { 'x-user-role': 'admin' },
      credentials: 'include',
    });

    const data = await parseResponse<ServiceDetailPayload>(response);
    return {
      ...data,
      mappedService: mapApiService(data.service),
      mappedVariants: data.variants.map(mapApiService),
    };
  },

  create: async (input: CreateServiceInput): Promise<ServiceDocument> => {
    const body: Record<string, unknown> = {
      name: input.name,
      description: input.description ?? '',
      level: input.level,
      levelId: input.levelId,
      isActive: input.isActive ?? true,
    };

    if (input.variants && input.variants.length > 0) {
      body.variants = input.variants;
    } else {
      body.basePrice = input.basePrice;
      body.estimatedTime = input.estimatedTime;
    }

    const response = await fetch(`${API_BASE_URL}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const created = await parseResponse<ServiceApiDocument>(response);
    const mapped = mapApiService(created);
    serviceCache = [mapped, ...serviceCache];
    return mapped;
  },

  update: async (id: string, input: UpdateServiceInput): Promise<ServiceDocument> => {
    if (input.isActive !== undefined && Object.keys(input).length === 1) {
      const response = await fetch(`${API_BASE_URL}/api/services/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: input.isActive }),
      });
      const updated = await parseResponse<{ id: string; isActive: boolean }>(response);
      serviceCache = serviceCache.map(s =>
        s.id === id ? { ...s, isActive: updated.isActive } : s
      );
      return serviceCache.find(s => s.id === id)!;
    }

    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = input.description;
    if (input.basePrice !== undefined) payload.basePrice = input.basePrice;
    if (input.estimatedTime !== undefined) payload.estimatedTime = input.estimatedTime;
    if (input.isActive !== undefined) payload.isActive = input.isActive;
    if (input.level !== undefined) payload.level = input.level;
    if (input.levelId !== undefined) payload.levelId = input.levelId;
    if (input.variants !== undefined) payload.variants = input.variants;
    if (input.removeVariants !== undefined) payload.removeVariants = input.removeVariants;
    if (input.newVariants !== undefined) payload.newVariants = input.newVariants;

    const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const updated = await parseResponse<ServiceApiDocument>(response);
    const mapped = mapApiService(updated);
    serviceCache = serviceCache.map(s => (s.id === id ? mapped : s));
    return mapped;
  },

  updateStatus: async (id: string, isActive: boolean): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/services/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive }),
    });
    await parseResponse<{ id: string; isActive: boolean }>(response);
    serviceCache = serviceCache.map(s => (s.id === id ? { ...s, isActive } : s));
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/services/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-role': 'admin' },
      credentials: 'include',
    });
    await parseResponse<{ serviceId: string }>(response);
    serviceCache = serviceCache.filter(s => s.id !== id && s.parentServiceId !== id);
  },

  getCount: (): number => serviceCache.length,
};