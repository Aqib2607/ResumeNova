import { createFileRoute } from "@tanstack/react-router";
import { Download, FileDown, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExports, useDeleteExport } from "@/hooks/use-exports";
import { useMemo } from "react";
import type { ExportRecord } from "@/types";

export const Route = createFileRoute("/dashboard/exports")({
  component: ExportsPage,
});

function formatBytes(n?: number | null) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function ExportsPage() {
  const { data: exportsData, isLoading } = useExports();
  const deleteMutation = useDeleteExport();

  const exportsList: ExportRecord[] = useMemo(() => {
    return Array.isArray(exportsData)
      ? exportsData
      : exportsData?.data && Array.isArray(exportsData.data)
        ? exportsData.data
        : [];
  }, [exportsData]);

  const handleDelete = async (id: string | number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Export record deleted.");
    } catch {
      toast.error("Failed to delete export.");
    }
  };

  const handleDownload = (item: ExportRecord) => {
    const url = `/api/exports/${item.id}/download`;
    const a = document.createElement("a");
    a.href = url;
    a.download = item.file_name || "document";
    a.click();
    toast.success("Download started.");
  };

  return (
    <div className="space-y-6">
      <SEO title="Document Exports" />
      <PageHeader
        title="Document Exports"
        description="Download and manage your generated PDF and DOCX documents."
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm">Loading export history...</p>
          </div>
        ) : exportsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <FileDown className="h-10 w-10 text-muted-foreground/40" />
            <h3 className="mt-3 text-base font-semibold text-foreground">
              No Exported Documents Yet
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              You can export resumes and cover letters to PDF or DOCX directly from their respective
              builder and management pages.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Template / Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exportsList.map((x) => (
                <TableRow key={x.id}>
                  <TableCell className="font-medium">
                    {x.resume_title || x.cover_letter_title || x.file_name || "Exported Document"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={x.format === "pdf" ? "default" : "secondary"}
                      className="uppercase font-semibold text-[10px]"
                    >
                      {x.format}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize text-xs text-muted-foreground">
                    {x.template ? x.template.replace("-", " ") : "Standard"}
                  </TableCell>
                  <TableCell className="tabular-nums text-xs">
                    {x.file_size_human || formatBytes(x.file_size)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(x.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownload(x)}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(x.id)}
                        disabled={deleteMutation.isPending}
                        title="Delete export"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
