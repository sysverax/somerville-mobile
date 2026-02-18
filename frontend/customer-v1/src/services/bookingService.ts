import { bookings } from '@/src/mock-data/bookings';
import type { Booking, BookingSlot } from '@/src/types';

/**
 * Generate booking slots for the next 14 days.
 */
export const generateBookingSlots = (): BookingSlot[] => {
  const slots: BookingSlot[] = [];
  const today = new Date();

  for (let day = 1; day <= 14; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    times.forEach(time => {
      slots.push({
        date: dateStr,
        time,
        available: true,
      });
    });
  }

  return slots;
};

export const getAllBookings = (): Booking[] => {
  return bookings;
};

export const getBookingById = (id: string): Booking | undefined => {
  return bookings.find(b => b.id === id);
};

export const addBooking = (booking: Omit<Booking, 'id' | 'createdAt'>): Booking => {
  const newBooking: Booking = {
    ...booking,
    id: `booking-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  return newBooking;
};

export const getBookingsByProduct = (productId: string): Booking[] => {
  return bookings.filter(b => b.productId === productId);
};
