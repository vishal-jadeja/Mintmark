"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  useUserSettings,
  usePlatformInstructions,
  useUpdateActivePlatforms,
  useUpsertPlatformInstruction,
} from "@/lib/queries/settings"

// ─── Icons ────────────────────────────────────────────────────────────────────

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function MediumIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", limit: "Up to 3,000 chars", Icon: LinkedInIcon },
  { id: "x",       name: "X",        limit: "280 chars",          Icon: XIcon },
  { id: "medium",  name: "Medium",   limit: "Long-form articles", Icon: MediumIcon },
] as const

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual",       label: "Casual" },
  { value: "educational",  label: "Educational" },
  { value: "storytelling", label: "Storytelling" },
] as const

type PlatformId = (typeof PLATFORMS)[number]["id"]

interface InstructionFields {
  tone: string
  instruction_text: string
  format_rules: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PublishingTab() {
  const [selected, setSelected] = useState<Set<PlatformId>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<PlatformId>>(new Set())
  const [instructions, setInstructions] = useState<Partial<Record<PlatformId, InstructionFields>>>({})
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const { data: userSettings } = useUserSettings()
  const { data: platformInstructions } = usePlatformInstructions()
  const updateActivePlatforms = useUpdateActivePlatforms()
  const upsertInstruction = useUpsertPlatformInstruction()

  // Seed local state from server once both queries resolve
  useEffect(() => {
    if (initialized || !userSettings || !platformInstructions) return

    const validIds = PLATFORMS.map((p) => p.id)
    setSelected(
      new Set(
        (userSettings.active_platforms ?? []).filter((p): p is PlatformId =>
          validIds.includes(p as PlatformId)
        )
      )
    )

    const map: Partial<Record<PlatformId, InstructionFields>> = {}
    for (const inst of platformInstructions) {
      if (validIds.includes(inst.platform as PlatformId)) {
        map[inst.platform as PlatformId] = {
          tone: inst.tone ?? "",
          instruction_text: inst.instruction_text ?? "",
          format_rules: inst.format_rules ?? "",
        }
      }
    }
    setInstructions(map)
    setInitialized(true)
  }, [userSettings, platformInstructions, initialized])

  function togglePlatform(id: PlatformId) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateInstruction(id: PlatformId, field: keyof InstructionFields, value: string) {
    setInstructions((prev) => ({
      ...prev,
      [id]: { tone: "", instruction_text: "", format_rules: "", ...prev[id], [field]: value },
    }))
  }

  async function handleSave() {
    setError(null)
    setLoading(true)
    setSaved(false)
    try {
      await updateActivePlatforms.mutateAsync({ active_platforms: [...selected] })

      const instructionUpserts = [...selected]
        .filter((platform) => {
          const inst = instructions[platform]
          return inst?.tone || inst?.instruction_text || inst?.format_rules
        })
        .map((platform) => {
          const inst = instructions[platform]!
          return upsertInstruction.mutateAsync({
            platform,
            tone: inst.tone || undefined,
            instruction_text: inst.instruction_text || undefined,
            format_rules: inst.format_rules || undefined,
          })
        })

      await Promise.all(instructionUpserts)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "#1c1a18",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e2e1",
  }
  const inputClass = "w-full rounded-lg px-3 py-2 font-body text-sm focus:outline-none transition-colors"

  if (!initialized) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl animate-pulse"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Publishing Platforms
        </h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Content Studio only generates drafts for the platforms you select here. Optionally
          teach the AI your voice per platform.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {PLATFORMS.map(({ id, name, limit, Icon }) => {
          const isSelected = selected.has(id)
          const isCollapsed = collapsed.has(id)
          const inst = instructions[id]

          return (
            <div
              key={id}
              className="rounded-xl overflow-hidden transition-all duration-150"
              style={{
                border: isSelected
                  ? "1px solid rgba(230,195,100,0.40)"
                  : "1px solid rgba(255,255,255,0.07)",
                background: isSelected ? "rgba(230,195,100,0.06)" : "rgba(255,255,255,0.03)",
              }}
            >
              <button
                onClick={() => togglePlatform(id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <div
                  className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-colors"
                  style={{
                    border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.25)",
                    background: isSelected ? "var(--mm-gold-400)" : "transparent",
                  }}
                >
                  {isSelected && (
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none">
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="#1a1200"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <span
                  style={{
                    color: isSelected ? "var(--mm-gold-400)" : "var(--muted-foreground)",
                  }}
                >
                  <Icon />
                </span>

                <div className="flex-1 min-w-0">
                  <span className="font-heading text-sm font-semibold text-foreground">
                    {name}
                  </span>
                  <span
                    className="ml-2 font-mono text-[11px]"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {limit}
                  </span>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isSelected && !isCollapsed && (
                  <motion.div
                    key="expanded"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      className="px-4 pb-4 flex flex-col gap-3"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <p
                        className="pt-3 font-body text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Optional — teach the AI your voice for {name}
                      </p>

                      <select
                        value={inst?.tone ?? ""}
                        onChange={(e) => updateInstruction(id, "tone", e.target.value)}
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="">Tone (optional)</option>
                        {TONES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>

                      <textarea
                        rows={2}
                        value={inst?.instruction_text ?? ""}
                        onChange={(e) => updateInstruction(id, "instruction_text", e.target.value)}
                        placeholder={`Describe your voice for ${name} (optional)\ne.g. I write like I'm teaching a junior dev. Always use real examples.`}
                        className={`${inputClass} resize-none`}
                        style={inputStyle}
                      />

                      <textarea
                        rows={2}
                        value={inst?.format_rules ?? ""}
                        onChange={(e) => updateInstruction(id, "format_rules", e.target.value)}
                        placeholder={
                          "Any format rules? (optional)\ne.g. Always start with a hook. Use short paragraphs."
                        }
                        className={`${inputClass} resize-none`}
                        style={inputStyle}
                      />

                      <button
                        onClick={() =>
                          setCollapsed((prev) => {
                            const n = new Set(prev)
                            n.add(id)
                            return n
                          })
                        }
                        className="self-start font-body text-xs transition-colors hover:text-foreground"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Collapse instructions
                      </button>
                    </div>
                  </motion.div>
                )}

                {isSelected && isCollapsed && (
                  <motion.div
                    key="collapsed"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div
                      className="px-4 pb-3"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <button
                        onClick={() =>
                          setCollapsed((prev) => {
                            const n = new Set(prev)
                            n.delete(id)
                            return n
                          })
                        }
                        className="pt-2 font-body text-xs transition-colors hover:text-foreground"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Edit AI instructions →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Save */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg px-5 py-2.5 font-heading text-sm font-bold text-neutral-950 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: "var(--mm-gold-400, #e6c364)",
              boxShadow: "0 0 20px rgba(230,195,100,0.15)",
            }}
          >
            {loading ? <span className="animate-pulse">Saving…</span> : "Save changes"}
          </button>

          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 font-body text-sm"
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
                Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <p className="font-body text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}
