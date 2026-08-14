import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminTemplates,
  useAdminCreateTemplate,
  useAdminUpdateTemplate,
  useAdminDeleteTemplate,
} from "@/hooks/use-admin";
import type { AdminResumeTemplate } from "@/types";

export const Route = createFileRoute("/admin/templates")({
  component: AdminTemplates,
});

function AdminTemplates() {
  const { data: templates = [], isLoading } = useAdminTemplates();
  const createMutation = useAdminCreateTemplate();
  const updateMutation = useAdminUpdateTemplate();
  const deleteMutation = useAdminDeleteTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdminResumeTemplate | null>(null);

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("professional");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setSlug("");
    setName("");
    setCategory("professional");
    setDescription("");
    setIsActive(true);
    setIsPremium(false);
    setDialogOpen(true);
  };

  const openEditDialog = (t: AdminResumeTemplate) => {
    setEditingTemplate(t);
    setSlug(t.slug);
    setName(t.name);
    setCategory(t.category);
    setDescription(t.description || "");
    setIsActive(t.is_active);
    setIsPremium(t.is_premium);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Template name is required.");
      return;
    }

    try {
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          payload: {
            name,
            category,
            description,
            is_active: isActive,
            is_premium: isPremium,
          },
        });
        toast.success("Template updated successfully.");
      } else {
        if (!slug.trim()) {
          toast.error("Slug is required for new template.");
          return;
        }
        await createMutation.mutateAsync({
          slug,
          name,
          category,
          description,
          is_active: isActive,
          is_premium: isPremium,
        });
        toast.success("Template created successfully.");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save template.";
      toast.error(message);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Template deleted.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete template.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <SEO title="Admin · Templates" />
      <PageHeader
        title="Resume Templates"
        description="Configure available layout templates, category tags, and premium tier restrictions."
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> New template
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="overflow-hidden rounded-xl border border-border bg-card flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] bg-surface p-5">
                <div className="absolute left-0 top-0 h-1.5 w-full bg-primary" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-1/2 rounded bg-foreground/80" />
                  <div className="h-2 w-1/3 rounded bg-muted-foreground/40" />
                  <div className="mt-4 space-y-1.5">
                    {[88, 64, 75, 92, 50, 70].map((w, k) => (
                      <div key={k} className="h-1.5 rounded bg-muted" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
                <div className="absolute top-3 right-3 flex gap-1">
                  {t.is_premium && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]"
                    >
                      PRO
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      t.is_active
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[10px]"
                        : "border-muted bg-muted/40 text-muted-foreground text-[10px]"
                    }
                  >
                    {t.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border p-4">
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {t.category} · {t.usage_count} uses
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(t)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(t.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
            <DialogDescription>
              Set metadata and visibility for this resume rendering template.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!editingTemplate && (
              <div className="space-y-1.5">
                <Label>Slug identifier</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. nordic-minimal"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Template Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nordic Minimal"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. professional, minimal, technical"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of the layout aesthetics"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label>Active in Builder</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Requires Premium Subscription</Label>
              <Switch checked={isPremium} onCheckedChange={setIsPremium} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
