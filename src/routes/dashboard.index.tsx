import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Download,
  FileText,
  KeyRound,
  Plus,
  ScanSearch,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  demoApiKeys,
  demoExports,
  demoNotifications,
  demoResumes,
  demoUser,
} from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const usageData = [
  { d: "Mon", v: 12 },
  { d: "Tue", v: 18 },
  { d: "Wed", v: 9 },
  { d: "Thu", v: 24 },
  { d: "Fri", v: 31 },
  { d: "Sat", v: 14 },
  { d: "Sun", v: 22 },
];

const quickActions = [
  { label: "New resume", icon: Plus, to: "/dashboard/resumes" },
  { label: "Run ATS analysis", icon: ScanSearch, to: "/dashboard/ats" },
  { label: "Generate cover letter", icon: Sparkles, to: "/dashboard/cover-letters" },
  { label: "Add API key", icon: KeyRound, to: "/dashboard/api-keys" },
];

function DashboardHome() {
  return (
    <div>
      <SEO title="Dashboard" />
      <PageHeader
        title={`Welcome back, ${demoUser.name.split(" ")[0]}`}
        description="Here's a snapshot of your career toolkit."
        actions={
          <Button asChild>
            <Link to="/dashboard/resumes">
              <Plus className="h-4 w-4" /> New resume
            </Link>
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Resumes", value: demoResumes.length, icon: FileText, hint: "+1 this month" },
          { label: "Avg ATS score", value: "78", icon: ScanSearch, hint: "+6 vs. last month" },
          { label: "AI usage", value: "1,684", icon: Sparkles, hint: "calls this week" },
          { label: "Exports", value: demoExports.length, icon: Download, hint: "PDF / DOCX" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3 w-3" /> {s.hint}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* API usage chart */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">AI usage this week</p>
              <p className="text-xs text-muted-foreground">Calls per day across all keys</p>
            </div>
            <Badge variant="secondary">130 total</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gd" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="d"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#gd)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Quick actions</p>
          <p className="text-xs text-muted-foreground">Jump back into your workflow</p>
          <div className="mt-4 space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="group flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
                    <a.icon className="h-3.5 w-3.5" />
                  </span>
                  {a.label}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent resumes */}
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Recent resumes</p>
            <Link
              to="/dashboard/resumes"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {demoResumes.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{r.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      v{r.version} · updated {new Date(r.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/resumes">Edit</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* ATS score widget */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Latest ATS score</p>
          <p className="text-xs text-muted-foreground">vs. Vercel — Senior Product Designer</p>
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight">78</span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <Progress value={78} className="mt-4" />
          <Button variant="outline" size="sm" className="mt-5 w-full" asChild>
            <Link to="/dashboard/ats">Open analyzer</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent exports */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Recent exports</p>
            <Link
              to="/dashboard/exports"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="space-y-2">
            {demoExports.slice(0, 3).map((x) => (
              <li
                key={x.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Badge variant="secondary" className="uppercase">
                    {x.format}
                  </Badge>
                  <p className="truncate text-sm">{x.resume_title}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Notifications</p>
          <ul className="mt-3 space-y-2">
            {demoNotifications.map((n) => (
              <li key={n.id} className="rounded-lg border border-border px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* API keys quick view */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">API keys</p>
            <p className="text-xs text-muted-foreground">Priority routing & failover</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/api-keys">Manage</Link>
          </Button>
        </div>
        <ul className="grid gap-2 sm:grid-cols-3">
          {demoApiKeys.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{k.name}</p>
                <p className="truncate text-xs text-muted-foreground">{k.masked_key}</p>
              </div>
              <Badge
                className={
                  k.status === "active"
                    ? "bg-success/10 text-success hover:bg-success/15"
                    : k.status === "rate_limited"
                      ? "bg-warning/10 text-warning hover:bg-warning/15"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/15"
                }
              >
                {k.status.replace("_", " ")}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
