import { useNavigate } from 'react-router-dom';
import { brandService } from '@/services/brand.service';
import { categoryService } from '@/services/category.service';
import { seriesService } from '@/services/series.service';
import { productService } from '@/services/product.service';
import { serviceService } from '@/services/service.service';
import { bookingService } from '@/services/booking.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, FolderTree, Layers, Package, Wrench, Calendar } from 'lucide-react';

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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Customer</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Product</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Service</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-3">{b.customerName}</td>
                    <td className="py-2.5 px-3">{b.productName}</td>
                    <td className="py-2.5 px-3">{b.serviceName}</td>
                    <td className="py-2.5 px-3">{b.date}</td>
                    <td className="py-2.5 px-3">{b.timeSlot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
