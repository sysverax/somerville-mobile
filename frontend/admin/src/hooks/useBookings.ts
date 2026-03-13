import { useState, useCallback, useEffect, useRef } from 'react';
import { Booking, TimeSlotConfig } from '@/types';
import { bookingService } from '@/services/booking.service';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [config, setConfig] = useState<TimeSlotConfig>(bookingService.getTimeSlotConfig());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFilters = useRef<{ page?: number; limit?: number; brandId?: string; categoryId?: string; productId?: string; date?: string } | undefined>();

  const fetchBookings = useCallback(async (filters?: { page?: number; limit?: number; brandId?: string; categoryId?: string; productId?: string; date?: string }) => {
    try {
      setError(null);
      if (filters !== undefined) lastFilters.current = filters;
      const { bookings: bookingsData, total: totalItems } = await bookingService.getAll(lastFilters.current);
      setBookings(bookingsData);
      setTotal(totalItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      setBookings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateConfig = useCallback((data: TimeSlotConfig) => {
    bookingService.updateTimeSlotConfig(data);
    setConfig(bookingService.getTimeSlotConfig());
  }, []);

  const refetch = useCallback((filters?: { page?: number; limit?: number; brandId?: string; categoryId?: string; productId?: string; date?: string }) => {
    fetchBookings(filters);
  }, [fetchBookings]);

  return { bookings, total, config, loading, error, updateConfig, refetch };
};
