import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getJobApplyUrl(job?: {
  url?: string | null;
  links?: Array<{ url?: string | null }> | null;
  company?: string | null;
  company_name?: string | null;
  title?: string | null;
} | null): string {
  if (!job) return "https://www.google.com/search?q=tech+software+jobs";

  const rawUrl = job.url || job.links?.[0]?.url;
  if (rawUrl && typeof rawUrl === "string") {
    const trimmed = rawUrl.trim();
    if (trimmed && trimmed !== "#" && !trimmed.startsWith("javascript:")) {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      return `https://${trimmed}`;
    }
  }

  const company = job.company || job.company_name || "";
  const title = job.title || "";
  const query = `${company} ${title} careers apply`.trim();
  if (query) {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  return "https://www.google.com/search?q=software+developer+careers";
}
