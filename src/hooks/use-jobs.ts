import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JobsService } from "@/services/endpoints";
import type { JobApplication, SavedJob } from "@/types";

export const jobsKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobsKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...jobsKeys.lists(), { filters }] as const,
  matches: () => [...jobsKeys.all, "matches"] as const,
  saved: () => [...jobsKeys.all, "saved"] as const,
  applications: () => [...jobsKeys.all, "applications"] as const,
};

export function useJobs(params?: {
  q?: string;
  location?: string;
  work_mode?: string;
  employment_type?: string;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: jobsKeys.list(params || {}),
    queryFn: () => JobsService.search(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useDiscoverJobsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params?: { keywords?: string[] | string; q?: string; location?: string }) =>
      JobsService.discover(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    },
  });
}

export function useSmartMatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { resume_id?: string | number; job_posting_id?: string | number }) =>
      JobsService.smartMatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.matches() });
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    },
  });
}

export function useJobMatches() {
  return useQuery({
    queryKey: jobsKeys.matches(),
    queryFn: () => JobsService.getMatches(),
  });
}

export function useDismissMatchMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => JobsService.dismissMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.matches() });
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    },
  });
}

export function useSavedJobs() {
  return useQuery({
    queryKey: jobsKeys.saved(),
    queryFn: () => JobsService.getSavedJobs(),
  });
}

export function useSaveJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { job_posting_id: string | number; notes?: string }) =>
      JobsService.saveJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.saved() });
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    },
  });
}

export function useRemoveSavedJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => JobsService.removeSavedJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.saved() });
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    },
  });
}

export function useJobApplications() {
  return useQuery({
    queryKey: jobsKeys.applications(),
    queryFn: () => JobsService.getApplications(),
  });
}

export function useCreateApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      job_posting_id: string | number;
      resume_id?: string | number | null;
      status?: string;
      applied_at?: string | null;
      notes?: string | null;
    }) => JobsService.createApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.applications() });
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() });
    },
  });
}

export function useUpdateApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<JobApplication> }) =>
      JobsService.updateApplication(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.applications() });
    },
  });
}

export function useDeleteApplicationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => JobsService.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.applications() });
    },
  });
}
