import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  FileText,
  KeyRound,
  Layers,
  Mail,
  Menu,
  Mic,
  ScanSearch,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useAuthMe } from "@/hooks/useDashboard";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  {
    icon: Bot,
    title: "AI Resume Builder",
    desc: "Generate role-specific, recruiter-tested resumes in under 60 seconds.",
  },
  {
    icon: ScanSearch,
    title: "ATS Analyzer",
    desc: "Match your resume against any job description with a precise 0–100 score.",
  },
  {
    icon: Mail,
    title: "Cover Letter Generator",
    desc: "Tailored cover letters in 30+ languages, ready to send.",
  },
  {
    icon: Mic,
    title: "Interview Preparation",
    desc: "Curated questions by role, level and company — with hints.",
  },
  {
    icon: Layers,
    title: "Resume Versioning",
    desc: "Branch resumes per role. Revert to any version in one click.",
  },
  {
    icon: KeyRound,
    title: "API Key Failover",
    desc: "Bring your own AI keys with priority routing and automatic failover.",
  },
];

const templates = [
  { name: "Modern Professional", accent: "bg-primary" },
  { name: "Corporate Executive", accent: "bg-foreground" },
  { name: "ATS Professional", accent: "bg-success" },
  { name: "Creative Professional", accent: "bg-warning" },
];

const steps = [
  {
    n: "01",
    title: "Import or build",
    desc: "Start from your LinkedIn, an existing PDF, or a blank slate.",
  },
  {
    n: "02",
    title: "Tailor with AI",
    desc: "Paste a job description — we rewrite bullets to match.",
  },
  {
    n: "03",
    title: "Score & ship",
    desc: "Run the ATS analyzer, export to PDF or DOCX, apply with confidence.",
  },
];

const testimonials = [
  {
    quote:
      "ResumeNova rewrote my bullets to match a Stripe JD — I had three interviews booked that week.",
    name: "Priya S.",
    role: "Senior PM, fintech",
  },
  {
    quote: "The ATS score is brutal in the best way. It catches things recruiters definitely will.",
    name: "Marcus T.",
    role: "Staff Engineer",
  },
  {
    quote:
      "Switching templates without losing content is something I didn't know I needed until now.",
    name: "Léa M.",
    role: "Design Lead",
  },
];

const faqs = [
  {
    q: "Is my data private?",
    a: "Yes. Your resume content is never used to train models. Bring your own API keys if you prefer end-to-end control.",
  },
  {
    q: "Can I use my own AI keys?",
    a: "Add OpenAI, Anthropic, Gemini, Groq or Mistral keys with priority ordering and automatic failover.",
  },
  {
    q: "Does the ATS score work for any job description?",
    a: "Yes — paste any JD, in any language. The analyzer extracts keywords, scores match, and recommends rewrites.",
  },
  {
    q: "What export formats are supported?",
    a: "PDF (recommended) and DOCX. Every export is ATS-safe with embedded fonts and selectable text.",
  },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const { data: user } = useAuthMe();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo to={user ? "/dashboard" : "/"} />
        <nav className="hidden items-center gap-7 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-foreground/70 transition hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#templates"
            className="text-sm font-medium text-foreground/70 transition hover:text-foreground"
          >
            Templates
          </a>
          <a
            href="#how"
            className="text-sm font-medium text-foreground/70 transition hover:text-foreground"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-foreground/70 transition hover:text-foreground"
          >
            FAQ
          </a>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button size="sm" asChild className="gap-1.5 font-medium shadow-sm">
              <Link to="/dashboard">
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
        <button
          className="grid h-9 w-9 place-items-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-page space-y-1 py-3">
            <a
              href="#features"
              className="block py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              Features
            </a>
            <a
              href="#templates"
              className="block py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              Templates
            </a>
            <a
              href="#how"
              className="block py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              How it works
            </a>
            <a
              href="#faq"
              className="block py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              FAQ
            </a>
            <div className="flex gap-2 pt-2">
              {user ? (
                <Button className="flex-1 gap-1.5" asChild>
                  <Link to="/dashboard">
                    Dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link to="/register">Get started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const { data: user } = useAuthMe();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-transparent" />
      <div className="absolute left-1/2 top-24 -z-10 h-72 w-[120%] -translate-x-1/2 rounded-[100%] bg-primary/10 blur-3xl" />

      <div className="container-page pb-20 pt-16 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="secondary" className="mb-5 gap-1.5 rounded-full px-3 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium">Now with multi-provider API failover</span>
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Resumes that actually
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              get you interviews.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            ResumeNova combines AI-tailored content, an honest ATS score, and four recruiter-tested
            templates so every application lands in the right pile.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="h-11 px-6">
              <Link to={user ? "/dashboard" : "/register"}>
                {user ? "Go to Dashboard" : "Start free"} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11 px-6">
              <a href="#how">See how it works</a>
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border/70 pt-8 sm:gap-12">
            {[
              { k: "180k+", v: "resumes built" },
              { k: "92%", v: "ATS pass rate" },
              { k: "4.9 / 5", v: "user rating" },
            ].map((s) => (
              <div key={s.v} className="text-center">
                <p className="text-2xl font-semibold text-foreground sm:text-3xl">{s.k}</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.v}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero illustration / app preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto mt-14 max-w-5xl"
        >
          <div className="rounded-2xl border border-border bg-card shadow-elevated">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ml-3 text-xs text-muted-foreground">resumenova.app/dashboard</span>
            </div>
            <div className="grid gap-0 md:grid-cols-[220px_1fr]">
              <div className="hidden border-r border-border bg-sidebar p-3 md:block">
                {["Dashboard", "My Resumes", "ATS Analyzer", "Cover Letters", "API Keys"].map(
                  (l, i) => (
                    <div
                      key={l}
                      className={`mb-1 rounded-md px-3 py-2 text-xs font-medium ${i === 1 ? "bg-primary/10 text-primary" : "text-foreground/70"}`}
                    >
                      {l}
                    </div>
                  ),
                )}
              </div>
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Senior Product Designer — 2026</p>
                    <p className="text-xs text-muted-foreground">Last edited 2h ago · v4</p>
                  </div>
                  <Badge className="bg-success/10 text-success hover:bg-success/15">ATS 92</Badge>
                </div>
                <div className="space-y-2">
                  {[88, 64, 75, 92, 50, 70].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/80"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {["Skills matched", "Missing", "Recommendations"].map((t, i) => (
                    <div key={t} className="rounded-lg border border-border p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {t}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">{[18, 4, 7][i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="border-t border-border bg-surface py-20 md:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Everything you need to land the role
          </h2>
          <p className="mt-3 text-muted-foreground">
            From the first draft to the interview prep — ResumeNova is the toolkit modern candidates
            use.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="group rounded-xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Templates() {
  return (
    <section id="templates" className="border-t border-border py-20 md:py-24">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Templates</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Four templates. Zero compromise on parsing.
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Every template is ATS-safe with selectable text, embedded fonts, and a single-column
            fallback.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-elevated"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-surface p-4">
                <div className={`absolute left-0 top-0 h-1.5 w-full ${t.accent}`} />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-1/2 rounded bg-foreground/80" />
                  <div className="h-2 w-1/3 rounded bg-muted-foreground/50" />
                  <div className="mt-4 space-y-1.5">
                    {[90, 70, 80, 60, 75, 85, 50].map((w, k) => (
                      <div key={k} className="h-1.5 rounded bg-muted" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <div className="mt-4 h-2 w-1/4 rounded bg-foreground/70" />
                  <div className="space-y-1.5">
                    {[80, 65, 70].map((w, k) => (
                      <div key={k} className="h-1.5 rounded bg-muted" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-border p-4">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">ATS-safe · 1-page or 2-page</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="border-t border-border bg-surface py-20 md:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Three steps to a tailored resume
          </h2>
        </div>
        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div className="absolute left-8 right-8 top-12 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AtsShowcase() {
  return (
    <section className="border-t border-border py-20 md:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            ATS Analyzer
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Before & after, scored honestly.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Most resumes never reach a human. The ATS Analyzer shows you exactly what your target
            system sees and tells you what to fix — line by line.
          </p>
          <ul className="mt-6 space-y-2.5">
            {[
              "Keyword density vs. job description",
              "Missing skills with priority",
              "Section-level rewrite suggestions",
              "PDF & DOCX parser preview",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              label: "Before",
              score: 42,
              tone: "destructive",
              missing: ["Accessibility", "GraphQL", "Localization"],
            },
            { label: "After", score: 92, tone: "success", missing: ["—"] },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </span>
                <Badge
                  className={
                    c.tone === "success"
                      ? "bg-success/10 text-success hover:bg-success/15"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/15"
                  }
                >
                  ATS {c.score}
                </Badge>
              </div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight">{c.score}</span>
                <span className="mb-1 text-sm text-muted-foreground">/ 100</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${c.tone === "success" ? "bg-success" : "bg-destructive"}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Missing
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {c.missing.map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="border-t border-border bg-surface py-20 md:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Loved by candidates
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Built with feedback from 180,000+ job seekers
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {t.name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="border-t border-border py-20 md:py-24">
      <div className="container-page mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Frequently asked
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="border-border">
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function CTABanner() {
  const { data: user } = useAuthMe();

  return (
    <section className="border-t border-border py-20 md:py-24">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-foreground p-10 text-background md:p-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
              Your next role is one tailored resume away.
            </h2>
            <p className="mt-3 max-w-xl text-background/70">
              Join 180k+ professionals using ResumeNova to apply smarter.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {user ? (
                <Button
                  size="lg"
                  asChild
                  className="h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link to="/dashboard">
                    Go to Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="h-11 px-6">
                    <Link to="/register">Get started — it's free</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-11 border-background/30 bg-transparent px-6 text-background hover:bg-background/10 hover:text-background"
                  >
                    <Link to="/login">I already have an account</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The AI-powered resume builder & career platform for modern candidates.
            </p>
          </div>
          {[
            { t: "Product", l: ["Features", "Templates", "Pricing", "Changelog"] },
            { t: "Company", l: ["About", "Blog", "Careers", "Contact"] },
            { t: "Legal", l: ["Privacy", "Terms", "Security", "Cookies"] },
          ].map((c) => (
            <div key={c.t}>
              <p className="text-sm font-semibold">{c.t}</p>
              <ul className="mt-3 space-y-2">
                {c.l.map((i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {i}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ResumeNova. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Made with care for job seekers.</p>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Resume Builder & Career Platform"
        description="ResumeNova helps you build ATS-optimized resumes, generate tailored cover letters, and prepare for interviews — powered by AI."
      />
      <Nav />
      <Hero />
      <Features />
      <Templates />
      <HowItWorks />
      <AtsShowcase />
      <Testimonials />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}
