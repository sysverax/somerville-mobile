const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

type ApiEnvelope<T> = {
  message: string;
  data: T;
  error: {
    code: number;
    detail: string;
    solution: string;
  } | null;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
};

type ProductServiceResponse = {
  id: string;
  serviceId: string;
  productId: string;
  name: string;
  description: string;
  basePrice: number;
  baseEstimatedTime: number;
  level: 'brand' | 'category' | 'series' | 'product';
  isVariant: boolean;
  price: number;
  estimatedTime: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

type ServiceWithVariants = {
  id: string;
  name: string;
  description: string;
  isParent: boolean;
  level: 'brand' | 'category' | 'series' | 'product';
  variants: ProductServiceResponse[];
} | ProductServiceResponse;

type GetServicesForProductResponse = {
  services: ServiceWithVariants[];
};

type ProductInfo = {
  id: string;
  name: string;
  isActive: boolean;
};

type ProductServiceItem = {
  productServiceId: string;
  serviceId: string;
  price: number;
  estimatedTime: number;
  isDefault: boolean;
  isActive: boolean;
  product: ProductInfo | null;
};

type GetProductsForServiceResponse = {
  products: ProductServiceItem[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
};

export const productServiceService = {
  getServicesForProduct: async (productId: string): Promise<GetServicesForProductResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/product-services/product/${productId}`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    return parseResponse<GetServicesForProductResponse>(response);
  },

  getProductsForService: async (
    serviceId: string
  ): Promise<GetProductsForServiceResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/product-services/${serviceId}/product`, {
      method: 'GET',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    return parseResponse<GetProductsForServiceResponse>(response);
  },

  updateProductService: async (
    id: string, 
    data: { price?: number; estimatedTime?: number; isActive?: boolean }
  ): Promise<ProductServiceResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/product-services/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return parseResponse<ProductServiceResponse>(response);
  },

  updateProductServiceStatus: async (
    id: string, 
    isActive: boolean
  ): Promise<ProductServiceResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/product-services/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'admin',
      },
      body: JSON.stringify({ isActive }),
      credentials: 'include',
    });
    return parseResponse<ProductServiceResponse>(response);
  },

  resetToDefault: async (id: string): Promise<ProductServiceResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/product-services/${id}/default`, {
      method: 'PATCH',
      headers: {
        'x-user-role': 'admin',
      },
      credentials: 'include',
    });
    return parseResponse<ProductServiceResponse>(response);
  },
};
