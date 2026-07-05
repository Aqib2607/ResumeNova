// ============================================================
// Domain Types — ResumeNova
// Shared TypeScript contracts for the frontend.
// These mirror the Laravel REST API response shapes.
// ============================================================

export type ID = string;

export interface User {
  id: ID;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: "user" | "admin";
  language: string;
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
  title: string;
  template: ResumeTemplate;
  basics: ResumeBasics;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  skill_groups: ResumeSkillGroup[];
  version: number;
  updated_at: string;
  created_at: string;
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
  resume_id: ID;
  language: string;
  job_description: string;
  content: string;
  created_at: string;
}

// ---------- Interview Prep ----------
export type QuestionCategory = "behavioral" | "technical" | "system-design" | "leadership";
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface InterviewQuestion {
  id: ID;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  question: string;
  hints?: string[];
  user_answer?: string;
  completed: boolean;
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
  resume_id: ID;
  resume_title: string;
  format: "pdf" | "docx";
  size_bytes: number;
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

// ---------- Pagination ----------
export interface Paginated<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
}
