"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useOnboardingStore } from "@/stores/onboardingStore"
import { useUpdateOnboarding } from "@/lib/queries/onboarding"
import { OnboardingProgress } from "./OnboardingProgress"
import { PlatformConnectionsStep } from "./steps/PlatformConnectionsStep"
import { ActivePlatformsStep } from "./steps/ActivePlatformsStep"
import { FirstSessionStep } from "./steps/FirstSessionStep"
import { ByokKeyStep } from "./steps/ByokKeyStep"

// Same glass style as login/page.tsx
const glassStyle: React.CSSProperties = {
  background: "rgba(32, 31, 31, 0.65)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  borderRadius: "10px",
  borderTop: "1px solid rgba(230, 195, 100, 0.22)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(230,195,100,0.10) inset, 0 0 60px rgba(230,195,100,0.05)",
}

const STEPS: Record<number, React.ReactNode> = {
  1: <PlatformConnectionsStep />,
  2: <ActivePlatformsStep />,
  3: <FirstSessionStep />,
  4: <ByokKeyStep />,
}

interface OnboardingWizardProps {
  initialStep: number
}

export function OnboardingWizard({ initialStep }: OnboardingWizardProps) {
  const router = useRouter()
  const currentStep = useOnboardingStore((s) => s.currentStep)
  const setStep = useOnboardingStore((s) => s.setStep)
  const { mutate, isPending } = useUpdateOnboarding()
  const [error, setError] = useState<string | null>(null)

  // Sync store with the server-provided step on mount
  useEffect(() => {
    setStep(initialStep)
  }, [initialStep, setStep])

  // Avoid hydration flash: show initialStep until the effect fires and syncs the store
  const displayStep = currentStep < initialStep ? initialStep : currentStep

  function handleContinue() {
    const nextStep = displayStep + 1
    setError(null)
    mutate(
      { step: nextStep },
      {
        onSuccess: () => setStep(nextStep),
        onError: (err) => setError(err.message),
      }
    )
  }

  function handleComplete() {
    setError(null)
    mutate(
      { completed: true },
      {
        onSuccess: () => router.push("/dashboard"),
        onError: (err) => setError(err.message),
      }
    )
  }

  const isLastStep = displayStep === 4

  return (
    <div style={glassStyle} className="w-full max-w-lg p-8">
      <OnboardingProgress />

      <AnimatePresence mode="wait">
        <motion.div
          key={displayStep}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {STEPS[displayStep]}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          onClick={isLastStep ? handleComplete : handleContinue}
          disabled={isPending}
          className="w-full rounded-lg py-2.5 font-heading text-sm font-bold text-neutral-950 transition-opacity disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: "var(--mm-gold-400, #e6c364)",
            boxShadow: "0 0 20px rgba(230,195,100,0.15)",
          }}
        >
          {isPending ? (
            <span className="animate-pulse">Saving…</span>
          ) : isLastStep ? (
            "Finish setup"
          ) : (
            "Continue →"
          )}
        </button>

        {isLastStep && (
          <button
            onClick={handleComplete}
            disabled={isPending}
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            Skip for now →
          </button>
        )}

        {error && (
          <p className="font-body text-sm text-red-400 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}
