import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Smartphone, FolderTree, Layers, Package, Wrench, DollarSign, Calendar, Settings, X } from 'lucide-react';
import logo from '@/assets/logo.jpeg';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/brands', label: 'Brands', icon: Smartphone },
  { path: '/categories', label: 'Categories', icon: FolderTree },
  { path: '/series', label: 'Series', icon: Layers },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/services', label: 'Services', icon: Wrench },
  // TODO: If need shop now please uncomment the following section
  // { path: '/stock-pricing', label: 'Stock & Pricing', icon: DollarSign },
  { path: '/bookings', label: 'Bookings', icon: Calendar },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col bg-sidebar border-r border-sidebar-border`}>
        <div className="flex items-center justify-between p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Somerville Mobile" className="h-10 w-10 rounded-lg object-cover" />
            <div>
              <h1 className="text-sm font-bold text-sidebar-primary-foreground">Somerville</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
