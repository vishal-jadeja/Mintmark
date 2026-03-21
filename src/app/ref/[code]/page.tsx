"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function RefPage() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()

  useEffect(() => {
    // httpOnly: false — must be set client-side so WaitlistForm can read it
    const maxAge = 60 * 60 * 24 * 30 // 30 days
    document.cookie = `referral_code=${encodeURIComponent(code)}; max-age=${maxAge}; path=/; samesite=lax`
    router.replace("/")
  }, [code, router])

  return null
}
