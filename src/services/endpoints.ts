// ============================================================
// Service interfaces — typed wrappers around API endpoints.
// Implementations call Laravel REST endpoints via api-client.
// Frontend components consume these via TanStack Query hooks.
// ============================================================

import { api } from "./api-client";
import type {
  ApiKey,
  AtsAnalysis,
  AuthSession,
  CoverLetter,
  ExportRecord,
  InterviewQuestion,
  Notification,
  Paginated,
  Resume,
  User,
} from "@/types";

// ---------- Auth ----------
export const AuthService = {
  login: (payload: { email: string; password: string }) =>
    api.post<AuthSession>("/login", payload),
  register: (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => api.post<AuthSession>("/register", payload),
  forgotPassword: (payload: { email: string }) =>
    api.post<{ message: string }>("/forgot-password", payload),
  resetPassword: (payload: { token: string; email: string; password: string }) =>
    api.post<{ message: string }>("/reset-password", payload),
  logout: () => api.post<void>("/logout"),
  me: () => api.get<User>("/user"),
  googleAuthUrl: () => api.get<{ url: string }>("/auth/google"),
};

// ---------- Resumes ----------
export const ResumesService = {
  list: () => api.get<Paginated<Resume>>("/resumes"),
  get: (id: string) => api.get<Resume>(`/resumes/${id}`),
  create: (payload: Partial<Resume>) => api.post<Resume>("/resumes", payload),
  update: (id: string, payload: Partial<Resume>) => api.put<Resume>(`/resumes/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/resumes/${id}`),
  duplicate: (id: string) => api.post<Resume>(`/resumes/${id}/duplicate`),
  export: (id: string, format: "pdf" | "docx") =>
    api.post<{ url: string }>(`/resumes/${id}/export`, { format }),
  versions: (id: string) => api.get<Resume[]>(`/resumes/${id}/versions`),
};

// ---------- ATS ----------
export const AtsService = {
  analyze: (payload: { resume_id: string; job_description: string }) =>
    api.post<AtsAnalysis>("/ats/analyze", payload),
  history: () => api.get<Paginated<AtsAnalysis>>("/ats/history"),
};

// ---------- Cover Letters ----------
export const CoverLetterService = {
  list: () => api.get<Paginated<CoverLetter>>("/cover-letters"),
  generate: (payload: { resume_id: string; language: string; job_description: string }) =>
    api.post<CoverLetter>("/cover-letters/generate", payload),
  remove: (id: string) => api.delete<void>(`/cover-letters/${id}`),
};

// ---------- Interview Prep ----------
export const InterviewService = {
  questions: (params?: { category?: string; difficulty?: string }) =>
    api.get<Paginated<InterviewQuestion>>(
      `/interview/questions${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""}`,
    ),
  saveAnswer: (id: string, answer: string) =>
    api.put<InterviewQuestion>(`/interview/questions/${id}/answer`, { answer }),
};

// ---------- API Keys ----------
export const ApiKeysService = {
  list: () => api.get<ApiKey[]>("/api-keys"),
  create: (payload: { provider: string; name: string; key: string; priority?: number }) =>
    api.post<ApiKey>("/api-keys", payload),
  update: (id: string, payload: Partial<ApiKey>) => api.put<ApiKey>(`/api-keys/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/api-keys/${id}`),
  reorder: (ids: string[]) => api.post<void>("/api-keys/reorder", { ids }),
};

// ---------- Exports ----------
export const ExportsService = {
  list: () => api.get<Paginated<ExportRecord>>("/exports"),
  remove: (id: string) => api.delete<void>(`/exports/${id}`),
};

// ---------- Notifications ----------
export const NotificationsService = {
  list: () => api.get<Notification[]>("/notifications"),
  markRead: (id: string) => api.post<void>(`/notifications/${id}/read`),
};

// ---------- Admin ----------
export const AdminService = {
  users: () => api.get<Paginated<User>>("/admin/users"),
  templates: () => api.get<unknown[]>("/admin/templates"),
  analytics: () => api.get<unknown>("/admin/analytics"),
  auditLogs: () => api.get<unknown[]>("/admin/audit-logs"),
  systemLogs: () => api.get<unknown[]>("/admin/system-logs"),
};

// ---------- Dashboard ----------
export const DashboardService = {
  statistics: () => api.get<{
    resumes_count: number;
    average_ats_score: number;
    ai_usage_count: number;
    exports_count: number;
  }>("/dashboard/statistics"),
  chart: () => api.get<Array<{ d: string; v: number }>>("/dashboard/chart"),
  recentResumes: () => api.get<Resume[]>("/dashboard/recent-resumes"),
  recentExports: () => api.get<ExportRecord[]>("/dashboard/recent-exports"),
  apiKeys: () => api.get<ApiKey[]>("/dashboard/api-keys"),
};
