import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Check,
  ChevronRight,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Award,
  History,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useResumes } from "@/hooks/use-resumes";
import {
  useInterviews,
  useInterview,
  useCreateInterview,
  useDeleteInterview,
  useAnswerQuestion,
  useGenerateMoreQuestions,
} from "@/hooks/use-interviews";
import type { InterviewQuestion, InterviewSession } from "@/types";

export const Route = createFileRoute("/dashboard/interview")({
  component: InterviewPage,
});

const CATEGORIES = [
  { v: "all", l: "All Categories" },
  { v: "technical", l: "Technical & Coding" },
  { v: "behavioral", l: "Behavioral & STAR" },
  { v: "system-design", l: "System Design & Architecture" },
  { v: "leadership", l: "Leadership & Management" },
  { v: "hr", l: "HR & Culture Fit" },
];

const DIFFICULTIES = [
  { v: "all", l: "Any Difficulty" },
  { v: "easy", l: "Easy" },
  { v: "medium", l: "Medium" },
  { v: "hard", l: "Hard" },
];

const LANGUAGES = [
  { v: "en", l: "English" },
  { v: "bn", l: "বাংলা (Bangla)" },
  { v: "es", l: "Spanish" },
  { v: "fr", l: "French" },
];

function InterviewPage() {
  const [activeTab, setActiveTab] = useState<"practice" | "history">("practice");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Resume Data
  const { data: resumesData } = useResumes();
  const resumes = useMemo(() => {
    return Array.isArray(resumesData)
      ? resumesData
      : resumesData?.data && Array.isArray(resumesData.data)
        ? resumesData.data
        : [];
  }, [resumesData]);

  // Session List
  const { data: sessionsData, isLoading: sessionsLoading } = useInterviews();
  const sessions = useMemo(() => {
    return Array.isArray(sessionsData)
      ? sessionsData
      : sessionsData?.data && Array.isArray(sessionsData.data)
        ? sessionsData.data
        : [];
  }, [sessionsData]);

  // Active Session State
  const [selectedSessionId, setSelectedSessionId] = useState<string | number | null>(null);

  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  const { data: activeSession, isLoading: sessionLoading } = useInterview(selectedSessionId);

  // Filter & Question Stepper State
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [activeQuestionId, setActiveQuestionId] = useState<string | number | null>(null);
  const [userAnswer, setUserAnswer] = useState("");

  const questions: InterviewQuestion[] = useMemo(
    () => activeSession?.questions ?? [],
    [activeSession?.questions],
  );

  useEffect(() => {
    if (questions.length > 0) {
      const firstUnanswered = questions.find((q) => !q.user_answer) || questions[0];
      setActiveQuestionId(firstUnanswered.id);
      setUserAnswer(firstUnanswered.user_answer ?? "");
    } else {
      setActiveQuestionId(null);
      setUserAnswer("");
    }
  }, [activeSession?.id, questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchCat = categoryFilter === "all" || q.category === categoryFilter;
      const matchDiff = difficultyFilter === "all" || q.difficulty === difficultyFilter;
      return matchCat && matchDiff;
    });
  }, [questions, categoryFilter, difficultyFilter]);

  const activeQuestion = useMemo(() => {
    return questions.find((q) => q.id === activeQuestionId) ?? filteredQuestions[0] ?? null;
  }, [questions, activeQuestionId, filteredQuestions]);

  // Mutations
  const createMutation = useCreateInterview();
  const answerMutation = useAnswerQuestion();
  const deleteMutation = useDeleteInterview();
  const generateMoreMutation = useGenerateMoreQuestions();

  // New Session Form State
  const [newResumeId, setNewResumeId] = useState<string>("");
  const [newCategory, setNewCategory] = useState("technical");
  const [newDifficulty, setNewDifficulty] = useState("medium");
  const [newLanguage, setNewLanguage] = useState("en");
  const [newJd, setNewJd] = useState("");
  const [newTotal, setNewTotal] = useState(5);

  useEffect(() => {
    if (resumes.length > 0 && !newResumeId) {
      setNewResumeId(String(resumes[0].id));
    }
  }, [resumes, newResumeId]);

  const handleCreateSession = async () => {
    try {
      const session = await createMutation.mutateAsync({
        resume_id: newResumeId ? Number(newResumeId) : null,
        category: newCategory,
        difficulty: newDifficulty,
        language: newLanguage,
        job_description: newJd.trim() || undefined,
        total_questions: newTotal,
      });

      toast.success("AI Interview Session created with tailored questions!");
      setIsNewModalOpen(false);
      setSelectedSessionId(session.id);
    } catch {
      toast.error("Failed to create interview session. Ensure your Groq API key is active.");
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedSessionId || !activeQuestion || !userAnswer.trim()) {
      toast.error("Please provide an answer before submitting.");
      return;
    }

    try {
      await answerMutation.mutateAsync({
        sessionId: selectedSessionId,
        questionId: activeQuestion.id,
        answer: userAnswer.trim(),
      });
      toast.success("Answer evaluated by AI!");
    } catch {
      toast.error("Failed to evaluate answer.");
    }
  };

  const handleDeleteSession = async (id: string | number) => {
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedSessionId === id) {
        setSelectedSessionId(null);
      }
      toast.success("Session deleted.");
    } catch {
      toast.error("Failed to delete session.");
    }
  };

  const handleGenerateMore = async () => {
    if (!selectedSessionId) return;
    try {
      await generateMoreMutation.mutateAsync(selectedSessionId);
      toast.success("More questions generated!");
    } catch {
      toast.error("Failed to generate more questions.");
    }
  };

  const completedCount = activeSession?.completed_questions ?? 0;
  const totalCount = activeSession?.total_questions ?? (questions.length || 1);
  const progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));

  return (
    <div className="space-y-6">
      <SEO title="AI Interview Preparation" />
      <PageHeader
        title="AI Interview Preparation"
        description="Practice role-tailored questions generated from your resume and target job descriptions with instant AI answer evaluations."
        actions={
          <Button onClick={() => setIsNewModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Start New Session
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "practice" | "history")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="practice" className="gap-2">
            <Sparkles className="h-4 w-4" /> Active Practice
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> Past Sessions ({sessions.length})
          </TabsTrigger>
        </TabsList>

        {/* ── PRACTICE TAB ── */}
        <TabsContent value="practice" className="space-y-6 pt-4">
          {sessionsLoading || sessionLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm">Loading interview session...</p>
            </div>
          ) : !activeSession ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
              <Sparkles className="h-10 w-10 text-primary/40" />
              <h3 className="mt-3 text-lg font-semibold">No Active Interview Session</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Generate tailored interview questions based on your resume experience and job
                requirements.
              </p>
              <Button onClick={() => setIsNewModalOpen(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" /> Create First Session
              </Button>
            </div>
          ) : (
            <>
              {/* Progress and Top Filters */}
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1.2fr)_auto_auto]">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Session Progress ({activeSession.category} • {activeSession.difficulty})
                      </p>
                      <p className="text-sm font-medium">
                        {activeSession.resume_title
                          ? `Based on: ${activeSession.resume_title}`
                          : "General Role Prep"}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {completedCount} / {totalCount} completed ({progressPercent}%)
                    </span>
                  </div>
                  <Progress value={progressPercent} className="mt-3" />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Category Filter</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="mt-1 w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.v} value={c.v}>
                          {c.l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Difficulty</Label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="mt-1 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d.v} value={d.v}>
                          {d.l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Main Questions Grid */}
              <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
                {/* Questions List Sidebar */}
                <div className="space-y-3">
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Questions ({filteredQuestions.length})</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={handleGenerateMore}
                        disabled={generateMoreMutation.isPending}
                      >
                        {generateMoreMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" /> Add More
                          </>
                        )}
                      </Button>
                    </div>
                    <ul className="divide-y divide-border max-h-[600px] overflow-y-auto">
                      {filteredQuestions.map((q, idx) => (
                        <li key={q.id}>
                          <button
                            onClick={() => {
                              setActiveQuestionId(q.id);
                              setUserAnswer(q.user_answer ?? "");
                            }}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-accent",
                              q.id === activeQuestion?.id &&
                                "bg-primary/10 border-l-4 border-primary",
                            )}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-muted-foreground">
                                  #{idx + 1}
                                </span>
                                <Badge variant="secondary" className="text-[10px] capitalize">
                                  {q.category}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] capitalize",
                                    q.difficulty === "easy" && "border-success/40 text-success",
                                    q.difficulty === "medium" && "border-warning/40 text-warning",
                                    q.difficulty === "hard" &&
                                      "border-destructive/40 text-destructive",
                                  )}
                                >
                                  {q.difficulty}
                                </Badge>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs font-medium text-foreground">
                                {q.question}
                              </p>
                            </div>
                            {q.user_answer ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Question Detail & Answer Area */}
                {activeQuestion ? (
                  <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {activeQuestion.category}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {activeQuestion.difficulty}
                        </Badge>
                      </div>
                      {activeQuestion.score !== null && activeQuestion.score !== undefined && (
                        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                          <Award className="h-4 w-4" /> Score: {activeQuestion.score}/100
                        </div>
                      )}
                    </div>

                    <h2 className="text-lg font-semibold text-foreground leading-snug">
                      {activeQuestion.question}
                    </h2>

                    {/* Hints Box */}
                    {activeQuestion.hints && activeQuestion.hints.length > 0 && (
                      <div className="rounded-lg border border-warning/30 bg-warning/5 p-3.5 text-sm">
                        <p className="flex items-center gap-2 font-semibold text-warning">
                          <Lightbulb className="h-4 w-4" /> Answering Strategy & Hints
                        </p>
                        <ul className="mt-2 list-disc pl-5 space-y-1 text-foreground/80 text-xs sm:text-sm">
                          {activeQuestion.hints.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* User Answer Textarea */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold">Your Answer</Label>
                      <Textarea
                        rows={8}
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Write your comprehensive answer here (use the STAR method: Situation, Task, Action, Result)..."
                        className="resize-y text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        onClick={handleAnswerSubmit}
                        disabled={answerMutation.isPending || !userAnswer.trim()}
                        className="gap-2"
                      >
                        {answerMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Evaluating with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" /> Submit & Get AI Evaluation
                          </>
                        )}
                      </Button>
                    </div>

                    {/* AI Evaluation Box */}
                    {activeQuestion.evaluation && (
                      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                          <span className="font-semibold text-primary flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4" /> AI Evaluation Feedback
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            Evaluated against industry standards
                          </span>
                        </div>

                        {activeQuestion.evaluation.feedback && (
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {activeQuestion.evaluation.feedback}
                          </p>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2 pt-2">
                          {activeQuestion.evaluation.strengths && (
                            <div className="rounded-lg bg-card/60 p-3 border border-success/20">
                              <span className="text-xs font-bold text-success flex items-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Key Strengths
                              </span>
                              <ul className="mt-1.5 list-disc pl-4 text-xs text-foreground/80 space-y-1">
                                {activeQuestion.evaluation.strengths.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {activeQuestion.evaluation.improvements && (
                            <div className="rounded-lg bg-card/60 p-3 border border-warning/20">
                              <span className="text-xs font-bold text-warning flex items-center gap-1">
                                <AlertCircle className="h-3.5 w-3.5" /> Areas for Improvement
                              </span>
                              <ul className="mt-1.5 list-disc pl-4 text-xs text-foreground/80 space-y-1">
                                {activeQuestion.evaluation.improvements.map((im, i) => (
                                  <li key={i}>{im}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm font-medium">
                      Select a question from the left to practice.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── HISTORY TAB ── */}
        <TabsContent value="history" className="pt-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {sessions.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <History className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="mt-2 text-sm">No past interview sessions found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {sessions.map((sess: InterviewSession) => (
                  <li
                    key={sess.id}
                    className="flex items-center justify-between p-4 hover:bg-accent/40 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {sess.category}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {sess.difficulty}
                        </Badge>
                        <Badge variant="outline" className="uppercase text-[10px]">
                          {sess.language}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sess.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {sess.resume_title
                          ? `Resume: ${sess.resume_title}`
                          : "Custom Role Practice"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sess.completed_questions} / {sess.total_questions} questions answered
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSessionId(sess.id);
                          setActiveTab("practice");
                        }}
                      >
                        Resume Session
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteSession(sess.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── CREATE NEW SESSION MODAL ── */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Start AI Interview Session</DialogTitle>
            <DialogDescription>
              Configure the category, difficulty, and background context for your AI mock interview.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Source Resume (Optional)</Label>
              <Select value={newResumeId} onValueChange={setNewResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resume for context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Resume (General Prep)</SelectItem>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Interview Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.v !== "all").map((c) => (
                      <SelectItem key={c.v} value={c.v}>
                        {c.l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Difficulty Level</Label>
                <Select value={newDifficulty} onValueChange={setNewDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.filter((d) => d.v !== "all").map((d) => (
                      <SelectItem key={d.v} value={d.v}>
                        {d.l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select value={newLanguage} onValueChange={setNewLanguage}>
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
                <Label>Number of Questions</Label>
                <Select value={String(newTotal)} onValueChange={(v) => setNewTotal(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="8">8 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Target Job Description (Optional)</Label>
              <Textarea
                rows={3}
                value={newJd}
                onChange={(e) => setNewJd(e.target.value)}
                placeholder="Paste the target job description or requirements to tailor the questions precisely..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={createMutation.isPending}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Start Interview Prep
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
