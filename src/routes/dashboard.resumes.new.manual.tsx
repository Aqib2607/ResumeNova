import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Save } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { demoResumes } from "@/lib/demo-data";
import type { Resume, ResumeTemplate } from "@/types";

export const Route = createFileRoute("/dashboard/resumes/new/manual")({
  component: ManualBuilderPage,
});

const templates: { id: ResumeTemplate; name: string; accent: string }[] = [
  { id: "modern-professional", name: "Modern Professional", accent: "bg-primary" },
  { id: "corporate-executive", name: "Corporate Executive", accent: "bg-foreground" },
  { id: "ats-professional", name: "ATS Professional", accent: "bg-success" },
  { id: "creative-professional", name: "Creative Professional", accent: "bg-warning" },
];

function ManualBuilderPage() {
  const [resume, setResume] = useState<Resume>(demoResumes[0]);
  const update = <K extends keyof Resume>(key: K, value: Resume[K]) =>
    setResume((r) => ({ ...r, [key]: value }));
  const updateBasics = (patch: Partial<Resume["basics"]>) =>
    setResume((r) => ({ ...r, basics: { ...r.basics, ...patch } }));

  return (
    <div>
      <SEO title="Resume builder" />
      <PageHeader
        title={resume.title || "Untitled resume"}
        description="Edits update the preview instantly."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* LEFT: form */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 space-y-1.5">
            <Label htmlFor="title">Resume title</Label>
            <Input
              id="title"
              value={resume.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="mb-5">
            <Label className="mb-2 block">Template</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => update("template", t.id)}
                  className={`group rounded-lg border p-2 text-left transition ${
                    resume.template === t.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className={`h-1.5 w-full rounded ${t.accent}`} />
                  <p className="mt-2 text-[11px] font-medium leading-tight">{t.name}</p>
                </button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="basics">
            <TabsList className="w-full">
              <TabsTrigger value="basics" className="flex-1">
                Basics
              </TabsTrigger>
              <TabsTrigger value="experience" className="flex-1">
                Experience
              </TabsTrigger>
              <TabsTrigger value="education" className="flex-1">
                Education
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex-1">
                Skills
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  value={resume.basics.full_name}
                  onChange={(v) => updateBasics({ full_name: v })}
                />
                <Field
                  label="Headline"
                  value={resume.basics.headline}
                  onChange={(v) => updateBasics({ headline: v })}
                />
                <Field
                  label="Email"
                  value={resume.basics.email}
                  onChange={(v) => updateBasics({ email: v })}
                />
                <Field
                  label="Phone"
                  value={resume.basics.phone}
                  onChange={(v) => updateBasics({ phone: v })}
                />
                <Field
                  label="Location"
                  value={resume.basics.location}
                  onChange={(v) => updateBasics({ location: v })}
                />
                <Field
                  label="LinkedIn"
                  value={resume.basics.linkedin ?? ""}
                  onChange={(v) => updateBasics({ linkedin: v })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Professional summary</Label>
                <Textarea
                  rows={5}
                  value={resume.basics.summary}
                  onChange={(e) => updateBasics({ summary: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="experience" className="mt-5 space-y-4">
              {resume.experiences.map((exp, idx) => (
                <div key={exp.id} className="rounded-lg border border-border p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Role"
                      value={exp.role}
                      onChange={(v) =>
                        update(
                          "experiences",
                          resume.experiences.map((e, i) => (i === idx ? { ...e, role: v } : e)),
                        )
                      }
                    />
                    <Field
                      label="Company"
                      value={exp.company}
                      onChange={(v) =>
                        update(
                          "experiences",
                          resume.experiences.map((e, i) => (i === idx ? { ...e, company: v } : e)),
                        )
                      }
                    />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label>Bullets (one per line)</Label>
                    <Textarea
                      rows={4}
                      value={exp.bullets.join("\n")}
                      onChange={(e) =>
                        update(
                          "experiences",
                          resume.experiences.map((x, i) =>
                            i === idx ? { ...x, bullets: e.target.value.split("\n") } : x,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="education" className="mt-5 space-y-3">
              {resume.education.map((ed) => (
                <div key={ed.id} className="rounded-lg border border-border p-4 text-sm">
                  <p className="font-semibold">
                    {ed.degree}
                    {ed.field ? `, ${ed.field}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {ed.school} · {ed.start_date} – {ed.end_date}
                  </p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="skills" className="mt-5 space-y-3">
              {resume.skill_groups.map((g) => (
                <div key={g.id}>
                  <Label className="mb-1.5 block">{g.category}</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {g.skills.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT: live preview */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-2 shadow-elegant">
            <div className="aspect-[8.5/11] w-full overflow-auto rounded-lg bg-white p-8 text-[#0F172A]">
              <ResumePreview resume={resume} />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
            <Select defaultValue="100">
              <SelectTrigger className="h-8 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="75">75%</SelectItem>
                <SelectItem value="100">100%</SelectItem>
                <SelectItem value="125">125%</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Live preview · auto-saves on type</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ResumePreview({ resume }: { resume: Resume }) {
  const accent =
    resume.template === "corporate-executive"
      ? "border-foreground"
      : resume.template === "ats-professional"
        ? "border-success"
        : resume.template === "creative-professional"
          ? "border-warning"
          : "border-primary";

  return (
    <div className="font-sans text-[11px] leading-relaxed">
      <header className={`border-b-2 ${accent} pb-3`}>
        <h1 className="text-2xl font-bold tracking-tight">
          {resume.basics.full_name || "Your name"}
        </h1>
        <p className="text-[12px] text-[#0F172A]/70">{resume.basics.headline}</p>
        <p className="mt-1.5 text-[10px] text-[#0F172A]/60">
          {[
            resume.basics.email,
            resume.basics.phone,
            resume.basics.location,
            resume.basics.linkedin,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>
      {resume.basics.summary && (
        <section className="mt-3">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0F172A]/70">
            Summary
          </h2>
          <p>{resume.basics.summary}</p>
        </section>
      )}
      {resume.experiences.length > 0 && (
        <section className="mt-3">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0F172A]/70">
            Experience
          </h2>
          {resume.experiences.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">
                  {e.role} <span className="font-normal">— {e.company}</span>
                </p>
                <span className="text-[10px] text-[#0F172A]/60">
                  {e.start_date} – {e.current ? "Present" : e.end_date}
                </span>
              </div>
              <ul className="mt-1 list-disc pl-4">
                {e.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
      {resume.skill_groups.length > 0 && (
        <section className="mt-3">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0F172A]/70">
            Skills
          </h2>
          {resume.skill_groups.map((g) => (
            <p key={g.id}>
              <span className="font-semibold">{g.category}:</span> {g.skills.join(", ")}
            </p>
          ))}
        </section>
      )}
      {resume.education.length > 0 && (
        <section className="mt-3">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0F172A]/70">
            Education
          </h2>
          {resume.education.map((ed) => (
            <div key={ed.id} className="mb-1">
              <p className="font-semibold">
                {ed.degree}
                {ed.field ? `, ${ed.field}` : ""} — {ed.school}
              </p>
              <p className="text-[10px] text-[#0F172A]/60">
                {ed.start_date} – {ed.end_date}
              </p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
