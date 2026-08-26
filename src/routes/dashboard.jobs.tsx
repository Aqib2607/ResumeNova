import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useJobs,
  useDiscoverJobsMutation,
  useJobMatches,
  useSavedJobs,
  useJobApplications,
  useDismissMatchMutation,
  useDeleteApplicationMutation,
} from "@/hooks/use-jobs";
import { JobCard } from "@/components/jobs/JobCard";
import { SmartMatchModal } from "@/components/jobs/SmartMatchModal";
import { ApplicationTrackerModal } from "@/components/jobs/ApplicationTrackerModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Loader2,
  Sparkles,
  Compass,
  Bookmark,
  Briefcase,
  Building,
  MapPin,
  ExternalLink,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { getJobApplyUrl } from "@/lib/utils";
import { toast } from "sonner";
import type { Job, JobApplication, JobMatch, SavedJob } from "@/types";

export const Route = createFileRoute("/dashboard/jobs")({
  component: JobsPage,
});

function JobsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedApplication, setSelectedApplication] = useState<{
    job: Job | null;
    app: JobApplication | null;
  } | null>(null);

  const [debouncedSearch] = useDebounce(searchTerm, 400);
  const [debouncedLocation] = useDebounce(locationFilter, 400);

  // Queries
  const {
    data: jobsData,
    isLoading: isLoadingJobs,
    isFetching: isFetchingJobs,
  } = useJobs({
    q: debouncedSearch || undefined,
    location: debouncedLocation || undefined,
    work_mode: workModeFilter !== "all" ? workModeFilter : undefined,
    employment_type: employmentTypeFilter !== "all" ? employmentTypeFilter : undefined,
    page,
    per_page: 18,
  });

  const { data: matchesData, isLoading: isLoadingMatches } = useJobMatches();
  const { data: savedData, isLoading: isLoadingSaved } = useSavedJobs();
  const { data: appsData, isLoading: isLoadingApps } = useJobApplications();

  // Mutations
  const discoverMutation = useDiscoverJobsMutation();
  const dismissMatchMutation = useDismissMatchMutation();
  const deleteAppMutation = useDeleteApplicationMutation();

  const jobs = jobsData?.data || [];
  const meta = jobsData?.meta;
  const matches = (matchesData || []) as JobMatch[];
  const savedJobs = (savedData || []) as SavedJob[];
  const applications = (appsData || []) as JobApplication[];

  const handleDiscover = async () => {
    try {
      toast.loading("Scanning internet & public job boards for live openings...", {
        id: "job-discovery",
      });

      const result = await discoverMutation.mutateAsync({
        q: debouncedSearch || undefined,
        location: debouncedLocation || undefined,
      });

      toast.success(`Discovered ${result.new_jobs_count ?? 0} active live job opportunities!`, {
        id: "job-discovery",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Live discovery failed.";
      toast.error(message, { id: "job-discovery" });
    }
  };

  const handleDismissMatch = async (id: number | string) => {
    try {
      await dismissMatchMutation.mutateAsync(id);
      toast.info("Match dismissed.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to dismiss match.";
      toast.error(message);
    }
  };

  const handleDeleteApp = async (id: number | string) => {
    try {
      await deleteAppMutation.mutateAsync(id);
      toast.info("Application tracking removed.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove application.";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              AI Job Discovery & Smart Match
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 text-xs"
            >
              Live Feed
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Search real-time job openings from verified public sources and evaluate match fitness
            using Groq AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDiscover}
            disabled={discoverMutation.isPending}
            className="border-primary/30 hover:bg-primary/5"
          >
            {discoverMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
            ) : (
              <Compass className="mr-2 h-4 w-4 text-primary" />
            )}
            Discover Live Jobs
          </Button>

          <SmartMatchModal />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="all" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Search className="h-3.5 w-3.5" />
            All Jobs
            {meta?.total ? (
              <span className="ml-1 text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-mono">
                {meta.total}
              </span>
            ) : null}
          </TabsTrigger>

          <TabsTrigger value="matches" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            AI Matches
            {matches.length > 0 && (
              <span className="ml-1 text-[10px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-mono font-bold">
                {matches.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="saved" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Bookmark className="h-3.5 w-3.5 text-amber-500" />
            Saved
            {savedJobs.length > 0 && (
              <span className="ml-1 text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-mono">
                {savedJobs.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="applications"
            className="flex items-center gap-1.5 text-xs sm:text-sm"
          >
            <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
            Tracker
            {applications.length > 0 && (
              <span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-mono">
                {applications.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ALL JOBS */}
        <TabsContent value="all" className="space-y-6 mt-6">
          {/* Filters Bar */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border bg-card/60 p-4 shadow-sm backdrop-blur-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="jobs-search-input"
                name="search_query"
                aria-label="Search jobs by title, skills, or keywords"
                placeholder="Title, skills, keywords..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="jobs-location-filter"
                name="location_query"
                aria-label="Filter jobs by location"
                placeholder="Location (e.g. Remote, US, Worldwide)..."
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <div>
              <Select
                value={workModeFilter}
                onValueChange={(val) => {
                  setWorkModeFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger id="jobs-work-mode-select" aria-label="Filter by work mode">
                  <SelectValue placeholder="Work Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Work Modes</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={employmentTypeFilter}
                onValueChange={(val) => {
                  setEmploymentTypeFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger id="jobs-employment-type-select" aria-label="Filter by employment type">
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Job Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract / Freelance</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Job List State */}
          {isLoadingJobs ? (
            <div className="flex h-56 flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading active job listings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-12 text-center">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">No matching jobs found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Try clearing search filters or click <strong>Discover Live Jobs</strong> to fetch
                fresh openings from verified public sources.
              </p>
              <Button
                onClick={handleDiscover}
                disabled={discoverMutation.isPending}
                className="mt-2"
              >
                {discoverMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Discover Now
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>
                  Showing {jobs.length} of {meta?.total || jobs.length} postings
                  {isFetchingJobs && <Loader2 className="ml-2 inline-block h-3 w-3 animate-spin" />}
                </span>
                {meta?.last_page && meta.last_page > 1 && (
                  <span>
                    Page {meta.current_page} of {meta.last_page}
                  </span>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.current_page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {meta.current_page} / {meta.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* TAB 2: AI MATCHES */}
        <TabsContent value="matches" className="space-y-4 mt-6">
          <div className="rounded-xl border bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Your AI Tailored Opportunities
                </h3>
                <p className="text-xs text-muted-foreground">
                  Groq AI evaluates live job requirements against your resume profile, surfacing
                  high-probability matches with actionable advice.
                </p>
              </div>
              <SmartMatchModal
                trigger={
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Run New Match
                  </Button>
                }
              />
            </div>
          </div>

          {isLoadingMatches ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : matches.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center space-y-3">
              <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
              <h4 className="font-semibold text-base">No AI Match records yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Select your resume and run the Smart Match evaluation to find the best job fits.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((match) => {
                const job = match.job || match.posting;
                const score = match.match_score ?? match.score ?? 0;
                const matched = Array.isArray(match.matched_skills) ? match.matched_skills : [];
                const missing = Array.isArray(match.missing_skills) ? match.missing_skills : [];

                return (
                  <div
                    key={match.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm space-y-3 hover:border-indigo-500/40 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge
                            className={`font-semibold text-xs border ${
                              score >= 80
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                                : "border-amber-500/40 bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            <TrendingUp className="mr-1 h-3 w-3" />
                            {score}% Compatibility
                          </Badge>
                          <h4 className="font-bold text-base mt-2 text-foreground">
                            {job?.title || "Job Posting"}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Building className="h-3 w-3" />
                            {job?.company || job?.company_name} • {job?.location || "Remote"}
                          </p>
                        </div>

                        {match.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDismissMatch(match.id!)}
                            title="Dismiss recommendation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>

                      {match.match_reasoning && (
                        <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5 mt-3 leading-relaxed">
                          {match.match_reasoning}
                        </p>
                      )}

                      {/* Skills */}
                      <div className="mt-3 space-y-1.5 text-xs">
                        {matched.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Matched:
                            </span>
                            {matched.slice(0, 5).map((s, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {missing.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Missing:
                            </span>
                            {missing.slice(0, 4).map((s, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {match.created_at ? new Date(match.created_at).toLocaleDateString() : ""}
                      </span>

                      <div className="flex items-center gap-2">
                        {job && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => setSelectedApplication({ job, app: null })}
                          >
                            Track
                          </Button>
                        )}
                        {job && (
                          <Button asChild size="sm" className="h-7 text-xs">
                            <a href={getJobApplyUrl(job)} target="_blank" rel="noopener noreferrer">
                              Apply <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: SAVED JOBS */}
        <TabsContent value="saved" className="space-y-4 mt-6">
          {isLoadingSaved ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : savedJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center space-y-3">
              <Bookmark className="h-8 w-8 text-muted-foreground mx-auto" />
              <h4 className="font-semibold text-base">No saved jobs yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Bookmark job listings from the <strong>All Jobs</strong> feed to keep track of
                opportunities you want to apply to later.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedJobs.map((saved: SavedJob) => {
                const job = saved.job || saved.posting;
                if (!job) return null;
                return <JobCard key={saved.id} job={job} />;
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: APPLICATION TRACKER */}
        <TabsContent value="applications" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base">Application Tracker Pipeline</h3>
              <p className="text-xs text-muted-foreground">
                Monitor and organize your active interview stages and application outcomes.
              </p>
            </div>
          </div>

          {isLoadingApps ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center space-y-3">
              <Briefcase className="h-8 w-8 text-muted-foreground mx-auto" />
              <h4 className="font-semibold text-base">No tracked applications yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Click <strong>Track</strong> on any job card to log your application status,
                interview notes, and timeline.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {applications.map((app: JobApplication) => {
                const job = app.job || app.posting;
                const statusColors: Record<string, string> = {
                  applied: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                  screening:
                    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                  interviewing:
                    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                  offered:
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                  rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                  withdrawn: "bg-muted text-muted-foreground border-border",
                };

                return (
                  <div
                    key={app.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs font-semibold ${statusColors[app.status] || ""}`}
                        >
                          {app.status}
                        </Badge>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteApp(app.id)}
                          title="Delete application"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <h4 className="font-bold text-base text-foreground leading-snug">
                        {job?.title || "Tracked Role"}
                      </h4>

                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5" />
                        {job?.company || job?.company_name || "Company"}
                      </p>

                      {app.applied_at && (
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                          <Calendar className="h-3 w-3" />
                          Applied: {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      )}

                      {app.notes && (
                        <p className="text-xs text-foreground/80 bg-muted/40 rounded-md p-2 mt-2 leading-relaxed">
                          {app.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setSelectedApplication({ job: job || null, app })}
                      >
                        Update Status
                      </Button>

                      {job && (
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                          <a href={getJobApplyUrl(job)} target="_blank" rel="noopener noreferrer">
                            Posting <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Shared Application Modal */}
      {selectedApplication && selectedApplication.job && (
        <ApplicationTrackerModal
          job={selectedApplication.job}
          existingApplication={selectedApplication.app}
          open={!!selectedApplication}
          onOpenChange={(open) => {
            if (!open) setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
}
