import { Booking } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: any;
};

export interface DashboardStats {
  summary: {
    totalBookings: number;
    totalProducts: number;
    totalServices: number;
    totalCategories: number;
    totalBrands: number;
    totalSeries: number;
  };
  recentBookings: any[];
}

export interface DashboardData {
  summary: DashboardStats['summary'];
  recentBookings: Booking[];
}

const normalizeDashboardBooking = (booking: any): Booking => ({
  id: booking._id || booking.id,
  customerName: booking.name,
  customerEmail: booking.email,
  customerPhone: booking.phone,
  productId: booking.product?._id || '',
  productName: booking.product?.name || 'Product',
  brandName: booking.brand?.name || '',
  categoryName: booking.category?.name || '',
  serviceName: booking.serviceDetails?.name || booking.productServiceId?.serviceId?.name || '',
  date: booking.scheduleDateTime ? new Date(booking.scheduleDateTime).toISOString().split('T')[0] : '',
  timeSlot: booking.scheduleDateTime ? new Date(booking.scheduleDateTime).toTimeString().slice(0, 5) : '',
  createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : '',
});

export const dashboardService = {
  getStats: async (): Promise<DashboardData> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
        method: 'GET',
        headers: {
          'x-user-role': 'admin',
        },
        credentials: 'include',
      });
      
      const payload = (await response.json()) as ApiEnvelope<DashboardStats>;
      
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to fetch dashboard stats');
      }

      const data = payload.data;
      
      return {
        summary: data.summary,
        recentBookings: data.recentBookings.map(normalizeDashboardBooking),
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw error; // Or return mock data fallback
    }
  }
};
