import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Terminal } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { useAdminSystemLogs } from "@/hooks/use-admin";

import type { AdminSystemLog } from "@/types";

export const Route = createFileRoute("/admin/system-logs")({
  component: SystemLogs,
});

const TONE: Record<string, string> = {
  info: "bg-primary/10 text-primary border-primary/20",
  notice: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  warn: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  error: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  critical: "bg-rose-600/20 text-rose-500 border-rose-600/30",
  debug: "bg-muted text-muted-foreground border-border",
};

function SystemLogs() {
  const { data: logsData, isLoading } = useAdminSystemLogs();

  const logs: AdminSystemLog[] = Array.isArray(logsData)
    ? logsData
    : logsData?.data && Array.isArray(logsData.data)
      ? logsData.data
      : [];

  return (
    <div className="space-y-6">
      <SEO title="Admin · System Logs" />
      <PageHeader
        title="System Logs"
        description="Sanitized application log trail with masked sensitive tokens and credentials."
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm">Loading system logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Terminal className="h-10 w-10 text-muted-foreground/40" />
            <h3 className="mt-3 text-base font-semibold text-foreground">No System Log Events</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Exceptions and system telemetry will be reported here automatically.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border font-mono text-xs">
            {logs.map((l) => (
              <li
                key={l.id}
                className="grid grid-cols-1 md:grid-cols-[100px_180px_1fr] items-start gap-3 p-4 hover:bg-muted/30 transition"
              >
                <div>
                  <Badge
                    variant="outline"
                    className={`${TONE[l.level.toLowerCase()] ?? "bg-muted text-muted-foreground"} justify-center uppercase font-mono text-[10px]`}
                  >
                    {l.level}
                  </Badge>
                </div>
                <span className="text-muted-foreground text-xs">
                  {new Date(l.created_at).toLocaleString()}
                </span>
                <div className="space-y-1 min-w-0">
                  <p className="break-all font-medium text-foreground">{l.message}</p>
                  {l.context && Object.keys(l.context).length > 0 && (
                    <pre className="mt-1 rounded bg-muted p-2 text-[11px] overflow-x-auto text-muted-foreground">
                      {JSON.stringify(l.context, null, 2)}
                    </pre>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
