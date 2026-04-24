"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useUpdateOnboarding } from "@/lib/queries/onboarding"
import { useSaveApiKey } from "@/lib/queries/settings"

const PROVIDERS = [
  {
    id: "anthropic" as const,
    label: "Anthropic",
    placeholder: "sk-ant-...",
    hint: "Get your key at console.anthropic.com",
  },
  {
    id: "openai" as const,
    label: "OpenAI",
    placeholder: "sk-...",
    hint: "Get your key at platform.openai.com/api-keys",
  },
  {
    id: "gemini" as const,
    label: "Gemini",
    placeholder: "AIza...",
    hint: "Get your key at aistudio.google.com/apikey",
  },
  {
    id: "groq" as const,
    label: "Groq",
    placeholder: "gsk_...",
    hint: "Get your key at console.groq.com/keys",
  },
] as const

type ProviderId = (typeof PROVIDERS)[number]["id"]

export function ByokKeyStep() {
  const router = useRouter()
  const [activeProvider, setActiveProvider] = useState<ProviderId>("anthropic")
  const [keyValues, setKeyValues] = useState<Partial<Record<ProviderId, string>>>({})
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const saveApiKey = useSaveApiKey()
  const updateOnboarding = useUpdateOnboarding()

  async function completeOnboarding() {
    await updateOnboarding.mutateAsync({ completed: true })
    router.push("/dashboard")
  }

  async function handleSave() {
    const key = keyValues[activeProvider]?.trim()
    if (!key) {
      setError("Please enter an API key.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      await saveApiKey.mutateAsync({ provider: activeProvider, key })
      setSaved(true)
      setTimeout(() => completeOnboarding(), 1000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      setLoading(false)
    }
  }

  async function handleSkip() {
    setError(null)
    setLoading(true)
    try {
      await completeOnboarding()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      setLoading(false)
    }
  }

  const activeProviderMeta = PROVIDERS.find((p) => p.id === activeProvider)!
  const currentKey = keyValues[activeProvider] ?? ""

  const inputStyle: React.CSSProperties = {
    background: "#1c1a18",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e2e1",
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Add your AI API key (optional)
        </h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Mintmark uses your own key to power the AI assistant and content studio.
          You&apos;re never billed through us. Your heatmap and tracking work without it.
        </p>
      </div>

      {/* Provider tabs */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => { setActiveProvider(p.id); setError(null) }}
            disabled={loading}
            className="flex-1 py-2 font-heading text-xs font-semibold transition-colors"
            style={{
              background: activeProvider === p.id ? "rgba(230,195,100,0.12)" : "transparent",
              color: activeProvider === p.id ? "var(--mm-gold-400)" : "var(--muted-foreground)",
              borderRight: p.id !== "groq" ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Key input */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={currentKey}
            onChange={(e) =>
              setKeyValues((prev) => ({ ...prev, [activeProvider]: e.target.value }))
            }
            placeholder={activeProviderMeta.placeholder}
            className="w-full rounded-lg px-3 py-2 pr-10 font-mono text-sm focus:outline-none transition-colors"
            style={inputStyle}
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-foreground"
            style={{ color: "var(--muted-foreground)" }}
            tabIndex={-1}
          >
            {showKey ? (
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current" aria-label="Hide">
                <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" />
                <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current" aria-label="Show">
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        <p className="font-body text-xs" style={{ color: "var(--muted-foreground)" }}>
          {activeProviderMeta.hint} · Your key is encrypted and never leaves our servers in plaintext.
        </p>
      </div>

      {/* Success chip */}
      <AnimatePresence>
        {saved && (
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
            Key saved
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save + Skip */}
      <div className="flex flex-col items-center gap-3 mt-1">
        <button
          onClick={handleSave}
          disabled={!currentKey.trim() || loading}
          className="w-full rounded-lg py-2.5 font-heading text-sm font-bold text-neutral-950 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: "var(--mm-gold-400, #e6c364)",
            boxShadow: "0 0 20px rgba(230,195,100,0.15)",
          }}
        >
          {loading && !saved ? <span className="animate-pulse">Saving…</span> : "Save Key →"}
        </button>

        <button
          onClick={handleSkip}
          disabled={loading}
          className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Skip for now →
        </button>

        {error && (
          <p className="font-body text-sm text-red-400 text-center">{error}</p>
        )}
      </div>
    </div>
  )
}
