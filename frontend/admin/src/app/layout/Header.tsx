import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/brands': 'Brand Management',
  '/categories': 'Category Management',
  '/series': 'Series Management',
  '/products': 'Product Management',
  '/services': 'Service Management',
  '/stock-pricing': 'Stock & Pricing',
  '/bookings': 'Booking Management',
  '/bookings/calendar': 'Booking Calendar',
  '/settings': 'Settings',
};

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[pathname] || 'Admin Portal';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
        <LogOut className="h-4 w-4" /> Logout
      </Button>
    </header>
  );
};

export default Header;
