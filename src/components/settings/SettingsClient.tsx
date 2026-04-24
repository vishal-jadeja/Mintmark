"use client"

import { Suspense, useState } from "react"
import { ConnectionsTab } from "./ConnectionsTab"
import { PublishingTab } from "./PublishingTab"
import { ApiKeysTab } from "./ApiKeysTab"
import { PrivacyTab } from "./PrivacyTab"

const TABS = ["Connections", "Publishing", "AI Keys", "Privacy"] as const
type Tab = (typeof TABS)[number]

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

export function SettingsClient() {
  const [active, setActive] = useState<Tab>("Connections")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Manage your connections, publishing preferences, and account.
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-lg p-1"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="flex-1 py-2 rounded-md font-heading text-xs font-semibold transition-colors"
            style={
              active === tab
                ? { background: "rgba(230,195,100,0.12)", color: "var(--mm-gold-400)" }
                : { color: "var(--muted-foreground)" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {active === "Connections" && (
        <Suspense fallback={<ConnectionsSkeleton />}>
          <ConnectionsTab />
        </Suspense>
      )}
      {active === "Publishing" && <PublishingTab />}
      {active === "AI Keys" && <ApiKeysTab />}
      {active === "Privacy" && <PrivacyTab />}
    </div>
  )
}
