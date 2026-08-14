import { createFileRoute } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
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
import { useAdminAuditLogs } from "@/hooks/use-admin";

import type { AdminAuditLog } from "@/types";

export const Route = createFileRoute("/admin/audit-logs")({
  component: AuditLogs,
});

function AuditLogs() {
  const { data: logsData, isLoading } = useAdminAuditLogs();

  const logs: AdminAuditLog[] = Array.isArray(logsData)
    ? logsData
    : logsData?.data && Array.isArray(logsData.data)
      ? logsData.data
      : [];

  return (
    <div className="space-y-6">
      <SEO title="Admin · Audit Logs" />
      <PageHeader
        title="Audit Logs"
        description="Immutable record of administrative mutations, role updates, and user state transitions."
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
            <h3 className="mt-3 text-base font-semibold text-foreground">No Audit Logs Found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Administrative actions and security events will automatically appear here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Entity</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {new Date(l.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium text-xs">
                    {l.user ? `${l.user.name} (${l.user.email})` : "System / Background"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {l.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {l.entity_type ? `${l.entity_type.split("\\").pop()} #${l.entity_id}` : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {l.ip_address || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
