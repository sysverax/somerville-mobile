import { Booking } from '@/types';
import { Loader2 } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

interface BookingsTableProps {
  bookings: Booking[];
  loading?: boolean;
  compact?: boolean;
  onRowClick?: (booking: Booking) => void;
}

const BookingsTable = ({ bookings, loading = false, compact = false, onRowClick }: BookingsTableProps) => {
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-border">
        <div className="col-span-full flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className={compact ? "border-b border-border" : "bg-card border-b border-border"}>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
            {!compact && <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Email</th>}
            {!compact && <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Phone</th>}
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Service</th>
            {!compact && <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>}
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr 
              key={b.id} 
              className="border-b border-border/50 hover:bg-muted/30 cursor-pointer"
              onClick={() => onRowClick?.(b)}
            >
              <td className="py-3 px-4">{b.date}</td>
              <td className="py-3 px-4">{b.timeSlot}</td>
              <td className="py-3 px-4">{b.customerName}</td>
              {!compact && (
                <td className="py-3 px-4 hidden md:table-cell">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=${b.customerEmail}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    {b.customerEmail}
                  </a>
                </td>
              )}
              {!compact && (
                <td className="py-3 px-4 hidden lg:table-cell">
                  <a
                    href={`tel:${b.customerPhone}`}
                    className="hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    {b.customerPhone}
                  </a>
                </td>
              )}
              <td className="py-3 px-4">{b.productName}</td>
              <td className="py-3 px-4">{b.serviceName}</td>
              {!compact && <td className="py-3 px-4">{b.createdAt}</td>}
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={compact ? 5 : 8} className="py-0">
                <EmptyState 
                  title={compact ? "No recent bookings" : "No bookings found"} 
                  description="New bookings will appear here once customers place them." 
                  compact={compact} 
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingsTable;
