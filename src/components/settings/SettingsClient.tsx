"use client"

import { Suspense, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link2, Send, KeyRound, Shield, User } from "lucide-react"
import { ConnectionsTab } from "./ConnectionsTab"
import { PublishingWidget } from "../dashboard/PublishingWidget"
import { ApiKeysTab } from "./ApiKeysTab"
import { PrivacyTab } from "./PrivacyTab"
import { AccountTab } from "./AccountTab"

const TABS = [
  { id: "Account"     as const, label: "Account",     Icon: User,     sub: "Profile & security" },
  { id: "Connections" as const, label: "Connections", Icon: Link2,    sub: "Platforms & OAuth" },
  { id: "Publishing"  as const, label: "Publishing",  Icon: Send,     sub: "AI tone & instructions" },
  { id: "AI Keys"     as const, label: "AI Keys",     Icon: KeyRound, sub: "LLM provider keys" },
  { id: "Privacy"     as const, label: "Privacy",     Icon: Shield,   sub: "Data controls" },
]

type Tab = (typeof TABS)[number]["id"]

const DEFAULT_TAB: Tab = "Account"

function ConnectionsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-lg animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      ))}
    </div>
  )
}

interface SettingsClientProps {
  initialName: string | null
  initialEmail: string
  initialAvatar: string | null
}

export function SettingsClient({ initialName, initialEmail, initialAvatar }: SettingsClientProps) {
  const [active, setActive] = useState<Tab>(DEFAULT_TAB)

  return (
    <div className="flex min-h-full">
      {/* ── Left sidebar nav ────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{
          width: "220px",
          background: "rgba(255,255,255,0.01)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="px-5 py-7" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            Settings
          </p>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
          {TABS.map(({ id, label, Icon, sub }) => {
            const isActive = active === id
            return (
              <motion.button
                key={id}
                onClick={() => setActive(id)}
                className="flex items-center gap-3 w-full text-left rounded-lg px-3 py-3 transition-colors"
                whileHover={{ x: isActive ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                style={{
                  background: isActive ? "rgba(230,195,100,0.08)" : "transparent",
                  color: isActive ? "var(--mm-gold-400)" : "var(--muted-foreground)",
                  borderLeft: `2px solid ${isActive ? "var(--mm-gold-400)" : "transparent"}`,
                }}
              >
                <Icon size={15} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.65 }} />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-heading text-sm font-semibold leading-tight">
                    {label}
                  </span>
                  <span
                    className="font-body text-xs truncate"
                    style={{
                      color: isActive ? "rgba(230,195,100,0.5)" : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {sub}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </nav>
      </aside>

      {/* ── Main content ────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile tab strip */}
        <div
          className="md:hidden flex gap-1 p-1 mx-4 mt-4 rounded-lg"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-heading text-xs font-semibold transition-colors"
              style={
                active === id
                  ? { background: "rgba(230,195,100,0.12)", color: "var(--mm-gold-400)" }
                  : { color: "var(--muted-foreground)" }
              }
            >
              <Icon size={13} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="flex-1 p-6 md:p-10" style={{ maxWidth: "720px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {active === "Account" && (
                <AccountTab
                  initialName={initialName}
                  initialEmail={initialEmail}
                  initialAvatar={initialAvatar}
                />
              )}
              {active === "Connections" && (
                <Suspense fallback={<ConnectionsSkeleton />}>
                  <ConnectionsTab />
                </Suspense>
              )}
              {active === "Publishing" && <PublishingWidget />}
              {active === "AI Keys" && <ApiKeysTab />}
              {active === "Privacy" && <PrivacyTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
