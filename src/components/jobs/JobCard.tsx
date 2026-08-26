import { useState } from "react";
import {
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  ExternalLink,
  Bookmark,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import type { Job, JobMatch } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSaveJobMutation, useRemoveSavedJobMutation } from "@/hooks/use-jobs";
import { ApplicationTrackerModal } from "./ApplicationTrackerModal";
import { toast } from "sonner";

interface JobCardProps {
  job: Job;
  match?: JobMatch | null;
  onViewMatchDetails?: (match: JobMatch) => void;
}

function timeAgo(dateString?: string | null) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";

  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Recently";
}

export function JobCard({ job, match, onViewMatchDetails }: JobCardProps) {
  const [trackModalOpen, setTrackModalOpen] = useState(false);

  const saveMutation = useSaveJobMutation();
  const removeSaveMutation = useRemoveSavedJobMutation();

  const isSaved = Array.isArray(job.saves) && job.saves.length > 0;
  const savedRecord = isSaved ? job.saves![0] : null;

  const matchData = match || (job.matches && job.matches.length > 0 ? job.matches[0] : null);
  const score = matchData?.match_score ?? matchData?.score ?? null;

  const handleToggleSave = async () => {
    try {
      if (isSaved && savedRecord) {
        await removeSaveMutation.mutateAsync(savedRecord.id);
        toast.info("Job removed from saved list.");
      } else {
        await saveMutation.mutateAsync({ job_posting_id: job.id });
        toast.success("Job bookmarked!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update saved job.";
      toast.error(message);
    }
  };

  const applyUrl = job.url || job.links?.[0]?.url || "#";

  return (
    <>
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
        <div>
          {/* Header & Badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {score !== null && (
                  <Badge
                    variant="outline"
                    className={`font-semibold text-xs border ${
                      score >= 80
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                        : score >= 60
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-500"
                          : "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    {score}% Match
                  </Badge>
                )}
                {job.work_mode && (
                  <Badge variant="secondary" className="capitalize text-[11px]">
                    {job.work_mode}
                  </Badge>
                )}
                {job.employment_type && (
                  <Badge variant="outline" className="capitalize text-[11px]">
                    {job.employment_type.replace("-", " ")}
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-base text-foreground leading-snug line-clamp-1 mt-1">
                {job.title}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium text-foreground/80 truncate">
                  {job.company || job.company_name || "Company"}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 shrink-0 ${isSaved ? "text-primary fill-primary" : "text-muted-foreground"}`}
              onClick={handleToggleSave}
              disabled={saveMutation.isPending || removeSaveMutation.isPending}
              title={isSaved ? "Remove from saved" : "Save job"}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
            </Button>
          </div>

          {/* Meta Info */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.location || "Remote"}</span>
            </div>

            {(job.salary_formatted || job.salary) && (
              <div className="flex items-center gap-1 text-foreground/90 font-medium">
                <DollarSign className="h-3.5 w-3.5" />
                <span>{job.salary_formatted || job.salary}</span>
              </div>
            )}
          </div>

          {/* Description snippet */}
          <p className="mt-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {job.description}
          </p>

          {/* Skills Required Chips */}
          {Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {job.skills_required.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
              {job.skills_required.length > 4 && (
                <span className="inline-flex items-center rounded-md bg-muted/40 px-1 py-0.5 text-[10px] text-muted-foreground">
                  +{job.skills_required.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>{timeAgo(job.posted_at)}</span>

          <div className="flex items-center gap-2">
            {matchData && onViewMatchDetails && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary hover:text-primary/90"
                onClick={() => onViewMatchDetails(matchData)}
              >
                Insights
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setTrackModalOpen(true)}
            >
              <ClipboardList className="mr-1 h-3.5 w-3.5" />
              Track
            </Button>

            <Button asChild size="sm" className="h-7 px-2.5 text-xs">
              <a href={applyUrl} target="_blank" rel="noopener noreferrer">
                Apply
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <ApplicationTrackerModal
        job={job}
        open={trackModalOpen}
        onOpenChange={setTrackModalOpen}
      />
    </>
  );
}
