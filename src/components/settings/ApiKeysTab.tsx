"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useApiKeys, useSaveApiKey, useDeleteApiKey } from "@/lib/queries/settings"

const PROVIDERS = [
  {
    id: "anthropic" as const,
    label: "Anthropic",
    placeholder: "sk-ant-...",
    hint: "console.anthropic.com",
  },
  {
    id: "openai" as const,
    label: "OpenAI",
    placeholder: "sk-...",
    hint: "platform.openai.com/api-keys",
  },
  {
    id: "gemini" as const,
    label: "Gemini",
    placeholder: "AIza...",
    hint: "aistudio.google.com/apikey",
  },
  {
    id: "groq" as const,
    label: "Groq",
    placeholder: "gsk_...",
    hint: "console.groq.com/keys",
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

  // Reset update mode if the key is removed externally
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
    // Second click: confirmed
    setConfirmDelete(false)
    setLoading(true)
    deleteApiKey.mutateAsync(provider.id as ProviderId).catch(() => {
      setError("Failed to delete key.")
    }).finally(() => {
      setLoading(false)
    })
  }

  const inputStyle: React.CSSProperties = {
    background: "#1c1a18",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e2e1",
  }

  const savedDate = existingKey
    ? new Date(existingKey.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3 transition-colors"
      style={{
        background: existingKey ? "rgba(230,195,100,0.04)" : "rgba(255,255,255,0.03)",
        border: existingKey
          ? "1px solid rgba(230,195,100,0.15)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Provider header */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-sm font-semibold text-foreground">
          {provider.label}
        </span>

        {hasKey && (
          <div className="flex items-center gap-3">
            <span className="font-body text-xs" style={{ color: "var(--muted-foreground)" }}>
              Saved {savedDate}
            </span>
            <button
              onClick={() => { setUpdateMode(true); setSaved(false) }}
              disabled={loading}
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Update
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={loading}
              className="font-body text-xs transition-colors disabled:opacity-50"
              style={{ color: confirmDelete ? "#f87171" : "var(--muted-foreground)" }}
            >
              {confirmDelete ? "Confirm delete?" : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Key saved indicator */}
      <AnimatePresence>
        {hasKey && !saved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 font-body text-sm"
            style={{ color: "#4ade80" }}
          >
            <svg viewBox="0 0 10 8" className="w-3 h-3 flex-shrink-0" fill="none">
              <path
                d="M1 4l3 3 5-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Key saved
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input (shown when no key or in update mode) */}
      {!hasKey && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder={provider.placeholder}
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
                  <path
                    fillRule="evenodd"
                    d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>

          <p className="font-body text-xs" style={{ color: "var(--muted-foreground)" }}>
            Get your key at{" "}
            <span className="font-mono">{provider.hint}</span>
            {" "}· Encrypted at rest, never sent to the client.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!keyValue.trim() || loading}
              className="rounded-lg px-4 py-2 font-heading text-xs font-bold text-neutral-950 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              style={{ background: "var(--mm-gold-400, #e6c364)" }}
            >
              {loading ? <span className="animate-pulse">Saving…</span> : "Save Key"}
            </button>

            {updateMode && (
              <button
                onClick={() => { setUpdateMode(false); setKeyValue(""); setError(null) }}
                disabled={loading}
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                    <path
                      d="M1 4l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Saved
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {error && <p className="font-body text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ApiKeysTab() {
  const { data: keys = [], isLoading } = useApiKeys()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">AI API Keys</h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Your key powers the AI assistant and Content Studio. It is encrypted at rest and
          used only when you invoke an AI feature. Mintmark never pays for your AI calls.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg animate-pulse"
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
