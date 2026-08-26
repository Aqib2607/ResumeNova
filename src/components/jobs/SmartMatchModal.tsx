import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, ExternalLink, Lightbulb } from "lucide-react";
import { useResumes } from "@/hooks/use-resumes";
import { useSmartMatchMutation } from "@/hooks/use-jobs";
import type { JobMatch } from "@/types";
import { toast } from "sonner";

interface SmartMatchModalProps {
  initialJobPostingId?: number | string;
  trigger?: React.ReactNode;
}

export function SmartMatchModal({ initialJobPostingId, trigger }: SmartMatchModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [matches, setMatches] = useState<JobMatch[] | null>(null);

  const { data: resumesData, isLoading: isLoadingResumes } = useResumes({ per_page: 50 });
  const smartMatchMutation = useSmartMatchMutation();

  const resumes = resumesData?.data || [];

  const handleRunSmartMatch = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume to run the match against.");
      return;
    }

    try {
      const result = await smartMatchMutation.mutateAsync({
        resume_id: selectedResumeId,
        job_posting_id: initialJobPostingId,
      });

      setMatches(result.matches || []);
      toast.success(
        `AI evaluation complete! Analyzed ${result.matches?.length || 0} top matching jobs.`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Smart match evaluation failed.";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Smart Match
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Groq AI Smart Match & Suitability Score
          </DialogTitle>
          <DialogDescription>
            Select one of your resumes. Groq AI will evaluate requirements against your experience,
            generate a match score, and highlight skills gaps and tactical advice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Resume Selector */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Select Profile / Resume to Evaluate
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Select
                value={selectedResumeId}
                onValueChange={setSelectedResumeId}
                disabled={isLoadingResumes || smartMatchMutation.isPending}
              >
                <SelectTrigger className="flex-1 bg-background">
                  <SelectValue placeholder="Choose a resume to analyze..." />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      {r.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleRunSmartMatch}
                disabled={!selectedResumeId || smartMatchMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
              >
                {smartMatchMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with Groq AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze & Rank Jobs
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results Display */}
          {matches && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-base">
                  Top Recommended Matches ({matches.length})
                </h4>
                <span className="text-xs text-muted-foreground">
                  Sorted by compatibility score
                </span>
              </div>

              {matches.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No matching jobs found with score above threshold. Try discovering more live jobs!
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match, index) => {
                    const job = match.job || match.posting;
                    const score = match.match_score ?? match.score ?? 0;
                    const matchedSkills = Array.isArray(match.matched_skills)
                      ? match.matched_skills
                      : [];
                    const missingSkills = Array.isArray(match.missing_skills)
                      ? match.missing_skills
                      : [];
                    const reasoning = match.match_reasoning;
                    const recommendation = match.recommendation;

                    return (
                      <div
                        key={match.id || index}
                        className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4"
                      >
                        {/* Title & Score Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h5 className="font-bold text-base text-foreground">
                              {job?.title || "Job Opportunity"}
                            </h5>
                            <p className="text-xs text-muted-foreground">
                              {job?.company || job?.company_name} • {job?.location || "Remote"}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-28 space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span>Match</span>
                                <span
                                  className={
                                    score >= 80
                                      ? "text-emerald-500"
                                      : score >= 60
                                        ? "text-amber-500"
                                        : "text-muted-foreground"
                                  }
                                >
                                  {score}%
                                </span>
                              </div>
                              <Progress
                                value={score}
                                className="h-2"
                              />
                            </div>

                            {job?.url && (
                              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                                <a href={job.url} target="_blank" rel="noopener noreferrer">
                                  View
                                  <ExternalLink className="ml-1.5 h-3 w-3" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Reasoning Snippet */}
                        {reasoning && (
                          <p className="text-xs text-foreground/80 bg-muted/40 rounded-lg p-3 leading-relaxed">
                            {reasoning}
                          </p>
                        )}

                        {/* Skills Breakdown */}
                        <div className="grid gap-3 sm:grid-cols-2 text-xs">
                          {matchedSkills.length > 0 && (
                            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
                              <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Matching Skills ({matchedSkills.length})</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {matchedSkills.map((s, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"
                                  >
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {missingSkills.length > 0 && (
                            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 space-y-2">
                              <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                                <AlertCircle className="h-3.5 w-3.5" />
                                <span>Missing / Growth Skills ({missingSkills.length})</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {missingSkills.map((s, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px]"
                                  >
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Recommendation */}
                        {recommendation && (
                          <div className="flex items-start gap-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3 text-xs text-indigo-900 dark:text-indigo-200">
                            <Lightbulb className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-semibold">AI Recommendation: </strong>
                              <span>{recommendation}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
