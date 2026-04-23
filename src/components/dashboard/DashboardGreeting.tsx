interface Props {
  name: string | null
  streak: { current: number; longest: number }
  hasData: boolean
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

export function DashboardGreeting({ name, streak, hasData }: Props) {
  const greeting = `${getGreeting()}${name ? `, ${name.split(" ")[0]}` : ""}`

  let subline: string
  if (streak.current > 0) {
    subline = `You're on a ${streak.current}-day streak. Keep it going.`
  } else if (hasData) {
    subline = "Welcome back. Here's where things stand."
  } else {
    subline = "Let's get your first day on the board."
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">{greeting}</h1>
      <p className="mt-0.5 font-body text-sm text-muted-foreground">{subline}</p>
    </div>
  )
}
