import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  History,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useAnalyzeResume, useAtsHistory } from "@/hooks/use-ats";
import type { AtsAnalysis } from "@/types";

export const Route = createFileRoute("/dashboard/ats")({
  component: AtsAnalyzerPage,
});

function AtsAnalyzerPage() {
  const { data: resumesData, isLoading: resumesLoading } = useResumes();
  const resumes = useMemo(() => {
    return Array.isArray(resumesData)
      ? resumesData
      : resumesData?.data && Array.isArray(resumesData.data)
        ? resumesData.data
        : [];
  }, [resumesData]);

  const { data: historyData } = useAtsHistory(1);
  const historyItems: AtsAnalysis[] = useMemo(() => {
    return Array.isArray(historyData)
      ? historyData
      : historyData?.data && Array.isArray(historyData.data)
        ? historyData.data
        : [];
  }, [historyData]);

  const analyzeMutation = useAnalyzeResume();

  const [resumeId, setResumeId] = useState<string>("");
  const [jd, setJd] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState<AtsAnalysis | null>(null);

  useEffect(() => {
    if (resumes.length > 0 && !resumeId) {
      setResumeId(String(resumes[0].id));
    }
  }, [resumes, resumeId]);

  const handleAnalyze = async () => {
    if (!resumeId) {
      toast.error("Please select a resume to analyze.");
      return;
    }
    if (!jd.trim() || jd.trim().length < 20) {
      toast.error("Please provide a detailed job description (minimum 20 characters).");
      return;
    }

    try {
      const result = await analyzeMutation.mutateAsync({
        resume_id: resumeId,
        job_description: jd.trim(),
      });
      setCurrentAnalysis(result);
      toast.success("ATS Analysis completed successfully!");
    } catch {
      toast.error("Analysis failed. Please make sure your Groq API key is active.");
    }
  };

  const a = currentAnalysis;

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent Match", style: "bg-success/10 text-success" };
    if (score >= 60) return { label: "Good · Improvable", style: "bg-warning/10 text-warning" };
    return { label: "Needs Improvement", style: "bg-destructive/10 text-destructive" };
  };

  return (
    <div>
      <SEO title="ATS Analyzer" />
      <PageHeader
        title="ATS Resume Analyzer"
        description="Score your resume against job requirements with hybrid keyword & Groq semantic analysis."
      />

      <Tabs defaultValue="analyzer" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analyzer" className="gap-2">
            <Sparkles className="h-4 w-4" /> Live Analyzer
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> Past Reports ({historyItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            {/* INPUT */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="space-y-1.5">
                  <Label>Select Target Resume</Label>
                  <Select
                    value={resumeId}
                    onValueChange={setResumeId}
                    disabled={resumesLoading || resumes.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a resume…" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((r) => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {resumes.length === 0 && !resumesLoading && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No resumes found. Create a resume first in your Resumes tab.
                    </p>
                  )}
                </div>

                <div className="mt-4 space-y-1.5">
                  <Label htmlFor="jd-input">Job Description / Requirements</Label>
                  <Textarea
                    id="jd-input"
                    rows={12}
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste the full job posting, duties, and qualifications here…"
                  />
                </div>

                <Button
                  className="mt-4 w-full"
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending || !resumeId || !jd.trim()}
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing with Groq AI…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" /> Calculate ATS Score
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* RESULTS */}
            <div className="space-y-6">
              {a ? (
                <>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          ATS Match Score
                        </p>
                        <p className="mt-1 text-5xl font-semibold tracking-tight">{a.score}%</p>
                      </div>
                      <Badge className={getScoreStatus(a.score).style}>
                        {getScoreStatus(a.score).label}
                      </Badge>
                    </div>

                    <Progress value={a.score} className="mt-5" />

                    <div className="mt-6 grid grid-cols-3 divide-x divide-border rounded-lg border border-border bg-surface text-center">
                      {[
                        {
                          l: "Matched Skills",
                          v: a.matched_skills?.length ?? 0,
                          tone: "text-success",
                        },
                        {
                          l: "Missing Keywords",
                          v: a.missing_skills?.length ?? 0,
                          tone: "text-destructive",
                        },
                        {
                          l: "Actionable Tips",
                          v: a.recommendations?.length ?? 0,
                          tone: "text-primary",
                        },
                      ].map((s) => (
                        <div key={s.l} className="px-3 py-3">
                          <p className={`text-2xl font-semibold ${s.tone}`}>{s.v}</p>
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {s.l}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {a.keywords && a.keywords.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-5 overflow-hidden">
                      <p className="text-sm font-semibold">Keyword Match Analysis</p>
                      <Table className="mt-3">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Target Keyword</TableHead>
                            <TableHead>In Resume</TableHead>
                            <TableHead>In Job Posting</TableHead>
                            <TableHead className="text-right">Frequency</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {a.keywords.map((k) => (
                            <TableRow key={k.keyword}>
                              <TableCell className="font-medium">{k.keyword}</TableCell>
                              <TableCell>
                                {k.in_resume ? (
                                  <Badge className="bg-success/10 text-success">Yes</Badge>
                                ) : (
                                  <Badge className="bg-destructive/10 text-destructive">No</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{k.in_jd ? "Yes" : "No"}</Badge>
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {k.frequency}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-5">
                      <p className="text-sm font-semibold flex items-center gap-1.5 text-destructive">
                        <AlertCircle className="h-4 w-4" /> Missing Skills / Keywords
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {a.missing_skills && a.missing_skills.length > 0 ? (
                          a.missing_skills.map((s) => (
                            <Badge
                              key={s}
                              className="bg-destructive/10 text-destructive hover:bg-destructive/15"
                            >
                              + {s}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No critical keywords missing.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                      <p className="text-sm font-semibold flex items-center gap-1.5 text-success">
                        <CheckCircle2 className="h-4 w-4" /> Matched Competencies
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {a.matched_skills && a.matched_skills.length > 0 ? (
                          a.matched_skills.map((s) => (
                            <Badge
                              key={s}
                              className="bg-success/10 text-success hover:bg-success/15"
                            >
                              ✓ {s}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            No overlapping skills detected.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {a.recommendations && a.recommendations.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-5">
                      <p className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                        <TrendingUp className="h-4 w-4" /> High-Impact Recommendations
                      </p>
                      <ul className="mt-3 space-y-2">
                        {a.recommendations.map((r, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-sm"
                          >
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card p-12 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary mb-3">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold">Ready for ATS Analysis</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Select a resume from your library, paste the target job description on the left,
                    and click &quot;Calculate ATS Score&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-base font-semibold mb-4">Past ATS Evaluation Reports</h3>
            {historyItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Matched Skills</TableHead>
                    <TableHead>Missing Keywords</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getScoreStatus(item.score).style}>{item.score}%</Badge>
                      </TableCell>
                      <TableCell>{item.matched_skills?.length ?? 0} skills</TableCell>
                      <TableCell>{item.missing_skills?.length ?? 0} missing</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentAnalysis(item);
                            const tab = document.querySelector('[value="analyzer"]') as HTMLElement;
                            tab?.click();
                          }}
                        >
                          View Report <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No past ATS evaluations yet. Run your first analysis above!
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
