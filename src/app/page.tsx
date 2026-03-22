import type { Metadata } from "next"
import LandingPage from "@/components/landing/LandingPage"
import { FAQS_DATA } from "@/lib/faq-data"

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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS_DATA.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingPage />
    </>
  )
}
