import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronRight, Lightbulb, Save } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { demoInterviewQuestions } from "@/lib/demo-data";
import type { QuestionDifficulty } from "@/types";

export const Route = createFileRoute("/dashboard/interview")({
  component: InterviewPage,
});

const CATEGORIES = ["all", "behavioral", "technical", "system-design", "leadership"] as const;
const DIFFICULTIES: ("all" | QuestionDifficulty)[] = ["all", "easy", "medium", "hard"];

function InterviewPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("all");
  const [diff, setDiff] = useState<"all" | QuestionDifficulty>("all");
  const [activeId, setActiveId] = useState(demoInterviewQuestions[0].id);
  const [answer, setAnswer] = useState(demoInterviewQuestions[0].user_answer ?? "");

  const filtered = useMemo(
    () =>
      demoInterviewQuestions.filter(
        (q) => (cat === "all" || q.category === cat) && (diff === "all" || q.difficulty === diff),
      ),
    [cat, diff],
  );

  const active = demoInterviewQuestions.find((q) => q.id === activeId) ?? demoInterviewQuestions[0];
  const done = demoInterviewQuestions.filter((q) => q.completed).length;
  const total = demoInterviewQuestions.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div>
      <SEO title="Interview Preparation" />
      <PageHeader
        title="Interview Preparation"
        description="Practice answers to role-specific questions, organised by category and difficulty."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Progress</p>
            <p className="text-xs text-muted-foreground">
              {done} / {total} completed
            </p>
          </div>
          <Progress value={pct} className="mt-3" />
        </div>
        <div>
          <Label className="text-xs">Category</Label>
          <Select value={cat} onValueChange={(v) => setCat(v as typeof cat)}>
            <SelectTrigger className="mt-1 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="capitalize">
                  {c === "all" ? "All categories" : c.replace("-", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Difficulty</Label>
          <Select value={diff} onValueChange={(v) => setDiff(v as typeof diff)}>
            <SelectTrigger className="mt-1 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d} className="capitalize">
                  {d === "all" ? "Any difficulty" : d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {filtered.map((q) => (
              <li key={q.id}>
                <button
                  onClick={() => {
                    setActiveId(q.id);
                    setAnswer(q.user_answer ?? "");
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-accent",
                    q.id === active.id && "bg-primary/5",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {q.category.replace("-", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          q.difficulty === "easy" && "border-success/40 text-success",
                          q.difficulty === "medium" && "border-warning/40 text-warning",
                          q.difficulty === "hard" && "border-destructive/40 text-destructive",
                        )}
                      >
                        {q.difficulty}
                      </Badge>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm font-medium">{q.question}</p>
                  </div>
                  {q.completed ? (
                    <Check className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {active.category.replace("-", " ")}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {active.difficulty}
            </Badge>
          </div>
          <h2 className="text-lg font-semibold">{active.question}</h2>
          {active.hints && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
              <p className="flex items-center gap-2 font-semibold text-warning">
                <Lightbulb className="h-4 w-4" /> Hints
              </p>
              <ul className="mt-1.5 list-disc pl-5 text-foreground/80">
                {active.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Your answer</Label>
            <Textarea
              rows={12}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Use the STAR framework — situation, task, action, result."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Skip</Button>
            <Button>
              <Save className="h-4 w-4" /> Save & next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
