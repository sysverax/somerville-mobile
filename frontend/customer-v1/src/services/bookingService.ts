import type { Booking, BookingSlot } from '@/src/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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

export const getAllBookings = async (params: any = {}): Promise<Booking[]> => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/api/bookings?${queryParams}`, {
      headers: {
        'x-user-role': 'admin', // Only admins can see all bookings
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const rawBookings = json.data?.bookings || [];
    
    return rawBookings.map((b: any) => ({
      id: b.id,
      productId: b.productId,
      serviceId: b.productServiceId,
      date: new Date(b.scheduleDateTime).toISOString().split('T')[0],
      time: b.scheduleDateTime.split('T')[1].substring(0, 5),
      customerName: b.name,
      customerPhone: b.phone,
      customerEmail: b.email,
      status: b.status,
      createdAt: b.createdAt,
    }));
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return [];
  }
};

export const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
  try {
    // Construct scheduleDateTime from date and time strings
    // time format is likely "HH:mm – HH:mm" or just "HH:mm" from TIME_SLOTS
    const timeStart = booking.time.split(' – ')[0];
    const scheduleDateTime = new Date(`${booking.date}T${timeStart}`).toISOString();

    const payload = {
      productServiceId: booking.serviceId,
      scheduleDateTime,
      name: booking.customerName,
      email: booking.customerEmail,
      phone: booking.customerPhone,
    };

    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'public',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const b = json.data;

    return {
      id: b.id,
      productId: b.productId,
      serviceId: b.productServiceId,
      date: new Date(b.scheduleDateTime).toISOString().split('T')[0],
      time: b.scheduleDateTime.split('T')[1].substring(0, 5),
      customerName: b.name,
      customerPhone: b.phone,
      customerEmail: b.email,
      status: b.status,
      createdAt: b.createdAt,
    };
  } catch (error) {
    console.error('Failed to add booking:', error);
    throw error;
  }
};

export const getBookingsByProduct = async (productId: string): Promise<Booking[]> => {
  return getAllBookings({ productId });
};
