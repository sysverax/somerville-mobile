import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useBookings } from '@/hooks/useBookings';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Loader2, AlertCircle, List, Search } from 'lucide-react';
import { format } from 'date-fns';
import TablePagination from '@/components/TablePagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BookingsTable from '@/components/BookingsTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDate, formatTime, formatDateTime } from '@/utils/dateUtils';
import { Input } from '@/components/ui/input';

const BookingsListPage = () => {
  const { bookings, total, loading, error, refetch } = useBookings({ autoFetch: false });
  const { brands, categories, products, isLoading: optionsLoading } = useFilterOptions();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ brandName: '', categoryName: '', productId: '', date: '', search: '' });
  const [applied, setApplied] = useState({ brandName: '', categoryName: '', productId: '', date: '', search: '' });
  const selectedDate = filters.date ? new Date(filters.date + 'T00:00:00') : undefined;

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const hasChanges = JSON.stringify(filters) !== JSON.stringify(applied);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);

  const filteredCategories = useMemo(() => {
    if (!filters.brandName) return categories;
    const brand = brands.find(b => b.name === filters.brandName);
    if (!brand) return [];
    return categories.filter(c => c.brandId === brand.id);
  }, [categories, filters.brandName, brands]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (filters.brandName) {
      const brand = brands.find(b => b.name === filters.brandName);
      if (brand) result = result.filter(p => p.brandId === brand.id);
    }
    if (filters.categoryName) {
      const category = categories.find(c => c.name === filters.categoryName);
      if (category) result = result.filter(p => p.categoryId === category.id);
    }
    return result;
  }, [products, filters.brandName, filters.categoryName, brands, categories]);

  const handleBrandChange = (v: string) => {
    const val = v === 'all' ? '' : v;
    setFilters(f => {
      const next = { ...f, brandName: val };
      if (val && f.categoryName) {
        const brand = brands.find(b => b.name === val);
        const category = categories.find(c => c.name === f.categoryName);
        if (brand && category && category.brandId !== brand.id) {
          next.categoryName = '';
          next.productId = '';
        }
      }
      return next;
    });
  };

  const handleCategoryChange = (v: string) => {
    const val = v === 'all' ? '' : v;
    setFilters(f => {
      const next = { ...f, categoryName: val };
      if (val && f.productId) {
        const category = categories.find(c => c.name === val);
        const product = products.find(p => p.id === f.productId);
        if (category && product && product.categoryId !== category.id) {
          next.productId = '';
        }
      }
      return next;
    });
  };

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
      page,
      limit: pageSize,
      brandId,
      categoryId,
      productId: applied.productId || undefined,
      date: applied.date || undefined,
      search: applied.search || undefined,
    });
  }, [applied, page, pageSize, brands, categories, optionsLoading, refetch]);

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
              <Loader2 className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 w-full">
        <div className="col-span-2 sm:contents">
          <div className="space-y-1">
            <Label className="text-xs">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Booking ID..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="pl-8 w-full sm:w-[200px] h-10"
              />
            </div>
          </div>
        </div>
        <div className="space-y-1"><Label className="text-xs">Brand</Label>
          <Select value={filters.brandName || "all"} onValueChange={handleBrandChange}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All Brands" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {optionsLoading && brands.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">Loading...</div>}
              {!optionsLoading && brands.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No brands found</div>}
              {brands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Category</Label>
          <Select value={filters.categoryName || "all"} onValueChange={handleCategoryChange} disabled={!filters.brandName}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {optionsLoading && categories.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">Loading...</div>}
              {!optionsLoading && categories.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No categories found</div>}
              {[...new Set(filteredCategories.map(c => c.name))].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Product</Label>
          <Select value={filters.productId || "all"} onValueChange={v => setFilters(f => ({ ...f, productId: v === 'all' ? '' : v }))} disabled={!filters.categoryName}>
            <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="All Products" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {optionsLoading && products.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">Loading...</div>}
              {!optionsLoading && products.length === 0 && <div className="text-muted-foreground italic text-xs py-3 px-2 text-center select-none cursor-default">No products found</div>}
              {filteredProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
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
        <div className="col-span-2 sm:contents flex gap-2">
          {hasChanges && <Button className="flex-1 sm:flex-none" onClick={() => { setApplied({ ...filters }); setPage(1); }}>Apply</Button>}
          {(applied.brandName || applied.categoryName || applied.productId || applied.date || applied.search) && (
            <Button
              variant="ghost"
              className="px-2 sm:px-3 flex-1 sm:flex-none"
              onClick={() => {
                setFilters({ brandName: '', categoryName: '', productId: '', date: '', search: '' });
                setApplied({ brandName: '', categoryName: '', productId: '', date: '', search: '' });
                setPage(1);
              }}
            >Clear</Button>
          )}
          <div className="ml-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => navigate('/bookings')}><CalendarIcon className="h-4 w-4" /> Calendar View</Button>
          </div>
        </div>
      </div>

      <BookingsTable 
        bookings={bookings} 
        loading={loading || optionsLoading}
        onRowClick={(booking) => setSelected(booking)}
      />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Booking ID</Label><p className="font-medium font-mono">{selected.bookingCode || '-'}</p></div>
                <div><Label className="text-xs text-muted-foreground">Customer</Label><p className="font-medium">{selected.customerName}</p></div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">
                    <a 
                      href={`https://mail.google.com/mail/?view=cm&to=${selected.customerEmail}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      // className="text-primary hover:underline"
                    >
                      {selected.customerEmail}
                    </a>
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="font-medium">
                    <a 
                      href={`tel:${selected.customerPhone}`}
                      // className="text-primary hover:underline"
                    >
                      {selected.customerPhone}
                    </a>
                  </p>
                </div>
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

      <TablePagination totalItems={total} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />
    </div>
  );
};

export default BookingsListPage;
