"use client"

import { useState, useMemo } from "react"
import type { UnifiedActivityRow } from "@/types/database"

interface Props {
  activities: UnifiedActivityRow[]
  streak: { current: number; longest: number }
}

const CELL = 14
const GAP = 2
const STEP = CELL + GAP
const WEEKS = 52
const DAYS = 7
const WIDTH = WEEKS * STEP
const HEIGHT = DAYS * STEP
const LABEL_HEIGHT = 20

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

const SOURCE_LABELS: Record<string, string> = {
  github: "GitHub",
  session: "Sessions",
  linkedin: "LinkedIn",
  x: "X",
  medium: "Medium",
  notes: "Notes",
}

function getSundayGrid(): string[] {
  // Most recent Sunday (start of current week or today if Sunday)
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const latest = new Date(now)
  latest.setDate(now.getDate() - day)
  latest.setHours(0, 0, 0, 0)

  // Go back 51 more weeks from that Sunday
  const start = new Date(latest)
  start.setDate(latest.getDate() - 51 * 7)

  const dates: string[] = []
  const cursor = new Date(start)
  for (let i = 0; i < WEEKS * DAYS; i++) {
    dates.push(cursor.toISOString().split("T")[0])
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

function getMonthLabels(dates: string[]): { label: string; x: number }[] {
  const labels: { label: string; x: number }[] = []
  let lastMonth = -1
  for (let w = 0; w < WEEKS; w++) {
    const date = dates[w * 7]
    const m = new Date(date).getMonth()
    if (m !== lastMonth) {
      labels.push({ label: MONTH_NAMES[m], x: w * STEP })
      lastMonth = m
    }
  }
  return labels
}

export function HeatmapWidget({ activities, streak }: Props) {
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; date: string; lines: string[]
  } | null>(null)

  const dates = useMemo(() => getSundayGrid(), [])
  const monthLabels = useMemo(() => getMonthLabels(dates), [dates])

  const sources = useMemo(() => {
    const s = new Set(activities.map((a) => a.source))
    return [...s]
  }, [activities])

  // Build per-date max-intensity map (filtered by activeSource)
  const intensityMap = useMemo(() => {
    const map = new Map<string, number>()
    const filtered = activeSource
      ? activities.filter((a) => a.source === activeSource)
      : activities
    for (const a of filtered) {
      map.set(a.activity_date, Math.max(map.get(a.activity_date) ?? 0, a.intensity))
    }
    return map
  }, [activities, activeSource])

  // Build per-date source breakdown for tooltips
  const breakdownMap = useMemo(() => {
    const map = new Map<string, UnifiedActivityRow[]>()
    for (const a of activities) {
      if (!map.has(a.activity_date)) map.set(a.activity_date, [])
      map.get(a.activity_date)!.push(a)
    }
    return map
  }, [activities])

  function handleMouseEnter(
    e: React.MouseEvent<SVGRectElement>,
    date: string,
    svgX: number,
    svgY: number
  ) {
    const rows = breakdownMap.get(date)
    if (!rows) {
      setTooltip(null)
      return
    }
    const d = new Date(date + "T00:00:00")
    const label = d.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    const lines = rows.map((r) => {
      const src = SOURCE_LABELS[r.source] ?? r.source
      return `${r.activity_count} ${src}`
    })
    setTooltip({ x: svgX, y: svgY, date, lines: [label, ...lines] })
  }

  function cellColor(intensity: number): string {
    if (intensity === 0) return "var(--activity-empty)"
    return `var(--activity-${intensity})`
  }

  const hasData = activities.length > 0

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          Activity heatmap
        </h2>
        {streak.current > 0 && (
          <span className="font-mono text-xs" style={{ color: "var(--mm-gold-400)" }}>
            🔥 {streak.current}-day streak
          </span>
        )}
      </div>

      {/* SVG grid */}
      <div className="overflow-x-auto">
        <div style={{ position: "relative", display: "inline-block" }}>
          <svg
            width={WIDTH}
            height={LABEL_HEIGHT + HEIGHT}
            style={{ display: "block" }}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Month labels */}
            {monthLabels.map(({ label, x }) => (
              <text
                key={`${label}-${x}`}
                x={x}
                y={12}
                className="font-mono"
                style={{
                  fontSize: "10px",
                  fill: "var(--muted-foreground)",
                  fontFamily: "var(--mm-font-mono)",
                }}
              >
                {label}
              </text>
            ))}

            {/* Cells */}
            {dates.map((date, i) => {
              const week = Math.floor(i / 7)
              const weekday = i % 7
              const cx = week * STEP
              const cy = LABEL_HEIGHT + weekday * STEP
              const intensity = intensityMap.get(date) ?? 0

              return (
                <rect
                  key={date}
                  x={cx}
                  y={cy}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={cellColor(intensity)}
                  style={{ cursor: intensity > 0 ? "pointer" : "default" }}
                  onMouseEnter={(e) => handleMouseEnter(e, date, cx, cy)}
                />
              )
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              style={{
                position: "absolute",
                left: Math.min(tooltip.x, WIDTH - 140),
                top: Math.max(tooltip.y - 70, 0),
                background: "rgba(24,22,20,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "6px",
                padding: "6px 10px",
                pointerEvents: "none",
                zIndex: 10,
                minWidth: "120px",
              }}
            >
              {tooltip.lines.map((line, i) => (
                <p
                  key={i}
                  className={i === 0 ? "font-heading text-xs font-semibold text-foreground" : "font-body text-xs text-muted-foreground"}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
        {/* Source filter pills */}
        {sources.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {sources.map((src) => {
              const active = activeSource === null || activeSource === src
              return (
                <button
                  key={src}
                  onClick={() => setActiveSource(activeSource === src ? null : src)}
                  className="rounded-full px-2.5 py-0.5 font-mono text-[10px] transition-colors"
                  style={{
                    background: active ? "rgba(230,195,100,0.12)" : "rgba(255,255,255,0.04)",
                    border: active
                      ? "1px solid rgba(230,195,100,0.30)"
                      : "1px solid rgba(255,255,255,0.07)",
                    color: active ? "var(--mm-gold-400)" : "var(--muted-foreground)",
                  }}
                >
                  {SOURCE_LABELS[src] ?? src}
                </button>
              )
            })}
          </div>
        )}

        {streak.longest > 0 && (
          <span className="font-mono text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            Longest: {streak.longest} days
          </span>
        )}
      </div>

      {/* Empty overlay */}
      {!hasData && (
        <p className="mt-3 font-body text-sm text-center text-muted-foreground">
          Connect GitHub or log a session to start your heatmap
        </p>
      )}
    </div>
  )
}
