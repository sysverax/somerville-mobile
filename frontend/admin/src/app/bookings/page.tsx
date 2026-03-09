import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useBookings } from '@/hooks/useBookings';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import TablePagination from '@/components/TablePagination';
import EmptyState from '@/components/EmptyState';

const BookingsPage = () => {
  const { bookings } = useBookings();
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { products } = useProducts();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ brandName: '', categoryName: '', productId: '', date: '' });
  const [applied, setApplied] = useState({ brandName: '', categoryName: '', productId: '', date: '' });
  const [selected, setSelected] = useState<Booking | null>(null);
  const selectedDate = filters.date ? new Date(filters.date + 'T00:00:00') : undefined;

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasChanges = JSON.stringify(filters) !== JSON.stringify(applied);

  const filtered = bookings.filter(b =>
    (!applied.brandName || b.brandName === applied.brandName) &&
    (!applied.categoryName || b.categoryName === applied.categoryName) &&
    (!applied.productId || b.productId === applied.productId) &&
    (!applied.date || b.date === applied.date)
  );
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 w-full">
        <div className="space-y-1"><Label className="text-xs">Brand</Label>
          <Select value={filters.brandName} onValueChange={v => setFilters(f => ({ ...f, brandName: v }))}><SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Category</Label>
          <Select value={filters.categoryName} onValueChange={v => setFilters(f => ({ ...f, categoryName: v }))}><SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{[...new Set(categories.map(c => c.name))].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Product</Label>
          <Select value={filters.productId} onValueChange={v => setFilters(f => ({ ...f, productId: v }))}><SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="flex flex-col space-y-1">
          <Label className="text-xs">Date</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                  {filters.date ? format(selectedDate!, 'dd/MM/yyyy') : 'dd/mm/yyyy'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate}
                onSelect={(day) => {
                  setFilters(f => ({ ...f, date: day ? format(day, 'yyyy-MM-dd') : '' }));
                  setIsCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Buttons row — spans full width on mobile */}
        <div className="col-span-2 sm:contents flex gap-2">
          {hasChanges && <Button className="flex-1 sm:flex-none" onClick={() => { setApplied({ ...filters }); setPage(1); }}>Apply</Button>}
          {(applied.brandName || applied.categoryName || applied.productId || applied.date) && (
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => { const empty = { brandName: '', categoryName: '', productId: '', date: '' }; setFilters(empty); setApplied(empty); setPage(1); }}>Clear</Button>
          )}
          <div className="ml-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => navigate('/bookings/calendar')}><CalendarIcon className="h-4 w-4" /> Calendar View</Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead><tr className="bg-card border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Email</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Phone</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Service</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
          </tr></thead>
          <tbody>
            {paginated.map(b => (
              <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-3 px-4">{b.date}</td>
                <td className="py-3 px-4">{b.timeSlot}</td>
                <td className="py-3 px-4">{b.customerName}</td>
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
                <td className="py-3 px-4 hidden lg:table-cell"> <a
                  href={`tel:${b.customerPhone}`}
                  className="hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  {b.customerPhone}
                </a></td>
                <td className="py-3 px-4">{b.productName}</td>
                <td className="py-3 px-4">{b.serviceName}</td>
                <td className="py-3 px-4">{b.createdAt}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-0">
                  <EmptyState title="No bookings found" description="New bookings will appear here once customers place them." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <TablePagination totalItems={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
    </div>
  );
};

export default BookingsPage;
