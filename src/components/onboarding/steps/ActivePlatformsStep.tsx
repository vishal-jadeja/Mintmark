"use client"

export function ActivePlatformsStep() {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-8">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Select posting platforms
      </h2>
      <p className="font-body text-sm text-muted-foreground max-w-sm">
        Choose which platforms you actively post on. Mintmark will tailor its
        suggestions and track your activity across your selected channels.
      </p>
      <p className="font-mono text-xs" style={{ color: "var(--mm-gold-400)" }}>
        Platform selection — Phase 8.5
      </p>
    </div>
  )
}
