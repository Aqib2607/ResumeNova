import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Download, Save, Plus, Trash2, Loader2, ArrowLeft, Sparkles, Globe } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
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
import { useResume, useCreateResume, useUpdateResume } from "@/hooks/use-resumes";
import { useGenerateSummary, useImproveExperience, useSuggestSkills } from "@/hooks/use-ai-resume";
import type {
  Resume,
  ResumeTemplate,
  ResumeExperience,
  ResumeEducation,
  ResumeSkillGroup,
} from "@/types";

const searchSchema = z.object({
  id: z.string().optional(),
});

export const Route = createFileRoute("/dashboard/resumes/new/manual")({
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  component: ManualBuilderPage,
});

const templates: { id: ResumeTemplate; name: string; accent: string }[] = [
  { id: "modern-professional", name: "Modern Professional", accent: "bg-primary" },
  { id: "corporate-executive", name: "Corporate Executive", accent: "bg-foreground" },
  { id: "ats-professional", name: "ATS Professional", accent: "bg-success" },
  { id: "creative-professional", name: "Creative Professional", accent: "bg-warning" },
];

const emptyResume: Resume = {
  id: "",
  title: "Untitled Resume",
  template: "modern-professional",
  version: 1,
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  basics: {
    full_name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    summary: "",
  },
  experiences: [
    {
      id: "exp-1",
      company: "",
      role: "",
      location: "",
      start_date: "",
      end_date: "",
      current: false,
      bullets: [""],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "",
      degree: "",
      field: "",
      start_date: "",
      end_date: "",
    },
  ],
  projects: [],
  skill_groups: [
    {
      id: "skill-1",
      category: "Technical Skills",
      skills: [],
    },
  ],
};

function ManualBuilderPage() {
  const { id } = useSearch({ from: "/dashboard/resumes/new/manual" });
  const navigate = useNavigate();
  const { data: fetchedResume, isLoading } = useResume(id);
  const createMutation = useCreateResume();
  const updateMutation = useUpdateResume();
  const generateSummaryMutation = useGenerateSummary();
  const improveExperienceMutation = useImproveExperience();
  const suggestSkillsMutation = useSuggestSkills();

  const [resume, setResume] = useState<Resume>(emptyResume);
  const [newSkill, setNewSkill] = useState("");
  const [aiLang, setAiLang] = useState("en");
  const [polishingExpIdx, setPolishingExpIdx] = useState<number | null>(null);

  useEffect(() => {
    if (fetchedResume) {
      setResume({
        ...emptyResume,
        ...fetchedResume,
        basics: { ...emptyResume.basics, ...(fetchedResume.basics || {}) },
        experiences: fetchedResume.experiences?.length
          ? fetchedResume.experiences
          : emptyResume.experiences,
        education: fetchedResume.education?.length
          ? fetchedResume.education
          : emptyResume.education,
        skill_groups: fetchedResume.skill_groups?.length
          ? fetchedResume.skill_groups
          : emptyResume.skill_groups,
      });
    }
  }, [fetchedResume]);

  const update = <K extends keyof Resume>(key: K, value: Resume[K]) =>
    setResume((r) => ({ ...r, [key]: value }));

  const updateBasics = (patch: Partial<Resume["basics"]>) =>
    setResume((r) => ({ ...r, basics: { ...r.basics, ...patch } }));

  const handleAiGenerateSummary = async () => {
    if (!id) {
      toast.info("Please save your resume once before generating AI summary.");
      return;
    }

    try {
      const res = await generateSummaryMutation.mutateAsync({
        id,
        payload: {
          language: aiLang,
          current_summary: resume.basics.summary,
        },
      });
      if (res?.summary) {
        updateBasics({ summary: res.summary });
        toast.success("AI generated professional summary applied!");
      }
    } catch {
      toast.error("AI summary generation failed. Please ensure an API key is connected.");
    }
  };

  const handleAiImproveExperience = async (idx: number) => {
    if (!id) {
      toast.info("Please save your resume once before polishing with AI.");
      return;
    }

    const exp = resume.experiences[idx];
    if (!exp) return;

    setPolishingExpIdx(idx);
    try {
      const res = await improveExperienceMutation.mutateAsync({
        id,
        payload: {
          role: exp.role,
          company: exp.company,
          bullets: exp.bullets,
          language: aiLang,
        },
      });
      if (res?.bullets && res.bullets.length > 0) {
        update(
          "experiences",
          resume.experiences.map((e, i) => (i === idx ? { ...e, bullets: res.bullets } : e)),
        );
        toast.success(`Polished bullets for ${exp.role || "position"} applied!`);
      }
    } catch {
      toast.error("Failed to polish bullets. Please check your API key.");
    } finally {
      setPolishingExpIdx(null);
    }
  };

  const handleAiSuggestSkills = async () => {
    if (!id) {
      toast.info("Please save your resume once before generating AI skill suggestions.");
      return;
    }

    try {
      const res = await suggestSkillsMutation.mutateAsync({
        id,
        payload: {
          language: aiLang,
        },
      });
      const skillResponse = res as
        { skill_groups?: Array<{ category: string; skills: string[] }> } | undefined;
      if (skillResponse?.skill_groups && Array.isArray(skillResponse.skill_groups)) {
        const mappedGroups: ResumeSkillGroup[] = skillResponse.skill_groups.map(
          (g: { category: string; skills: string[] }, idx: number) => ({
            id: `ai-skill-${Date.now()}-${idx}`,
            category: g.category,
            skills: g.skills,
          }),
        );
        setResume((r) => ({
          ...r,
          skill_groups: [...r.skill_groups, ...mappedGroups],
        }));
        toast.success("AI suggested skills added!");
      }
    } catch {
      toast.error("Failed to suggest skills. Please check your API key.");
    }
  };

  const handleSave = async () => {
    if (!resume.title.trim()) {
      toast.error("Please provide a resume title");
      return;
    }

    try {
      if (id) {
        await updateMutation.mutateAsync({
          id,
          payload: {
            title: resume.title,
            template: resume.template,
            content: {
              basics: resume.basics,
              experiences: resume.experiences,
              education: resume.education,
              projects: resume.projects,
              skill_groups: resume.skill_groups,
            },
          },
        });
        toast.success("Resume updated successfully!");
      } else {
        const created = await createMutation.mutateAsync({
          title: resume.title,
          template: resume.template,
          content: {
            basics: resume.basics,
            experiences: resume.experiences,
            education: resume.education,
            projects: resume.projects,
            skill_groups: resume.skill_groups,
          },
        });
        toast.success("Resume created successfully!");
        navigate({
          to: "/dashboard/resumes/new/manual",
          search: { id: String(created.id) },
        });
      }
    } catch {
      toast.error("Failed to save resume. Please check your connection.");
    }
  };

  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: `exp-${Date.now()}`,
      company: "",
      role: "",
      location: "",
      start_date: "",
      end_date: "",
      current: false,
      bullets: [""],
    };
    setResume((r) => ({ ...r, experiences: [...r.experiences, newExp] }));
  };

  const removeExperience = (index: number) => {
    setResume((r) => ({
      ...r,
      experiences: r.experiences.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: `edu-${Date.now()}`,
      school: "",
      degree: "",
      field: "",
      start_date: "",
      end_date: "",
    };
    setResume((r) => ({ ...r, education: [...r.education, newEdu] }));
  };

  const removeEducation = (index: number) => {
    setResume((r) => ({
      ...r,
      education: r.education.filter((_, i) => i !== index),
    }));
  };

  const addSkill = (groupIdx: number) => {
    if (!newSkill.trim()) return;
    setResume((r) => ({
      ...r,
      skill_groups: r.skill_groups.map((group, idx) =>
        idx === groupIdx ? { ...group, skills: [...group.skills, newSkill.trim()] } : group,
      ),
    }));
    setNewSkill("");
  };

  const removeSkill = (groupIdx: number, skillIdx: number) => {
    setResume((r) => ({
      ...r,
      skill_groups: r.skill_groups.map((group, idx) =>
        idx === groupIdx
          ? { ...group, skills: group.skills.filter((_, sIdx) => sIdx !== skillIdx) }
          : group,
      ),
    }));
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (id && isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Loading resume editor…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEO title="Resume builder" />
      <PageHeader
        title={resume.title || "Untitled resume"}
        description="Edits update the preview in real-time."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/dashboard/resumes" })}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
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
              placeholder="e.g. Senior Software Engineer"
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
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label>Professional summary</Label>
                  <div className="flex items-center gap-2">
                    <Select value={aiLang} onValueChange={setAiLang}>
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bn">বাংলা (Bangla)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs text-primary border-primary/30 hover:bg-primary/10"
                      onClick={handleAiGenerateSummary}
                      disabled={generateSummaryMutation.isPending}
                    >
                      {generateSummaryMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                      )}
                      {generateSummaryMutation.isPending ? "Generating…" : "AI Polish Summary"}
                    </Button>
                  </div>
                </div>
                <Textarea
                  rows={5}
                  value={resume.basics.summary}
                  onChange={(e) => updateBasics({ summary: e.target.value })}
                  placeholder="Write a concise overview of your professional background and top achievements…"
                />
              </div>
            </TabsContent>

            <TabsContent value="experience" className="mt-5 space-y-4">
              {resume.experiences.map((exp, idx) => (
                <div key={exp.id || idx} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Position #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                        onClick={() => handleAiImproveExperience(idx)}
                        disabled={polishingExpIdx === idx}
                        title="Rewrite bullet points with strong action verbs and quantified impact"
                      >
                        {polishingExpIdx === idx ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 mr-1" />
                        )}
                        {polishingExpIdx === idx ? "Polishing…" : "AI Polish Bullets"}
                      </Button>
                      {resume.experiences.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(idx)}
                          className="text-destructive h-7 px-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
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
                  <div className="grid gap-3 sm:grid-cols-2 mt-3">
                    <Field
                      label="Start Date"
                      value={exp.start_date}
                      onChange={(v) =>
                        update(
                          "experiences",
                          resume.experiences.map((e, i) =>
                            i === idx ? { ...e, start_date: v } : e,
                          ),
                        )
                      }
                    />
                    <Field
                      label="End Date"
                      value={exp.end_date ?? ""}
                      onChange={(v) =>
                        update(
                          "experiences",
                          resume.experiences.map((e, i) => (i === idx ? { ...e, end_date: v } : e)),
                        )
                      }
                    />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label>Bullets (one per line)</Label>
                    <Textarea
                      rows={3}
                      value={exp.bullets.join("\n")}
                      onChange={(e) =>
                        update(
                          "experiences",
                          resume.experiences.map((x, i) =>
                            i === idx ? { ...x, bullets: e.target.value.split("\n") } : x,
                          ),
                        )
                      }
                      placeholder="• Built feature X that increased efficiency by 25%&#10;• Led cross-functional team of 5 engineers"
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addExperience} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add another position
              </Button>
            </TabsContent>

            <TabsContent value="education" className="mt-5 space-y-4">
              {resume.education.map((ed, idx) => (
                <div key={ed.id || idx} className="rounded-lg border border-border p-4 text-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Degree #{idx + 1}
                    </span>
                    {resume.education.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(idx)}
                        className="text-destructive h-7 px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="School / University"
                      value={ed.school}
                      onChange={(v) =>
                        update(
                          "education",
                          resume.education.map((e, i) => (i === idx ? { ...e, school: v } : e)),
                        )
                      }
                    />
                    <Field
                      label="Degree"
                      value={ed.degree}
                      onChange={(v) =>
                        update(
                          "education",
                          resume.education.map((e, i) => (i === idx ? { ...e, degree: v } : e)),
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 mt-3">
                    <Field
                      label="Field of Study"
                      value={ed.field ?? ""}
                      onChange={(v) =>
                        update(
                          "education",
                          resume.education.map((e, i) => (i === idx ? { ...e, field: v } : e)),
                        )
                      }
                    />
                    <Field
                      label="Dates"
                      value={`${ed.start_date || ""} - ${ed.end_date || ""}`}
                      onChange={(v) => {
                        const parts = v.split("-");
                        update(
                          "education",
                          resume.education.map((e, i) =>
                            i === idx
                              ? {
                                  ...e,
                                  start_date: parts[0]?.trim() || "",
                                  end_date: parts[1]?.trim() || "",
                                }
                              : e,
                          ),
                        );
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addEducation} className="w-full">
                <Plus className="h-4 w-4 mr-1" /> Add education
              </Button>
            </TabsContent>

            <TabsContent value="skills" className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Group your core competencies and technical proficiencies.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-primary border-primary/30 hover:bg-primary/10"
                  onClick={handleAiSuggestSkills}
                  disabled={suggestSkillsMutation.isPending}
                >
                  {suggestSkillsMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                  )}
                  {suggestSkillsMutation.isPending ? "Suggesting…" : "AI Suggest Skills"}
                </Button>
              </div>

              {resume.skill_groups.map((g, groupIdx) => (
                <div key={g.id || groupIdx} className="rounded-lg border border-border p-4">
                  <Label className="mb-2 block">{g.category}</Label>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {g.skills.map((s, sIdx) => (
                      <Badge key={sIdx} variant="secondary" className="gap-1 pr-1.5">
                        {s}
                        <button
                          type="button"
                          onClick={() => removeSkill(groupIdx, sIdx)}
                          className="hover:text-destructive text-muted-foreground ml-1"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g. React, TypeScript, PHP)…"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill(groupIdx);
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={() => addSkill(groupIdx)}>
                      Add
                    </Button>
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
            <p className="text-xs text-muted-foreground">Live synchronized preview</p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={isSaving}
              className="h-7 text-xs"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
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
          {resume.basics.full_name || "Your Full Name"}
        </h1>
        <p className="text-[12px] text-[#0F172A]/70">
          {resume.basics.headline || "Your Professional Title"}
        </p>
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
      {resume.experiences.some((e) => e.role || e.company) && (
        <section className="mt-3">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0F172A]/70">
            Experience
          </h2>
          {resume.experiences
            .filter((e) => e.role || e.company)
            .map((e, idx) => (
              <div key={e.id || idx} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">
                    {e.role || "Role"}{" "}
                    {e.company && <span className="font-normal">— {e.company}</span>}
                  </p>
                  <span className="text-[10px] text-[#0F172A]/60">
                    {e.start_date}{" "}
                    {e.start_date &&
                      (e.current ? "– Present" : e.end_date ? `– ${e.end_date}` : "")}
                  </span>
                </div>
                <ul className="mt-1 list-disc pl-4">
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
        </section>
      )}
      {resume.skill_groups.some((g) => g.skills.length > 0) && (
        <section className="mt-3">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0F172A]/70">
            Skills
          </h2>
          {resume.skill_groups
            .filter((g) => g.skills.length > 0)
            .map((g, idx) => (
              <p key={g.id || idx}>
                <span className="font-semibold">{g.category}:</span> {g.skills.join(", ")}
              </p>
            ))}
        </section>
      )}
      {resume.education.some((ed) => ed.school || ed.degree) && (
        <section className="mt-3">
          <h2 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#0F172A]/70">
            Education
          </h2>
          {resume.education
            .filter((ed) => ed.school || ed.degree)
            .map((ed, idx) => (
              <div key={ed.id || idx} className="mb-1">
                <p className="font-semibold">
                  {ed.degree}
                  {ed.field ? `, ${ed.field}` : ""} {ed.school && `— ${ed.school}`}
                </p>
                <p className="text-[10px] text-[#0F172A]/60">
                  {ed.start_date} {ed.start_date && ed.end_date ? `– ${ed.end_date}` : ""}
                </p>
              </div>
            ))}
        </section>
      )}
    </div>
  );
}
