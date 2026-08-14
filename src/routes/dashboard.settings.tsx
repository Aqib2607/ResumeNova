import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
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
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <SEO title={t("settings_title")} />
      <PageHeader title={t("settings_title")} description={t("settings_subtitle")} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title={t("appearance_title")} description={t("appearance_desc")}>
          <Row label={t("theme_label")} hint={t("theme_hint")}>
            <Select
              value={theme}
              onValueChange={(val) => setTheme(val as "light" | "dark" | "system")}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("theme_light")}</SelectItem>
                <SelectItem value="dark">{t("theme_dark")}</SelectItem>
                <SelectItem value="system">{t("theme_system")}</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label={t("compact_label")} hint={t("compact_hint")}>
            <Switch />
          </Row>
        </Section>

        <Section title={t("notifications_section")} description={t("notifications_desc")}>
          <Row label={t("product_updates")} hint={t("product_updates_hint")}>
            <Switch defaultChecked />
          </Row>
          <Row label={t("weekly_digest")} hint={t("weekly_digest_hint")}>
            <Switch defaultChecked />
          </Row>
          <Row label={t("interview_reminders")} hint={t("interview_reminders_hint")}>
            <Switch />
          </Row>
        </Section>

        <Section title={t("lang_region")} description={t("lang_region_desc")}>
          <Row label={t("app_lang")} hint={t("app_lang_hint")}>
            <Select value={language} onValueChange={(val) => setLanguage(val as "en" | "bn")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label={t("date_format")}>
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

        <Section title={t("danger_zone")} description={t("danger_zone_desc")}>
          <Row label={t("export_all")} hint={t("export_all_hint")}>
            <Button variant="outline">{t("btn_request_export")}</Button>
          </Row>
          <Row label={t("delete_account")} hint={t("delete_account_hint")}>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {t("delete_account")}
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
                  <AlertDialogCancel>{t("btn_cancel")}</AlertDialogCancel>
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
