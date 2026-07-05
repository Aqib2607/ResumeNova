import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, FileText, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { demoResumes } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard/resumes")({
  component: ResumesPage,
});

function ResumesPage() {
  const [q, setQ] = useState("");
  const filtered = demoResumes.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-elegant"
          >
            {/* Mini preview */}
            <div className="relative aspect-[4/3] overflow-hidden bg-surface p-5">
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
                v{r.version}
              </Badge>
            </div>
            <div className="flex items-start justify-between gap-2 border-t border-border p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {r.template.replace(/-/g, " ")} · updated{" "}
                  {new Date(r.updated_at).toLocaleDateString()}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/resumes/new">Open editor</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
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
            <FileText className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium">Create a new resume</span>
        </Link>
      </div>
    </div>
  );
}
