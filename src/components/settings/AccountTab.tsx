"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { AnimatePresence, motion } from "framer-motion"
import { Lock, Trash2, User } from "lucide-react"
import { useUpdateProfile, useChangePassword, useDeleteAccount } from "@/lib/queries/settings"

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e5e2e1",
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon size={14} style={{ color: "var(--mm-gold-400)", opacity: 0.8 }} />
      <span
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Feedback line ─────────────────────────────────────────────────────────────

function Feedback({ success, error }: { success?: string; error?: string }) {
  const msg = error ?? success
  if (!msg) return null
  return (
    <AnimatePresence>
      <motion.p
        key={msg}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="font-body text-xs"
        style={{ color: error ? "#f87171" : "#4ade80" }}
      >
        {msg}
      </motion.p>
    </AnimatePresence>
  )
}

// ─── Avatar circle ─────────────────────────────────────────────────────────────

function AvatarCircle({ src, name }: { src?: string | null; name?: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: "rgba(230,195,100,0.12)", border: "1px solid rgba(230,195,100,0.2)" }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ?? "Avatar"}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = "none"
          }}
        />
      ) : (
        <span
          className="font-heading text-lg font-bold"
          style={{ color: "var(--mm-gold-400)" }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}

// ─── Profile section ───────────────────────────────────────────────────────────

interface ProfileSectionProps {
  initialName: string | null
  initialEmail: string
  initialAvatar: string | null
}

function ProfileSection({ initialName, initialEmail, initialAvatar }: ProfileSectionProps) {
  const [name, setName] = useState(initialName ?? "")
  const [avatar, setAvatar] = useState(initialAvatar ?? "")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const updateProfile = useUpdateProfile()

  async function handleSave() {
    setError("")
    setSuccess("")
    try {
      await updateProfile.mutateAsync({ name: name.trim(), avatar: avatar.trim() || undefined })
      setSuccess("Profile updated. Changes appear on next page load.")
      setTimeout(() => setSuccess(""), 4000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    }
  }

  const loading = updateProfile.isPending

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <SectionHeader icon={User} label="Profile" />

      <div className="flex items-start gap-4 mb-5">
        <AvatarCircle src={avatar || initialAvatar} name={name || initialName} />
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm text-foreground">{initialName ?? "—"}</p>
          <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
            {initialEmail}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Display name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Your name"
            className="rounded-lg px-3 py-2.5 font-body text-sm focus:outline-none w-full"
            style={inputBase}
            disabled={loading}
          />
        </div>

        {/* Avatar URL */}
        <div className="flex flex-col gap-1">
          <label
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Avatar URL{" "}
            <span style={{ color: "rgba(255,255,255,0.18)" }}>(optional)</span>
          </label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none w-full"
            style={inputBase}
            disabled={loading}
          />
        </div>

        {/* Email — read-only */}
        <div className="flex flex-col gap-1">
          <label
            className="font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Email
            <span
              className="font-mono text-[8px] rounded-full px-1.5 py-0.5"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              cannot be changed
            </span>
          </label>
          <input
            type="email"
            value={initialEmail}
            readOnly
            className="rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none w-full opacity-40 cursor-not-allowed"
            style={inputBase}
          />
        </div>

        <div className="flex items-center gap-3 mt-1">
          <motion.button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="rounded-lg px-4 py-2 font-heading text-sm font-bold text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--mm-gold-400, #e6c364)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? <span className="animate-pulse">Saving…</span> : "Save Profile"}
          </motion.button>
          <Feedback success={success} error={error} />
        </div>
      </div>
    </div>
  )
}

// ─── Security section ──────────────────────────────────────────────────────────

function SecuritySection() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const changePassword = useChangePassword()

  const mismatch = confirm.length > 0 && next !== confirm
  const loading = changePassword.isPending

  async function handleSave() {
    setError("")
    setSuccess("")
    if (next !== confirm) {
      setError("Passwords do not match.")
      return
    }
    try {
      await changePassword.mutateAsync({ currentPassword: current, newPassword: next })
      setSuccess("Password changed.")
      setCurrent("")
      setNext("")
      setConfirm("")
      setTimeout(() => setSuccess(""), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    }
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <SectionHeader icon={Lock} label="Security" />

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Current password
          </label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="rounded-lg px-3 py-2.5 font-body text-sm focus:outline-none w-full"
            style={inputBase}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            New password
          </label>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            className="rounded-lg px-3 py-2.5 font-body text-sm focus:outline-none w-full"
            style={inputBase}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="font-mono text-[9px] uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Confirm new password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="rounded-lg px-3 py-2.5 font-body text-sm focus:outline-none w-full"
            style={{
              ...inputBase,
              borderColor: mismatch ? "rgba(248,113,113,0.5)" : undefined,
            }}
            disabled={loading}
          />
          {mismatch && (
            <p className="font-body text-xs text-red-400">Passwords do not match.</p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1">
          <motion.button
            onClick={handleSave}
            disabled={loading || !current || !next || !confirm || mismatch}
            className="rounded-lg px-4 py-2 font-heading text-sm font-bold text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--mm-gold-400, #e6c364)" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? <span className="animate-pulse">Saving…</span> : "Change Password"}
          </motion.button>
          <Feedback success={success} error={error} />
        </div>
      </div>
    </div>
  )
}

// ─── Danger zone ───────────────────────────────────────────────────────────────

function DangerZone({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [error, setError] = useState("")
  const deleteAccount = useDeleteAccount()
  const confirmed = confirmText.trim().toLowerCase() === email.toLowerCase()
  const loading = deleteAccount.isPending

  async function handleDelete() {
    setError("")
    try {
      await deleteAccount.mutateAsync({ confirmation: confirmText.trim() })
      await signOut({ callbackUrl: "/" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
    }
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "rgba(239,68,68,0.03)",
        border: "1px solid rgba(239,68,68,0.15)",
      }}
    >
      <SectionHeader icon={Trash2} label="Danger Zone" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">Delete account</p>
          <p className="mt-1 font-body text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
            Permanently deletes your account and all data — sessions, notes, connections,
            API keys, and activity history. This cannot be undone.
          </p>
        </div>
        {!open && (
          <motion.button
            onClick={() => setOpen(true)}
            className="flex-shrink-0 rounded-lg px-4 py-2 font-heading text-sm font-semibold transition-colors"
            style={{
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#f87171",
              background: "transparent",
            }}
            whileHover={{ background: "rgba(239,68,68,0.08)" }}
            whileTap={{ scale: 0.97 }}
          >
            Delete account
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 20 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3">
              <div
                className="rounded-lg px-4 py-3"
                style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}
              >
                <p className="font-body text-xs leading-relaxed" style={{ color: "#fca5a5" }}>
                  Type <span className="font-mono font-semibold">{email}</span> to confirm.
                </p>
              </div>

              <input
                type="email"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={email}
                autoComplete="off"
                className="rounded-lg px-3 py-2.5 font-mono text-sm focus:outline-none w-full"
                style={{
                  background: "rgba(239,68,68,0.05)",
                  border: `1px solid ${confirmed ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.2)"}`,
                  color: "#e5e2e1",
                }}
                disabled={loading}
              />

              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleDelete}
                  disabled={!confirmed || loading}
                  className="rounded-lg px-4 py-2 font-heading text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: confirmed ? "#ef4444" : "rgba(239,68,68,0.3)",
                    color: "#fff",
                  }}
                  whileTap={confirmed ? { scale: 0.97 } : undefined}
                >
                  {loading ? (
                    <span className="animate-pulse">Deleting…</span>
                  ) : (
                    "Delete my account"
                  )}
                </motion.button>
                <button
                  onClick={() => { setOpen(false); setConfirmText(""); setError("") }}
                  disabled={loading}
                  className="font-body text-xs transition-colors hover:text-foreground"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Cancel
                </button>
              </div>

              {error && <p className="font-body text-xs text-red-400">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

interface AccountTabProps {
  initialName: string | null
  initialEmail: string
  initialAvatar: string | null
}

export function AccountTab({ initialName, initialEmail, initialAvatar }: AccountTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Account</h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Manage your profile, password, and account data.
        </p>
      </div>

      <ProfileSection
        initialName={initialName}
        initialEmail={initialEmail}
        initialAvatar={initialAvatar}
      />
      <SecuritySection />
      <DangerZone email={initialEmail} />
    </div>
  )
}
