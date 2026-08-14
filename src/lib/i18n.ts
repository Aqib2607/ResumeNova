export type Language = "en" | "bn";

export const translations = {
  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_resumes: "My Resumes",
    nav_cover_letters: "Cover Letters",
    nav_ats_scanner: "ATS Scanner",
    nav_interview_prep: "Interview Prep",
    nav_exports: "Document Exports",
    nav_api_keys: "API Keys",
    nav_profile: "Profile",
    nav_settings: "Settings",
    nav_admin: "Admin Portal",

    // Common Actions
    btn_create: "Create",
    btn_save: "Save Changes",
    btn_cancel: "Cancel",
    btn_delete: "Delete",
    btn_edit: "Edit",
    btn_export_pdf: "Export PDF",
    btn_export_docx: "Export DOCX",
    btn_download: "Download",
    btn_generate: "Generate with AI",
    btn_analyzing: "Analyzing...",
    btn_generating: "Generating...",
    btn_saving: "Saving...",

    // Dashboard
    dash_welcome: "Welcome back",
    dash_overview_desc: "Track your resumes, ATS scores, and AI generation performance.",
    dash_total_resumes: "Total Resumes",
    dash_avg_ats: "Average ATS Score",
    dash_ai_calls: "AI Generations",
    dash_exports: "Total Exports",

    // Resumes
    resumes_title: "My Resumes",
    resumes_desc: "Create, tailor, and version-control resumes for every job opportunity.",
    resumes_new: "New Resume",
    resumes_empty_title: "No Resumes Yet",
    resumes_empty_desc:
      "Create your first AI-optimized resume or import from an existing document.",

    // ATS
    ats_title: "ATS Resume Analyzer",
    ats_desc:
      "Scan and benchmark your resume against real target job descriptions with instant keyword matching.",
    ats_run_scan: "Run ATS Scan",
    ats_overall_score: "Overall ATS Compatibility",

    // Cover Letter
    cl_title: "AI Cover Letters",
    cl_desc: "Generate persuasive, targeted cover letters matched to job requirements.",
    cl_new: "Create Cover Letter",

    // Interview Prep
    interview_title: "AI Interview Preparation",
    interview_desc:
      "Practice tailored interview questions generated from your resume and target job description.",
    interview_start_session: "Start New Session",
  },
  bn: {
    // Navigation
    nav_dashboard: "ড্যাশবোর্ড",
    nav_resumes: "আমার জীবনবৃত্তান্ত",
    nav_cover_letters: "কভার লেটার",
    nav_ats_scanner: "এটিএস স্ক্যানার",
    nav_interview_prep: "ইন্টারভিউ প্রস্তুতি",
    nav_exports: "ডকুমেন্ট এক্সপোর্ট",
    nav_api_keys: "এপিআই কি",
    nav_profile: "প্রোফাইল",
    nav_settings: "সেটিংস",
    nav_admin: "অ্যাডমিন পোর্টাল",

    // Common Actions
    btn_create: "তৈরি করুন",
    btn_save: "সংরক্ষণ করুন",
    btn_cancel: "বাতিল",
    btn_delete: "মুছুন",
    btn_edit: "সম্পাদনা",
    btn_export_pdf: "পিডিএফ এক্সপোর্ট",
    btn_export_docx: "ডকএক্স এক্সপোর্ট",
    btn_download: "ডাউনলোড",
    btn_generate: "এআই দিয়ে তৈরি করুন",
    btn_analyzing: "বিশ্লেষণ করা হচ্ছে...",
    btn_generating: "তৈরি হচ্ছে...",
    btn_saving: "সংরক্ষণ হচ্ছে...",

    // Dashboard
    dash_welcome: "স্বাগতম",
    dash_overview_desc: "আপনার জীবনবৃত্তান্ত, এটিএস স্কোর এবং এআই কার্যকলাপ এক নজরে দেখুন।",
    dash_total_resumes: "মোট জীবনবৃত্তান্ত",
    dash_avg_ats: "গড় এটিএস স্কোর",
    dash_ai_calls: "এআই জেনারেশন",
    dash_exports: "মোট এক্সপোর্ট",

    // Resumes
    resumes_title: "আমার জীবনবৃত্তান্তসমূহ",
    resumes_desc: "প্রতিটি চাকরির জন্য জীবনবৃত্তান্ত তৈরি এবং কাস্টমাইজ করুন।",
    resumes_new: "নতুন জীবনবৃত্তান্ত",
    resumes_empty_title: "কোনো জীবনবৃত্তান্ত পাওয়া যায়নি",
    resumes_empty_desc: "আপনার প্রথম এআই-অপ্টিমাইজড জীবনবৃত্তান্ত তৈরি করুন।",

    // ATS
    ats_title: "এটিএস স্ক্যানার",
    ats_desc: "চাকরির বিবরণীর সাথে আপনার জীবনবৃত্তান্ত মিলিয়ে দেখুন।",
    ats_run_scan: "স্ক্যান শুরু করুন",
    ats_overall_score: "সামগ্রিক এটিএস স্কোর",

    // Cover Letter
    cl_title: "এআই কভার লেটার",
    cl_desc: "চাকরির প্রয়োজনীয়তা অনুযায়ী প্রভাবশালী কভার লেটার তৈরি করুন।",
    cl_new: "নতুন কভার লেটার",

    // Interview Prep
    interview_title: "এআই ইন্টারভিউ প্রস্তুতি",
    interview_desc:
      "আপনার প্রোফাইল ও চাকরির বিবরণীর ভিত্তিতে বাস্তব ইন্টারভিউ প্রশ্নের অনুশীলন করুন।",
    interview_start_session: "নতুন সেশন শুরু করুন",
  },
} as const;

export function getTranslation(lang: Language, key: keyof typeof translations.en): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}
