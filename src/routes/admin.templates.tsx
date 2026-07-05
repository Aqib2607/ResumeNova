import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/templates")({
  component: AdminTemplates,
});

const TEMPLATES = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    accent: "bg-primary",
    uses: 28140,
    status: "live",
  },
  {
    id: "corporate-executive",
    name: "Corporate Executive",
    accent: "bg-foreground",
    uses: 19320,
    status: "live",
  },
  {
    id: "ats-professional",
    name: "ATS Professional",
    accent: "bg-success",
    uses: 31280,
    status: "live",
  },
  {
    id: "creative-professional",
    name: "Creative Professional",
    accent: "bg-warning",
    uses: 12490,
    status: "live",
  },
  { id: "academic", name: "Academic CV", accent: "bg-chart-5", uses: 0, status: "draft" },
];

function AdminTemplates() {
  return (
    <div>
      <SEO title="Admin · Templates" />
      <PageHeader
        title="Templates"
        description="Manage the resume templates available to users."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> New template
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative aspect-[4/3] bg-surface p-5">
              <div className={`absolute left-0 top-0 h-1.5 w-full ${t.accent}`} />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-1/2 rounded bg-foreground/80" />
                <div className="h-2 w-1/3 rounded bg-muted-foreground/40" />
                <div className="mt-4 space-y-1.5">
                  {[88, 64, 75, 92, 50, 70].map((w, k) => (
                    <div key={k} className="h-1.5 rounded bg-muted" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border p-4">
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.uses.toLocaleString()} active resumes
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    t.status === "live"
                      ? "bg-success/10 text-success hover:bg-success/15 capitalize"
                      : "bg-muted text-muted-foreground capitalize"
                  }
                >
                  {t.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
