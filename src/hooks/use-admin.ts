import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminService } from "@/services/endpoints";
import type { AdminResumeTemplate } from "@/types";

export const ADMIN_OVERVIEW_KEY = ["admin", "overview"] as const;
export const ADMIN_ANALYTICS_KEY = ["admin", "analytics"] as const;
export const ADMIN_USERS_KEY = ["admin", "users"] as const;
export const ADMIN_TEMPLATES_KEY = ["admin", "templates"] as const;
export const ADMIN_AUDIT_LOGS_KEY = ["admin", "audit-logs"] as const;
export const ADMIN_SYSTEM_LOGS_KEY = ["admin", "system-logs"] as const;

export function useAdminOverview() {
  return useQuery({
    queryKey: ADMIN_OVERVIEW_KEY,
    queryFn: () => AdminService.overview(),
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ADMIN_ANALYTICS_KEY,
    queryFn: () => AdminService.analytics(),
  });
}

export function useAdminUsers(params?: {
  q?: string;
  role?: string;
  status?: string;
  sort_by?: string;
  sort_dir?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, params],
    queryFn: () => AdminService.users(params),
  });
}

export function useAdminUser(id: string | number) {
  return useQuery({
    queryKey: ["admin", "users", id],
    queryFn: () => AdminService.getUser(id),
    enabled: Boolean(id),
  });
}

export function useAdminAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string | number; role: string }) =>
      AdminService.assignRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

export function useAdminSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string | number; reason?: string }) =>
      AdminService.suspendUser(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

export function useAdminReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => AdminService.reactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

export function useAdminTemplates() {
  return useQuery({
    queryKey: ADMIN_TEMPLATES_KEY,
    queryFn: () => AdminService.templates(),
  });
}

export function useAdminCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AdminResumeTemplate>) => AdminService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TEMPLATES_KEY });
    },
  });
}

export function useAdminUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<AdminResumeTemplate> }) =>
      AdminService.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TEMPLATES_KEY });
    },
  });
}

export function useAdminDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => AdminService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TEMPLATES_KEY });
    },
  });
}

export function useAdminAuditLogs(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: [...ADMIN_AUDIT_LOGS_KEY, params],
    queryFn: () => AdminService.auditLogs(params),
  });
}

export function useAdminSystemLogs(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: [...ADMIN_SYSTEM_LOGS_KEY, params],
    queryFn: () => AdminService.systemLogs(params),
  });
}
