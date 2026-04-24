import type { UnifiedActivityRow } from "@/types/database"
import type { Json } from "@/types/database"

interface Props {
  activities: UnifiedActivityRow[]
}

function getWeekBounds(): { start: string; end: string } {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function getMeta(metadata: Json): { topic?: string; duration_minutes?: number } {
  if (typeof metadata === "object" && metadata !== null && !Array.isArray(metadata)) {
    return metadata as { topic?: string; duration_minutes?: number }
  }
  return {}
}

export function TopicDistribution({ activities }: Props) {
  const { start, end } = getWeekBounds()

  const sessions = activities.filter(
    (a) => a.source === "session" && a.activity_date >= start && a.activity_date <= end
  )

  const topicMap = new Map<string, number>()
  for (const s of sessions) {
    const meta = getMeta(s.metadata)
    if (meta.topic && meta.duration_minutes) {
      topicMap.set(meta.topic, (topicMap.get(meta.topic) ?? 0) + meta.duration_minutes)
    }
  }

  const sorted = [...topicMap.entries()].sort((a, b) => b[1] - a[1])
  const top5 = sorted.slice(0, 5)
  const hasMore = sorted.length > 5
  const maxDuration = top5[0]?.[1] ?? 1

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <h2 className="font-heading text-sm font-semibold text-foreground mb-4">
        Where your time went this week
      </h2>

      {top5.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground">
          Log a session to see your topic breakdown
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {top5.map(([topic, minutes]) => {
            const pct = Math.round((minutes / maxDuration) * 100)
            return (
              <div key={topic} className="flex items-center gap-3">
                <span
                  className="font-body text-sm text-foreground truncate"
                  style={{ minWidth: "8rem", maxWidth: "12rem" }}
                >
                  {topic}
                </span>
                <div className="flex-1 h-2 rounded-full" style={{ background: "var(--mm-neutral-800)" }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${pct}%`, background: "var(--mm-gold-400)" }}
                  />
                </div>
                <span
                  className="font-mono text-xs flex-shrink-0"
                  style={{ color: "var(--muted-foreground)", minWidth: "3.5rem", textAlign: "right" }}
                >
                  {formatDuration(minutes)}
                </span>
              </div>
            )
          })}

          {hasMore && (
            <p className="font-body text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              +{sorted.length - 5} more topics
            </p>
          )}
        </div>
      )}
    </div>
  )
}
