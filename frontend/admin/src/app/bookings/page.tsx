import { useEffect, useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { Booking } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import TablePagination from '@/components/TablePagination';

const BookingsPage = () => {
  const location = useLocation();
  const { bookings } = useBookings();
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { products } = useProducts();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ brandName: '', categoryName: '', productId: '', date: '' });
  const [applied, setApplied] = useState({ brandName: '', categoryName: '', productId: '', date: '' });
  const [selected, setSelected] = useState<Booking | null>(null);

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

  useEffect(() => {
    if (location.state?.bookingId) {
      const booking = bookings.find(b => b.id === location.state.bookingId);
      if (booking) setSelected(booking);
    }
  }, [location.state, bookings]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1"><Label className="text-xs">Brand</Label>
          <Select value={filters.brandName} onValueChange={v => setFilters(f => ({ ...f, brandName: v }))}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Category</Label>
          <Select value={filters.categoryName} onValueChange={v => setFilters(f => ({ ...f, categoryName: v }))}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{[...new Set(categories.map(c => c.name))].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Product</Label>
          <Select value={filters.productId} onValueChange={v => setFilters(f => ({ ...f, productId: v }))}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All" /></SelectTrigger><SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1"><Label className="text-xs">Date</Label>
          <Input type="date" className="w-[160px]" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))} /></div>
        {hasChanges && <Button onClick={() => { setApplied({ ...filters }); setPage(1); }}>Apply</Button>}
        {(applied.brandName || applied.categoryName || applied.productId || applied.date) && (
          <Button variant="outline" onClick={() => { const empty = { brandName: '', categoryName: '', productId: '', date: '' }; setFilters(empty); setApplied(empty); setPage(1); }}>Clear</Button>
        )}
        <div className="ml-auto"><Button variant="outline" className="gap-2" onClick={() => navigate('/bookings/calendar')}><Calendar className="h-4 w-4" /> Calendar View</Button></div>
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
              <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(b)}>
                <td className="py-3 px-4">{b.date}</td>
                <td className="py-3 px-4">{b.timeSlot}</td>
                <td className="py-3 px-4">{b.customerName}</td>
                <td className="py-3 px-4 hidden md:table-cell">{b.customerEmail}</td>
                <td className="py-3 px-4 hidden lg:table-cell">{b.customerPhone}</td>
                <td className="py-3 px-4">{b.productName}</td>
                <td className="py-3 px-4">{b.serviceName}</td>
                <td className="py-3 px-4">{b.createdAt}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No bookings found</td></tr>}
          </tbody>
        </table>
      </div>

      <TablePagination totalItems={filtered.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={s => { setPageSize(s); setPage(1); }} />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs text-muted-foreground">Customer</Label><p className="font-medium">{selected.customerName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium">{selected.customerEmail}</p></div>
                <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="font-medium">{selected.customerPhone}</p></div>
                <div><Label className="text-xs text-muted-foreground">Brand</Label><p className="font-medium">{selected.brandName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Product</Label><p className="font-medium">{selected.productName}</p></div>
                <div><Label className="text-xs text-muted-foreground">Category</Label><p className="font-medium">{selected.categoryName}</p></div>
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

export default BookingsPage;
