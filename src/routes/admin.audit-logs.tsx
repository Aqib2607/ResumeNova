import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/audit-logs")({
  component: AuditLogs,
});

const LOGS = [
  {
    at: "2026-06-27 09:14:02",
    actor: "aarav@resumenova.app",
    action: "user.role.update",
    target: "u_03 → admin",
    ip: "203.0.113.10",
  },
  {
    at: "2026-06-27 08:51:39",
    actor: "system",
    action: "api_key.failover",
    target: "org_2381 · groq → anthropic",
    ip: "—",
  },
  {
    at: "2026-06-26 22:30:11",
    actor: "priya@acme.io",
    action: "resume.export",
    target: "r_01 · pdf",
    ip: "198.51.100.42",
  },
  {
    at: "2026-06-26 18:12:00",
    actor: "priya@acme.io",
    action: "cover_letter.generate",
    target: "Vercel · Senior PD",
    ip: "198.51.100.42",
  },
  {
    at: "2026-06-25 12:04:48",
    actor: "marcus@hexcorp.dev",
    action: "auth.login.failed",
    target: "3 attempts",
    ip: "192.0.2.88",
  },
];

const TONES: Record<string, string> = {
  "user.role.update": "bg-primary/10 text-primary",
  "api_key.failover": "bg-warning/10 text-warning",
  "resume.export": "bg-success/10 text-success",
  "cover_letter.generate": "bg-success/10 text-success",
  "auth.login.failed": "bg-destructive/10 text-destructive",
};

function AuditLogs() {
  return (
    <div>
      <SEO title="Admin · Audit logs" />
      <PageHeader
        title="Audit logs"
        description="Every privileged action, with who, when and from where."
      />
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {LOGS.map((l, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-xs tabular-nums">{l.at}</TableCell>
                <TableCell className="text-muted-foreground">{l.actor}</TableCell>
                <TableCell>
                  <Badge
                    className={`${TONES[l.action] ?? "bg-muted text-muted-foreground"} hover:opacity-90`}
                  >
                    {l.action}
                  </Badge>
                </TableCell>
                <TableCell>{l.target}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{l.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
