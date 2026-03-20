import type { Metadata } from "next"
import LandingPage from "@/components/landing/LandingPage"

export const metadata: Metadata = {
  title: "Mintmark — Stamp your knowledge on the internet",
  description:
    "Turn what you learn into content that builds your personal brand. LinkedIn, X, and Medium — all at once.",
  openGraph: {
    title: "Mintmark — Stamp your knowledge on the internet",
    description:
      "Turn what you learn into content that builds your personal brand. LinkedIn, X, and Medium — all at once.",
    type: "website",
  },
}

export default function Page() {
  return <LandingPage />
}
