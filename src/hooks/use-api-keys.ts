import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiKeysService } from "@/services/endpoints";
import type { ApiKey } from "@/types";

export const API_KEYS_QUERY_KEY = ["api-keys"] as const;

export function useApiKeys() {
  return useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: async () => {
      const res = await ApiKeysService.list();
      return Array.isArray(res) ? res : (res?.data ?? []);
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      provider?: string;
      name: string;
      key: string;
      priority?: number;
    }) => {
      const res = await ApiKeysService.create(payload);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; status?: string; priority?: number; key?: string };
    }) => {
      const res = await ApiKeysService.update(id, payload);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await ApiKeysService.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useTestApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await ApiKeysService.test(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
    },
  });
}

export function useReorderApiKeys() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyIds: number[]) => {
      return await ApiKeysService.reorder(keyIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY });
    },
  });
}
