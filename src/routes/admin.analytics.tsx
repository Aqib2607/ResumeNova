import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

const conversion = [
  { d: "Jan", v: 4.1 },
  { d: "Feb", v: 4.6 },
  { d: "Mar", v: 5.2 },
  { d: "Apr", v: 5.8 },
  { d: "May", v: 6.4 },
  { d: "Jun", v: 7.1 },
];

const breakdown = [
  { name: "Modern Pro", v: 38, color: "var(--color-chart-1)" },
  { name: "ATS Pro", v: 31, color: "var(--color-chart-2)" },
  { name: "Corporate", v: 18, color: "var(--color-chart-3)" },
  { name: "Creative", v: 13, color: "var(--color-chart-4)" },
];

function AdminAnalytics() {
  return (
    <div>
      <SEO title="Admin · Analytics" />
      <PageHeader title="Analytics" description="Cohort, conversion and template usage." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <p className="text-sm font-semibold">Free → paid conversion (%)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={conversion} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="v" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Template usage</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Pie data={breakdown} dataKey="v" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {breakdown.map((b, i) => (
                    <Cell key={i} fill={b.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5">
            {breakdown.map((b) => (
              <li key={b.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                  {b.name}
                </span>
                <span className="tabular-nums text-muted-foreground">{b.v}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
