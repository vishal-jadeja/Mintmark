"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Users,
  Clock,
  CheckCircle,
  Mail,
  Shield,
  AlertCircle,
  Pencil,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Send,
  Zap,
} from "lucide-react"
import { LogoMark } from "@/components/ui/logo-mark"
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

// ── Design tokens (inline for isolation) ─────────────────────────────────────

const C = {
  bg: "#0d0d0d",
  surface: "rgba(255,255,255,0.035)",
  surfaceHover: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.07)",
  borderGold: "rgba(230,195,100,0.22)",
  gold: "#e6c364",
  goldMuted: "rgba(230,195,100,0.10)",
  text: "#e5e2e1",
  muted: "#7a7673",
  green: "oklch(0.72 0.18 150)",
  greenMuted: "rgba(100,200,130,0.12)",
  greenBorder: "rgba(100,200,130,0.25)",
  amber: "rgba(230,195,100,0.85)",
  amberMuted: "rgba(230,195,100,0.10)",
  amberBorder: "rgba(230,195,100,0.22)",
  red: "oklch(0.65 0.22 27)",
  redMuted: "rgba(220,80,80,0.10)",
  redBorder: "rgba(220,80,80,0.22)",
}

// ── Skeleton shimmer ──────────────────────────────────────────────────────────

function Skeleton({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{ background: "rgba(255,255,255,0.06)", ...style }}
    />
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: WaitlistStatus }) {
  const map = {
    waiting: {
      label: "Waiting",
      bg: "rgba(255,255,255,0.06)",
      color: C.muted,
      border: "rgba(255,255,255,0.08)",
    },
    invited: {
      label: "Invited",
      bg: C.amberMuted,
      color: C.gold,
      border: C.amberBorder,
    },
    joined: {
      label: "Joined",
      bg: C.greenMuted,
      color: C.green,
      border: C.greenBorder,
    },
  }
  const s = map[status]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number | undefined
  icon: React.ReactNode
  accent?: string
  loading?: boolean
}

function StatCard({ label, value, icon, accent = C.muted, loading }: StatCardProps) {
  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-4"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>
          {label}
        </span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      {loading ? (
        <Skeleton style={{ height: 28, width: 72 }} />
      ) : (
        <span className="font-heading text-2xl font-bold" style={{ color: accent === C.muted ? C.text : accent }}>
          {value?.toLocaleString() ?? "—"}
        </span>
      )}
    </div>
  )
}

// ── Inline editable config field ──────────────────────────────────────────────

function ConfigField({
  label,
  configKey,
  currentValue,
}: {
  label: string
  configKey: "invite_cap" | "referral_bonus"
  currentValue: number | undefined
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [errMsg, setErrMsg] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { mutateAsync } = useUpdateConfig()

  function startEdit() {
    setDraft(String(currentValue ?? ""))
    setEditing(true)
    setStatus("idle")
    setTimeout(() => inputRef.current?.select(), 10)
  }

  function cancel() {
    setEditing(false)
    setStatus("idle")
  }

  async function save() {
    const val = parseInt(draft, 10)
    if (isNaN(val) || val < 0) {
      setErrMsg("Must be a non-negative integer.")
      setStatus("error")
      return
    }
    setStatus("saving")
    try {
      await mutateAsync({ key: configKey, value: val })
      setStatus("saved")
      setEditing(false)
      setTimeout(() => setStatus("idle"), 2000)
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Update failed.")
      setStatus("error")
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") save()
    if (e.key === "Escape") cancel()
  }

  const inputBase = "rounded-md px-3 py-1.5 font-mono text-sm w-24 focus:outline-none focus:ring-1"

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-widest w-28" style={{ color: C.muted }}>
        {label}
      </span>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={save}
            className={inputBase}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${C.borderGold}`,
              color: C.text,
              boxShadow: `0 0 0 1px rgba(230,195,100,0.15)`,
            }}
            type="number"
            min={0}
          />
          <button
            onClick={save}
            disabled={status === "saving"}
            className="rounded p-1 transition-colors"
            style={{ background: C.goldMuted, color: C.gold }}
          >
            <Check className="size-3.5" />
          </button>
          <button
            onClick={cancel}
            className="rounded p-1 transition-colors"
            style={{ color: C.muted }}
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium" style={{ color: C.text }}>
            {currentValue?.toLocaleString() ?? "—"}
          </span>
          <button
            onClick={startEdit}
            className="rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: C.muted }}
            aria-label={`Edit ${label}`}
          >
            <Pencil className="size-3" />
          </button>
        </div>
      )}
      {status === "saved" && (
        <span className="font-mono text-[11px]" style={{ color: C.green }}>Saved</span>
      )}
      {status === "error" && (
        <span className="font-mono text-[11px]" style={{ color: C.red }}>{errMsg}</span>
      )}
    </div>
  )
}

// ── Waitlist table row ────────────────────────────────────────────────────────

function WaitlistRow({ entry }: { entry: AdminWaitlistEntry }) {
  const [rowStatus, setRowStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [errMsg, setErrMsg] = useState("")
  const { mutateAsync: sendInvite } = useSendInvite()

  async function handleSendInvite() {
    setRowStatus("sending")
    setErrMsg("")
    try {
      await sendInvite(entry.email)
      setRowStatus("sent")
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Failed.")
      setRowStatus("error")
      setTimeout(() => setRowStatus("idle"), 4000)
    }
  }

  const cellClass = "px-4 py-2.5 text-sm"

  return (
    <tr
      className="border-b transition-colors"
      style={{
        borderColor: C.border,
        background: rowStatus === "sending" ? "rgba(230,195,100,0.03)" : "transparent",
      }}
    >
      <td className={`${cellClass} font-mono text-xs`} style={{ color: C.muted }}>
        {entry.position ?? "—"}
      </td>
      <td className={`${cellClass} font-body`} style={{ color: C.text }}>
        {entry.email}
      </td>
      <td className={cellClass}>
        <StatusBadge status={entry.status} />
      </td>
      <td className={`${cellClass} font-mono text-xs text-center`} style={{ color: C.muted }}>
        {entry.referral_count}
      </td>
      <td className={`${cellClass} font-mono text-xs`} style={{ color: C.muted }}>
        {new Date(entry.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
      <td className={`${cellClass} text-right`}>
        {rowStatus === "sent" ? (
          <span className="font-mono text-[11px]" style={{ color: C.green }}>Invited</span>
        ) : rowStatus === "error" ? (
          <span className="font-mono text-[11px]" style={{ color: C.red }}>{errMsg}</span>
        ) : entry.status === "waiting" ? (
          <button
            onClick={handleSendInvite}
            disabled={rowStatus === "sending"}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all disabled:opacity-50"
            style={{
              background: C.goldMuted,
              border: `1px solid ${C.borderGold}`,
              color: C.gold,
            }}
          >
            {rowStatus === "sending" ? (
              <span className="animate-pulse">Sending…</span>
            ) : (
              <>
                <Send className="size-3" />
                Invite
              </>
            )}
          </button>
        ) : null}
      </td>
    </tr>
  )
}

// ── Skeleton table rows ───────────────────────────────────────────────────────

function SkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b" style={{ borderColor: C.border }}>
          {[40, 200, 64, 32, 80, 60].map((w, j) => (
            <td key={j} className="px-4 py-2.5">
              <Skeleton style={{ height: 14, width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────

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

  // Batch invite
  const [batchCount, setBatchCount] = useState("")
  const [batchResult, setBatchResult] = useState<{ invited: number; failed: string[] } | null>(null)
  const [batchError, setBatchError] = useState("")
  const { mutateAsync: batchInvite, isPending: batchPending } = useBatchInvite()

  const handleBatchInvite = useCallback(async () => {
    const count = parseInt(batchCount, 10)
    if (isNaN(count) || count < 1 || count > 100) {
      setBatchError("Enter a number between 1 and 100.")
      return
    }
    setBatchError("")
    setBatchResult(null)
    try {
      const result = await batchInvite({ count })
      setBatchResult(result)
      setBatchCount("")
    } catch (e) {
      setBatchError(e instanceof Error ? e.message : "Batch invite failed.")
    }
  }, [batchCount, batchInvite])

  const STATUS_TABS: { label: string; value: typeof selectedTab }[] = [
    { label: "All", value: "all" },
    { label: "Waiting", value: "waiting" },
    { label: "Invited", value: "invited" },
    { label: "Joined", value: "joined" },
  ]

  const inputBase =
    "rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-1 transition-colors"
  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: `1px solid ${C.border}`,
    color: C.text,
  }
  const focusRingStyle = `focus:ring-[${C.borderGold}] focus:border-[${C.borderGold}]`

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-8 py-4"
        style={{
          background: "rgba(13,13,13,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="flex items-center gap-3">
          <LogoMark size={24} />
          <span className="font-heading text-base font-semibold" style={{ color: C.text }}>
            Mintmark
          </span>
          <span style={{ color: C.border }}>
            <ChevronRight className="size-3.5" />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: C.muted }}>
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px]"
            style={{ background: C.goldMuted, border: `1px solid ${C.borderGold}`, color: C.gold }}
          >
            <Shield className="size-3" />
            Admin
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-8 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: C.text }}>
            Admin Dashboard
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: C.muted }}>
            Manage the Mintmark early access waitlist
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Total"
            value={stats?.totalWaitlist}
            icon={<Users className="size-4" />}
            loading={statsLoading}
          />
          <StatCard
            label="Waiting"
            value={stats?.waitingCount}
            icon={<Clock className="size-4" />}
            accent={C.muted}
            loading={statsLoading}
          />
          <StatCard
            label="Invited"
            value={stats?.invitedCount}
            icon={<Mail className="size-4" />}
            accent={C.gold}
            loading={statsLoading}
          />
          <StatCard
            label="Joined"
            value={stats?.joinedCount}
            icon={<CheckCircle className="size-4" />}
            accent={C.green}
            loading={statsLoading}
          />
          <StatCard
            label="Users"
            value={stats?.totalUsers}
            icon={<Shield className="size-4" />}
            accent={C.green}
            loading={statsLoading}
          />
          <StatCard
            label="Pending tokens"
            value={stats?.pendingTokens}
            icon={<AlertCircle className="size-4" />}
            accent={stats?.expiredTokens ? C.red : C.muted}
            loading={statsLoading}
          />
        </div>

        {/* Config + Batch panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Config panel */}
          <div
            className="group rounded-xl p-6 space-y-4"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>
                Configuration
              </span>
            </div>
            <div className="space-y-3">
              <ConfigField
                label="Invite cap"
                configKey="invite_cap"
                currentValue={stats?.currentInviteCap}
              />
              <ConfigField
                label="Referral bonus"
                configKey="referral_bonus"
                currentValue={stats?.referralBonus}
              />
            </div>
            <p className="font-body text-xs mt-2" style={{ color: C.muted }}>
              Click the value to edit inline. Press Enter to save, Escape to cancel.
            </p>
          </div>

          {/* Batch invite panel */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-center gap-2">
              <Zap className="size-4" style={{ color: C.gold }} />
              <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: C.muted }}>
                Batch Invite
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={batchCount}
                  onChange={(e) => {
                    setBatchCount(e.target.value)
                    setBatchError("")
                    setBatchResult(null)
                  }}
                  placeholder="1–100"
                  className={`${inputBase} w-24 ${focusRingStyle}`}
                  style={inputStyle}
                  disabled={batchPending}
                />
                <button
                  onClick={handleBatchInvite}
                  disabled={batchPending || !batchCount || (stats?.waitingCount ?? 0) === 0}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: C.gold,
                    color: "#0d0d0d",
                    boxShadow: batchPending ? "none" : "0 0 16px rgba(230,195,100,0.15)",
                  }}
                >
                  {batchPending ? (
                    <span className="animate-pulse">Sending…</span>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      Send batch
                    </>
                  )}
                </button>
              </div>

              {batchCount && !isNaN(parseInt(batchCount)) && (
                <p className="font-body text-sm" style={{ color: C.muted }}>
                  This will invite the next{" "}
                  <span style={{ color: C.gold }}>{parseInt(batchCount).toLocaleString()}</span>{" "}
                  users on the waitlist.
                </p>
              )}

              {(stats?.waitingCount ?? 0) === 0 && (
                <p className="font-body text-xs" style={{ color: C.red }}>
                  No users are currently waiting.
                </p>
              )}

              {batchError && (
                <p className="font-body text-sm" style={{ color: C.red }}>{batchError}</p>
              )}

              {batchResult && (
                <div
                  className="rounded-lg p-3 space-y-1"
                  style={{ background: C.greenMuted, border: `1px solid ${C.greenBorder}` }}
                >
                  <p className="font-body text-sm font-medium" style={{ color: C.green }}>
                    {batchResult.invited} invite{batchResult.invited !== 1 ? "s" : ""} sent
                    {batchResult.failed.length > 0 && `, ${batchResult.failed.length} failed`}
                  </p>
                  {batchResult.failed.length > 0 && (
                    <div className="space-y-0.5 mt-1">
                      {batchResult.failed.map((email) => (
                        <p key={email} className="font-mono text-[11px]" style={{ color: C.red }}>
                          {email}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Waitlist table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${C.border}` }}
        >
          {/* Table header */}
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}
          >
            <div className="flex items-center gap-1">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedTab(tab.value)}
                  className="px-3 py-1.5 rounded-md font-mono text-xs transition-all"
                  style={{
                    background: selectedTab === tab.value ? C.goldMuted : "transparent",
                    color: selectedTab === tab.value ? C.gold : C.muted,
                    border: selectedTab === tab.value ? `1px solid ${C.borderGold}` : "1px solid transparent",
                  }}
                >
                  {tab.label}
                  {tab.value === "waiting" && stats?.waitingCount != null && (
                    <span className="ml-1.5 opacity-60">{stats.waitingCount}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 pointer-events-none"
                style={{ color: C.muted }}
              />
              <input
                type="text"
                placeholder="Search by email…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`${inputBase} pl-9 w-64`}
                style={{ ...inputStyle, fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)" }}>
                  {["#", "Email", "Status", "Referrals", "Joined", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-left"
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
                      className="px-4 py-10 text-center font-body text-sm"
                      style={{ color: C.muted }}
                    >
                      {searchQuery ? "No results for this search." : "No entries in this view."}
                    </td>
                  </tr>
                ) : (
                  waitlistPage.data.map((entry) => (
                    <WaitlistRow key={entry.id} entry={entry} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {waitlistPage && waitlistPage.totalPages > 1 && (
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}
            >
              <span className="font-mono text-[11px]" style={{ color: C.muted }}>
                {waitlistPage.total.toLocaleString()} total ·{" "}
                page {currentPage} of {waitlistPage.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="rounded-md p-1.5 transition-colors disabled:opacity-30"
                  style={{ color: C.muted }}
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: Math.min(5, waitlistPage.totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(waitlistPage.totalPages - 4, currentPage - 2)) + i
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className="rounded-md min-w-[28px] h-7 font-mono text-xs transition-all"
                      style={{
                        background: page === currentPage ? C.goldMuted : "transparent",
                        color: page === currentPage ? C.gold : C.muted,
                        border: page === currentPage ? `1px solid ${C.borderGold}` : "1px solid transparent",
                      }}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= waitlistPage.totalPages}
                  className="rounded-md p-1.5 transition-colors disabled:opacity-30"
                  style={{ color: C.muted }}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
