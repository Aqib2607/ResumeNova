import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardService, NotificationsService, AuthService } from "@/services/endpoints";
import type { Notification as AppNotification } from "@/types";

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

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => NotificationsService.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard", "notifications"] });
      const previousNotifications = queryClient.getQueryData<AppNotification[]>([
        "dashboard",
        "notifications",
      ]);
      if (previousNotifications) {
        queryClient.setQueryData<AppNotification[]>(
          ["dashboard", "notifications"],
          previousNotifications.map((n) =>
            String(n.id) === String(id) ? { ...n, read_at: new Date().toISOString() } : n,
          ),
        );
      }
      return { previousNotifications };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["dashboard", "notifications"], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationsService.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["dashboard", "notifications"] });
      const previousNotifications = queryClient.getQueryData<AppNotification[]>([
        "dashboard",
        "notifications",
      ]);
      if (previousNotifications) {
        queryClient.setQueryData<AppNotification[]>(
          ["dashboard", "notifications"],
          previousNotifications.map((n) => ({ ...n, read_at: new Date().toISOString() })),
        );
      }
      return { previousNotifications };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["dashboard", "notifications"], context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "notifications"] });
    },
  });
}

export function useAuthMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => AuthService.me(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
