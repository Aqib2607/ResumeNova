import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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
  const [productName, setProductName] = useState("ResumeNova");
  const [supportEmail, setSupportEmail] = useState("support@resumenova.app");
  const [aiCoverLetter, setAiCoverLetter] = useState(true);
  const [interviewPrep, setInterviewPrep] = useState(true);
  const [multiProviderFailover, setMultiProviderFailover] = useState(true);
  const [publicMarketplace, setPublicMarketplace] = useState(false);
  const [freeQuota, setFreeQuota] = useState(20);
  const [proQuota, setProQuota] = useState(500);
  const [maxResumes, setMaxResumes] = useState(25);

  const handleSave = () => {
    toast.success("System configurations updated successfully.");
  };

  return (
    <div className="space-y-6">
      <SEO title="Admin · Settings" />
      <PageHeader
        title="System Settings"
        description="Global platform parameters, feature flags, and AI capacity tier limits."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold">Branding & Communication</p>
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label>Product Name</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Support Email</Label>
              <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold">Global Feature Flags</p>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>AI Cover Letter Generator</span>
              <Switch checked={aiCoverLetter} onCheckedChange={setAiCoverLetter} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Interview Preparation Engine</span>
              <Switch checked={interviewPrep} onCheckedChange={setInterviewPrep} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Multi-Provider Failover Routing</span>
              <Switch checked={multiProviderFailover} onCheckedChange={setMultiProviderFailover} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Public Template Marketplace</span>
              <Switch checked={publicMarketplace} onCheckedChange={setPublicMarketplace} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <p className="text-sm font-semibold">AI Capacity & Quota Limits</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Free Tier AI Calls / Day</Label>
              <Input
                type="number"
                value={freeQuota}
                onChange={(e) => setFreeQuota(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pro Tier AI Calls / Day</Label>
              <Input
                type="number"
                value={proQuota}
                onChange={(e) => setProQuota(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max Resumes Per Account</Label>
              <Input
                type="number"
                value={maxResumes}
                onChange={(e) => setMaxResumes(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
