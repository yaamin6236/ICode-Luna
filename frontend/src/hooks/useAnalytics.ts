import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '@/lib/api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: analyticsAPI.getDashboardSummary,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useRevenue(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['revenue', params],
    queryFn: () => analyticsAPI.getRevenue(params),
  });
}

export function useDailyCapacity(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['daily-capacity', params],
    queryFn: () => analyticsAPI.getDailyCapacity(params),
  });
}

export function useCancellations(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['cancellations', params],
    queryFn: () => analyticsAPI.getCancellations(params),
  });
}

