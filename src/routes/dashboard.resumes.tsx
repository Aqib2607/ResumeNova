import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, FileText, MoreHorizontal, Plus, Search, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResumes, useDeleteResume, useDuplicateResume } from "@/hooks/use-resumes";
import type { Resume } from "@/types";

export const Route = createFileRoute("/dashboard/resumes")({
  component: ResumesPage,
});

function ResumesPage() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { data: response, isLoading, isError, error } = useResumes();
  const deleteMutation = useDeleteResume();
  const duplicateMutation = useDuplicateResume();

  const resumes: Resume[] = Array.isArray(response) ? response : (response?.data ?? []);

  const filtered = resumes.filter((r) =>
    (r.title || "Untitled resume").toLowerCase().includes(q.toLowerCase()),
  );

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`"${title}" deleted successfully`);
    } catch {
      toast.error("Failed to delete resume. Please try again.");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await duplicateMutation.mutateAsync(id);
      toast.success(`Duplicated as "${duplicated.title}"`);
    } catch {
      toast.error("Failed to duplicate resume. Please try again.");
    }
  };

  return (
    <div>
      <SEO title="My Resumes" />
      <PageHeader
        title="My Resumes"
        description="Manage, version and tailor your resumes for every role."
        actions={
          <Button asChild>
            <Link to="/dashboard/resumes/new">
              <Plus className="h-4 w-4" /> New resume
            </Link>
          </Button>
        }
      />

      <div className="mb-5 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search resumes…"
            className="h-9 pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading your resumes…</p>
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load resumes: {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-elegant"
            >
              {/* Mini preview */}
              <div
                onClick={() =>
                  navigate({
                    to: "/dashboard/resumes/new/manual",
                    search: { id: r.id },
                  })
                }
                className="relative aspect-[4/3] cursor-pointer overflow-hidden bg-surface p-5 transition hover:opacity-90"
              >
                <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
                <div className="mt-2 space-y-2">
                  <div className="h-3 w-1/2 rounded bg-foreground/80" />
                  <div className="h-2 w-1/3 rounded bg-muted-foreground/40" />
                  <div className="mt-4 space-y-1.5">
                    {[88, 64, 75, 92, 50, 70, 60].map((w, k) => (
                      <div key={k} className="h-1.5 rounded bg-muted" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
                <Badge
                  className="absolute right-3 top-3 bg-background/90 text-foreground"
                  variant="outline"
                >
                  v{r.version || "1.0"}
                </Badge>
              </div>
              <div className="flex items-start justify-between gap-2 border-t border-border p-4">
                <div className="min-w-0">
                  <p
                    onClick={() =>
                      navigate({
                        to: "/dashboard/resumes/new/manual",
                        search: { id: r.id },
                      })
                    }
                    className="cursor-pointer truncate text-sm font-semibold hover:text-primary"
                  >
                    {r.title || "Untitled Resume"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {(r.template || "modern-professional").replace(/-/g, " ")} · updated{" "}
                    {r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "recently"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        navigate({
                          to: "/dashboard/resumes/new/manual",
                          search: { id: r.id },
                        })
                      }
                    >
                      Open editor
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDuplicate(r.id)}
                      disabled={duplicateMutation.isPending}
                    >
                      <Copy className="h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          const res = await (
                            await import("@/services/endpoints")
                          ).ExportsService.exportResume(r.id, { format: "pdf" });
                          const a = document.createElement("a");
                          a.href = `/api/exports/${res.data.id}/download`;
                          a.download = res.data.file_name;
                          a.click();
                          toast.success("PDF export downloaded!");
                        } catch {
                          toast.error("Failed to export PDF.");
                        }
                      }}
                    >
                      <FileText className="h-4 w-4" /> Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          const res = await (
                            await import("@/services/endpoints")
                          ).ExportsService.exportResume(r.id, { format: "docx" });
                          const a = document.createElement("a");
                          a.href = `/api/exports/${res.data.id}/download`;
                          a.download = res.data.file_name;
                          a.click();
                          toast.success("DOCX export downloaded!");
                        } catch {
                          toast.error("Failed to export DOCX.");
                        }
                      }}
                    >
                      <FileText className="h-4 w-4" /> Export as DOCX
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(r.id, r.title)}
                      disabled={deleteMutation.isPending}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          {/* Create card */}
          <Link
            to="/dashboard/resumes/new"
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium">Create a new resume</span>
          </Link>
        </div>
      )}
    </div>
  );
}
