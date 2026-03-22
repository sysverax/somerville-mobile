import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useBookings } from '@/hooks/useBookings';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, List, Loader2, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { formatDate, formatTime, formatDateTime } from '@/utils/dateUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BookingsPage = () => {
  const { brands, categories, products, isLoading: optionsLoading } = useFilterOptions();
  const navigate = useNavigate();
  
  // Filters
  const [filters, setFilters] = useState({ brandName: '', categoryName: '', productId: '', date: '' });
  const [applied, setApplied] = useState({ brandName: '', categoryName: '', productId: '', date: '' });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const selectedPickerDate = filters.date ? new Date(filters.date + 'T00:00:00') : undefined;

  // Bookings fetching
  const { bookings, loading, error, refetch } = useBookings({ autoFetch: false });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [selected, setSelected] = useState<Booking | null>(null);

  const hasChanges = JSON.stringify(filters) !== JSON.stringify(applied);

  useEffect(() => {
    if (optionsLoading) return;

    let brandId: string | undefined = undefined;
    if (applied.brandName) {
      brandId = brands.find(b => b.name === applied.brandName)?.id;
    }
    let categoryId: string | undefined = undefined;
    if (applied.categoryName) {
      categoryId = categories.find(c => c.name === applied.categoryName)?.id;
    }

    refetch({
      limit: 500, // Fetch many for calendar
      brandId,
      categoryId,
      productId: applied.productId || undefined,
      date: applied.date || undefined
    });
  }, [applied, brands, categories, optionsLoading, refetch]);

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
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
              <Loader2 className="h-4 w-4 mr-2" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters (Original Style) */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 w-full">
        <div className="space-y-1"><Label className="text-xs">Brand</Label>
          <Select value={filters.brandName || "all"} onValueChange={v => setFilters(f => ({ ...f, brandName: v === 'all' ? '' : v }))}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All Brands" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Category</Label>
          <Select value={filters.categoryName || "all"} onValueChange={v => setFilters(f => ({ ...f, categoryName: v === 'all' ? '' : v }))}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {[...new Set(categories.map(c => c.name))].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Product</Label>
          <Select value={filters.productId || "all"} onValueChange={v => setFilters(f => ({ ...f, productId: v === 'all' ? '' : v }))}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All Products" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col space-y-1">
          <Label className="text-xs">Date</Label>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[160px] justify-start text-left font-normal h-10 px-2",
                  !filters.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 h-3.5 w-3.5 shrink-0" />
                <span className="text-sm truncate">
                  {filters.date ? format(selectedPickerDate!, 'dd/MM/yyyy') : 'dd/mm/yyyy'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker
                mode="single"
                selected={selectedPickerDate}
                onSelect={(day) => {
                  setFilters(f => ({ ...f, date: day ? format(day, 'yyyy-MM-dd') : '' }));
                  setIsDatePickerOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="col-span-2 sm:contents flex gap-2">
          {hasChanges && <Button className="flex-1 sm:flex-none" onClick={() => setApplied({ ...filters })}>Apply</Button>}
          {(applied.brandName || applied.categoryName || applied.productId || applied.date) && (
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => { const empty = { brandName: '', categoryName: '', productId: '', date: '' }; setFilters(empty); setApplied(empty); }}>Clear</Button>
          )}
          <div className="ml-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => navigate('/bookings/list')}><List className="h-4 w-4" /> List View</Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}><ChevronLeft className="h-5 w-5" /></Button>
          <h3 className="text-lg font-semibold min-w-[150px] text-center">{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}><ChevronRight className="h-5 w-5" /></Button>
        </div>

        <div className="rounded-xl border border-border overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {dayHeaders.map(d => (
                <div key={d} className="py-2 px-1 text-center text-xs font-medium text-muted-foreground bg-card border-b border-border">{d}</div>
              ))}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border/50 bg-muted/10" />
              ))}
              {days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayBookings = (bookingsByDate.get(dateStr) || []).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

                return (
                  <div key={dateStr} className={`min-h-[100px] border-b border-r border-border/50 p-1 ${!isSameMonth(day, currentMonth) ? 'bg-muted/10' : ''}`}>
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5 max-h-[180px] overflow-y-auto scrollbar-hide">
                      {dayBookings.map(b => (
                        <div key={b.id} className="text-[10px] bg-primary/15 text-primary rounded px-1 py-0.5 truncate cursor-pointer hover:bg-primary/25" onClick={() => setSelected(b)}>
                          {b.timeSlot} {b.customerName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                <div><Label className="text-xs text-muted-foreground">Date & Time</Label><p className="font-medium">{formatDate(selected.date)} at {formatTime(selected.timeSlot)}</p></div>
                <div><Label className="text-xs text-muted-foreground">Created</Label><p className="font-medium">{formatDateTime(selected.createdAt)}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPage;
