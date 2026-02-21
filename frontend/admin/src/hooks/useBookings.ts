import { useState, useCallback } from 'react';
import { Booking, TimeSlotConfig } from '@/types';
import { bookingService } from '@/services/booking.service';

export const useBookings = () => {
  const [bookings] = useState<Booking[]>(bookingService.getAll());
  const [config, setConfig] = useState<TimeSlotConfig>(bookingService.getTimeSlotConfig());

  const updateConfig = useCallback((data: TimeSlotConfig) => {
    bookingService.updateTimeSlotConfig(data);
    setConfig(bookingService.getTimeSlotConfig());
  }, []);

  return { bookings, config, updateConfig };
};
