export interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId: string;
  productName: string;
  brandName: string;
  categoryName: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  createdAt: string;
}

export interface TimeSlotConfig {
  workingDays: number[];
  startTime: string;
  endTime: string;
  slotDuration: number;
}
