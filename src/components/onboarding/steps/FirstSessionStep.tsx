"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useOnboardingStore } from "@/stores/onboardingStore"
import { useUpdateOnboarding } from "@/lib/queries/onboarding"
import { useLogSession } from "@/lib/queries/activity"

export function FirstSessionStep() {
  const setStep = useOnboardingStore((s) => s.setStep)

  const [topic, setTopic] = useState("")
  const [durationValue, setDurationValue] = useState("")
  const [durationUnit, setDurationUnit] = useState<"minutes" | "hours">("minutes")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const logSession = useLogSession()
  const updateOnboarding = useUpdateOnboarding()

  async function advanceToStep4() {
    await updateOnboarding.mutateAsync({ step: 4 })
    setStep(4)
  }

  async function handleSubmit() {
    setError(null)
    const trimmedTopic = topic.trim()
    const parsedDuration = parseFloat(durationValue)

    if (!trimmedTopic) {
      setError("Topic is required.")
      return
    }
    if (!durationValue || isNaN(parsedDuration) || parsedDuration <= 0) {
      setError("Duration must be a positive number.")
      return
    }

    const duration_minutes =
      durationUnit === "hours" ? Math.round(parsedDuration * 60) : Math.round(parsedDuration)

    setLoading(true)
    try {
      await logSession.mutateAsync({
        topic: trimmedTopic,
        duration_minutes,
        notes: notes.trim() || undefined,
      })
      setSuccess(true)
      setTimeout(() => advanceToStep4(), 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      setLoading(false)
    }
  }

  async function handleSkip() {
    setError(null)
    setLoading(true)
    try {
      await advanceToStep4()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "#1c1a18",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e2e1",
  }
  const inputClass = "w-full rounded-lg px-3 py-2 font-body text-sm focus:outline-none transition-colors"

  const canSubmit = topic.trim().length > 0 && parseFloat(durationValue) > 0 && !loading

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          What have you been learning lately?
        </h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          This gives the AI context about what you&apos;re working on. It shows up on your calendar right now.
        </p>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={120}
          placeholder="e.g. System design, React Server Components, TypeScript generics"
          className={inputClass}
          style={inputStyle}
          disabled={loading}
        />

        {/* Duration row */}
        <div className="flex gap-2">
          <input
            type="number"
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
            min="1"
            placeholder="45"
            className="w-24 rounded-lg px-3 py-2 font-body text-sm focus:outline-none transition-colors"
            style={inputStyle}
            disabled={loading}
          />
          <select
            value={durationUnit}
            onChange={(e) => setDurationUnit(e.target.value as "minutes" | "hours")}
            className="flex-1 rounded-lg px-3 py-2 font-body text-sm focus:outline-none transition-colors"
            style={inputStyle}
            disabled={loading}
          >
            <option value="minutes">minutes</option>
            <option value="hours">hours</option>
          </select>
        </div>

        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={"Notes (optional) — anything you want to remember about this session?"}
          className={`${inputClass} resize-none`}
          style={inputStyle}
          disabled={loading}
        />
      </div>

      {/* Success chip */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 font-body text-sm"
            style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80" }}
          >
            <svg viewBox="0 0 10 8" className="w-3 h-3 flex-shrink-0" fill="none">
              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Added to your calendar
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit + Skip */}
      <div className="flex flex-col items-center gap-3 mt-1">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-lg py-2.5 font-heading text-sm font-bold text-neutral-950 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: "var(--mm-gold-400, #e6c364)",
            boxShadow: "0 0 20px rgba(230,195,100,0.15)",
          }}
        >
          {loading && !success ? <span className="animate-pulse">Saving…</span> : "Log Session →"}
        </button>

        <button
          onClick={handleSkip}
          disabled={loading}
          className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Skip — I&apos;ll log later
        </button>

        {error && (
          <p className="font-body text-sm text-red-400 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}
