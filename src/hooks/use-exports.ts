import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExportsService } from "@/services/endpoints";

export const EXPORTS_QUERY_KEY = ["exports"] as const;

export function useExports(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: [...EXPORTS_QUERY_KEY, params],
    queryFn: () => ExportsService.list(params),
  });
}

export function useExportResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resumeId,
      format = "pdf",
      template,
    }: {
      resumeId: string | number;
      format?: "pdf" | "docx";
      template?: string;
    }) => {
      const res = await ExportsService.exportResume(resumeId, { format, template });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPORTS_QUERY_KEY });
    },
  });
}

export function useExportCoverLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coverLetterId,
      format = "pdf",
    }: {
      coverLetterId: string | number;
      format?: "pdf" | "docx";
    }) => {
      const res = await ExportsService.exportCoverLetter(coverLetterId, { format });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPORTS_QUERY_KEY });
    },
  });
}

export function useDeleteExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => ExportsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPORTS_QUERY_KEY });
    },
  });
}
