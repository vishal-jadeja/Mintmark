"use client"

const PLANNED_CONTROLS = [
  "View all tracked data by category",
  "Export your data as JSON",
  "Delete data by time period or source",
] as const

export function PrivacyTab() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Data & Privacy</h2>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Full data controls are coming in Phase 2. Every piece of data Mintmark tracks is
          viewable, exportable, and deletable — on your schedule.
        </p>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {PLANNED_CONTROLS.map((label, i) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-4"
            style={{
              borderBottom:
                i < PLANNED_CONTROLS.length - 1
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "none",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <span className="font-body text-sm" style={{ color: "var(--muted-foreground)" }}>
              {label}
            </span>
            <span
              className="font-mono text-xs rounded-md px-2.5 py-1"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "var(--muted-foreground)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Phase 2
            </span>
          </div>
        ))}
      </div>

      <p className="font-body text-xs" style={{ color: "var(--muted-foreground)" }}>
        Nothing is shared without your knowledge. Raw browsing data never leaves your device.
        OAuth tokens are encrypted with AES-256 before storage. You can revoke any connection
        at any time from the Connections tab.
      </p>
    </div>
  )
}
