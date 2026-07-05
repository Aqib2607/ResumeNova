import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
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
  DialogTrigger,
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
  AlertDialogTrigger,
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
import { demoApiKeys } from "@/lib/demo-data";
import type { ApiKey } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/api-keys")({
  component: ApiKeysPage,
});

const STATUS_STYLES: Record<ApiKey["status"], string> = {
  active: "bg-success/10 text-success hover:bg-success/15",
  rate_limited: "bg-warning/10 text-warning hover:bg-warning/15",
  invalid: "bg-destructive/10 text-destructive hover:bg-destructive/15",
  disabled: "bg-muted text-muted-foreground",
};

function ApiKeysPage() {
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  return (
    <div>
      <SEO title="API Keys" />
      <PageHeader
        title="API Keys"
        description="Bring your own AI provider keys. Higher priority keys are used first; lower ones act as failover."
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add API key
              </Button>
            </DialogTrigger>
            <ApiKeyDialog />
          </Dialog>
        }
      />

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Provider</TableHead>
              <TableHead>Key name</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demoApiKeys.map((k) => (
              <TableRow key={k.id}>
                <TableCell>
                  <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                </TableCell>
                <TableCell className="font-medium capitalize">{k.provider}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{k.name}</span>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {reveal[k.id] ? k.masked_key.replace(/•/g, "x") : k.masked_key}
                    </code>
                    <button
                      onClick={() => setReveal((r) => ({ ...r, [k.id]: !r[k.id] }))}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Toggle reveal"
                    >
                      {reveal[k.id] ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                    {k.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={cn(STATUS_STYLES[k.status], "capitalize")}>
                    {k.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {k.usage_count.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <ApiKeyDialog editing={k} />
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API key?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes "{k.name}". Active routing may switch to the
                            next priority key.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Drag rows to re-order priority. Keys are encrypted at rest and never exposed to the
        frontend.
      </p>
    </div>
  );
}

function ApiKeyDialog({ editing }: { editing?: ApiKey }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit API key" : "Add API key"}</DialogTitle>
        <DialogDescription>
          {editing ? "Update the key's metadata." : "Connect a provider with a personal API key."}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Provider</Label>
          <Select defaultValue={editing?.provider ?? "openai"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["openai", "anthropic", "gemini", "groq", "mistral"].map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Key name</Label>
          <Input defaultValue={editing?.name} placeholder="e.g. OpenAI · Primary" />
        </div>
        <div className="space-y-1.5">
          <Label>API key</Label>
          <Input type="password" placeholder="sk-…" />
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Input type="number" min={1} defaultValue={editing?.priority ?? 1} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button>{editing ? "Save changes" : "Add key"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
