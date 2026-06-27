import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Download, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { demoCoverLetters, demoResumes } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard/cover-letters")({
  component: CoverLettersPage,
});

const LANGUAGES = [
  { v: "en", l: "English" },
  { v: "es", l: "Spanish" },
  { v: "fr", l: "French" },
  { v: "de", l: "German" },
  { v: "pt", l: "Portuguese" },
  { v: "hi", l: "Hindi" },
];

const SAMPLE = `Dear Hiring Team at Vercel,

I'm writing to express my strong interest in the Senior Product Designer role. Over the past three years at Linear, I've led the redesign of the project planning surface adopted by 12,000+ teams and shipped 40+ components into our design system, cutting design QA time by 35%.

Your job description emphasizes design systems, accessibility (WCAG 2.2), and cross-functional collaboration — all areas where I've spent the bulk of my career. At Stripe I drove an 18% increase in onboarding activation by partnering with engineering and analytics, and I've maintained a public WCAG-tested token library used by 18k weekly Figma users.

I'd love to bring this work to Vercel and help shape the next generation of your dashboard experience.

Sincerely,
Aarav Mehta`;

function CoverLettersPage() {
  const [letter, setLetter] = useState(SAMPLE);
  const [resumeId, setResumeId] = useState(demoResumes[0].id);
  const [lang, setLang] = useState("en");
  const [jd, setJd] = useState("Senior Product Designer at Vercel — design systems and DX.");

  return (
    <div>
      <SEO title="Cover Letters" />
      <PageHeader
        title="Cover Letter Generator"
        description="Generate tailored cover letters in any language, ready to send."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="space-y-1.5">
            <Label>Resume</Label>
            <Select value={resumeId} onValueChange={setResumeId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {demoResumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.v} value={l.v}>
                    {l.l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Job description</Label>
            <Textarea rows={10} value={jd} onChange={(e) => setJd(e.target.value)} />
          </div>
          <Button className="w-full">
            <Sparkles className="h-4 w-4" /> Generate
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {demoCoverLetters.length} previously generated
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border p-3">
            <p className="text-sm font-semibold">Generated letter</p>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(letter);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </div>
          <Textarea
            className="min-h-[520px] resize-none border-0 font-sans text-sm leading-relaxed focus-visible:ring-0"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
