import { useNavigate } from 'react-router-dom';
import { brandService } from '@/services/brand.service';
import { categoryService } from '@/services/category.service';
import { seriesService } from '@/services/series.service';
import { productService } from '@/services/product.service';
import { serviceService } from '@/services/service.service';
import { bookingService } from '@/services/booking.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, FolderTree, Layers, Package, Wrench, Calendar } from 'lucide-react';
import BookingsTable from '@/components/BookingsTable';
import EmptyState from '@/components/EmptyState';

const stats = [
  { label: 'Brands', icon: Smartphone, path: '/brands', getValue: () => `${brandService.getCount()} / 5` },
  { label: 'Categories', icon: FolderTree, path: '/categories', getValue: () => String(categoryService.getCount()) },
  { label: 'Series', icon: Layers, path: '/series', getValue: () => String(seriesService.getCount()) },
  { label: 'Products', icon: Package, path: '/products', getValue: () => String(productService.getCount()) },
  { label: 'Services', icon: Wrench, path: '/services', getValue: () => String(serviceService.getCount()) },
  { label: 'Bookings', icon: Calendar, path: '/bookings', getValue: () => String(bookingService.getCount()) },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const recentBookings = bookingService.getRecent(5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(stat.path)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.getValue()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Bookings</CardTitle></CardHeader>
        <CardContent>
          <BookingsTable 
            bookings={recentBookings} 
            compact={true}
            onRowClick={(booking) => navigate('/bookings', { state: { bookingId: booking.id } })}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
