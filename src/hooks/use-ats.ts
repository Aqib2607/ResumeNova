import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AtsService } from "@/services/endpoints";
import type { AtsAnalysis } from "@/types";

export const ATS_QUERY_KEY = ["ats"] as const;

export function useAtsHistory(page = 1) {
  return useQuery({
    queryKey: [...ATS_QUERY_KEY, "history", page],
    queryFn: async () => {
      const res = await AtsService.history({ page });
      return res;
    },
  });
}

export function useAtsAnalysis(id?: string | number) {
  return useQuery({
    queryKey: [...ATS_QUERY_KEY, "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await AtsService.get(id);
      return ("data" in res && res.data ? res.data : res) as AtsAnalysis;
    },
    enabled: Boolean(id),
  });
}

export function useAnalyzeResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { resume_id: string | number; job_description: string }) => {
      const res = await AtsService.analyze(payload);
      return ("data" in res && res.data ? res.data : res) as AtsAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteAtsAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      return await AtsService.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATS_QUERY_KEY });
    },
  });
}
