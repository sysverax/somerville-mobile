import { useState, useMemo } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth } from 'date-fns';

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarPage = () => {
  const { bookings } = useBookings();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // Feb 2026 to show mock data
  const [selected, setSelected] = useState<Booking | null>(null);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOffset = getDay(days[0]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(b => {
      const existing = map.get(b.date) || [];
      existing.push(b);
      map.set(b.date, existing);
    });
    return map;
  }, [bookings]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <h3 className="text-lg font-semibold min-w-[160px] text-center">{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => navigate('/bookings')}><List className="h-4 w-4" /> List View</Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-7">
          {dayHeaders.map(d => (
            <div key={d} className="py-2 px-1 text-center text-xs font-medium text-muted-foreground bg-card border-b border-border">{d}</div>
          ))}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border/50 bg-muted/10" />
          ))}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayBookings = bookingsByDate.get(dateStr) || [];
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

            return (
              <div key={dateStr} className={`min-h-[100px] border-b border-r border-border/50 p-1 ${!isSameMonth(day, currentMonth) ? 'bg-muted/10' : ''}`}>
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 3).map(b => (
                    <div key={b.id} className="text-[10px] bg-primary/15 text-primary rounded px-1 py-0.5 truncate cursor-pointer hover:bg-primary/25" onClick={() => setSelected(b)}>
                      {b.timeSlot} {b.customerName}
                    </div>
                  ))}
                  {dayBookings.length > 3 && <div className="text-[10px] text-muted-foreground px-1">+{dayBookings.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Customer</Label><p className="font-medium">{selected.customerName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium">{selected.customerEmail}</p></div>
                <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="font-medium">{selected.customerPhone}</p></div>
                <div><Label className="text-xs text-muted-foreground">Brand</Label><p className="font-medium">{selected.brandName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Product</Label><p className="font-medium">{selected.productName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Service</Label><p className="font-medium">{selected.serviceName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Date & Time</Label><p className="font-medium">{selected.date} at {selected.timeSlot}</p></div>
                <div><Label className="text-xs text-muted-foreground">Created</Label><p className="font-medium">{selected.createdAt}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
