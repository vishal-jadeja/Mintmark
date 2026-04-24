import Link from "next/link"

export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 py-16 text-center">
      {/* Inline SVG — calendar grid outline */}
      <svg
        width="80"
        height="72"
        viewBox="0 0 80 72"
        fill="none"
        aria-hidden
        style={{ opacity: 0.35 }}
      >
        {/* Calendar frame */}
        <rect x="4" y="12" width="72" height="56" rx="6" stroke="var(--mm-gold-400)" strokeWidth="2" />
        {/* Header bar */}
        <rect x="4" y="12" width="72" height="16" rx="6" fill="var(--mm-gold-400)" fillOpacity="0.15" />
        {/* Top clips */}
        <rect x="4" y="20" width="72" height="8" fill="var(--mm-gold-400)" fillOpacity="0.08" />
        {/* Pin left */}
        <rect x="22" y="4" width="4" height="16" rx="2" fill="var(--mm-gold-400)" fillOpacity="0.5" />
        {/* Pin right */}
        <rect x="54" y="4" width="4" height="16" rx="2" fill="var(--mm-gold-400)" fillOpacity="0.5" />
        {/* Grid cells — 5 cols × 4 rows */}
        {[0, 1, 2, 3, 4].map((col) =>
          [0, 1, 2, 3].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={10 + col * 14}
              y={34 + row * 12}
              width="10"
              height="8"
              rx="2"
              fill="var(--mm-gold-400)"
              fillOpacity={0.06 + (col + row) * 0.025}
            />
          ))
        )}
      </svg>

      <div>
        <p className="font-heading text-base font-semibold text-foreground">
          Connect GitHub or log a session to start your heatmap
        </p>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Your activity will show up here as you build.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/settings"
          className="rounded-lg px-5 py-2.5 font-heading text-sm font-bold text-neutral-950 transition-opacity hover:opacity-90"
          style={{ background: "var(--mm-gold-400)", boxShadow: "0 0 20px rgba(230,195,100,0.15)" }}
        >
          Connect GitHub
        </Link>
        <Link
          href="/onboarding"
          className="rounded-lg px-5 py-2.5 font-heading text-sm font-semibold transition-colors hover:text-foreground"
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            color: "var(--muted-foreground)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          Log a session
        </Link>
      </div>
    </div>
  )
}
