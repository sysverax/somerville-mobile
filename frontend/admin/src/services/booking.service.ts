import { Booking, TimeSlotConfig } from '@/types';
import { mockBookings, mockTimeSlotConfig } from '@/mock-data/bookings';

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

type BookingListPayload = {
  bookings: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const normalizeBooking = (booking: any): Booking => ({
  id: booking.id,
  customerName: booking.name,
  customerEmail: booking.email,
  customerPhone: booking.phone,
  productId: booking.product?.id || '',
  productName: booking.product?.name || '',
  brandName: booking.product?.brandName || '',
  categoryName: booking.product?.categoryName || '',
  serviceName: booking.service?.name || '',
  date: booking.scheduleDateTime ? new Date(booking.scheduleDateTime).toISOString().split('T')[0] : '',
  timeSlot: booking.scheduleDateTime ? new Date(booking.scheduleDateTime).toTimeString().slice(0, 5) : '',
  createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : '',
});

let bookings: Booking[] = [...mockBookings];
let config: TimeSlotConfig = { ...mockTimeSlotConfig };

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload.data;
};

export const bookingService = {
  getAll: async (filters?: { page?: number; limit?: number; brandId?: string; categoryId?: string; productId?: string; date?: string }): Promise<{ bookings: Booking[]; total: number }> => {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.brandId) params.append('brandId', filters.brandId);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.date) params.append('date', filters.date);

      const response = await fetch(`${API_BASE_URL}/api/bookings?${params.toString()}`, {
        method: 'GET',
        headers: {
          'x-user-role': 'admin',
        },
        credentials: 'include',
      });
      const data = await parseResponse<BookingListPayload>(response);
      bookings = data.bookings.map(normalizeBooking);
      return { bookings: [...bookings], total: data.total || 0 };
    } catch (error) {
      console.error('Failed to fetch bookings from API, using mock data:', error);
      return { bookings: [...mockBookings], total: mockBookings.length };
    }
  },
  getById: (id: string): Booking | undefined => bookings.find(b => b.id === id),
  getRecent: (limit: number): Booking[] =>
    [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit),
  getByDate: (date: string): Booking[] => bookings.filter(b => b.date === date),
  getCount: (): number => bookings.length,
  getTimeSlotConfig: (): TimeSlotConfig => ({ ...config }),
  updateTimeSlotConfig: (data: TimeSlotConfig): void => { config = { ...data }; },
};
