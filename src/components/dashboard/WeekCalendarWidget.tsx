"use client"

import { useState } from "react"
import type { UnifiedActivityRow } from "@/types/database"

interface Props {
  activities: UnifiedActivityRow[]
}

const SOURCE_COLORS: Record<string, string> = {
  github:   "var(--mm-green)",
  session:  "var(--mm-gold-400)",
  linkedin: "oklch(0.65 0.18 245)",
  x:        "var(--mm-neutral-300)",
  medium:   "oklch(0.72 0.18 150)",
  notes:    "var(--mm-blue)",
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function getWeekDates(): string[] {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split("T")[0]
  })
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${parseInt(m)}/${parseInt(d)}`
}

export function WeekCalendarWidget({ activities }: Props) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const weekDates = getWeekDates()
  const today = new Date().toISOString().split("T")[0]

  const actsByDate = new Map<string, UnifiedActivityRow[]>()
  for (const a of activities) {
    if (!actsByDate.has(a.activity_date)) actsByDate.set(a.activity_date, [])
    actsByDate.get(a.activity_date)!.push(a)
  }

  const hasAnyActivity = weekDates.some((d) => actsByDate.has(d))

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <h2 className="font-heading text-sm font-semibold text-foreground mb-4">
        Week at a glance
      </h2>

      {!hasAnyActivity ? (
        <p className="font-body text-sm text-muted-foreground">No activity this week yet</p>
      ) : (
        <div className="flex gap-1.5">
          {weekDates.map((date, i) => {
            const dayActs = actsByDate.get(date) ?? []
            const isToday = date === today
            const isExpanded = expandedDay === date

            return (
              <div key={date} className="flex-1 flex flex-col gap-1">
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : date)}
                  className="flex flex-col items-center gap-1.5 rounded-lg py-2.5 px-1 transition-colors w-full"
                  style={{
                    border: isToday
                      ? "1px solid rgba(230,195,100,0.40)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: isToday ? "rgba(230,195,100,0.07)" : "transparent",
                  }}
                >
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: isToday ? "var(--mm-gold-400)" : "var(--muted-foreground)" }}
                  >
                    {DAY_LABELS[i]}
                  </span>
                  <span className="font-body text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(date)}
                  </span>

                  {/* Source dots */}
                  <div className="flex flex-wrap gap-0.5 justify-center min-h-[8px]">
                    {dayActs.map((a) => (
                      <span
                        key={a.id}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: SOURCE_COLORS[a.source] ?? "var(--muted-foreground)" }}
                      />
                    ))}
                  </div>
                </button>

                {/* Expanded breakdown */}
                {isExpanded && dayActs.length > 0 && (
                  <div
                    className="rounded-lg p-2 flex flex-col gap-1"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {dayActs.map((a) => (
                      <p key={a.id} className="font-body text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
                          style={{ background: SOURCE_COLORS[a.source] ?? "var(--muted-foreground)" }}
                        />
                        {a.source === "session"
                          ? `Session · ${a.activity_count}×`
                          : `${a.source} · ${a.activity_count}`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
