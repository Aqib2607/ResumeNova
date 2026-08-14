// ============================================================
// Service interfaces — typed wrappers around API endpoints.
// Implementations call Laravel REST endpoints via api-client.
// Frontend components consume these via TanStack Query hooks.
// ============================================================

import { api } from "./api-client";
import type {
  AdminAnalytics,
  AdminAuditLog,
  AdminDashboardOverview,
  AdminResumeTemplate,
  AdminSystemLog,
  ApiKey,
  AtsAnalysis,
  AuthSession,
  CoverLetter,
  ExportRecord,
  InterviewQuestion,
  InterviewSession,
  Notification,
  Paginated,
  Resume,
  ResumeVersion,
  User,
} from "@/types";

// ---------- Auth ----------
export const AuthService = {
  login: (payload: { email: string; password: string }) => api.post<AuthSession>("/login", payload),
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
  updatePassword: (payload: {
    current_password?: string;
    password?: string;
    password_confirmation?: string;
  }) => api.patch<{ message: string }>("/user/password", payload),
  logout: () => api.post<void>("/logout"),
  me: () => api.get<User>("/user"),
  googleAuthUrl: () => api.get<{ url: string }>("/auth/google"),
};

// ---------- Profile ----------
export const ProfileService = {
  get: () => api.get<User>("/profile"),
  update: (payload: Record<string, unknown>) =>
    api.patch<{ message: string; user: User }>("/profile", payload),
};

// ---------- Resumes ----------
export const ResumesService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<Paginated<Resume>>("/resumes", { params }),
  get: async (id: string | number): Promise<Resume> => {
    const res = await api.get<{ data: Resume } | Resume>(`/resumes/${id}`);
    return "data" in res && res.data && typeof res.data === "object" ? res.data : (res as Resume);
  },
  create: async (payload: Partial<Resume>): Promise<Resume> => {
    const res = await api.post<{ data: Resume } | Resume>("/resumes", payload);
    return "data" in res && res.data && typeof res.data === "object" ? res.data : (res as Resume);
  },
  update: async (id: string | number, payload: Partial<Resume>): Promise<Resume> => {
    const res = await api.patch<{ data: Resume } | Resume>(`/resumes/${id}`, payload);
    return "data" in res && res.data && typeof res.data === "object" ? res.data : (res as Resume);
  },
  remove: (id: string | number) => api.delete<{ message: string }>(`/resumes/${id}`),
  duplicate: async (id: string | number): Promise<Resume> => {
    const res = await api.post<{ data: Resume } | Resume>(`/resumes/${id}/duplicate`);
    return "data" in res && res.data && typeof res.data === "object" ? res.data : (res as Resume);
  },
  versions: (id: string | number) => api.get<ResumeVersion[]>(`/resumes/${id}/versions`),
  restoreVersion: (resumeId: string | number, versionId: string | number) =>
    api.post<Resume>(`/resumes/${resumeId}/versions/${versionId}/restore`),
};

// ---------- AI Resume Builder Service ----------
export const AIResumeService = {
  summary: (id: string | number, payload?: Record<string, unknown>) =>
    api.post<{ summary: string; data?: { summary: string } }>(`/resumes/${id}/ai/summary`, payload),
  experience: (id: string | number, payload: Record<string, unknown>) =>
    api.post<{ bullets: string[]; data?: { bullets: string[] } }>(
      `/resumes/${id}/ai/experience`,
      payload,
    ),
  project: (id: string | number, payload: Record<string, unknown>) =>
    api.post<{ description: string; data?: { description: string } }>(
      `/resumes/${id}/ai/project`,
      payload,
    ),
  skills: (id: string | number, payload?: Record<string, unknown>) =>
    api.post<{ skills: string[]; data?: { skills: string[] } }>(
      `/resumes/${id}/ai/skills`,
      payload,
    ),
};

// ---------- ATS Analysis ----------
export const AtsService = {
  analyze: (payload: { resume_id: string | number; job_description: string; title?: string }) =>
    api.post<{ message: string; data: AtsAnalysis }>("/ats/analyze", payload),
  get: (id: string | number) => api.get<{ data: AtsAnalysis }>(`/ats/${id}`),
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<{ data: AtsAnalysis[] }>("/ats", { params }),
  history: (params?: { page?: number; per_page?: number } | number) =>
    api.get<{ data: AtsAnalysis[] }>(
      "/ats",
      typeof params === "number" ? { params: { page: params } } : { params },
    ),
  remove: (id: string | number) => api.delete<{ message: string }>(`/ats/${id}`),
};

// ---------- Cover Letters ----------
export const CoverLettersService = {
  list: (params?: { page?: number; per_page?: number } | number) =>
    api.get<Paginated<CoverLetter>>(
      "/cover-letters",
      typeof params === "number" ? { params: { page: params } } : { params },
    ),
  get: (id: string | number) => api.get<{ data: CoverLetter }>(`/cover-letters/${id}`),
  generate: (payload: {
    resume_id?: string | number;
    job_description: string;
    tone?: string;
    language?: string;
    company_name?: string;
    title?: string;
  }) => api.post<{ message: string; data: CoverLetter }>("/cover-letters/generate", payload),
  update: (id: string | number, payload: Partial<CoverLetter>) =>
    api.patch<{ data: CoverLetter }>(`/cover-letters/${id}`, payload),
  remove: (id: string | number) => api.delete<{ message: string }>(`/cover-letters/${id}`),
};

export const CoverLetterService = CoverLettersService;

// ---------- API Keys ----------
export const ApiKeysService = {
  list: () => api.get<{ data: ApiKey[] }>("/api-keys"),
  create: (payload: { provider?: string; key: string; name?: string; priority?: number }) =>
    api.post<{ message: string; data: ApiKey }>("/api-keys", payload),
  update: (id: string | number, payload: Record<string, unknown>) =>
    api.patch<{ message: string; data: ApiKey }>(`/api-keys/${id}`, payload),
  remove: (id: string | number) => api.delete<{ message: string }>(`/api-keys/${id}`),
  reorder: (key_ids: number[]) =>
    api.post<{ message: string; data: ApiKey[] }>("/api-keys/reorder", { key_ids }),
  test: (id: string | number) =>
    api.post<{ valid: boolean; message: string }>(`/api-keys/${id}/test`),
};

// ---------- Exports ----------
export const ExportsService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<Paginated<ExportRecord>>("/exports", { params }),
  exportResume: (
    resumeId: string | number,
    payload: { format?: "pdf" | "docx"; template?: string },
  ) => api.post<{ data: ExportRecord }>(`/exports/resumes/${resumeId}`, payload),
  exportCoverLetter: (coverLetterId: string | number, payload: { format?: "pdf" | "docx" }) =>
    api.post<{ data: ExportRecord }>(`/exports/cover-letters/${coverLetterId}`, payload),
  get: (id: string | number) => api.get<{ data: ExportRecord }>(`/exports/${id}`),
  remove: (id: string | number) => api.delete<{ message: string }>(`/exports/${id}`),
  downloadUrl: (id: string | number) => `/api/exports/${id}/download`,
};

// ---------- Interviews ----------
export const InterviewsService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<Paginated<InterviewSession>>("/interviews", { params }),
  get: (id: string | number) => api.get<{ data: InterviewSession }>(`/interviews/${id}`),
  create: (payload: {
    resume_id?: string | number | null;
    category?: string;
    difficulty?: string;
    language?: string;
    job_description?: string;
    total_questions?: number;
  }) => api.post<{ data: InterviewSession }>("/interviews", payload),
  delete: (id: string | number) => api.delete<{ message: string }>(`/interviews/${id}`),
  generateQuestions: (id: string | number) =>
    api.post<{ message: string; questions: InterviewQuestion[] }>(
      `/interviews/${id}/questions/generate`,
    ),
  answerQuestion: (sessionId: string | number, questionId: string | number, answer: string) =>
    api.post<{
      message: string;
      question: InterviewQuestion;
      session: InterviewSession;
    }>(`/interviews/${sessionId}/questions/${questionId}/answer`, { answer }),
};

// ---------- Notifications ----------
export const NotificationsService = {
  list: () => api.get<Notification[]>("/notifications"),
  markRead: (id: string | number) => api.post<void>(`/notifications/${id}/read`),
  markAllRead: () => api.post<void>("/notifications/read-all"),
};

// ---------- Admin ----------
export const AdminService = {
  overview: () => api.get<AdminDashboardOverview>("/admin/dashboard"),
  analytics: () => api.get<AdminAnalytics>("/admin/analytics"),
  users: (params?: {
    q?: string;
    role?: string;
    status?: string;
    sort_by?: string;
    sort_dir?: string;
    page?: number;
    per_page?: number;
  }) => api.get<Paginated<User>>("/admin/users", { params }),
  getUser: (id: string | number) =>
    api.get<{ user: User; assignableRoles: string[] }>(`/admin/users/${id}`),
  updateUser: (id: string | number, payload: { name?: string; email?: string }) =>
    api.patch<{ message: string; user: User }>(`/admin/users/${id}`, payload),
  assignRole: (id: string | number, role: string) =>
    api.patch<{ message: string; user: User }>(`/admin/users/${id}/role`, { role }),
  suspendUser: (id: string | number, reason?: string) =>
    api.post<{ message: string; user: User }>(`/admin/users/${id}/suspend`, { reason }),
  reactivateUser: (id: string | number) =>
    api.post<{ message: string; user: User }>(`/admin/users/${id}/reactivate`),
  templates: () => api.get<AdminResumeTemplate[]>("/admin/templates"),
  createTemplate: (payload: Partial<AdminResumeTemplate>) =>
    api.post<{ message: string; template: AdminResumeTemplate }>("/admin/templates", payload),
  updateTemplate: (id: string | number, payload: Partial<AdminResumeTemplate>) =>
    api.patch<{ message: string; template: AdminResumeTemplate }>(
      `/admin/templates/${id}`,
      payload,
    ),
  deleteTemplate: (id: string | number) =>
    api.delete<{ message: string }>(`/admin/templates/${id}`),
  auditLogs: (params?: { page?: number; per_page?: number }) =>
    api.get<Paginated<AdminAuditLog>>("/admin/audit-logs", { params }),
  systemLogs: (params?: { page?: number; per_page?: number }) =>
    api.get<Paginated<AdminSystemLog>>("/admin/system-logs", { params }),
};

// ---------- Dashboard ----------
export const DashboardService = {
  statistics: () =>
    api.get<{
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
