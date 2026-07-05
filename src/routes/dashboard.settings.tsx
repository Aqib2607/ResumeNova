import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 first:border-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Label className="text-sm">{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <SEO title="Settings" />
      <PageHeader
        title="Settings"
        description="Manage preferences, notifications, and account state."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Appearance" description="Theme preferences (system-wide).">
          <Row label="Theme" hint="Choose light, dark, or follow system.">
            <Select defaultValue="system">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Compact density" hint="Tighten spacing across dashboard tables.">
            <Switch />
          </Row>
        </Section>

        <Section title="Notifications" description="What we email you about.">
          <Row label="Product updates" hint="Major releases and improvements.">
            <Switch defaultChecked />
          </Row>
          <Row label="Weekly ATS digest" hint="Score trends across your resumes.">
            <Switch defaultChecked />
          </Row>
          <Row label="Interview reminders" hint="Daily nudge to practice 1 question.">
            <Switch />
          </Row>
        </Section>

        <Section title="Language & region">
          <Row label="App language">
            <Select defaultValue="en">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Date format">
            <Select defaultValue="iso">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iso">2026-06-27</SelectItem>
                <SelectItem value="us">06/27/2026</SelectItem>
                <SelectItem value="eu">27/06/2026</SelectItem>
              </SelectContent>
            </Select>
          </Row>
        </Section>

        <Section title="Danger zone" description="Account-level actions that can't be undone.">
          <Row label="Export all data" hint="Receive a ZIP of resumes, analyses and letters.">
            <Button variant="outline">Request export</Button>
          </Row>
          <Row label="Delete account" hint="Permanently remove your account and data.">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently removes your resumes, exports, and analyses. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Row>
        </Section>
      </div>
    </div>
  );
}
