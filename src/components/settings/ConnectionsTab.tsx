"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { useConnections, useDisconnect } from "@/lib/queries/connections"
import api from "@/lib/axios"
import type { Platform } from "@/types/database"

// ─── Icons ────────────────────────────────────────────────────────────────────

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function GmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.908 1.528-1.147C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  )
}

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

// ─── Backfill polling ─────────────────────────────────────────────────────────

type BackfillStatus = "idle" | "pending" | "complete"

function useBackfillPoll(githubConnected: boolean) {
  const [status, setStatus] = useState<BackfillStatus>("idle")
  const [syncedDays, setSyncedDays] = useState(0)
  const attemptsRef = useRef(0)
  const MAX_ATTEMPTS = 5

  useEffect(() => {
    if (!githubConnected || status === "complete") return
    attemptsRef.current = 0

    const poll = async () => {
      if (attemptsRef.current >= MAX_ATTEMPTS) return
      attemptsRef.current++
      try {
        const { data } = await api.get<{ status: string; synced_days: number }>(
          "/api/connections/github/backfill-status"
        )
        if (data.status === "complete") {
          setStatus("complete")
          setSyncedDays(data.synced_days ?? 0)
          return
        }
        setStatus("pending")
      } catch {
        // non-fatal
      }
    }

    poll()
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [githubConnected, status])

  return { status, syncedDays }
}

function BackfillChip({ status, syncedDays }: { status: BackfillStatus; syncedDays: number }) {
  if (status === "idle") return null
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs"
        style={
          status === "complete"
            ? {
                background: "rgba(230,195,100,0.12)",
                color: "var(--mm-gold-400, #e6c364)",
                border: "1px solid rgba(230,195,100,0.25)",
              }
            : {
                background: "rgba(255,255,255,0.06)",
                color: "var(--muted-foreground)",
                border: "1px solid rgba(255,255,255,0.1)",
              }
        }
      >
        {status === "complete" ? (
          `${syncedDays} days synced ✓`
        ) : (
          <>
            <span className="animate-pulse">●</span> Syncing commits…
          </>
        )}
      </motion.span>
    </AnimatePresence>
  )
}

// ─── Platform card ────────────────────────────────────────────────────────────

interface ProfileData {
  username?: string
  display_name?: string
  avatar_url?: string | null
}

interface PlatformCardProps {
  platform: Platform
  meta: { name: string; description: string; authorizeUrl: string; icon: React.ReactNode }
  connected: boolean
  profile: ProfileData | null
  onDisconnect: () => void
  disconnecting: boolean
  chip?: React.ReactNode
}

function PlatformCard({
  meta,
  connected,
  profile,
  onDisconnect,
  disconnecting,
  chip,
}: PlatformCardProps) {
  return (
    <div
      className="rounded-lg p-4 flex items-start gap-3 transition-colors"
      style={{
        background: connected ? "rgba(230,195,100,0.06)" : "rgba(255,255,255,0.03)",
        border: connected
          ? "1px solid rgba(230,195,100,0.2)"
          : "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="mt-0.5 flex-shrink-0 rounded-md p-2"
        style={{
          background: "rgba(255,255,255,0.05)",
          color: connected ? "var(--mm-gold-400, #e6c364)" : "var(--muted-foreground)",
        }}
      >
        {meta.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-heading text-sm font-semibold text-foreground">{meta.name}</span>

          {connected ? (
            <div className="flex items-center gap-2">
              {profile?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt="" className="w-5 h-5 rounded-full" />
              )}
              <span className="font-mono text-xs" style={{ color: "var(--mm-gold-400)" }}>
                {profile?.username ? `@${profile.username}` : "Connected"}
              </span>
              <button
                onClick={onDisconnect}
                disabled={disconnecting}
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {disconnecting ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
          ) : (
            <a
              href={meta.authorizeUrl}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-heading text-xs font-bold text-neutral-950 transition-opacity hover:opacity-90"
              style={{ background: "var(--mm-gold-400, #e6c364)" }}
            >
              Connect {meta.name}
            </a>
          )}
        </div>

        {chip && <div className="mt-2">{chip}</div>}

        <p className="mt-1 font-body text-xs text-muted-foreground leading-relaxed">
          {meta.description}
        </p>
      </div>
    </div>
  )
}

// ─── Platform list ────────────────────────────────────────────────────────────

const ALL_PLATFORMS: Array<{
  platform: Platform
  meta: { name: string; description: string; authorizeUrl: string; icon: React.ReactNode }
}> = [
  {
    platform: "github",
    meta: {
      name: "GitHub",
      description: "Feeds your heatmap with 90 days of commit history.",
      authorizeUrl: "/api/connections/github/authorize",
      icon: <GitHubIcon />,
    },
  },
  {
    platform: "gmail",
    meta: {
      name: "Gmail",
      description:
        "Surfaces newsletters and important threads. Read-only — Mintmark never sends email on your behalf.",
      authorizeUrl: "/api/connections/gmail/authorize",
      icon: <GmailIcon />,
    },
  },
  {
    platform: "linkedin",
    meta: {
      name: "LinkedIn",
      description: "Publish content directly from Content Studio. Up to 3,000 characters.",
      authorizeUrl: "/api/connections/linkedin/authorize",
      icon: <LinkedInIcon />,
    },
  },
  {
    platform: "x",
    meta: {
      name: "X",
      description: "Publish 280-character posts directly from Content Studio.",
      authorizeUrl: "/api/connections/x/authorize",
      icon: <XIcon />,
    },
  },
  {
    platform: "medium",
    meta: {
      name: "Medium",
      description: "Publish long-form articles directly from Content Studio.",
      authorizeUrl: "/api/connections/medium/authorize",
      icon: <MediumIcon />,
    },
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function ConnectionsTab() {
  const searchParams = useSearchParams()
  const [errorToast, setErrorToast] = useState<string | null>(null)

  const { data: connections = [], isLoading } = useConnections()
  const { mutate: disconnect, isPending: disconnecting, variables: disconnectingPlatform } =
    useDisconnect()

  const connectedSet = new Set(connections.map((c) => c.platform))
  const githubConnected = connectedSet.has("github")
  const { status: backfillStatus, syncedDays } = useBackfillPoll(githubConnected)

  const profileFor = (platform: Platform): ProfileData | null => {
    const conn = connections.find((c) => c.platform === platform)
    return conn ? (conn.profile_data as ProfileData) : null
  }

  useEffect(() => {
    if (searchParams.get("error") === "connection_failed") {
      setErrorToast("Connection failed. Please try again.")
      const t = setTimeout(() => setErrorToast(null), 5000)
      return () => clearTimeout(t)
    }
  }, [searchParams])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Platform Connections
        </h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Connect and manage your accounts. GitHub and Gmail feed your heatmap. LinkedIn,
          X, and Medium publish your content.
        </p>
      </div>

      <AnimatePresence>
        {errorToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-md px-4 py-2.5 font-body text-sm text-red-400"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {errorToast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            ))}
          </>
        ) : (
          ALL_PLATFORMS.map(({ platform, meta }) => (
            <PlatformCard
              key={platform}
              platform={platform}
              meta={meta}
              connected={connectedSet.has(platform)}
              profile={profileFor(platform)}
              onDisconnect={() => disconnect(platform)}
              disconnecting={disconnecting && disconnectingPlatform === platform}
              chip={
                platform === "github" && githubConnected ? (
                  <BackfillChip status={backfillStatus} syncedDays={syncedDays} />
                ) : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
