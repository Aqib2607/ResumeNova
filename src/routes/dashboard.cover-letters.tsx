import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Copy, Download, History, Loader2, RefreshCw, Save, Sparkles, Trash2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResumes } from "@/hooks/use-resumes";
import {
  useCoverLetters,
  useGenerateCoverLetter,
  useUpdateCoverLetter,
  useDeleteCoverLetter,
} from "@/hooks/use-cover-letters";
import type { CoverLetter } from "@/types";

export const Route = createFileRoute("/dashboard/cover-letters")({
  component: CoverLettersPage,
});

const LANGUAGES = [
  { v: "en", l: "English" },
  { v: "bn", l: "বাংলা (Bangla)" },
  { v: "es", l: "Spanish" },
  { v: "fr", l: "French" },
  { v: "de", l: "German" },
  { v: "pt", l: "Portuguese" },
  { v: "hi", l: "Hindi" },
];

const TONES = [
  { v: "professional", l: "Formal & Professional" },
  { v: "confident", l: "Confident & Direct" },
  { v: "conversational", l: "Conversational & Warm" },
  { v: "executive", l: "Executive & Strategic" },
];

function CoverLettersPage() {
  const { data: resumesData, isLoading: resumesLoading } = useResumes();
  const resumes = useMemo(() => {
    return Array.isArray(resumesData)
      ? resumesData
      : resumesData?.data && Array.isArray(resumesData.data)
        ? resumesData.data
        : [];
  }, [resumesData]);

  const { data: coverLettersData } = useCoverLetters(1);
  const pastLetters: CoverLetter[] = useMemo(() => {
    return Array.isArray(coverLettersData)
      ? coverLettersData
      : coverLettersData?.data && Array.isArray(coverLettersData.data)
        ? coverLettersData.data
        : [];
  }, [coverLettersData]);

  const generateMutation = useGenerateCoverLetter();
  const updateMutation = useUpdateCoverLetter();
  const deleteMutation = useDeleteCoverLetter();

  const [activeLetter, setActiveLetter] = useState<CoverLetter | null>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [resumeId, setResumeId] = useState<string>("");
  const [lang, setLang] = useState("en");
  const [tone, setTone] = useState("professional");
  const [companyName, setCompanyName] = useState("");
  const [jd, setJd] = useState("");

  useEffect(() => {
    if (resumes.length > 0 && !resumeId) {
      setResumeId(String(resumes[0].id));
    }
  }, [resumes, resumeId]);

  const handleGenerate = async () => {
    if (!jd.trim() || jd.trim().length < 15) {
      toast.error("Please provide a detailed job description.");
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        resume_id: resumeId || undefined,
        language: lang,
        tone,
        company_name: companyName.trim() || undefined,
        job_description: jd.trim(),
      });

      setActiveLetter(result);
      setContent(result.content);
      setTitle(result.title || "Cover Letter");
      toast.success("AI Cover Letter generated successfully!");
    } catch {
      toast.error("Generation failed. Please make sure your Groq API key is active.");
    }
  };

  const handleSaveEdits = async () => {
    if (!activeLetter) return;
    try {
      await updateMutation.mutateAsync({
        id: activeLetter.id,
        payload: {
          title: title.trim() || activeLetter.title,
          content,
        },
      });
      toast.success("Cover letter saved successfully!");
    } catch {
      toast.error("Failed to save changes.");
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "cover_letter"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded.");
  };

  const handleSelectPastLetter = (letter: CoverLetter) => {
    setActiveLetter(letter);
    setContent(letter.content);
    setTitle(letter.title || "Cover Letter");
    if (letter.language) setLang(letter.language);
    if (letter.job_description) setJd(letter.job_description);
    const tab = document.querySelector('[value="generator"]') as HTMLElement;
    tab?.click();
  };

  const handleDeletePastLetter = async (id: string | number) => {
    try {
      await deleteMutation.mutateAsync(id);
      if (activeLetter && activeLetter.id === id) {
        setActiveLetter(null);
        setContent("");
      }
      toast.success("Cover letter deleted.");
    } catch {
      toast.error("Failed to delete cover letter.");
    }
  };

  return (
    <div>
      <SEO title="Cover Letters" />
      <PageHeader
        title="AI Cover Letter Generator"
        description="Generate persuasive, tailored cover letters in English or Bangla matching any job posting."
      />

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generator" className="gap-2">
            <Sparkles className="h-4 w-4" /> Generator & Editor
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> Past Letters ({pastLetters.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            {/* LEFT: Generation Parameters */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="space-y-1.5">
                <Label>Candidate Profile / Resume Context</Label>
                <Select
                  value={resumeId}
                  onValueChange={setResumeId}
                  disabled={resumesLoading || resumes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a resume for background context…" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
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
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t.v} value={t.v}>
                          {t.l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company-name">Target Company (Optional)</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Vercel, Pathao"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="jd-textarea">Target Job Description</Label>
                <Textarea
                  id="jd-textarea"
                  rows={9}
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the job description and requirements here…"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !jd.trim()}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating tailored letter…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" /> Generate Cover Letter
                  </>
                )}
              </Button>
            </div>

            {/* RIGHT: Live Editor & Export */}
            <div className="rounded-xl border border-border bg-card flex flex-col overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
                <div className="flex-1 min-w-[180px]">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Cover Letter Title…"
                    className="h-8 font-medium text-sm"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    disabled={!content}
                    onClick={() => {
                      navigator.clipboard.writeText(content);
                      toast.success("Cover letter copied to clipboard!");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    disabled={!activeLetter || updateMutation.isPending}
                    onClick={handleSaveEdits}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5 mr-1" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    disabled={generateMutation.isPending || !jd.trim()}
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Regenerate
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-2 text-xs"
                    disabled={!content}
                    onClick={handleDownload}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Download
                  </Button>
                </div>
              </div>

              <Textarea
                className="flex-1 min-h-[460px] resize-none border-0 p-5 font-sans text-sm leading-relaxed focus-visible:ring-0"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Your generated cover letter will appear here ready to review, customize, and export…"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-base font-semibold mb-4">Saved Cover Letters</h3>
            {pastLetters.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Tone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastLetters.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.title || "Untitled"}</TableCell>
                      <TableCell className="capitalize">{l.language}</TableCell>
                      <TableCell className="capitalize">{l.tone || "Professional"}</TableCell>
                      <TableCell>{new Date(l.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectPastLetter(l)}
                          >
                            Open in Editor
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeletePastLetter(l.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No saved cover letters yet. Generate your first one above!
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
