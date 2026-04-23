import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"
import type { UnifiedActivityRow } from "@/types/database"

interface DashboardActivityResponse {
  activities: UnifiedActivityRow[]
  streak: { current: number; longest: number }
}

export function useDashboardActivity(days = 365) {
  return useQuery<DashboardActivityResponse>({
    queryKey: ["dashboard-activity", days],
    queryFn: async () => {
      const { data } = await api.get<DashboardActivityResponse>(
        `/api/dashboard/activity?days=${days}`
      )
      return data
    },
  })
}

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
