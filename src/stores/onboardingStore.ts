import { create } from "zustand"
import type { Platform } from "@/types/database"

interface OnboardingStore {
  currentStep: number
  githubConnected: boolean
  linkedinConnected: boolean
  xConnected: boolean
  mediumConnected: boolean
  activePlatforms: string[]
  byokSkipped: boolean
  setStep: (step: number) => void
  markConnected: (platform: Platform) => void
  setActivePlatforms: (platforms: string[]) => void
  skipByok: () => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  currentStep: 1,
  githubConnected: false,
  linkedinConnected: false,
  xConnected: false,
  mediumConnected: false,
  activePlatforms: [],
  byokSkipped: false,

  setStep: (currentStep) => set({ currentStep }),

  markConnected: (platform) =>
    set(() => {
      const map: Record<Platform, keyof OnboardingStore> = {
        github: "githubConnected",
        linkedin: "linkedinConnected",
        x: "xConnected",
        medium: "mediumConnected",
      }
      return { [map[platform]]: true }
    }),

  setActivePlatforms: (activePlatforms) => set({ activePlatforms }),

  skipByok: () => set({ byokSkipped: true }),

  reset: () =>
    set({
      currentStep: 1,
      githubConnected: false,
      linkedinConnected: false,
      xConnected: false,
      mediumConnected: false,
      activePlatforms: [],
      byokSkipped: false,
    }),
}))
