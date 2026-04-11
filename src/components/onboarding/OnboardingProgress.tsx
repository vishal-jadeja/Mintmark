"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check } from "lucide-react"
import { useOnboardingStore } from "@/stores/onboardingStore"

const STEPS = [
  { n: 1, label: "Connect" },
  { n: 2, label: "Platforms" },
  { n: 3, label: "First Session" },
  { n: 4, label: "AI Key" },
]

export function OnboardingProgress() {
  const currentStep = useOnboardingStore((s) => s.currentStep)

  return (
    <div className="w-full px-2 pb-6">
      <div className="flex items-center">
        {STEPS.map(({ n, label }, idx) => {
          const isCompleted = n < currentStep
          const isActive = n === currentStep

          return (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              {/* Dot + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-200"
                  style={{
                    background: isCompleted
                      ? "var(--mm-gold-400)"
                      : isActive
                        ? "transparent"
                        : "rgba(255,255,255,0.06)",
                    border: isActive
                      ? "2px solid var(--mm-gold-400)"
                      : isCompleted
                        ? "none"
                        : "2px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.span
                        key="check"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="w-4 h-4 text-neutral-950" strokeWidth={3} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="number"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-mono text-xs font-bold"
                        style={{
                          color: isActive
                            ? "var(--mm-gold-400)"
                            : "var(--muted-foreground)",
                        }}
                      >
                        {n}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Framer Motion layout fill for completed state */}
                  {isCompleted && (
                    <motion.div
                      layoutId={`step-fill-${n}`}
                      className="absolute inset-0 rounded-full"
                      style={{ background: "var(--mm-gold-400)" }}
                    />
                  )}
                </div>

                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{
                    color:
                      isCompleted || isActive
                        ? "var(--mm-gold-400)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {label}
                </span>
              </div>

              {/* Connector line (not after last step) */}
              {idx < STEPS.length - 1 && (
                <div
                  className="h-px flex-1 mx-2 mb-5 transition-colors duration-200"
                  style={{
                    background:
                      n < currentStep
                        ? "rgba(230,195,100,0.40)"
                        : "rgba(255,255,255,0.08)",
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
