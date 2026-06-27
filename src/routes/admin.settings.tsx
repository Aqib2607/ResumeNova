import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div>
      <SEO title="Admin · Settings" />
      <PageHeader title="System settings" description="Global configuration for the platform." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold">Branding</p>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Product name</Label>
              <Input defaultValue="ResumeNova" />
            </div>
            <div className="space-y-1.5">
              <Label>Support email</Label>
              <Input defaultValue="support@resumenova.app" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold">Feature flags</p>
          <div className="mt-4 space-y-4">
            {[
              ["AI cover letter generator", true],
              ["Interview preparation", true],
              ["Multi-provider failover", true],
              ["Public template marketplace", false],
            ].map(([label, on]) => (
              <div key={label as string} className="flex items-center justify-between text-sm">
                <span>{label as string}</span>
                <Switch defaultChecked={on as boolean} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <p className="text-sm font-semibold">Rate limiting</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Free · AI calls / day</Label>
              <Input type="number" defaultValue={20} />
            </div>
            <div className="space-y-1.5">
              <Label>Pro · AI calls / day</Label>
              <Input type="number" defaultValue={500} />
            </div>
            <div className="space-y-1.5">
              <Label>Max resumes per account</Label>
              <Input type="number" defaultValue={25} />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button>Save settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
