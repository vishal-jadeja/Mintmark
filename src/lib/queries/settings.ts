import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"

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
