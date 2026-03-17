import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardData } from '@/services/dashboard.service';

export const useDashboardStats = () => {
  return useQuery<DashboardData, Error>({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardService.getStats(),
  });
};
