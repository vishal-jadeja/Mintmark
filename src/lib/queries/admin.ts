/**
 * Admin query hooks — stubs ready for Step 7 (admin dashboard).
 *
 * These are intentionally minimal. Flesh them out when building
 * src/app/admin/page.tsx and the /api/admin/* routes.
 */

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
  total: number
  verified: number
  invited: number
  joined: number
  capacity: number
}

export interface AdminWaitlistEntry {
  id: string
  email: string
  name: string | null
  position: number | null
  referral_count: number
  status: WaitlistStatus
  email_verified: boolean
  created_at: string
}

// ── useAdminStats ─────────────────────────────────────────────────────────────
// TODO (Step 7): implement GET /api/admin/stats route

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: adminKeys.stats,
    queryFn: async () => {
      const { data } = await api.get<AdminStats>("/api/admin/stats")
      return data
    },
    staleTime: 1000 * 60,
  })
}

// ── useAdminWaitlist ──────────────────────────────────────────────────────────
// TODO (Step 7): implement GET /api/admin/waitlist route

export function useAdminWaitlist(filters: WaitlistFilters) {
  return useQuery<{ rows: AdminWaitlistEntry[]; total: number }>({
    queryKey: adminKeys.waitlist(filters),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.statusFilter && filters.statusFilter !== "all")
        params.set("status", filters.statusFilter)
      if (filters.page) params.set("page", String(filters.page))
      if (filters.searchQuery) params.set("q", filters.searchQuery)

      const { data } = await api.get<{ rows: AdminWaitlistEntry[]; total: number }>(
        `/api/admin/waitlist?${params}`
      )
      return data
    },
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
  })
}

// ── useSendInvite ─────────────────────────────────────────────────────────────
// TODO (Step 7): implement POST /api/admin/send-invite route

export function useSendInvite() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; expiresAt: string; slotsRemaining: number },
    Error,
    string
  >({
    mutationFn: async (email) => {
      try {
        const { data } = await api.post<{
          success: boolean
          expiresAt: string
          slotsRemaining: number
        }>("/api/admin/send-invite", { email })
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Failed to send invite"
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
// TODO (Step 7): implement POST /api/admin/batch-invite route

export function useBatchInvite() {
  const queryClient = useQueryClient()

  return useMutation<
    { sent: number; failed: number; emails: string[] },
    Error,
    { count: number; strategy: "position" | "referrals" }
  >({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.post<{
          sent: number
          failed: number
          emails: string[]
        }>("/api/admin/batch-invite", payload)
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ?? "Batch invite failed"
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

// ── useUpdateCapacity ─────────────────────────────────────────────────────────
// Updates the early_access_limit key in the system_config table.
// TODO (Step 7): implement PATCH /api/admin/config route

export function useUpdateCapacity() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: async (limit) => {
      try {
        await api.patch("/api/admin/config", {
          key: "early_access_limit",
          value: String(limit),
        })
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error("Failed to update capacity")
        }
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.stats })
    },
  })
}
