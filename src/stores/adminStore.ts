import { create } from "zustand"
import type { WaitlistStatus } from "@/types/database"

type StatusFilter = "all" | WaitlistStatus

interface AdminStore {
  statusFilter: StatusFilter
  page: number
  searchQuery: string
  setStatusFilter: (filter: StatusFilter) => void
  setPage: (page: number) => void
  setSearchQuery: (q: string) => void
  resetFilters: () => void
}

export const useAdminStore = create<AdminStore>()((set) => ({
  statusFilter: "all",
  page: 1,
  searchQuery: "",
  // Changing filter or search always resets to page 1
  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setPage: (page) => set({ page }),
  setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),
  resetFilters: () => set({ statusFilter: "all", page: 1, searchQuery: "" }),
}))
