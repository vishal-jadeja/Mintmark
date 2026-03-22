import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"

// ── Key factory ───────────────────────────────────────────────────────────────

export const waitlistKeys = {
  count: ["waitlist", "count"] as const,
  stats: (email: string) => ["waitlist", "stats", email] as const,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WaitlistJoinPayload {
  email: string
  name: string | null
  reason: string | null
  website: string // honeypot — always sent, empty for real users
  referred_by?: string
}

export interface WaitlistJoinResponse {
  message: string
  referral_code: string
  position: number | null
  total: number
}

export interface WaitlistStatsResponse {
  position: number | null
  referrals: number
  total: number
}

// ── useWaitlistCount ──────────────────────────────────────────────────────────
// Fetched once per session. All components that show the count share this
// cache — only one network request is made regardless of how many call this.

export function useWaitlistCount() {
  return useQuery({
    queryKey: waitlistKeys.count,
    queryFn: async (): Promise<{ count: number }> => {
      const { data } = await api.get<{ count: number }>("/api/waitlist/count")
      return data
    },
  })
}

// ── useJoinWaitlist ───────────────────────────────────────────────────────────

export function useJoinWaitlist() {
  const queryClient = useQueryClient()

  return useMutation<WaitlistJoinResponse, Error, WaitlistJoinPayload>({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post<WaitlistJoinResponse>(
          "/api/waitlist/join",
          payload
        )
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          const msg =
            err.response?.status === 429
              ? "Too many requests. Please wait a moment and try again."
              : (err.response?.data as { error?: string })?.error ??
                "Something went wrong. Please try again."
          throw new Error(msg)
        }
        throw err
      }
    },
    onSuccess: () => {
      // Invalidate count so the hero number reflects the new signup
      queryClient.invalidateQueries({ queryKey: waitlistKeys.count })
    },
  })
}

// ── useReferralStats ──────────────────────────────────────────────────────────
// Only runs when email is provided (i.e. after a successful join).
// Polling is commented out — manual refresh via the refresh button.

export function useReferralStats(email: string | null) {
  return useQuery({
    queryKey: waitlistKeys.stats(email ?? ""),
    queryFn: async (): Promise<WaitlistStatsResponse> => {
      const { data } = await api.get<WaitlistStatsResponse>(
        `/api/waitlist/referral-stats?email=${encodeURIComponent(email!)}`
      )
      return data
    },
    enabled: !!email,
    // refetchInterval: 1000 * 30, // poll every 30s — uncomment to re-enable
    staleTime: 1000 * 25,
  })
}
