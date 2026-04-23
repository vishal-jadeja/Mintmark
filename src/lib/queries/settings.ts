import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"

// ─── API key hooks ─────────────────────────────────────────────────────────────

interface ApiKeyInfo {
  provider: string
  is_active: boolean
  created_at: string
}

interface SaveApiKeyInput {
  provider: string
  key: string
}

export function useApiKeys() {
  return useQuery<ApiKeyInfo[]>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data } = await api.get<{ keys: ApiKeyInfo[] }>("/api/user/api-keys")
      return data.keys
    },
  })
}

export function useSaveApiKey() {
  const qc = useQueryClient()
  return useMutation<{ success: boolean }, Error, SaveApiKeyInput>({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post<{ success: boolean }>("/api/user/api-key", payload)
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to save API key."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] })
    },
  })
}

export function useDeleteApiKey() {
  const qc = useQueryClient()
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (provider) => {
      try {
        const { data } = await api.delete<{ success: boolean }>(`/api/user/api-key/${provider}`)
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to delete API key."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] })
    },
  })
}

interface UpdateActivePlatformsInput {
  active_platforms: string[]
}

interface UpsertPlatformInstructionInput {
  platform: string
  tone?: string
  instruction_text?: string
  format_rules?: string
}

export function useUpdateActivePlatforms() {
  return useMutation<{ success: boolean }, Error, UpdateActivePlatformsInput>({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.patch<{ success: boolean }>("/api/user/settings", payload)
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to save platforms."
          )
        }
        throw err
      }
    },
  })
}

export function useUpsertPlatformInstruction() {
  return useMutation<{ success: boolean }, Error, UpsertPlatformInstructionInput>({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post<{ success: boolean }>(
          "/api/user/platform-instructions",
          payload
        )
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to save instructions."
          )
        }
        throw err
      }
    },
  })
}
