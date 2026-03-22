import { create } from "zustand"

interface UIStore {
  commandPaletteOpen: boolean
  sidebarCollapsed: boolean
  waitlistJoined: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
  toggleSidebar: () => void
  setWaitlistJoined: (joined: boolean) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  commandPaletteOpen: false,
  sidebarCollapsed: false,
  waitlistJoined: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setWaitlistJoined: (joined) => set({ waitlistJoined: joined }),
}))
