import { createFileRoute } from "@tanstack/react-router";
import { Activity, Bot, FileText, Loader2, ScanSearch, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminAnalytics, useAdminAuditLogs, useAdminOverview } from "@/hooks/use-admin";
import type { AdminAuditLog } from "@/types";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data: overview, isLoading: isOverviewLoading } = useAdminOverview();
  const { data: analytics, isLoading: isAnalyticsLoading } = useAdminAnalytics();
  const { data: auditLogsData } = useAdminAuditLogs({ per_page: 5 });

  const auditLogs: AdminAuditLog[] = Array.isArray(auditLogsData)
    ? auditLogsData
    : auditLogsData?.data && Array.isArray(auditLogsData.data)
      ? auditLogsData.data
      : [];

  const signupsData = (analytics?.user_growth || []).map(
    (item: { date: string; registrations: number }) => ({
      d: item.date.slice(5),
      v: item.registrations,
    }),
  );

  const aiActivityData = (analytics?.ai_activity || []).map(
    (item: { date: string; ai_requests: number }) => ({
      d: item.date.slice(5),
      v: item.ai_requests,
    }),
  );

  return (
    <div className="space-y-6">
      <SEO title="Admin · Overview" />
      <PageHeader
        title="Admin Overview"
        description="System health, live database growth, and resource usage."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            l: "Total Users",
            v: overview?.users?.total?.toLocaleString() ?? "—",
            h: `+${overview?.users?.new_this_week ?? 0} this week`,
            i: Users,
          },
          {
            l: "Resumes Created",
            v: overview?.content?.total_resumes?.toLocaleString() ?? "—",
            h: `${overview?.content?.total_exports ?? 0} exported`,
            i: FileText,
          },
          {
            l: "ATS Analyses",
            v: overview?.content?.total_ats_analyses?.toLocaleString() ?? "—",
            h: `${overview?.content?.total_interview_sessions ?? 0} interview prep`,
            i: ScanSearch,
          },
          {
            l: "AI Operations",
            v: overview?.ai?.total_operations?.toLocaleString() ?? "—",
            h: "all systems operational",
            i: Bot,
          },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.l}
              </p>
              <s.i className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">
              {isOverviewLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : s.v}
            </p>
            <p className="mt-1 text-xs text-emerald-500 font-medium">{s.h}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">New User Registrations</p>
          <p className="text-xs text-muted-foreground">14-day user acquisition trend</p>
          <div className="mt-4 h-64">
            {isAnalyticsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid
                    stroke="var(--color-border)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="d"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    name="Signups"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">AI Operations Volume</p>
          <p className="text-xs text-muted-foreground">14-day token and generation calls</p>
          <div className="mt-4 h-64">
            {isAnalyticsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={aiActivityData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="var(--color-border)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="d"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="v" name="AI Calls" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent System Audit Events */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Live System Audit Events</p>
        <p className="text-xs text-muted-foreground">
          Real-time security and administrative mutations
        </p>
        <div className="mt-3">
          {auditLogs.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No recent audit logs recorded.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {auditLogs.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">{e.action}</span>
                    {e.user && (
                      <span className="text-xs text-muted-foreground">
                        by {e.user.name} ({e.user.email})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {e.ip_address || "internal"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
