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
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  useDashboardStats,
  useDashboardChart,
  useRecentResumes,
  useRecentExports,
  useDashboardApiKeys,
  useNotifications,
  useAuthMe,
} from "@/hooks/useDashboard";
import { useLanguage, type TranslationKey } from "@/hooks/use-language";
import type { Resume, ExportRecord, ApiKey, Notification as AppNotification } from "@/types";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const quickActions: Array<{ labelKey: TranslationKey; icon: typeof Plus; to: string }> = [
  { labelKey: "qa_new_resume", icon: Plus, to: "/dashboard/resumes" },
  { labelKey: "qa_ats_scan", icon: ScanSearch, to: "/dashboard/ats" },
  { labelKey: "qa_cover_letter", icon: Sparkles, to: "/dashboard/cover-letters" },
  { labelKey: "qa_api_key", icon: KeyRound, to: "/dashboard/api-keys" },
];

function DashboardHome() {
  const { t } = useLanguage();
  const { data: user, isPending: isUserPending } = useAuthMe();
  const { data: stats, isPending: isStatsPending } = useDashboardStats();
  const { data: chartData, isPending: isChartPending } = useDashboardChart();
  const { data: recentResumes, isPending: isResumesPending } = useRecentResumes();
  const { data: recentExports, isPending: isExportsPending } = useRecentExports();
  const { data: apiKeys, isPending: isApiKeysPending } = useDashboardApiKeys();
  const { data: notifications, isPending: isNotificationsPending } = useNotifications();

  return (
    <div>
      <SEO title="Dashboard" />
      <PageHeader
        title={
          isUserPending
            ? `${t("dash_welcome")}...`
            : `${t("dash_welcome")}, ${user?.name?.split(" ")[0] || "User"}`
        }
        description={t("dash_subtitle")}
        actions={
          <Button asChild>
            <Link to="/dashboard/resumes">
              <Plus className="h-4 w-4" /> {t("btn_new_resume")}
            </Link>
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: t("stat_resumes"),
            value: stats?.resumes_count ?? 0,
            icon: FileText,
            hint: `+1 ${t("stat_month")}`,
          },
          {
            label: t("stat_avg_ats"),
            value: stats?.average_ats_score ?? 0,
            icon: ScanSearch,
            hint: "+6 vs. last month",
          },
          {
            label: t("stat_ai_usage"),
            value: stats?.ai_usage_count ?? 0,
            icon: Sparkles,
            hint: t("stat_calls_week"),
          },
          {
            label: t("stat_exports"),
            value: stats?.exports_count ?? 0,
            icon: Download,
            hint: "PDF / DOCX",
          },
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
            {isStatsPending ? (
              <Skeleton className="h-8 w-16 mt-3" />
            ) : (
              <p className="mt-3 text-2xl font-semibold tracking-tight">{s.value}</p>
            )}
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
              <p className="text-sm font-semibold">{t("chart_title")}</p>
              <p className="text-xs text-muted-foreground">{t("chart_subtitle")}</p>
            </div>
            <Badge variant="secondary">
              {isChartPending
                ? "..."
                : chartData?.reduce(
                    (acc: number, curr: { d: string; v: number }) => acc + curr.v,
                    0,
                  )}{" "}
              total
            </Badge>
          </div>
          <div className="h-56">
            {isChartPending ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <p className="text-sm">No AI usage data</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">{t("quick_actions")}</p>
          <p className="text-xs text-muted-foreground">{t("dash_subtitle")}</p>
          <div className="mt-4 space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.labelKey}
                to={a.to}
                className="group flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-sm transition hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
                    <a.icon className="h-3.5 w-3.5" />
                  </span>
                  {t(a.labelKey)}
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
            <p className="text-sm font-semibold">{t("recent_resumes")}</p>
            <Link
              to="/dashboard/resumes"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {isResumesPending ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentResumes && recentResumes.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentResumes.map((r: Resume) => (
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
                    <Link to="/dashboard/resumes/new/manual" search={{ id: String(r.id) }}>
                      Edit
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No resumes found. Create your first resume!
            </div>
          )}
        </div>

        {/* ATS score widget */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Latest ATS score</p>
          <p className="text-xs text-muted-foreground">Overall average across all resumes</p>
          <div className="mt-5 flex items-baseline gap-2">
            {isStatsPending ? (
              <Skeleton className="h-12 w-16" />
            ) : (
              <>
                <span className="text-5xl font-semibold tracking-tight">
                  {stats?.average_ats_score ?? 0}
                </span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </>
            )}
          </div>
          <Progress value={stats?.average_ats_score ?? 0} className="mt-4" />
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
          {isExportsPending ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : recentExports && recentExports.length > 0 ? (
            <ul className="space-y-2">
              {recentExports.map((x: ExportRecord) => (
                <li
                  key={x.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Badge variant="secondary" className="uppercase">
                      {x.format}
                    </Badge>
                    <p className="truncate text-sm">Export #{x.id}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">No recent exports.</div>
          )}
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Notifications</p>
          {isNotificationsPending ? (
            <div className="mt-3 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {notifications.map(
                (
                  n: AppNotification & {
                    data?: Record<string, unknown> | string;
                    read_at?: string | null;
                  },
                ) => {
                  const data = (typeof n.data === "string" ? JSON.parse(n.data) : n.data) as
                    Record<string, string> | undefined;
                  return (
                    <li key={n.id} className="rounded-lg border border-border px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{data?.title || "Notification"}</p>
                        {!n.read_at && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{data?.body}</p>
                    </li>
                  );
                },
              )}
            </ul>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No new notifications.
            </div>
          )}
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
        {isApiKeysPending ? (
          <div className="grid gap-2 sm:grid-cols-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : apiKeys && apiKeys.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-3">
            {apiKeys.map((k: ApiKey) => (
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
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No API keys configured.
          </div>
        )}
      </div>
    </div>
  );
}
