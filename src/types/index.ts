// ============================================================
// Domain Types — ResumeNova
// Shared TypeScript contracts for the frontend.
// These mirror the Laravel REST API response shapes.
// ============================================================

export type ID = string;

export type UserRole = "user" | "admin" | "super_admin";

export interface User {
  id: ID;
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  language?: string;
  status?: string;
  suspended_at?: string | null;
  profile?: {
    phone?: string | null;
    location?: string | null;
    website?: string | null;
    headline?: string | null;
    bio?: string | null;
  } | null;
  created_at: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

// ---------- Resume ----------
export type ResumeTemplate =
  "modern-professional" | "corporate-executive" | "ats-professional" | "creative-professional";

export interface ResumeBasics {
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  summary: string;
}

export interface ResumeExperience {
  id: ID;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string | null;
  current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  id: ID;
  school: string;
  degree: string;
  field?: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
}

export interface ResumeProject {
  id: ID;
  name: string;
  description: string;
  link?: string;
  tech?: string[];
}

export interface ResumeSkillGroup {
  id: ID;
  category: string;
  skills: string[];
}

export interface Resume {
  id: ID;
  user_id?: ID;
  title: string;
  template: ResumeTemplate;
  version: number | string;
  status?: string;
  language?: string;
  basics: ResumeBasics;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skill_groups: ResumeSkillGroup[];
  content?: {
    basics?: ResumeBasics;
    experiences?: ResumeExperience[];
    education?: ResumeEducation[];
    projects?: ResumeProject[];
    skill_groups?: ResumeSkillGroup[];
    [key: string]: unknown;
  };
  updated_at: string;
  created_at: string;
}

export type ResumeImportStatus =
  "pending" | "processing" | "ready" | "failed" | "completed" | "expired";

export interface ResumeImportContent {
  basics: ResumeBasics;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skill_groups: ResumeSkillGroup[];
}

export interface ResumeImport {
  id: number | string;
  user_id?: string;
  original_filename: string;
  status: ResumeImportStatus;
  parsed_content: ResumeImportContent | null;
  error_message?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ---------- ATS ----------
export interface AtsKeyword {
  keyword: string;
  in_resume: boolean;
  in_jd: boolean;
  frequency: number;
}

export interface AtsAnalysis {
  id: ID;
  resume_id: ID;
  score: number; // 0–100
  matched_skills: string[];
  missing_skills: string[];
  keywords: AtsKeyword[];
  recommendations: string[];
  created_at: string;
}

// ---------- Cover Letter ----------
export interface CoverLetter {
  id: ID;
  resume_id?: ID | null;
  title?: string;
  language: string;
  tone?: string;
  job_description: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

// ---------- Interview Prep ----------
export type QuestionCategory = "hr" | "behavioral" | "technical" | "system-design" | "leadership";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface InterviewEvaluation {
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
}

export interface InterviewQuestion {
  id: ID;
  session_id?: ID;
  order?: number;
  category: QuestionCategory | string;
  difficulty: QuestionDifficulty | string;
  question: string;
  hints?: string[];
  expected_answer?: string;
  user_answer?: string;
  evaluation?: InterviewEvaluation | null;
  score?: number | null;
  completed?: boolean;
  created_at?: string;
}

export interface InterviewSession {
  id: ID;
  user_id: ID;
  resume_id?: ID | null;
  resume_title?: string | null;
  category: string;
  difficulty: string;
  language: string;
  job_description?: string | null;
  status: "in_progress" | "completed";
  total_questions: number;
  completed_questions: number;
  questions?: InterviewQuestion[];
  created_at: string;
  updated_at: string;
}

// ---------- API Keys ----------
export type ApiProvider = "openai" | "anthropic" | "gemini" | "groq" | "mistral";
export type ApiKeyStatus = "active" | "rate_limited" | "invalid" | "disabled";

export interface ApiKey {
  id: ID;
  provider: ApiProvider;
  name: string;
  masked_key: string;
  priority: number;
  status: ApiKeyStatus;
  usage_count: number;
  last_used_at?: string | null;
  created_at: string;
}

// ---------- Exports ----------
export interface ExportRecord {
  id: ID;
  user_id?: ID;
  resume_id?: ID | null;
  resume_title?: string | null;
  cover_letter_id?: ID | null;
  cover_letter_title?: string | null;
  format: "pdf" | "docx";
  template?: string | null;
  file_name: string;
  file_size?: number | null;
  file_size_human?: string | null;
  status: string;
  download_url?: string;
  created_at: string;
}

// ---------- Notifications ----------
export interface Notification {
  id: ID;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface ResumeVersion {
  id: ID;
  resume_id: ID;
  version_number: number;
  title: string;
  template: ResumeTemplate;
  content: {
    basics?: ResumeBasics;
    experiences?: ResumeExperience[];
    education?: ResumeEducation[];
    projects?: ResumeProject[];
    skill_groups?: ResumeSkillGroup[];
  };
  created_at: string;
  updated_at: string;
}

// ---------- Admin Types ----------
export interface AdminDashboardOverview {
  users: {
    total: number;
    active: number;
    new_this_week: number;
    new_this_month: number;
  };
  content: {
    total_resumes: number;
    total_cover_letters: number;
    total_ats_analyses: number;
    total_interview_sessions: number;
    total_exports: number;
  };
  ai: {
    total_operations: number;
  };
}

export interface AdminAnalytics {
  user_growth: Array<{ date: string; registrations: number }>;
  ai_activity: Array<{ date: string; ai_requests: number; exports: number }>;
  template_popularity: Array<{
    id: number;
    name: string;
    slug: string;
    category: string;
    usage_count: number;
  }>;
}

export interface AdminResumeTemplate {
  id: ID;
  slug: string;
  name: string;
  category: string;
  thumbnail?: string | null;
  description?: string | null;
  is_active: boolean;
  is_premium: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  user_id?: ID | null;
  user?: {
    id: ID;
    name: string;
    email: string;
    role: string;
  } | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface AdminSystemLog {
  id: string;
  level: string;
  message: string;
  context?: Record<string, unknown> | null;
  created_at: string;
}

// ---------- Jobs ----------
export interface JobLink {
  id: ID;
  job_posting_id: ID;
  url: string;
  provider_type?: string;
  clicks?: number;
}

export interface Job {
  id: ID;
  title: string;
  company: string;
  company_name?: string;
  location?: string;
  work_mode?: "remote" | "hybrid" | "onsite" | string;
  employment_type?: "full-time" | "part-time" | "contract" | "internship" | string;
  type?: string;
  salary?: string;
  salary_formatted?: string;
  min_salary?: number;
  max_salary?: number;
  currency?: string;
  description: string;
  skills_required?: string[];
  url?: string;
  links?: JobLink[];
  posted_at?: string;
  expires_at?: string;
  is_active?: boolean;
  matches?: JobMatch[];
  saves?: SavedJob[];
  applications?: JobApplication[];
}

export interface JobMatch {
  id?: ID;
  job_posting_id?: ID;
  job?: Job;
  posting?: Job;
  score?: number;
  match_score?: number;
  match_reasoning?: string;
  matched_skills?: string[];
  missing_skills?: string[];
  recommendation?: string;
  is_dismissed?: boolean;
  created_at?: string;
}

export interface SavedJob {
  id: ID;
  user_id?: ID;
  job_posting_id: ID;
  job?: Job;
  posting?: Job;
  notes?: string;
  created_at?: string;
}

export interface JobApplication {
  id: ID;
  user_id?: ID;
  job_posting_id: ID;
  resume_id?: ID | null;
  job?: Job;
  posting?: Job;
  resume?: Resume | null;
  status: "applied" | "screening" | "interviewing" | "offered" | "rejected" | "withdrawn" | string;
  applied_at?: string | null;
  notes?: string | null;
  created_at?: string;
}

// ---------- Pagination ----------
export interface Paginated<T> {
  data: T[];
  page?: number;
  current_page?: number;
  per_page?: number;
  total?: number;
  last_page?: number;
  meta?: {
    current_page: number;
    from?: number;
    last_page: number;
    per_page: number;
    to?: number;
    total: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}
