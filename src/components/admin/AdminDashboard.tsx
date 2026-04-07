"use client"

import { useEffect, useRef, useState } from "react"
import {
  List,
  Mail,
  Users,
  BarChart2,
  Send,
  Settings,
  Search,
  Zap,
  Upload,
  Plus,
  X,
  CheckCircle,
  TrendingUp,
  Timer,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  useAdminStats,
  useAdminWaitlist,
  useSendInvite,
  useBatchInvite,
  useUpdateConfig,
} from "@/lib/queries/admin"
import { useAdminStore } from "@/stores/adminStore"
import type { AdminWaitlistEntry } from "@/lib/queries/admin"
import type { WaitlistStatus } from "@/types/database"

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg: "#131313",
  surface: "rgba(255,255,255,0.04)",
  surfaceHigh: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.06)",
  gold: "#e6c364",
  goldMuted: "rgba(230,195,100,0.10)",
  goldBorder: "rgba(230,195,100,0.22)",
  onPrimary: "#3d2e00",
  text: "#e5e2e1",
  muted: "#99907e",
  secondary: "#cfc5b4",
  error: "#ffb4ab",
  errorMuted: "rgba(255,180,171,0.10)",
  errorBorder: "rgba(255,180,171,0.22)",
  green: "oklch(0.72 0.18 150)",
  greenMuted: "rgba(100,200,130,0.10)",
  greenBorder: "rgba(100,200,130,0.22)",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(email: string): string {
  const name = email.split("@")[0]
  const parts = name.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ style = {} }: { style?: React.CSSProperties }) {
  return (
    <div
      className="animate-pulse rounded"
      style={{ background: "rgba(255,255,255,0.06)", ...style }}
    />
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WaitlistStatus }) {
  if (status === "invited") {
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full font-mono text-[10px] font-black tracking-wider uppercase"
        style={{ background: "rgba(201,168,76,0.18)", color: "#c9a84c" }}
      >
        Invited
      </span>
    )
  }
  if (status === "waiting") {
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full font-mono text-[10px] font-black tracking-wider uppercase"
        style={{ background: "rgba(79,72,59,0.45)", color: C.secondary }}
      >
        Waiting
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full font-mono text-[10px] font-black tracking-wider uppercase bg-neutral-800 text-neutral-200">
      Joined
    </span>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  badge,
  loading,
}: {
  label: string
  value: number | undefined
  badge?: React.ReactNode
  loading?: boolean
}) {
  return (
    <div
      className="p-6 rounded-xl border-t border-white/5 transition-colors cursor-default group"
      style={{ background: C.surface }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.surfaceHigh }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = C.surface }}
    >
      <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 font-bold mb-4">
        {label}
      </p>
      <div className="flex items-baseline justify-between gap-2">
        {loading ? (
          <Skeleton style={{ height: 36, width: 80 }} />
        ) : (
          <h3 className="font-heading text-4xl font-extrabold" style={{ color: C.text }}>
            {value?.toLocaleString() ?? "—"}
          </h3>
        )}
        {badge}
      </div>
    </div>
  )
}

// ── Invite Modal ──────────────────────────────────────────────────────────────

function InviteModal({
  open,
  email,
  onEmailChange,
  onClose,
}: {
  open: boolean
  email: string
  onEmailChange: (v: string) => void
  onClose: () => void
}) {
  const { mutateAsync: sendInvite, isPending } = useSendInvite()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!open) {
      setError("")
      setSuccess(false)
    }
  }, [open])

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Email is required.")
      return
    }
    setError("")
    try {
      await sendInvite(email.trim())
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send invite.")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div
        className="w-full max-w-md rounded-2xl p-10 relative shadow-2xl"
        style={{ background: "#0a0a0a", border: `1px solid ${C.border}` }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 transition-colors"
          style={{ color: C.muted }}
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: C.goldMuted, transform: "rotate(3deg)" }}
          >
            <Mail className="size-8" style={{ color: C.gold }} />
          </div>
          <h3 className="font-heading text-2xl font-extrabold tracking-tight" style={{ color: C.text }}>
            Issue New Invite
          </h3>
          <p className="text-sm mt-2" style={{ color: C.muted }}>
            Personalize the curation experience.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: C.muted }}>
              Recipient Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
                if (e.key === "Escape") onClose()
              }}
              placeholder="user@example.com"
              className="w-full rounded-xl py-4 px-5 text-sm font-heading font-bold focus:outline-none transition-all"
              style={{
                background: "#1a1a1a",
                border: `1px solid ${C.border}`,
                color: C.text,
              }}
              disabled={isPending || success}
              autoFocus
            />
          </div>

          <div
            className="p-4 rounded-xl flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}
          >
            <Timer className="size-4 flex-shrink-0" style={{ color: C.gold }} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.text }}>
                Invite Expiration
              </p>
              <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                Link expires in 48 hours.
              </p>
            </div>
          </div>

          {error && (
            <p className="font-mono text-sm" style={{ color: C.error }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isPending || success || !email.trim()}
            className="w-full py-4 rounded-xl font-mono text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: success ? C.green : C.gold,
              color: success ? "#fff" : C.onPrimary,
              boxShadow: "0 10px 30px rgba(230,195,100,0.18)",
            }}
          >
            {success ? "Invite Sent!" : isPending ? "Sending…" : "Confirm Invite Delivery"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Batch Invite Modal ────────────────────────────────────────────────────────

function BatchInviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutateAsync: batchInvite, isPending } = useBatchInvite()
  const [count, setCount] = useState("")
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ invited: number; failed: string[] } | null>(null)

  useEffect(() => {
    if (!open) {
      setCount("")
      setError("")
      setResult(null)
    }
  }, [open])

  async function handleSubmit() {
    const n = parseInt(count, 10)
    if (isNaN(n) || n < 1 || n > 100) {
      setError("Enter a number between 1 and 100.")
      return
    }
    setError("")
    try {
      const res = await batchInvite({ count: n })
      setResult(res)
      setCount("")
      setTimeout(onClose, 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch invite failed.")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div
        className="w-full max-w-sm rounded-2xl p-8 relative shadow-2xl"
        style={{ background: "#0a0a0a", border: `1px solid ${C.border}` }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 transition-colors"
          style={{ color: C.muted }}
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <h3 className="font-heading text-xl font-extrabold mb-1" style={{ color: C.text }}>
          Batch Invite
        </h3>
        <p className="text-sm mb-6" style={{ color: C.muted }}>
          Send invites to the next N users on the waitlist.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => { setCount(e.target.value); setError(""); setResult(null) }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit() }}
              placeholder="1–100"
              className="rounded-xl py-3 px-4 font-mono text-sm w-28 focus:outline-none transition-all"
              style={{
                background: "#1a1a1a",
                border: `1px solid ${C.border}`,
                color: C.text,
              }}
              disabled={isPending}
              autoFocus
            />
            {count && !isNaN(parseInt(count)) && (
              <p className="text-sm" style={{ color: C.muted }}>
                Invite next{" "}
                <span style={{ color: C.gold }}>{parseInt(count).toLocaleString()}</span>{" "}
                users
              </p>
            )}
          </div>

          {error && (
            <p className="font-mono text-sm" style={{ color: C.error }}>{error}</p>
          )}

          {result && (
            <div
              className="rounded-lg p-3"
              style={{ background: C.greenMuted, border: `1px solid ${C.greenBorder}` }}
            >
              <p className="font-body text-sm font-medium" style={{ color: C.green }}>
                {result.invited} invite{result.invited !== 1 ? "s" : ""} sent
                {result.failed.length > 0 && `, ${result.failed.length} failed`}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isPending || !count}
            className="w-full py-3 rounded-xl font-mono text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: C.gold, color: C.onPrimary }}
          >
            {isPending ? "Sending…" : "Send Batch"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: List, label: "Waitlist", active: true },
  { icon: Mail, label: "Invites", active: false },
  { icon: Users, label: "Users", active: false },
  { icon: BarChart2, label: "Stats", active: false },
] as const

function AdminSidebar({ onSendInvite }: { onSendInvite: () => void }) {
  return (
    <aside className="flex flex-col fixed left-0 top-0 h-full z-50 w-64 border-r border-white/5 bg-neutral-950">
      <div className="px-6 py-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: C.gold }}
          >
            <span className="font-heading text-xs font-black" style={{ color: C.onPrimary }}>
              M
            </span>
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold tracking-tight" style={{ color: C.gold }}>
              Mintmark
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">
              The Digital Curator
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-0.5">
          {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm font-heading font-semibold tracking-wide transition-all cursor-pointer select-none ${
                active ? "" : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900/50"
              }`}
              style={
                active
                  ? {
                      color: C.gold,
                      background: "rgba(255,255,255,0.04)",
                      borderRight: `2px solid ${C.gold}`,
                      marginRight: "-1px",
                    }
                  : {}
              }
            >
              <Icon className="size-4 flex-shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-auto p-6 space-y-4">
        <button
          onClick={onSendInvite}
          className="w-full py-2.5 rounded-lg font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: C.gold, color: C.onPrimary }}
        >
          <Send className="size-4" />
          Send Invite
        </button>

        <div className="flex items-center gap-3 px-2 pt-4 border-t border-white/5">
          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
            <Users className="size-4 text-neutral-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold font-heading truncate" style={{ color: C.text }}>
              Admin
            </p>
            <p className="font-mono text-[10px] text-neutral-500 truncate">
              admin@mintmark.com
            </p>
          </div>
          <Settings className="size-4 text-neutral-600 cursor-pointer flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}

// ── Skeleton table rows ───────────────────────────────────────────────────────

function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
          {[180, 40, 32, 64, 80, 60].map((w, j) => (
            <td key={j} className="px-6 py-5">
              <Skeleton style={{ height: 14, width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Waitlist Row ──────────────────────────────────────────────────────────────

function WaitlistRow({
  entry,
  onInvite,
}: {
  entry: AdminWaitlistEntry
  onInvite: (email: string) => void
}) {
  const initials = getInitials(entry.email)

  return (
    <tr
      className="transition-colors hover:bg-white/[0.025]"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      {/* Email + avatar */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-heading font-bold flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", color: C.muted }}
          >
            {initials}
          </div>
          <span className="text-sm font-medium font-body" style={{ color: C.text }}>
            {entry.email}
          </span>
        </div>
      </td>

      {/* Position */}
      <td className="px-6 py-5">
        <span className="font-mono text-xs" style={{ color: C.muted }}>
          #{entry.position ?? "—"}
        </span>
      </td>

      {/* Referrals */}
      <td className="px-6 py-5 text-center">
        <span className="text-sm font-bold font-body" style={{ color: C.text }}>
          {entry.referral_count}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-5">
        <StatusBadge status={entry.status} />
      </td>

      {/* Joined Date */}
      <td className="px-6 py-5">
        <span className="font-mono text-xs" style={{ color: C.muted }}>
          {new Date(entry.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-5 text-right">
        {entry.status === "joined" ? (
          <CheckCircle className="size-4 text-neutral-600 inline-block" />
        ) : entry.status === "invited" ? (
          <button
            onClick={() => onInvite(entry.email)}
            className="font-heading font-bold text-xs transition-colors hover:opacity-75"
            style={{ color: C.gold }}
          >
            Resend
          </button>
        ) : (
          <button
            onClick={() => onInvite(entry.email)}
            className="font-heading font-bold text-xs transition-colors hover:opacity-75"
            style={{ color: C.text }}
          >
            Send invite
          </button>
        )}
      </td>
    </tr>
  )
}

// ── Platform Settings ─────────────────────────────────────────────────────────

function PlatformSettings({
  inviteCap,
  referralBonus,
}: {
  inviteCap: number | undefined
  referralBonus: number | undefined
}) {
  const [capDraft, setCapDraft] = useState("")
  const [bonusDraft, setBonusDraft] = useState("")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errMsg, setErrMsg] = useState("")
  const { mutateAsync: updateConfig } = useUpdateConfig()

  useEffect(() => {
    if (inviteCap !== undefined) setCapDraft(String(inviteCap))
  }, [inviteCap])

  useEffect(() => {
    if (referralBonus !== undefined) setBonusDraft(String(referralBonus))
  }, [referralBonus])

  async function handleSave() {
    const cap = parseInt(capDraft, 10)
    const bonus = parseInt(bonusDraft, 10)
    if (isNaN(cap) || cap < 0 || isNaN(bonus) || bonus < 0) {
      setErrMsg("Values must be non-negative integers.")
      setSaveStatus("error")
      return
    }
    setSaveStatus("saving")
    setErrMsg("")
    try {
      await Promise.all([
        updateConfig({ key: "invite_cap", value: cap }),
        updateConfig({ key: "referral_bonus", value: bonus }),
      ])
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Failed to save.")
      setSaveStatus("error")
    }
  }

  const inputClass =
    "rounded-lg py-3 px-4 font-heading text-xl font-bold w-24 focus:outline-none transition-all"

  return (
    <div
      className="p-8 rounded-2xl"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <h3 className="font-heading text-xl font-bold mb-6" style={{ color: C.text }}>
        Platform Settings
      </h3>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: C.muted }}>
            Daily Capacity Cap
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={capDraft}
              onChange={(e) => { setCapDraft(e.target.value); setSaveStatus("idle") }}
              className={inputClass}
              style={{
                background: "#0e0e0e",
                border: `1px solid ${C.border}`,
                color: C.gold,
              }}
              min={0}
            />
            <p className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.22)" }}>
              Total new invites issued every 24 hours.
            </p>
          </div>
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: C.muted }}>
            Referral Multiplier
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={bonusDraft}
              onChange={(e) => { setBonusDraft(e.target.value); setSaveStatus("idle") }}
              className={inputClass}
              style={{
                background: "#0e0e0e",
                border: `1px solid ${C.border}`,
                color: C.text,
              }}
              min={0}
            />
            <p className="text-xs leading-tight" style={{ color: "rgba(255,255,255,0.22)" }}>
              Waitlist skips granted per verified referral.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        {saveStatus === "saved" && (
          <span className="font-mono text-sm" style={{ color: C.green }}>Saved</span>
        )}
        {saveStatus === "error" && (
          <span className="font-mono text-sm" style={{ color: C.error }}>{errMsg}</span>
        )}
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="px-8 py-3 rounded-lg font-heading font-bold text-sm transition-all disabled:opacity-50 hover:bg-white/10"
          style={{ background: C.surfaceHigh, color: C.text }}
        >
          {saveStatus === "saving" ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { selectedTab, searchQuery, currentPage, setSelectedTab, setSearchQuery, setCurrentPage } =
    useAdminStore()

  // Debounced search
  const [inputValue, setInputValue] = useState(searchQuery)
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(inputValue), 300)
    return () => clearTimeout(t)
  }, [inputValue, setSearchQuery])

  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: waitlistPage, isLoading: tableLoading } = useAdminWaitlist({
    statusFilter: selectedTab,
    page: currentPage,
    limit: 50,
    searchQuery,
  })

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  function openInviteModal(email = "") {
    setInviteEmail(email)
    setInviteModalOpen(true)
  }

  // Batch modal
  const [batchModalOpen, setBatchModalOpen] = useState(false)

  // Settings scroll ref
  const settingsRef = useRef<HTMLDivElement>(null)

  function scrollToSettings() {
    settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="flex min-h-screen" style={{ background: C.bg, color: C.text }}>
      <AdminSidebar onSendInvite={() => openInviteModal()} />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="font-heading text-4xl font-extrabold tracking-tighter" style={{ color: C.text }}>
              Admin Dashboard
            </h2>
            <p className="mt-2 font-body font-medium" style={{ color: C.muted }}>
              Curation queue and platform health overview.
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-lg flex items-center gap-3"
            style={{ background: C.surface }}
          >
            <span className="font-mono text-[11px] text-neutral-500 uppercase tracking-widest">
              System Status
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: C.gold,
                  boxShadow: "0 0 8px rgba(230,195,100,0.6)",
                }}
              />
              <span className="font-mono text-xs font-bold tracking-wide" style={{ color: C.gold }}>
                OPERATIONAL
              </span>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <section className="grid grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Signups"
            value={stats?.totalWaitlist}
            loading={statsLoading}
            badge={
              <span
                className="font-mono text-[11px] font-bold flex items-center gap-0.5"
                style={{ color: C.gold }}
              >
                <TrendingUp className="size-3" />
                +12%
              </span>
            }
          />
          <StatCard
            label="Pending"
            value={stats?.waitingCount}
            loading={statsLoading}
            badge={
              <span className="font-mono text-[11px] font-bold text-neutral-600">QUEUE</span>
            }
          />
          <StatCard
            label="Invited"
            value={stats?.invitedCount}
            loading={statsLoading}
            badge={
              <span
                className="font-mono text-[11px] font-bold"
                style={{ color: "rgba(230,195,100,0.55)" }}
              >
                OUTSTANDING
              </span>
            }
          />
          <StatCard
            label="Joined"
            value={stats?.joinedCount}
            loading={statsLoading}
            badge={
              <span className="font-mono text-[11px] font-bold" style={{ color: C.secondary }}>
                VERIFIED
              </span>
            }
          />
        </section>

        {/* Controls Bar */}
        <div
          className="p-3 rounded-xl mb-6 flex items-center justify-between gap-4"
          style={{ background: C.surface }}
        >
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none"
                style={{ color: C.muted }}
              />
              <input
                type="text"
                placeholder="Search by email..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full rounded-lg py-2.5 pl-10 pr-4 text-sm font-body focus:outline-none placeholder:text-neutral-600 transition-all"
                style={{
                  background: "#0e0e0e",
                  border: "none",
                  color: C.text,
                }}
              />
            </div>
            {/* Status filter */}
            <div className="relative">
              <select
                value={selectedTab}
                onChange={(e) => setSelectedTab(e.target.value as typeof selectedTab)}
                className="rounded-lg py-2.5 pl-4 pr-9 text-sm font-body focus:outline-none appearance-none cursor-pointer transition-all"
                style={{
                  background: "#0e0e0e",
                  border: "none",
                  color: C.muted,
                }}
              >
                <option value="all">All Status</option>
                <option value="waiting">Waiting</option>
                <option value="invited">Invited</option>
                <option value="joined">Joined</option>
              </select>
              <ChevronRight
                className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none rotate-90"
                style={{ color: C.muted }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={scrollToSettings}
              className="py-2.5 px-4 rounded-lg text-sm font-heading font-bold flex items-center gap-2 transition-all hover:bg-neutral-800"
              style={{ color: C.muted, background: "transparent" }}
            >
              <Zap className="size-4" />
              Adjust Capacity
            </button>
            <button
              onClick={() => setBatchModalOpen(true)}
              className="py-2.5 px-4 rounded-lg text-sm font-heading font-bold flex items-center gap-2 transition-all hover:bg-neutral-700"
              style={{ background: C.surfaceHigh, color: C.text }}
            >
              <Upload className="size-4" />
              Batch Invite
            </button>
            <button
              onClick={() => openInviteModal()}
              className="py-2.5 px-6 rounded-lg text-sm font-heading font-extrabold flex items-center gap-2 transition-all hover:opacity-90"
              style={{ background: C.gold, color: C.onPrimary }}
            >
              <Plus className="size-4" />
              Send Invite
            </button>
          </div>
        </div>

        {/* Waitlist Table */}
        <div className="rounded-xl overflow-hidden" style={{ background: C.surface }}>
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.025)" }}>
                {(
                  [
                    ["Email Address", ""],
                    ["Position", ""],
                    ["Referrals", "text-center"],
                    ["Status", ""],
                    ["Joined Date", ""],
                    ["Actions", "text-right"],
                  ] as [string, string][]
                ).map(([h, align]) => (
                  <th
                    key={h}
                    className={`px-6 py-4 font-mono text-[11px] font-bold uppercase tracking-widest ${align}`}
                    style={{ color: C.muted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <SkeletonRows />
              ) : !waitlistPage?.data?.length ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center font-body text-sm"
                    style={{ color: C.muted }}
                  >
                    {searchQuery ? "No results for this search." : "No entries in this view."}
                  </td>
                </tr>
              ) : (
                waitlistPage.data.map((entry) => (
                  <WaitlistRow key={entry.id} entry={entry} onInvite={openInviteModal} />
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderTop: `1px solid ${C.border}`, background: "rgba(255,255,255,0.01)" }}
          >
            <p className="font-mono text-[11px] text-neutral-600 uppercase tracking-widest">
              Showing {waitlistPage?.data?.length ?? 0} of{" "}
              {(waitlistPage?.total ?? 0).toLocaleString()} records
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="transition-colors disabled:opacity-30 hover:text-white"
                style={{ color: C.muted }}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!waitlistPage || currentPage >= waitlistPage.totalPages}
                className="transition-colors disabled:opacity-30 hover:text-white"
                style={{ color: C.text }}
                aria-label="Next page"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom: Platform Settings + Curation Insights */}
        <div ref={settingsRef} className="mt-12 grid grid-cols-12 gap-8">
          <div className="col-span-7">
            <PlatformSettings
              inviteCap={stats?.currentInviteCap}
              referralBonus={stats?.referralBonus}
            />
          </div>
          <div className="col-span-5">
            <div
              className="p-8 rounded-2xl h-full flex flex-col justify-between"
              style={{ background: C.goldMuted, border: `1px solid ${C.goldBorder}` }}
            >
              <div>
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-6"
                  style={{ background: "rgba(230,195,100,0.15)" }}
                >
                  <Sparkles className="size-5" style={{ color: C.gold }} />
                </div>
                <h4 className="font-heading text-lg font-bold" style={{ color: C.gold }}>
                  Curation Insights
                </h4>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: C.muted }}>
                  Engagement is up among the last batch of &apos;Joined&apos; users. Consider
                  increasing capacity to accelerate growth.
                </p>
              </div>
              <button
                className="mt-6 py-3 rounded-lg text-sm font-heading font-bold uppercase tracking-widest transition-colors"
                style={{
                  border: `1px solid ${C.goldBorder}`,
                  color: C.gold,
                  background: "transparent",
                }}
                disabled
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <InviteModal
        open={inviteModalOpen}
        email={inviteEmail}
        onEmailChange={setInviteEmail}
        onClose={() => setInviteModalOpen(false)}
      />
      <BatchInviteModal
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
      />
    </div>
  )
}
