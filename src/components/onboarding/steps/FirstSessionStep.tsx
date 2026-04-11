"use client"

export function FirstSessionStep() {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-8">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        Log your first session
      </h2>
      <p className="font-body text-sm text-muted-foreground max-w-sm">
        Record what you worked on today. Sessions keep your activity heatmap
        alive and give the AI context to generate relevant content ideas.
      </p>
      <p className="font-mono text-xs" style={{ color: "var(--mm-gold-400)" }}>
        Session logging — Phase 8.6
      </p>
    </div>
  )
}
