import { Booking, TimeSlotConfig } from '@/types';

export const mockBookings: Booking[] = [
  { id: 'bk1', customerName: 'John Smith', customerEmail: 'john.smith@email.com', customerPhone: '+1 555-0101', productId: 'p3', productName: 'iPhone 15 Pro', brandName: 'Apple', categoryName: 'iPhone', serviceName: 'Screen Repair', date: '2026-02-10', timeSlot: '10:00', createdAt: '2026-02-08' },
  { id: 'bk2', customerName: 'Jane Doe', customerEmail: 'jane.doe@email.com', customerPhone: '+1 555-0102', productId: 'p24', productName: 'Galaxy S24 Ultra', brandName: 'Samsung', categoryName: 'Galaxy S', serviceName: 'Battery Replacement', date: '2026-02-10', timeSlot: '11:30', createdAt: '2026-02-07' },
  { id: 'bk3', customerName: 'Mike Johnson', customerEmail: 'mike.j@email.com', customerPhone: '+1 555-0103', productId: 'p4', productName: 'iPhone 15 Pro Max', brandName: 'Apple', categoryName: 'iPhone', serviceName: 'Full Diagnostic', date: '2026-02-11', timeSlot: '09:00', createdAt: '2026-02-09' },
  { id: 'bk4', customerName: 'Sarah Wilson', customerEmail: 'sarah.w@email.com', customerPhone: '+1 555-0104', productId: 'p37', productName: 'Pixel 8 Pro', brandName: 'Google', categoryName: 'Pixel Phone', serviceName: 'Screen Repair', date: '2026-02-12', timeSlot: '14:00', createdAt: '2026-02-09' },
  { id: 'bk5', customerName: 'Tom Brown', customerEmail: 'tom.brown@email.com', customerPhone: '+1 555-0105', productId: 'p4', productName: 'iPhone 15 Pro Max', brandName: 'Apple', categoryName: 'iPhone', serviceName: 'Charging Port Repair', date: '2026-02-12', timeSlot: '10:00', createdAt: '2026-02-08' },
  { id: 'bk6', customerName: 'Emily Davis', customerEmail: 'emily.d@email.com', customerPhone: '+1 555-0106', productId: 'p24', productName: 'Galaxy S24 Ultra', brandName: 'Samsung', categoryName: 'Galaxy S', serviceName: 'Full Diagnostic', date: '2026-02-13', timeSlot: '15:30', createdAt: '2026-02-10' },
  { id: 'bk7', customerName: 'Chris Lee', customerEmail: 'chris.lee@email.com', customerPhone: '+1 555-0107', productId: 'p3', productName: 'iPhone 15 Pro', brandName: 'Apple', categoryName: 'iPhone', serviceName: 'Battery Replacement', date: '2026-02-14', timeSlot: '11:00', createdAt: '2026-02-10' },
  { id: 'bk8', customerName: 'Anna Martinez', customerEmail: 'anna.m@email.com', customerPhone: '+1 555-0108', productId: 'p37', productName: 'Pixel 8 Pro', brandName: 'Google', categoryName: 'Pixel Phone', serviceName: 'Software Reset', date: '2026-02-14', timeSlot: '16:00', createdAt: '2026-02-11' },
  { id: 'bk9', customerName: 'David Kim', customerEmail: 'david.kim@email.com', customerPhone: '+1 555-0109', productId: 'p42', productName: 'Xbox Series X', brandName: 'Gaming Console', categoryName: 'Xbox', serviceName: 'HDMI Port Repair', date: '2026-02-15', timeSlot: '09:30', createdAt: '2026-02-12' },
  { id: 'bk10', customerName: 'Lisa Chen', customerEmail: 'lisa.chen@email.com', customerPhone: '+1 555-0110', productId: 'p17', productName: 'MacBook Pro 14-inch M3', brandName: 'Apple', categoryName: 'MacBook', serviceName: 'Keyboard Replacement', date: '2026-02-15', timeSlot: '13:00', createdAt: '2026-02-12' },
  { id: 'bk11', customerName: 'Ryan Patel', customerEmail: 'ryan.p@email.com', customerPhone: '+1 555-0111', productId: 'p28', productName: 'Galaxy Z Fold 5', brandName: 'Samsung', categoryName: 'Galaxy Z (Foldables)', serviceName: 'Fold Screen Repair', date: '2026-02-16', timeSlot: '10:00', createdAt: '2026-02-13' },
  { id: 'bk12', customerName: 'Maria Garcia', customerEmail: 'maria.g@email.com', customerPhone: '+1 555-0112', productId: 'p47', productName: 'OnePlus 12', brandName: 'OnePlus', categoryName: 'OnePlus Number Series', serviceName: 'Battery Replacement', date: '2026-02-16', timeSlot: '14:30', createdAt: '2026-02-13' },
  { id: 'bk13', customerName: 'James Wilson', customerEmail: 'james.w@email.com', customerPhone: '+1 555-0113', productId: 'p44', productName: 'PlayStation 5 Standard', brandName: 'Gaming Console', categoryName: 'PlayStation', serviceName: 'Disc Drive Replacement', date: '2026-02-17', timeSlot: '11:00', createdAt: '2026-02-14' },
  { id: 'bk14', customerName: 'Sophie Turner', customerEmail: 'sophie.t@email.com', customerPhone: '+1 555-0114', productId: 'p19', productName: 'Apple Watch Series 9 41mm', brandName: 'Apple', categoryName: 'Apple Watch', serviceName: 'Band Replacement', date: '2026-02-17', timeSlot: '15:00', createdAt: '2026-02-14' },
];

export const mockTimeSlotConfig: TimeSlotConfig = {
  workingDays: [1, 2, 3, 4, 5, 6],
  startTime: '09:00',
  endTime: '18:00',
  slotDuration: 15,
};
