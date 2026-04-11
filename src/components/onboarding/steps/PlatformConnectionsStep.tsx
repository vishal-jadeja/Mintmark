"use client"

export function PlatformConnectionsStep() {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-8">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Connect your platforms
      </h2>
      <p className="font-body text-sm text-muted-foreground max-w-sm">
        Link your GitHub, LinkedIn, X, and Medium accounts so Mintmark can track
        your activity and help you publish content seamlessly.
      </p>
      <p className="font-mono text-xs" style={{ color: "var(--mm-gold-400)" }}>
        OAuth connections — Phase 8.3
      </p>
    </div>
  )
}
