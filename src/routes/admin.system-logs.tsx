import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/system-logs")({
  component: SystemLogs,
});

const LINES = [
  { lvl: "info", t: "2026-06-27T09:14:02Z", msg: "queue:worker started (workers=8)" },
  { lvl: "warn", t: "2026-06-27T08:51:39Z", msg: "ai_router: groq returned 429, switching to anthropic" },
  { lvl: "info", t: "2026-06-27T08:50:12Z", msg: "export.pdf job r_01 completed in 2.4s" },
  { lvl: "error", t: "2026-06-26T22:31:08Z", msg: "stripe.webhook: signature mismatch from 203.0.113.99" },
  { lvl: "info", t: "2026-06-26T22:30:11Z", msg: "ats.analyze finished score=78 user=u_02" },
  { lvl: "debug", t: "2026-06-26T22:29:54Z", msg: "cache:miss key=ats:r_01:hash:9af2" },
];

const TONE: Record<string, string> = {
  info: "bg-primary/10 text-primary",
  warn: "bg-warning/10 text-warning",
  error: "bg-destructive/10 text-destructive",
  debug: "bg-muted text-muted-foreground",
};

function SystemLogs() {
  return (
    <div>
      <SEO title="Admin · System logs" />
      <PageHeader title="System logs" description="Tail of the most recent application events." />
      <div className="overflow-hidden rounded-xl border border-border bg-foreground font-mono text-xs text-background/90">
        <ul className="divide-y divide-white/5">
          {LINES.map((l, i) => (
            <li key={i} className="grid grid-cols-[110px_auto_1fr] items-start gap-3 px-4 py-2.5">
              <Badge className={`${TONE[l.lvl]} justify-center uppercase`}>{l.lvl}</Badge>
              <span className="text-background/50">{l.t}</span>
              <span className="break-all">{l.msg}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
