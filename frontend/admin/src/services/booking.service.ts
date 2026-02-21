import { Booking, TimeSlotConfig } from '@/types';
import { mockBookings, mockTimeSlotConfig } from '@/mock-data/bookings';

const bookings: Booking[] = [...mockBookings];
let config: TimeSlotConfig = { ...mockTimeSlotConfig };

export const bookingService = {
  getAll: (): Booking[] => [...bookings],
  getById: (id: string): Booking | undefined => bookings.find(b => b.id === id),
  getRecent: (limit: number): Booking[] =>
    [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit),
  getByDate: (date: string): Booking[] => bookings.filter(b => b.date === date),
  getCount: (): number => bookings.length,
  getTimeSlotConfig: (): TimeSlotConfig => ({ ...config }),
  updateTimeSlotConfig: (data: TimeSlotConfig): void => { config = { ...data }; },
};
