import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Bot,
  Settings2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/notes",     label: "Notes",     Icon: FileText },
  { href: "/studio",    label: "Studio",    Icon: Sparkles },
  { href: "/assistant", label: "Assistant", Icon: Bot },
  { href: "/settings",  label: "Settings",  Icon: Settings2 },
]
