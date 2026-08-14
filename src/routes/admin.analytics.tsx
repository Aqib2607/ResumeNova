import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminAnalytics } from "@/hooks/use-admin";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

const PIE_COLORS = ["#2563eb", "#7c3aed", "#0f766e", "#f59e0b", "#ec4899", "#64748b"];

function AdminAnalytics() {
  const { data: analytics, isLoading } = useAdminAnalytics();

  const userGrowth = (analytics?.user_growth || []).map(
    (item: { date: string; registrations: number }) => ({
      d: item.date.slice(5),
      v: item.registrations,
    }),
  );

  const templateBreakdown = (analytics?.template_popularity || []).map(
    (item: { name: string; usage_count: number }, idx: number) => ({
      name: item.name,
      v: item.usage_count,
      color: PIE_COLORS[idx % PIE_COLORS.length],
    }),
  );

  const totalTemplateUses = templateBreakdown.reduce(
    (sum: number, item: { v: number }) => sum + item.v,
    0,
  );

  return (
    <div className="space-y-6">
      <SEO title="Admin · Analytics" />
      <PageHeader
        title="Deep Analytics & Growth"
        description="Daily user acquisition curves and real template distribution metrics."
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <p className="text-sm font-semibold">Daily User Registrations (14-Day Trajectory)</p>
            <p className="text-xs text-muted-foreground">Account creations per calendar day</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                  <Bar dataKey="v" name="New Users" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Template Market Share</p>
            <p className="text-xs text-muted-foreground">Distribution across all created resumes</p>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Pie
                    data={templateBreakdown}
                    dataKey="v"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {templateBreakdown.map((b: { color: string }, i: number) => (
                      <Cell key={i} fill={b.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
              {templateBreakdown.map((b: { name: string; v: number; color: string }) => (
                <li key={b.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="truncate max-w-[140px]">{b.name}</span>
                  </span>
                  <span className="tabular-nums font-medium">
                    {b.v} uses (
                    {totalTemplateUses > 0 ? Math.round((b.v / totalTemplateUses) * 100) : 0}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
