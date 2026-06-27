// Realistic demo data for UI rendering before API integration.
import type {
  ApiKey,
  AtsAnalysis,
  CoverLetter,
  ExportRecord,
  InterviewQuestion,
  Notification,
  Resume,
  User,
} from "@/types";

export const demoUser: User = {
  id: "u_01",
  name: "Aarav Mehta",
  email: "aarav.mehta@resumenova.app",
  avatar_url: null,
  role: "user",
  language: "en",
  created_at: "2025-01-12T09:24:00Z",
};

export const demoResumes: Resume[] = [
  {
    id: "r_01",
    title: "Senior Product Designer — 2026",
    template: "modern-professional",
    version: 4,
    updated_at: "2026-06-22T12:14:00Z",
    created_at: "2026-03-02T08:00:00Z",
    basics: {
      full_name: "Aarav Mehta",
      headline: "Senior Product Designer · Design Systems & AI",
      email: "aarav.mehta@resumenova.app",
      phone: "+1 415 555 0142",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/aaravmehta",
      website: "aaravmehta.design",
      summary:
        "Product designer with 8+ years shipping design systems and AI-first experiences across consumer and enterprise SaaS. Led 0→1 launches generating $12M ARR.",
    },
    experiences: [
      {
        id: "e1",
        company: "Linear",
        role: "Senior Product Designer",
        location: "Remote",
        start_date: "2023-04",
        end_date: null,
        current: true,
        bullets: [
          "Led redesign of the project planning surface adopted by 12,000+ teams.",
          "Shipped 40+ components into the Linear design system, cutting design QA time 35%.",
          "Partnered with ML team to ship AI issue triage with 92% accuracy.",
        ],
      },
      {
        id: "e2",
        company: "Stripe",
        role: "Product Designer",
        location: "San Francisco, CA",
        start_date: "2020-08",
        end_date: "2023-03",
        current: false,
        bullets: [
          "Owned dashboard navigation IA touched by 4M+ businesses monthly.",
          "Drove +18% activation by simplifying onboarding for first-time payment flows.",
        ],
      },
    ],
    education: [
      {
        id: "ed1",
        school: "Carnegie Mellon University",
        degree: "MHCI",
        field: "Human-Computer Interaction",
        start_date: "2018",
        end_date: "2020",
      },
    ],
    projects: [
      {
        id: "p1",
        name: "Tokens.studio Plugin",
        description: "Open-source Figma plugin syncing design tokens to GitHub, 18k weekly users.",
        link: "github.com/aarav/tokens-studio",
        tech: ["TypeScript", "Figma API", "GitHub Actions"],
      },
    ],
    skill_groups: [
      {
        id: "s1",
        category: "Design",
        skills: ["Figma", "Design Systems", "Prototyping", "User Research", "Motion"],
      },
      {
        id: "s2",
        category: "Engineering",
        skills: ["TypeScript", "React", "Tailwind", "Framer Motion"],
      },
    ],
  },
  {
    id: "r_02",
    title: "Staff Engineer — Backend",
    template: "ats-professional",
    version: 2,
    updated_at: "2026-06-10T18:02:00Z",
    created_at: "2026-05-04T11:30:00Z",
    basics: {
      full_name: "Aarav Mehta",
      headline: "Staff Software Engineer · Distributed Systems",
      email: "aarav.mehta@resumenova.app",
      phone: "+1 415 555 0142",
      location: "San Francisco, CA",
      summary: "Backend engineer specializing in high-throughput payment and search infrastructure.",
    },
    experiences: [],
    education: [],
    projects: [],
    skill_groups: [],
  },
];

export const demoAtsAnalysis: AtsAnalysis = {
  id: "a_01",
  resume_id: "r_01",
  score: 78,
  matched_skills: ["TypeScript", "React", "Design Systems", "Figma", "Prototyping"],
  missing_skills: ["GraphQL", "Accessibility (WCAG)", "Localization", "A/B Testing"],
  keywords: [
    { keyword: "design system", in_resume: true, in_jd: true, frequency: 6 },
    { keyword: "accessibility", in_resume: false, in_jd: true, frequency: 4 },
    { keyword: "react", in_resume: true, in_jd: true, frequency: 5 },
    { keyword: "graphql", in_resume: false, in_jd: true, frequency: 3 },
    { keyword: "user research", in_resume: true, in_jd: true, frequency: 2 },
    { keyword: "localization", in_resume: false, in_jd: true, frequency: 2 },
  ],
  recommendations: [
    "Add an Accessibility section — JD mentions WCAG 2.2 four times.",
    "Surface GraphQL experience in your Linear bullets.",
    "Quantify the design-system adoption metric in your summary.",
    "Mirror the JD's wording: 'cross-functional collaboration' instead of 'partner with'.",
  ],
  created_at: "2026-06-24T10:00:00Z",
};

export const demoCoverLetters: CoverLetter[] = [
  {
    id: "c_01",
    resume_id: "r_01",
    language: "en",
    job_description: "Senior Product Designer at Vercel — design systems, DX.",
    content:
      "Dear Vercel Hiring Team,\n\nI'm writing to express my interest in the Senior Product Designer role…",
    created_at: "2026-06-20T13:10:00Z",
  },
];

export const demoApiKeys: ApiKey[] = [
  {
    id: "k_01",
    provider: "openai",
    name: "OpenAI · Primary",
    masked_key: "sk-••••••••••••••••J9aQ",
    priority: 1,
    status: "active",
    usage_count: 1284,
    last_used_at: "2026-06-26T22:11:00Z",
    created_at: "2026-01-04T09:00:00Z",
  },
  {
    id: "k_02",
    provider: "anthropic",
    name: "Anthropic · Failover",
    masked_key: "sk-ant-••••••••••••2bX",
    priority: 2,
    status: "active",
    usage_count: 312,
    last_used_at: "2026-06-22T14:05:00Z",
    created_at: "2026-02-19T15:30:00Z",
  },
  {
    id: "k_03",
    provider: "groq",
    name: "Groq · Burst",
    masked_key: "gsk_••••••••••••••u72",
    priority: 3,
    status: "rate_limited",
    usage_count: 88,
    last_used_at: "2026-06-25T08:40:00Z",
    created_at: "2026-04-11T09:00:00Z",
  },
];

export const demoExports: ExportRecord[] = [
  {
    id: "x_01",
    resume_id: "r_01",
    resume_title: "Senior Product Designer — 2026",
    format: "pdf",
    size_bytes: 184_320,
    created_at: "2026-06-25T16:42:00Z",
  },
  {
    id: "x_02",
    resume_id: "r_01",
    resume_title: "Senior Product Designer — 2026",
    format: "docx",
    size_bytes: 95_120,
    created_at: "2026-06-22T11:08:00Z",
  },
  {
    id: "x_03",
    resume_id: "r_02",
    resume_title: "Staff Engineer — Backend",
    format: "pdf",
    size_bytes: 162_840,
    created_at: "2026-06-12T09:31:00Z",
  },
];

export const demoNotifications: Notification[] = [
  {
    id: "n_01",
    title: "ATS analysis ready",
    body: "Your resume scored 78 against the Vercel JD.",
    read: false,
    created_at: "2026-06-26T22:30:00Z",
  },
  {
    id: "n_02",
    title: "Cover letter generated",
    body: "Senior Product Designer at Vercel — ready to review.",
    read: false,
    created_at: "2026-06-26T18:12:00Z",
  },
  {
    id: "n_03",
    title: "API key rate limited",
    body: "Groq · Burst was rate limited; failover switched to Anthropic.",
    read: true,
    created_at: "2026-06-25T08:41:00Z",
  },
];

export const demoInterviewQuestions: InterviewQuestion[] = [
  {
    id: "q_01",
    category: "behavioral",
    difficulty: "medium",
    question: "Tell me about a time you disagreed with a senior leader. How did you resolve it?",
    hints: ["Use the STAR framework", "End with what you learned"],
    completed: true,
    user_answer:
      "At Stripe, our VP wanted to ship the merchant dashboard with…",
  },
  {
    id: "q_02",
    category: "technical",
    difficulty: "hard",
    question: "Design a notification system that supports 10M users with sub-second delivery.",
    hints: ["Consider fan-out vs fan-in", "Mention queue choice"],
    completed: false,
  },
  {
    id: "q_03",
    category: "system-design",
    difficulty: "hard",
    question: "How would you design a URL shortener like bit.ly at global scale?",
    completed: false,
  },
  {
    id: "q_04",
    category: "leadership",
    difficulty: "medium",
    question: "Walk me through how you ran your last design system migration.",
    completed: false,
  },
  {
    id: "q_05",
    category: "behavioral",
    difficulty: "easy",
    question: "What's a project you're most proud of and why?",
    completed: false,
  },
];
