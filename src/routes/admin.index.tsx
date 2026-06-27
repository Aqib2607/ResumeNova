import { createFileRoute } from "@tanstack/react-router";
import { Activity, FileText, ScanSearch, Users } from "lucide-react";
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

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const signups = [
  { d: "W1", v: 142 },
  { d: "W2", v: 198 },
  { d: "W3", v: 256 },
  { d: "W4", v: 312 },
  { d: "W5", v: 401 },
  { d: "W6", v: 488 },
];

const usage = [
  { d: "Mon", v: 1240 },
  { d: "Tue", v: 1820 },
  { d: "Wed", v: 940 },
  { d: "Thu", v: 2410 },
  { d: "Fri", v: 3122 },
  { d: "Sat", v: 1442 },
  { d: "Sun", v: 2231 },
];

function AdminOverview() {
  return (
    <div>
      <SEO title="Admin · Overview" />
      <PageHeader title="Overview" description="System health and growth at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Users", v: "18,402", h: "+312 this week", i: Users },
          { l: "Resumes", v: "84,217", h: "+1.2k this week", i: FileText },
          { l: "ATS scans", v: "62,108", h: "+880 today", i: ScanSearch },
          { l: "Uptime (30d)", v: "99.98%", h: "all systems normal", i: Activity },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.l}</p>
              <s.i className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{s.v}</p>
            <p className="mt-1 text-xs text-success">{s.h}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">New signups</p>
          <p className="text-xs text-muted-foreground">Last 6 weeks</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={signups} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                <Line type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">AI calls this week</p>
          <p className="text-xs text-muted-foreground">All providers, all keys</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={usage} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Recent system events</p>
        <ul className="mt-3 divide-y divide-border">
          {[
            { t: "Stripe webhook delivery", s: "success", at: "2m ago" },
            { t: "Anthropic API failover triggered for org_2381", s: "warning", at: "14m ago" },
            { t: "Background export job completed (412 files)", s: "success", at: "1h ago" },
            { t: "Auth: 3 failed logins for user_8129", s: "warning", at: "2h ago" },
          ].map((e, i) => (
            <li key={i} className="flex items-center justify-between py-2.5 text-sm">
              <span>{e.t}</span>
              <div className="flex items-center gap-3">
                <Badge
                  className={
                    e.s === "success"
                      ? "bg-success/10 text-success hover:bg-success/15"
                      : "bg-warning/10 text-warning hover:bg-warning/15"
                  }
                >
                  {e.s}
                </Badge>
                <span className="text-xs text-muted-foreground">{e.at}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
