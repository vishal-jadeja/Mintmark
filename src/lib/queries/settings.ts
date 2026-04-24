import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"

// ─── User settings ────────────────────────────────────────────────────────────

interface UserSettings {
  active_platforms: string[]
  timezone: string | null
  theme: string | null
  onboarding_completed: boolean
}

export function useUserSettings() {
  return useQuery<UserSettings>({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const { data } = await api.get<{ settings: UserSettings }>("/api/user/settings")
      return data.settings
    },
  })
}

export interface PlatformInstruction {
  platform: string
  instruction_text: string | null
  tone: string | null
  format_rules: string | null
}

export function usePlatformInstructions() {
  return useQuery<PlatformInstruction[]>({
    queryKey: ["platform-instructions"],
    queryFn: async () => {
      const { data } = await api.get<{ instructions: PlatformInstruction[] }>(
        "/api/user/platform-instructions"
      )
      return data.instructions
    },
  })
}

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
  const qc = useQueryClient()
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-settings"] })
    },
  })
}

export function useUpsertPlatformInstruction() {
  const qc = useQueryClient()
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-instructions"] })
    },
  })
}
