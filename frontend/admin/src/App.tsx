import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminLayout from "@/app/layout/AdminLayout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/app/dashboard/page";
import BrandsPage from "@/app/brands/page";
import CategoriesPage from "@/app/categories/page";
import SeriesPage from "@/app/series/page";
import ProductsPage from "@/app/products/page";
import ServicesPage from "@/app/services/page";
import StockPricingPage from "@/app/stock-pricing/page";
import BookingsPage from "@/app/bookings/page";
import CalendarPage from "@/app/bookings/calendar/page";
import SettingsPage from "@/app/settings/page";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/series" element={<SeriesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/stock-pricing" element={<StockPricingPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/bookings/calendar" element={<CalendarPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
