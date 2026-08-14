import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InterviewsService } from "@/services/endpoints";
import type { InterviewSession } from "@/types";

export const INTERVIEWS_QUERY_KEY = ["interviews"] as const;

export function useInterviews(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: [...INTERVIEWS_QUERY_KEY, params],
    queryFn: () => InterviewsService.list(params),
  });
}

export function useInterview(id: string | number | undefined | null) {
  return useQuery({
    queryKey: ["interview", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await InterviewsService.get(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      resume_id?: string | number | null;
      category?: string;
      difficulty?: string;
      language?: string;
      job_description?: string;
      total_questions?: number;
    }) => {
      const res = await InterviewsService.create(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTERVIEWS_QUERY_KEY });
    },
  });
}

export function useDeleteInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => InterviewsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INTERVIEWS_QUERY_KEY });
    },
  });
}

export function useAnswerQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      questionId,
      answer,
    }: {
      sessionId: string | number;
      questionId: string | number;
      answer: string;
    }) => {
      return await InterviewsService.answerQuestion(sessionId, questionId, answer);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["interview", variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: INTERVIEWS_QUERY_KEY });
    },
  });
}

export function useGenerateMoreQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string | number) => {
      return await InterviewsService.generateQuestions(sessionId);
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["interview", sessionId] });
    },
  });
}
