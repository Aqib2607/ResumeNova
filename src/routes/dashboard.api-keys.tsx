import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Loader2, Pencil, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useDeleteApiKey,
  useTestApiKey,
} from "@/hooks/use-api-keys";
import type { ApiKey } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/api-keys")({
  component: ApiKeysPage,
});

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success hover:bg-success/15",
  rate_limited: "bg-warning/10 text-warning hover:bg-warning/15",
  invalid: "bg-destructive/10 text-destructive hover:bg-destructive/15",
  disabled: "bg-muted text-muted-foreground",
};

function ApiKeysPage() {
  const { data: keys, isLoading, isError, error } = useApiKeys();
  const deleteMutation = useDeleteApiKey();
  const testMutation = useTestApiKey();

  const [addOpen, setAddOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [deletingKey, setDeletingKey] = useState<ApiKey | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTest = async (key: ApiKey) => {
    setTestingId(String(key.id));
    try {
      const res = await testMutation.mutateAsync(String(key.id));
      if (res.valid) {
        toast.success(res.message || `Key "${key.name}" is working and connected to Groq!`);
      } else {
        toast.error(res.message || `Key "${key.name}" failed verification.`);
      }
    } catch {
      toast.error("Failed to test key connectivity. Please check your connection.");
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingKey) return;
    try {
      await deleteMutation.mutateAsync(String(deletingKey.id));
      toast.success(`API key "${deletingKey.name}" deleted.`);
      setDeletingKey(null);
    } catch {
      toast.error("Failed to delete API key.");
    }
  };

  return (
    <div>
      <SEO title="API Keys" />
      <PageHeader
        title="API Keys"
        description="Manage your Groq AI provider keys. Higher priority keys are used first; lower priority keys act as automatic failovers."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add API key
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Loading your API keys…</p>
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">
            Failed to load API keys: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      ) : keys && keys.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Key Name</TableHead>
                <TableHead>Masked Key</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Usage Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell className="font-medium capitalize">
                    <Badge variant="outline" className="font-semibold">
                      {k.provider}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{k.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                      {k.masked_key}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                      {k.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(STATUS_STYLES[k.status] || STATUS_STYLES.active, "capitalize")}
                    >
                      {k.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm font-medium">
                    {k.usage_count?.toLocaleString() ?? 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleTest(k)}
                        disabled={testingId === String(k.id)}
                        title="Test API Key Connectivity"
                      >
                        {testingId === String(k.id) ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        ) : (
                          <Zap className="h-3.5 w-3.5 mr-1 text-primary" />
                        )}
                        Test
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingKey(k)}
                        title="Edit key metadata"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingKey(k)}
                        title="Delete key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold">No API keys configured</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Connect your Groq API key to power AI resume generation, ATS scoring, and Cover Letter
            creation.
          </p>
          <Button onClick={() => setAddOpen(true)} className="mt-5">
            <Plus className="h-4 w-4 mr-1" /> Add your first key
          </Button>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Keys are AES-256 encrypted at rest and never exposed in raw text. High priority keys are
        used first; automatic failover handles rate-limit limits without interrupting workflows.
      </p>

      {/* Add Dialog */}
      <AddApiKeyDialog open={addOpen} onOpenChange={setAddOpen} />

      {/* Edit Dialog */}
      {editingKey && (
        <EditApiKeyDialog
          apiKey={editingKey}
          open={Boolean(editingKey)}
          onOpenChange={(open) => !open && setEditingKey(null)}
        />
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(deletingKey)}
        onOpenChange={(open) => !open && setDeletingKey(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API key?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes &quot;{deletingKey?.name}&quot;. Active AI routing will
              automatically switch to the next priority key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddApiKeyDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [provider, setProvider] = useState("groq");
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [priority, setPriority] = useState(1);

  const createMutation = useCreateApiKey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) {
      toast.error("Please fill in key name and API key.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        provider,
        name: name.trim(),
        key: key.trim(),
        priority: Number(priority) || 1,
      });
      toast.success("API key added successfully!");
      setName("");
      setKey("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to add API key. Please verify input.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} autoComplete="off">
          <DialogHeader>
            <DialogTitle>Add API key</DialogTitle>
            <DialogDescription>
              Connect your personal Groq API key. Keys are encrypted at rest.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="groq">Groq (Llama 3.3 70B & 8B)</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="key-name">Key Name</Label>
              <Input
                id="key-name"
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groq Primary Key"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="api-key-val">API Key</Label>
              <Input
                id="api-key-val"
                type="password"
                autoComplete="new-password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="gsk_…"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="key-priority">Priority (1 = Highest)</Label>
              <Input
                id="key-priority"
                type="number"
                min={1}
                autoComplete="off"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Adding…
                </>
              ) : (
                "Add key"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditApiKeyDialog({
  apiKey,
  open,
  onOpenChange,
}: {
  apiKey: ApiKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(apiKey.name);
  const [status, setStatus] = useState<string>(apiKey.status);
  const [priority, setPriority] = useState(apiKey.priority);
  const [newKey, setNewKey] = useState("");

  const updateMutation = useUpdateApiKey();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Key name cannot be empty.");
      return;
    }

    try {
      const payload: { name: string; status: string; priority: number; key?: string } = {
        name: name.trim(),
        status,
        priority: Number(priority) || 1,
      };

      if (newKey.trim()) {
        payload.key = newKey.trim();
      }

      await updateMutation.mutateAsync({
        id: String(apiKey.id),
        payload,
      });

      toast.success("API key updated successfully!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update API key.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleUpdate} autoComplete="off">
          <DialogHeader>
            <DialogTitle>Edit API key</DialogTitle>
            <DialogDescription>
              Update metadata or replace credentials for this key.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-key-name">Key Name</Label>
              <Input
                id="edit-key-name"
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="rate_limited">Rate Limited</SelectItem>
                  <SelectItem value="invalid">Invalid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-key-priority">Priority</Label>
              <Input
                id="edit-key-priority"
                type="number"
                min={1}
                autoComplete="off"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="replace-key-val">
                Replace Secret Key (Leave blank to keep current)
              </Label>
              <Input
                id="replace-key-val"
                type="password"
                autoComplete="new-password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Enter new key to replace…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
