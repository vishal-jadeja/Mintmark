"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Sparkles } from "lucide-react"
import {
  usePlatformInstructions,
  useUpsertPlatformInstruction,
  useUserSettings,
  useUpdateActivePlatforms,
} from "@/lib/queries/settings"

// ── Platform icons ────────────────────────────────────────────────────────────

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function MediumIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden>
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────

type PlatformId = "linkedin" | "x" | "medium"

const PLATFORMS = [
  { id: "linkedin" as PlatformId, name: "LinkedIn", Icon: LinkedInIcon },
  { id: "x"        as PlatformId, name: "X",         Icon: XIcon },
  { id: "medium"   as PlatformId, name: "Medium",    Icon: MediumIcon },
]

const TONES = [
  { value: "professional",  label: "Professional" },
  { value: "casual",        label: "Casual" },
  { value: "witty",         label: "Witty" },
  { value: "authoritative", label: "Authoritative" },
  { value: "inspirational", label: "Inspirational" },
]

const FORMAT_PRESETS = [
  "Use bullet points",
  "Include hashtags",
  "Heavy emoji usage",
  "Tag relevant handles",
]

// ── Helpers ───────────────────────────────────────────────────────────────────

interface PlatformState {
  tone: string
  instruction_text: string
  activePresets: Set<string>
}

function parsePresets(raw: string): Set<string> {
  return new Set(
    raw.split(",").map((s) => s.trim()).filter((s) => FORMAT_PRESETS.includes(s))
  )
}

function serializePresets(active: Set<string>): string {
  return [...active].join(",")
}

function SectionLabel({ label, step }: { label: string; step?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span
        className="font-mono text-[10px] tracking-widest uppercase"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {label}
      </span>
      {step && (
        <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          {step}
        </span>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PublishingWidget() {
  const [activePlatform, setActivePlatform] = useState<PlatformId>("linkedin")
  const [states, setStates] = useState<Partial<Record<PlatformId, PlatformState>>>({})
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Content length — UI only, no DB field
  const [minWords, setMinWords] = useState("")
  const [maxWords, setMaxWords] = useState("")
  const [activePlatforms, setActivePlatforms] = useState<Set<PlatformId>>(new Set())
  const [platformsInitialized, setPlatformsInitialized] = useState(false)

  const { data: userSettings } = useUserSettings()
  const { data: platformInstructions } = usePlatformInstructions()
  const upsertInstruction = useUpsertPlatformInstruction()
  const updateActivePlatforms = useUpdateActivePlatforms()

  useEffect(() => {
    if (platformsInitialized || !userSettings) return
    setActivePlatforms(
      new Set(
        (userSettings.active_platforms ?? []).filter((p): p is PlatformId =>
          ["linkedin", "x", "medium"].includes(p)
        )
      )
    )
    setPlatformsInitialized(true)
  }, [userSettings, platformsInitialized])

  useEffect(() => {
    if (initialized || !platformInstructions) return
    const map: Partial<Record<PlatformId, PlatformState>> = {}
    for (const inst of platformInstructions) {
      const id = inst.platform as PlatformId
      if (["linkedin", "x", "medium"].includes(id)) {
        map[id] = {
          tone: inst.tone ?? "",
          instruction_text: inst.instruction_text ?? "",
          activePresets: parsePresets(inst.format_rules ?? ""),
        }
      }
    }
    setStates(map)
    setInitialized(true)
  }, [platformInstructions, initialized])

  const current: PlatformState = states[activePlatform] ?? {
    tone: "",
    instruction_text: "",
    activePresets: new Set(),
  }

  function updateCurrent(patch: Partial<PlatformState>) {
    setStates((prev) => ({ ...prev, [activePlatform]: { ...current, ...patch } }))
    setSaved(false)
  }

  function togglePreset(preset: string) {
    const next = new Set(current.activePresets)
    if (next.has(preset)) next.delete(preset)
    else next.add(preset)
    updateCurrent({ activePresets: next })
  }

  function togglePlatform(id: PlatformId) {
    const next = new Set(activePlatforms)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setActivePlatforms(next)
    updateActivePlatforms.mutate({ active_platforms: [...next] })
  }

  async function handleSave() {
    setError(null)
    setLoading(true)
    setSaved(false)
    try {
      await upsertInstruction.mutateAsync({
        platform: activePlatform,
        tone: current.tone || undefined,
        instruction_text: current.instruction_text || undefined,
        format_rules: serializePresets(current.activePresets) || undefined,
      })
      setSaved(true)
      setLastSaved(
        new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      )
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  const activeName = PLATFORMS.find((p) => p.id === activePlatform)?.name ?? "this platform"

  const inputBase: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e2e1",
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Page header ── */}
      <div>
        <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
          Platform Instructions
        </h2>
        <p className="mt-1.5 font-body text-sm text-muted-foreground">
          Tailor how Mintmark curates and crafts your digital presence across different networks.
        </p>
      </div>

      {/* ── Active platform selection ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="font-mono text-[10px] uppercase tracking-widest flex-shrink-0"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Create posts for
        </span>
        {PLATFORMS.map(({ id, name, Icon }) => {
          const on = activePlatforms.has(id)
          return (
            <motion.button
              key={id}
              onClick={() => togglePlatform(id)}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 font-heading text-xs font-semibold transition-colors"
              whileTap={{ scale: 0.96 }}
              style={{
                background: on ? "rgba(230,195,100,0.12)" : "transparent",
                border: `1px solid ${on ? "rgba(230,195,100,0.4)" : "rgba(255,255,255,0.08)"}`,
                color: on ? "var(--mm-gold-400)" : "var(--muted-foreground)",
              }}
            >
              {on && (
                <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 flex-shrink-0" fill="none">
                  <path
                    d="M1 4l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <Icon />
              {name}
            </motion.button>
          )
        })}
      </div>

      {/* ── Platform pill tabs ── */}
      <div className="flex gap-2">
        {PLATFORMS.map(({ id, name, Icon }) => {
          const isActive = activePlatform === id
          return (
            <motion.button
              key={id}
              onClick={() => setActivePlatform(id)}
              className="flex items-center gap-2 rounded-full px-4 py-2 font-heading text-sm font-semibold transition-colors"
              whileHover={{ scale: isActive ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: isActive ? "var(--mm-gold-400, #e6c364)" : "rgba(255,255,255,0.05)",
                color: isActive ? "#1a1200" : "var(--muted-foreground)",
                border: isActive ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Icon />
              {name}
            </motion.button>
          )
        })}
      </div>

      {/* ── Main card ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "rgba(32,31,31,0.6)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderTop: "1px solid rgba(230,195,100,0.15)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlatform}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="p-6 flex flex-col gap-6"
          >
            {/* ── Step 1: Tone & Voice ── */}
            <div>
              <SectionLabel label="Tone & Voice" step="Step 1 of 3" />
              <div className="flex flex-wrap gap-2 mb-4">
                {TONES.map(({ value, label }) => {
                  const on = current.tone === value
                  return (
                    <motion.button
                      key={value}
                      onClick={() => updateCurrent({ tone: on ? "" : value })}
                      className="rounded-full px-4 py-1.5 font-heading text-xs font-semibold transition-colors"
                      whileTap={{ scale: 0.95 }}
                      style={{
                        background: on ? "rgba(230,195,100,0.15)" : "transparent",
                        border: `1px solid ${on ? "rgba(230,195,100,0.5)" : "rgba(255,255,255,0.12)"}`,
                        color: on ? "var(--mm-gold-400)" : "var(--muted-foreground)",
                      }}
                    >
                      {label}
                    </motion.button>
                  )
                })}
              </div>
              <textarea
                rows={3}
                value={current.instruction_text}
                onChange={(e) => updateCurrent({ instruction_text: e.target.value })}
                placeholder={`Describe your unique perspective or specific stylistic nuances for ${activeName}…`}
                className="w-full rounded-lg px-3 py-2.5 font-body text-sm focus:outline-none transition-colors resize-none"
                style={inputBase}
              />
            </div>

            {/* ── Divider ── */}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

            {/* ── Step 2: Format Rules ── */}
            <div>
              <SectionLabel label="Format Rules" step="Step 2 of 3" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {FORMAT_PRESETS.map((preset) => {
                  const checked = current.activePresets.has(preset)
                  return (
                    <button
                      key={preset}
                      onClick={() => togglePreset(preset)}
                      className="flex items-center gap-2.5 text-left"
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          background: checked ? "var(--mm-gold-400)" : "transparent",
                          border: checked ? "none" : "1.5px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        {checked && (
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
                        className="font-body text-sm"
                        style={{ color: checked ? "var(--foreground)" : "var(--muted-foreground)" }}
                      >
                        {preset}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Divider ── */}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

            {/* ── Step 3: Content Length ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="font-mono text-[10px] tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                >
                  Content Length
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-[10px] rounded-full px-2 py-0.5"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.3)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    Coming soon
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Step 3 of 3
                  </span>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex flex-col gap-1 flex-1">
                  <label
                    className="font-mono text-[9px] tracking-widest uppercase"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Minimum Words
                  </label>
                  <input
                    type="number"
                    value={minWords}
                    onChange={(e) => setMinWords(e.target.value)}
                    placeholder="300"
                    disabled
                    className="rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none w-full opacity-40"
                    style={inputBase}
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label
                    className="font-mono text-[9px] tracking-widest uppercase"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    Maximum Words
                  </label>
                  <input
                    type="number"
                    value={maxWords}
                    onChange={(e) => setMaxWords(e.target.value)}
                    placeholder="800"
                    disabled
                    className="rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none w-full opacity-40"
                    style={inputBase}
                  />
                </div>
                <p
                  className="font-body text-xs flex-shrink-0 mt-5 opacity-40"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Optimal for algorithm
                </p>
              </div>
            </div>

            {/* ── Card footer ── */}
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="flex items-center gap-1.5 font-mono text-xs"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <Clock size={11} />
                {lastSaved ? `Last saved at ${lastSaved}` : "Not saved yet"}
              </span>

              <div className="flex items-center gap-3">
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-1.5 font-body text-xs"
                      style={{ color: "#4ade80" }}
                    >
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 flex-shrink-0" fill="none">
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

                {error && <p className="font-body text-xs text-red-400">{error}</p>}

                <motion.button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 font-heading text-sm font-bold text-neutral-950 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    background: "var(--mm-gold-400, #e6c364)",
                    boxShadow: "0 0 16px rgba(230,195,100,0.2)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
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
                  {loading ? <span className="animate-pulse">Saving…</span> : "Save Instructions"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Smart Suggestions */}
        <div
          className="rounded-xl p-5 flex items-start gap-3"
          style={{
            background: "rgba(32,31,31,0.6)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Sparkles size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--mm-gold-400)" }} />
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">Smart Suggestions</p>
            <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">
              Mintmark can analyze your top-performing {activeName} posts to auto-fill these
              instructions.
            </p>
          </div>
        </div>

        {/* Usage Status */}
        <div
          className="rounded-xl p-5 flex items-start gap-3"
          style={{
            background: "rgba(32,31,31,0.6)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex gap-1 mt-1 flex-shrink-0">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--mm-gold-400)" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">Usage Status</p>
            <p className="mt-1 font-body text-xs text-muted-foreground">Syncing rules…</p>
          </div>
        </div>
      </div>
    </div>
  )
}
