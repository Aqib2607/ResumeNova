import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CoverLetterService } from "@/services/endpoints";
import type { CoverLetter } from "@/types";

export const COVER_LETTERS_QUERY_KEY = ["cover-letters"] as const;

export function useCoverLetters(page = 1) {
  return useQuery({
    queryKey: [...COVER_LETTERS_QUERY_KEY, "list", page],
    queryFn: async () => {
      const res = await CoverLetterService.list({ page });
      return res;
    },
  });
}

export function useCoverLetter(id?: string | number) {
  return useQuery({
    queryKey: [...COVER_LETTERS_QUERY_KEY, "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await CoverLetterService.get(id);
      return ("data" in res && res.data ? res.data : res) as CoverLetter;
    },
    enabled: Boolean(id),
  });
}

export function useGenerateCoverLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      resume_id?: string | number;
      language?: string;
      tone?: string;
      company_name?: string;
      job_description: string;
      title?: string;
    }) => {
      const res = await CoverLetterService.generate(payload);
      return ("data" in res && res.data ? res.data : res) as CoverLetter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COVER_LETTERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateCoverLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string | number;
      payload: { title?: string; content?: string };
    }) => {
      const res = await CoverLetterService.update(id, payload);
      return ("data" in res && res.data ? res.data : res) as CoverLetter;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: COVER_LETTERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...COVER_LETTERS_QUERY_KEY, "detail", id] });
    },
  });
}

export function useDeleteCoverLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      return await CoverLetterService.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COVER_LETTERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
