import { create } from "zustand"
import type { WaitlistStatus } from "@/types/database"

type StatusFilter = "all" | WaitlistStatus

interface AdminStore {
  // Table filter state
  selectedTab: StatusFilter
  searchQuery: string
  currentPage: number

  // Setters
  setSelectedTab: (tab: StatusFilter) => void
  setSearchQuery: (q: string) => void
  setCurrentPage: (page: number) => void
  resetFilters: () => void
}

export const useAdminStore = create<AdminStore>()((set) => ({
  selectedTab: "all",
  searchQuery: "",
  currentPage: 1,

  // Changing filter or search always resets to page 1
  setSelectedTab: (selectedTab) => set({ selectedTab, currentPage: 1 }),
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  resetFilters: () => set({ selectedTab: "all", searchQuery: "", currentPage: 1 }),
}))
