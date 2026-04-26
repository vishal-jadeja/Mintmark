"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ShieldCheck } from "lucide-react"
import { useApiKeys, useSaveApiKey, useDeleteApiKey } from "@/lib/queries/settings"

// ─── Provider logos ───────────────────────────────────────────────────────────

function AnthropicLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.83 3H10.17L4 21h3.45l1.42-4.35h5.26L15.55 21H19L13.83 3zM9.1 13.8l2.4-6.64 2.4 6.64H9.1z" />
    </svg>
  )
}

function OpenAILogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22.28 9.52a5.5 5.5 0 0 0-.46-4.43 5.57 5.57 0 0 0-5.97-2.67A5.54 5.54 0 0 0 11.7 1a5.57 5.57 0 0 0-5.3 3.86 5.54 5.54 0 0 0-3.68 2.67 5.57 5.57 0 0 0 .68 6.49 5.5 5.5 0 0 0 .46 4.43 5.57 5.57 0 0 0 5.97 2.67A5.54 5.54 0 0 0 13.97 23a5.57 5.57 0 0 0 5.3-3.87 5.54 5.54 0 0 0 3.67-2.66 5.57 5.57 0 0 0-.66-6.95zM13.97 21.5a4.12 4.12 0 0 1-2.64-.95l.13-.07 4.37-2.53a.73.73 0 0 0 .36-.63V11.1l1.85 1.07a.065.065 0 0 1 .04.05V17a4.12 4.12 0 0 1-4.11 4.5zM4.38 18.1a4.12 4.12 0 0 1-.49-2.75l.13.08 4.37 2.53a.73.73 0 0 0 .73 0l5.34-3.09v2.14a.065.065 0 0 1-.03.06L9.4 19.6a4.12 4.12 0 0 1-5.02-1.5zm-1.34-9.57A4.12 4.12 0 0 1 5.16 6.4v5.17a.73.73 0 0 0 .36.63l5.34 3.09-1.85 1.07a.065.065 0 0 1-.07 0L4.88 13.8a4.12 4.12 0 0 1-1.84-5.27zm15.2 3.53-5.34-3.09 1.85-1.07a.065.065 0 0 1 .07 0l5.01 2.9a4.12 4.12 0 0 1-.63 7.42v-5.17a.73.73 0 0 0-.36-.63zm1.84-2.77-.13-.08-4.37-2.53a.73.73 0 0 0-.73 0l-5.34 3.09V7.63a.065.065 0 0 1 .03-.06l5.01-2.9a4.12 4.12 0 0 1 6.13 4.26zm-11.55 3.8-1.85-1.07a.065.065 0 0 1-.04-.05V6.86A4.12 4.12 0 0 1 13.38 3.3l-.13.07-4.37 2.53a.73.73 0 0 0-.36.63v6.17zm.99-2.16L12 9.85l2.49 1.44V13.7L12 15.15 9.51 13.7V11.93z" />
    </svg>
  )
}

function GeminiLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C11.78 5.62 10.18 8.94 8 11.12 5.82 13.3 2 12 2 12s3.82 1.3 6 3.47C10.18 17.65 11.78 20.96 12 24.59c.22-3.63 1.82-6.94 4-9.12C18.18 13.3 22 12 22 12s-3.82 1.3-6-0.88C13.82 8.94 12.22 5.62 12 2z" />
    </svg>
  )
}

function GroqLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 1 0 5.66 18.24V14.5H12v-2h7.66v6.97A12 12 0 1 1 24 12h-2a10 10 0 0 0-10-10z" />
    </svg>
  )
}

// ─── Provider config ──────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    id: "anthropic" as const,
    label: "Anthropic",
    Logo: AnthropicLogo,
    placeholder: "sk-ant-...",
    hint: "console.anthropic.com",
    color: "#D97757",
    bgColor: "rgba(217,119,87,0.12)",
    borderColor: "rgba(217,119,87,0.25)",
    connectedBorder: "rgba(217,119,87,0.3)",
  },
  {
    id: "openai" as const,
    label: "OpenAI",
    Logo: OpenAILogo,
    placeholder: "sk-...",
    hint: "platform.openai.com/api-keys",
    color: "#10A37F",
    bgColor: "rgba(16,163,127,0.12)",
    borderColor: "rgba(16,163,127,0.25)",
    connectedBorder: "rgba(16,163,127,0.3)",
  },
  {
    id: "gemini" as const,
    label: "Gemini",
    Logo: GeminiLogo,
    placeholder: "AIza...",
    hint: "aistudio.google.com/apikey",
    color: "#4285F4",
    bgColor: "rgba(66,133,244,0.12)",
    borderColor: "rgba(66,133,244,0.25)",
    connectedBorder: "rgba(66,133,244,0.3)",
  },
  {
    id: "groq" as const,
    label: "Groq",
    Logo: GroqLogo,
    placeholder: "gsk_...",
    hint: "console.groq.com/keys",
    color: "#F55036",
    bgColor: "rgba(245,80,54,0.12)",
    borderColor: "rgba(245,80,54,0.25)",
    connectedBorder: "rgba(245,80,54,0.3)",
  },
] as const

type ProviderId = (typeof PROVIDERS)[number]["id"]

interface ExistingKey {
  provider: string
  is_active: boolean
  created_at: string
}

// ─── Provider card ────────────────────────────────────────────────────────────

interface ProviderCardProps {
  provider: (typeof PROVIDERS)[number]
  existingKey: ExistingKey | undefined
}

function ProviderCard({ provider, existingKey }: ProviderCardProps) {
  const [keyValue, setKeyValue] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [updateMode, setUpdateMode] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveApiKey = useSaveApiKey()
  const deleteApiKey = useDeleteApiKey()

  const hasKey = !!existingKey && !updateMode

  useEffect(() => {
    if (!existingKey) setUpdateMode(false)
  }, [existingKey])

  async function handleSave() {
    if (!keyValue.trim()) {
      setError("Please enter an API key.")
      return
    }
    setError(null)
    setLoading(true)
    try {
      await saveApiKey.mutateAsync({ provider: provider.id, key: keyValue.trim() })
      setSaved(true)
      setUpdateMode(false)
      setKeyValue("")
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  function handleDeleteClick() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      confirmTimerRef.current = setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setConfirmDelete(false)
    setLoading(true)
    deleteApiKey
      .mutateAsync(provider.id as ProviderId)
      .catch(() => setError("Failed to delete key."))
      .finally(() => setLoading(false))
  }

  const savedDate = existingKey
    ? new Date(existingKey.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden"
      style={{
        background: hasKey ? provider.bgColor : "rgba(255,255,255,0.025)",
        border: `1px solid ${hasKey ? provider.connectedBorder : "rgba(255,255,255,0.07)"}`,
      }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15 }}
    >
      {/* Card header */}
      <div className="flex items-center gap-4 p-5">
        {/* Logo badge */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: provider.bgColor, color: provider.color }}
        >
          <provider.Logo size={22} />
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading text-sm font-semibold text-foreground">
              {provider.label}
            </span>
            {hasKey && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs"
                style={{
                  background: provider.bgColor,
                  color: provider.color,
                  border: `1px solid ${provider.borderColor}`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: provider.color }}
                />
                Connected
              </motion.span>
            )}
          </div>
          <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {provider.hint}
          </p>
        </div>

        {/* Actions when key exists */}
        {hasKey && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="font-mono text-xs hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>
              Added {savedDate}
            </span>
            <button
              onClick={() => { setUpdateMode(true); setSaved(false) }}
              disabled={loading}
              className="font-body text-xs transition-colors hover:text-foreground"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Update
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={loading}
              className="font-body text-xs transition-colors disabled:opacity-50"
              style={{ color: confirmDelete ? "#f87171" : "rgba(255,255,255,0.4)" }}
            >
              {confirmDelete ? "Confirm?" : "Remove"}
            </button>
          </div>
        )}
      </div>

      {/* Input area */}
      <AnimatePresence>
        {!hasKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 flex flex-col gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="relative mt-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
                  placeholder={provider.placeholder}
                  className="w-full rounded-lg px-3 py-2.5 pr-10 font-mono text-sm focus:outline-none transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#e5e2e1",
                  }}
                  disabled={loading}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-foreground"
                  style={{ color: "rgba(255,255,255,0.3)" }}
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
                      <path
                        fillRule="evenodd"
                        d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleSave}
                  disabled={!keyValue.trim() || loading}
                  className="rounded-lg px-4 py-2 font-heading text-xs font-bold text-neutral-950 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  style={{ background: provider.color }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? <span className="animate-pulse">Saving…</span> : "Save Key"}
                </motion.button>

                {updateMode && (
                  <button
                    onClick={() => { setUpdateMode(false); setKeyValue(""); setError(null) }}
                    disabled={loading}
                    className="font-body text-xs transition-colors hover:text-foreground"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    Cancel
                  </button>
                )}

                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 font-body text-xs"
                      style={{ color: "#4ade80" }}
                    >
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Saved
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <p className="font-body text-xs text-red-400">{error}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ApiKeysTab() {
  const { data: keys = [], isLoading } = useApiKeys()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">AI API Keys</h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Your keys power the AI assistant and Content Studio. Used only when you invoke an AI
          feature — Mintmark never pays for your AI calls.
        </p>
      </div>

      {/* Privacy note */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3.5"
        style={{
          background: "rgba(230,195,100,0.05)",
          border: "1px solid rgba(230,195,100,0.12)",
        }}
      >
        <ShieldCheck size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--mm-gold-400)" }} />
        <p className="font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          Keys are encrypted with AES-256-GCM before storage and never sent to the client. Only
          the server-side AI runner can decrypt and use them.
        </p>
      </div>

      {/* Provider cards */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            ))}
          </>
        ) : (
          PROVIDERS.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              existingKey={keys.find((k) => k.provider === provider.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
