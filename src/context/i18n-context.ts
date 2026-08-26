import { createContext } from "react";

export type Language = "en" | "bn";

export const translations = {
  en: {
    // Navigation Groups
    group_workspace: "Workspace",
    group_account: "Account",
    group_system: "System",

    // Navigation Items
    nav_dashboard: "Dashboard",
    nav_resumes: "My Resumes",
    nav_jobs: "Job Discovery",
    nav_ats: "ATS Analyzer",
    nav_cover_letters: "Cover Letters",
    nav_interview: "Interview Prep",
    nav_api_keys: "API Keys",
    nav_exports: "Exports",
    nav_profile: "Profile",
    nav_settings: "Settings",
    nav_admin: "Admin Portal",

    // Topbar
    search_placeholder: "Search resumes, jobs, questions…",
    notifications_title: "Notifications",
    notifications_empty: "No new notifications.",
    notifications_mark_all_read: "Mark all as read",
    notifications_new: "new",
    account_menu: "Account",
    log_out: "Log out",

    // Common Actions & Plan
    plan_free: "Free plan",
    plan_usage: "3 of 5 AI generations used this month.",
    btn_upgrade: "Upgrade",
    btn_new_resume: "+ New resume",
    btn_create: "Create",
    btn_save: "Save Changes",
    btn_cancel: "Cancel",
    btn_delete: "Delete",
    btn_edit: "Edit",
    btn_export: "Export",

    // Dashboard
    dash_welcome: "Welcome back",
    dash_subtitle: "Here's a snapshot of your career toolkit.",
    stat_resumes: "Resumes",
    stat_avg_ats: "Avg ATS Score",
    stat_ai_usage: "AI Usage",
    stat_exports: "Exports",
    stat_calls_week: "calls this week",
    stat_month: "this month",
    quick_actions: "Quick actions",
    qa_new_resume: "New resume",
    qa_ats_scan: "Run ATS analysis",
    qa_cover_letter: "Generate cover letter",
    qa_api_key: "Add API key",
    chart_title: "AI usage this week",
    chart_subtitle: "Calls per day across all keys",
    recent_resumes: "Recent resumes",
    latest_ats: "Latest ATS score",

    // Settings
    settings_title: "Settings",
    settings_subtitle: "Manage preferences, notifications, and account state.",
    appearance_title: "Appearance",
    appearance_desc: "Theme preferences (system-wide).",
    theme_label: "Theme",
    theme_hint: "Choose light, dark, or follow system.",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    compact_label: "Compact density",
    compact_hint: "Tighten spacing across dashboard tables.",
    notifications_section: "Notifications",
    notifications_desc: "What we email you about.",
    product_updates: "Product updates",
    product_updates_hint: "Major releases and improvements.",
    weekly_digest: "Weekly ATS digest",
    weekly_digest_hint: "Score trends across your resumes.",
    interview_reminders: "Interview reminders",
    interview_reminders_hint: "Daily nudge to practice 1 question.",
    lang_region: "Language & region",
    lang_region_desc: "Platform localization and locale format preferences.",
    app_lang: "App language",
    app_lang_hint: "Display language for navigation and tool labels.",
    date_format: "Date format",
    danger_zone: "Danger zone",
    danger_zone_desc: "Account-level actions that can't be undone.",
    export_all: "Export all data",
    export_all_hint: "Receive a ZIP of resumes, analyses and letters.",
    btn_request_export: "Request export",
    delete_account: "Delete account",
    delete_account_hint: "Permanently remove your account and data.",
  },
  bn: {
    // Navigation Groups
    group_workspace: "ওয়ার্কস্পেস",
    group_account: "অ্যাকাউন্ট",
    group_system: "সিস্টেম",

    // Navigation Items
    nav_dashboard: "ড্যাশবোর্ড",
    nav_resumes: "আমার জীবনবৃত্তান্ত",
    nav_jobs: "চাকরি সন্ধান",
    nav_ats: "এটিএস অ্যানালাইজার",
    nav_cover_letters: "কভার লেটার",
    nav_interview: "ইন্টারভিউ প্রস্তুতি",
    nav_api_keys: "এপিআই কি",
    nav_exports: "ডকুমেন্ট এক্সপোর্ট",
    nav_profile: "প্রোফাইল",
    nav_settings: "সেটিংস",
    nav_admin: "অ্যাডমিন পোর্টাল",

    // Topbar
    search_placeholder: "জীবনবৃত্তান্ত, চাকরি বা প্রশ্ন খুঁজুন…",
    notifications_title: "বিজ্ঞপ্তি",
    notifications_empty: "কোনো নতুন বিজ্ঞপ্তি নেই।",
    notifications_mark_all_read: "সব পঠিত হিসেবে চিহ্নিত করুন",
    notifications_new: "নতুন",
    account_menu: "অ্যাকাউন্ট",
    log_out: "লগ আউট",

    // Common Actions & Plan
    plan_free: "ফ্রি প্ল্যান",
    plan_usage: "এই মাসে ৫টির মধ্যে ৩টি এআই জেনারেশন ব্যবহৃত।",
    btn_upgrade: "আপগ্রেড",
    btn_new_resume: "+ নতুন জীবনবৃত্তান্ত",
    btn_create: "তৈরি করুন",
    btn_save: "সংরক্ষণ করুন",
    btn_cancel: "বাতিল",
    btn_delete: "মুছুন",
    btn_edit: "সম্পাদনা",
    btn_export: "এক্সপোর্ট",

    // Dashboard
    dash_welcome: "স্বাগতম",
    dash_subtitle: "আপনার ক্যারিয়ার টুলকিটের সামগ্রিক চিত্র।",
    stat_resumes: "জীবনবৃত্তান্ত",
    stat_avg_ats: "গড় এটিএস স্কোর",
    stat_ai_usage: "এআই ব্যবহার",
    stat_exports: "এক্সপোর্টসমূহ",
    stat_calls_week: "এই সপ্তাহের রিকোয়েস্ট",
    stat_month: "এই মাসে",
    quick_actions: "দ্রুত অ্যাকশন",
    qa_new_resume: "নতুন জীবনবৃত্তান্ত",
    qa_ats_scan: "এটিএস স্ক্যান চালান",
    qa_cover_letter: "কভার লেটার তৈরি করুন",
    qa_api_key: "এপিআই কি যোগ করুন",
    chart_title: "এই সপ্তাহের এআই ব্যবহার",
    chart_subtitle: "প্রতিদিনের এআই রিকোয়েস্ট সংখ্যা",
    recent_resumes: "সাম্প্রতিক জীবনবৃত্তান্ত",
    latest_ats: "সর্বশেষ এটিএস স্কোর",

    // Settings
    settings_title: "সেটিংস",
    settings_subtitle: "পছন্দসমূহ, বিজ্ঞপ্তি এবং অ্যাকাউন্ট সেটিংস পরিচালনা করুন।",
    appearance_title: "অ্যাপিয়ারেন্স",
    appearance_desc: "থিম ও ডিসপ্লে পছন্দসমূহ।",
    theme_label: "থিম",
    theme_hint: "লাইট, ডার্ক অথবা সিস্টেম মোড নির্বাচন করুন।",
    theme_light: "লাইট",
    theme_dark: "ডার্ক",
    theme_system: "সিস্টেম",
    compact_label: "কমপ্যাক্ট ডেনসিটি",
    compact_hint: "টেবিলের স্পেসিং কমিয়ে আনুন।",
    notifications_section: "বিজ্ঞপ্তি",
    notifications_desc: "ইমেইল বিজ্ঞপ্তির পছন্দসমূহ।",
    product_updates: "প্রোডাক্ট আপডেট",
    product_updates_hint: "নতুন ফিচার ও গুরুত্বপূর্ণ আপডেট।",
    weekly_digest: "সাপ্তাহিক এটিএস ডাইজেস্ট",
    weekly_digest_hint: "আপনার জীবনবৃত্তান্তের স্কোরের ট্রেন্ড।",
    interview_reminders: "ইন্টারভিউ রিমাইন্ডার",
    interview_reminders_hint: "প্রতিদিন ১টি প্রশ্ন অনুশীলনের রিমাইন্ডার।",
    lang_region: "ভাষা ও অঞ্চল",
    lang_region_desc: "প্ল্যাটফর্মের ভাষা ও ফরম্যাট সেটিংস।",
    app_lang: "অ্যাপের ভাষা",
    app_lang_hint: "নেভিগেশন ও টুলের ডিসপ্লে ভাষা।",
    date_format: "তারিখের ফরম্যাট",
    danger_zone: "ডেঞ্জার জোন",
    danger_zone_desc: "অ্যাকাউন্ট পর্যায়ের স্থায়ী অ্যাকশন।",
    export_all: "সব ডেটা এক্সপোর্ট",
    export_all_hint: "সব রেজুমে, অ্যানালাইসিস এবং লেটারের জিপ ফাইল নিন।",
    btn_request_export: "রিকোয়েস্ট এক্সপোর্ট",
    delete_account: "অ্যাকাউন্ট মুছুন",
    delete_account_hint: "আপনার অ্যাকাউন্ট এবং ডেটা স্থায়ীভাবে মুছে ফেলুন।",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export type I18nContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
};

export const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => null,
  t: (key: TranslationKey, fallback?: string) => fallback ?? key,
});
