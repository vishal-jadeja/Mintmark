import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"
import type { WaitlistStatus } from "@/types/database"

// ── Key factory ───────────────────────────────────────────────────────────────

export interface WaitlistFilters {
  statusFilter?: "all" | WaitlistStatus
  page?: number
  limit?: number
  searchQuery?: string
}

export const adminKeys = {
  all: ["admin"] as const,
  waitlist: (filters: WaitlistFilters) =>
    ["admin", "waitlist", filters] as const,
  stats: ["admin", "stats"] as const,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalWaitlist: number
  waitingCount: number
  invitedCount: number
  joinedCount: number
  totalUsers: number
  pendingTokens: number
  expiredTokens: number
  currentInviteCap: number
  referralBonus: number
}

export interface AdminWaitlistEntry {
  id: string
  email: string
  referral_code: string
  referred_by: string | null
  position: number | null
  status: WaitlistStatus
  created_at: string
  referral_count: number
}

export interface WaitlistPage {
  data: AdminWaitlistEntry[]
  total: number
  page: number
  totalPages: number
}

// ── useAdminStats ─────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: adminKeys.stats,
    queryFn: async () => {
      const { data } = await api.get<AdminStats>("/api/admin/stats")
      return data
    },
    staleTime: 1000 * 30,
  })
}

// ── useAdminWaitlist ──────────────────────────────────────────────────────────

export function useAdminWaitlist(filters: WaitlistFilters) {
  return useQuery<WaitlistPage>({
    queryKey: adminKeys.waitlist(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.statusFilter && filters.statusFilter !== "all")
        params.set("status", filters.statusFilter)
      if (filters.page) params.set("page", String(filters.page))
      if (filters.limit) params.set("limit", String(filters.limit))
      if (filters.searchQuery) params.set("search", filters.searchQuery)

      const { data } = await api.get<WaitlistPage>(
        `/api/admin/waitlist?${params}`
      )
      return data
    },
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  })
}

// ── useSendInvite ─────────────────────────────────────────────────────────────

export function useSendInvite() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (email) => {
      try {
        const { data } = await api.post<{ success: boolean }>(
          "/api/admin/send-invite",
          { email }
        )
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to send invite."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.waitlist({}) })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats })
    },
  })
}

// ── useBatchInvite ────────────────────────────────────────────────────────────

export interface BatchInviteResult {
  invited: number
  failed: string[]
}

export function useBatchInvite() {
  const queryClient = useQueryClient()

  return useMutation<BatchInviteResult, Error, { count: number }>({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post<BatchInviteResult>(
          "/api/admin/batch-invite",
          payload
        )
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Batch invite failed."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.waitlist({}) })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats })
    },
  })
}

// ── useUpdateConfig ───────────────────────────────────────────────────────────

export interface ConfigUpdate {
  key: "invite_cap" | "referral_bonus"
  value: number
}

export function useUpdateConfig() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ConfigUpdate>({
    mutationFn: async (payload) => {
      try {
        await api.patch("/api/admin/config", payload)
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to update config."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stats })
    },
  })
}
