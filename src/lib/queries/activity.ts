import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"

interface LogSessionInput {
  topic: string
  duration_minutes: number
  notes?: string
}

export function useLogSession() {
  const qc = useQueryClient()
  return useMutation<{ success: boolean; activityId: string }, Error, LogSessionInput>({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post<{ success: boolean; activityId: string }>(
          "/api/activity/session",
          payload
        )
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to log session."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-activity"] })
    },
  })
}
