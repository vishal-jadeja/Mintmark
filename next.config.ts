import type { NextConfig } from "next"

const securityHeaders = [
  // Force HTTPS for 2 years; preload-eligible
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow embedding in iframes from other origins
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Legacy XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Only send origin on cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny access to sensitive browser features
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },

  images: {
    remotePatterns: [
      // GitHub avatars (profile photos from OAuth connect)
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // Google / Gmail profile photos
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // LinkedIn profile photos
      { protocol: "https", hostname: "media.licdn.com" },
    ],
  },
}

export default nextConfig
