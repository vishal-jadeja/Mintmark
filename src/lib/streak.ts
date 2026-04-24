export function calculateStreaks(
  activities: { activity_date: string }[]
): { current: number; longest: number } {
  const dates = [...new Set(activities.map((a) => a.activity_date))].sort()
  if (dates.length === 0) return { current: 0, longest: 0 }

  // Longest streak — sliding window
  let longest = 1
  let run = 1
  for (let i = 1; i < dates.length; i++) {
    const diff =
      (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86_400_000
    run = diff === 1 ? run + 1 : 1
    if (run > longest) longest = run
  }

  // Current streak — walk backward from today or yesterday
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0]
  const last = dates[dates.length - 1]
  if (last !== today && last !== yesterday) return { current: 0, longest }

  let current = 1
  for (let i = dates.length - 2; i >= 0; i--) {
    const diff =
      (new Date(dates[i + 1]).getTime() - new Date(dates[i]).getTime()) / 86_400_000
    if (diff === 1) current++
    else break
  }

  return { current, longest }
}
