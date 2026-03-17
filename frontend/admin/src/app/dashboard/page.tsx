import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, FolderTree, Layers, Package, Wrench, Calendar, Loader2 } from 'lucide-react';
import BookingsTable from '@/components/BookingsTable';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Failed to load dashboard statistics.</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Brands', icon: Smartphone, path: '/brands', value: String(stats.summary.totalBrands) },
    { label: 'Categories', icon: FolderTree, path: '/categories', value: String(stats.summary.totalCategories) },
    { label: 'Series', icon: Layers, path: '/series', value: String(stats.summary.totalSeries) },
    { label: 'Products', icon: Package, path: '/products', value: String(stats.summary.totalProducts) },
    { label: 'Services', icon: Wrench, path: '/services', value: String(stats.summary.totalServices) },
    { label: 'Bookings', icon: Calendar, path: '/bookings', value: String(stats.summary.totalBookings) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(stat => (
          <Card key={stat.label} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(stat.path)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Bookings</CardTitle></CardHeader>
        <CardContent>
          <BookingsTable 
            bookings={stats.recentBookings} 
            compact={true}
            onRowClick={(booking) => navigate('/bookings', { state: { bookingId: booking.id } })}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
