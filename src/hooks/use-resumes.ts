import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResumesService } from "@/services/endpoints";
import type { Resume } from "@/types";

export const RESUMES_QUERY_KEY = ["resumes"] as const;

export function useResumes(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: [...RESUMES_QUERY_KEY, params],
    queryFn: () => ResumesService.list(params),
  });
}

export function useResume(id: string | undefined | null) {
  return useQuery({
    queryKey: ["resume", id],
    queryFn: () => (id ? ResumesService.get(id) : null),
    enabled: !!id,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Resume>) => ResumesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Resume> & { create_snapshot?: boolean };
    }) => ResumesService.update(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resume", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["resume-versions", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResumesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDuplicateResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ResumesService.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useResumeVersions(id: string | undefined | null) {
  return useQuery({
    queryKey: ["resume-versions", id],
    queryFn: () => (id ? ResumesService.versions(id) : []),
    enabled: !!id,
  });
}

export function useRestoreResumeVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, versionId }: { id: string; versionId: string | number }) =>
      ResumesService.restoreVersion(id, versionId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resume", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["resume-versions", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
