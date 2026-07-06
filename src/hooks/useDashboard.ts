import { useQuery } from "@tanstack/react-query";
import { DashboardService, NotificationsService, AuthService } from "@/services/endpoints";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "statistics"],
    queryFn: () => DashboardService.statistics(),
  });
}

export function useDashboardChart() {
  return useQuery({
    queryKey: ["dashboard", "chart"],
    queryFn: () => DashboardService.chart(),
  });
}

export function useRecentResumes() {
  return useQuery({
    queryKey: ["dashboard", "recent-resumes"],
    queryFn: () => DashboardService.recentResumes(),
  });
}

export function useRecentExports() {
  return useQuery({
    queryKey: ["dashboard", "recent-exports"],
    queryFn: () => DashboardService.recentExports(),
  });
}

export function useDashboardApiKeys() {
  return useQuery({
    queryKey: ["dashboard", "api-keys"],
    queryFn: () => DashboardService.apiKeys(),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["dashboard", "notifications"],
    queryFn: () => NotificationsService.list(),
  });
}

export function useAuthMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => AuthService.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
