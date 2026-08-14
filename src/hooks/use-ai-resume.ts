import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AIResumeService } from "@/services/endpoints";
import { RESUMES_QUERY_KEY } from "./use-resumes";

export function useGenerateSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload?: {
        language?: string;
        target_role?: string;
        current_summary?: string;
        persist?: boolean;
      };
    }) => {
      return await AIResumeService.summary(id, payload);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...RESUMES_QUERY_KEY, id] });
    },
  });
}

export function useImproveExperience() {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        role?: string;
        company?: string;
        bullets: string[] | string;
        language?: string;
        job_description?: string;
      };
    }) => {
      return await AIResumeService.experience(id, payload);
    },
  });
}

export function useImproveProject() {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        name: string;
        description?: string;
        technologies?: string[];
        language?: string;
      };
    }) => {
      return await AIResumeService.project(id, payload);
    },
  });
}

export function useSuggestSkills() {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload?: {
        language?: string;
        job_description?: string;
      };
    }) => {
      return await AIResumeService.skills(id, payload);
    },
  });
}
