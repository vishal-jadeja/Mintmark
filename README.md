<div align="center">

<!-- Replace with your actual logo -->
<img src="https://mintmark-vishal.vercel.app/mintmark-logo.png" alt="Mintmark Logo" width="100" height="100" style="border-radius: 20px;" />

<br />
<br />

# Mintmark

**Stamp your knowledge on the internet.**

Mintmark is a personal branding and productivity platform that turns what you learn into content that builds your public presence — automatically, across LinkedIn, X, and Medium.

<br />

<!-- Replace with actual screenshot -->
<img src="https://placehold.co/1200x630/0a0a0a/d4af37?text=Mintmark+Dashboard+Screenshot&font=montserrat" alt="Mintmark Dashboard" width="100%" style="border-radius: 12px;" />

<br />
<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Early%20Access-d4af37?style=flat-square)]()

<br />

[**Request Early Access**](https://mintmark-vishal.vercel.app) · [Report a Bug](https://github.com/vishal-jadeja/mintmark/issues) · [Request a Feature](https://github.com/vishal-jadeja/mintmark/issues)

</div>

---

## Table of Contents

- [What is Mintmark](#what-is-mintmark)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## What is Mintmark

Most people learn constantly — from YouTube, articles, their own work, their own notes — but never share it publicly. The knowledge disappears. Mintmark fixes that.

You paste what you learned. Mintmark generates a LinkedIn post, an X tweet, and a Medium article — all at once, all formatted to the rules you set for each platform. You review, edit, and publish directly from Mintmark. Over time, it builds a complete picture of your knowledge, what you post about, and what performs well.

The name comes from a **mintmark** — the tiny stamp a mint presses onto a coin to certify it's real, authentic, and came from a specific source. Mintmark helps you stamp your authentic knowledge and identity onto the internet.

> **Core philosophy:** The app should work even when you do nothing manually. Passive-first, intelligence layer on top of your entire digital life.

---

## Features

### ✦ Content Studio

> **Input once. Publish everywhere.**

<!-- Replace with actual screenshot -->
<img src="https://placehold.co/1200x600/111111/d4af37?text=Content+Studio+Screenshot&font=montserrat" alt="Content Studio" width="100%" />

<br />

Paste what you learned — a YouTube video, an article, a personal experience — and Mintmark generates posts for all three platforms simultaneously, each formatted to your own rules.

- **Per-platform AI instructions** — define your own tone, format, length, and style rules per platform. LinkedIn gets professional storytelling. X gets a punchy hook. Medium gets depth.
- **Parallel generation** — all three platforms generated at once via `Promise.all`, streamed to the UI so it feels instant.
- **Inline editing** — edit any generated post before publishing. Your changes are saved as a draft; nothing publishes without your explicit action.
- **One-click publish** — connected platforms publish directly from Mintmark.
- **BYOK AI** — bring your own API key (Anthropic, OpenAI, Gemini, or Groq). Mintmark never pays for your AI calls.

---

### ✦ Unified Heatmap

> **Every form of progress. One view.**

<!-- Replace with actual screenshot -->
<img src="https://placehold.co/1200x400/111111/d4af37?text=Unified+Heatmap+Screenshot&font=montserrat" alt="Unified Heatmap" width="100%" />

<br />

A single GitHub-style contribution heatmap that visualizes everything you do — across every connected platform — in one unified grid.

| Source                | What counts                 |
| --------------------- | --------------------------- |
| GitHub                | Commits, PRs, reviews       |
| LeetCode              | Problems solved             |
| YouTube               | Videos watched >50%         |
| LinkedIn / X / Medium | Posts published             |
| Notes                 | Notes created or updated    |
| Sessions              | Manual work sessions logged |
| VS Code               | Coding time (via extension) |

One square = one calendar day. Color intensity (0–4) = how much work you did that day. Hover for a breakdown. Filter by source. Navigate by year. Your streak updates in real time.

---

### ✦ AI Assistant

> **Chat with everything you know.**

<!-- Replace with actual screenshot -->
<img src="https://placehold.co/1200x600/111111/d4af37?text=AI+Assistant+Screenshot&font=montserrat" alt="AI Assistant" width="100%" />

<br />

A personal knowledge assistant that answers questions using your own notes, posts, and activity as context — not the general internet.

- _"What do I know about system design?"_
- _"Have I written any notes about React hooks?"_
- _"Suggest a topic I should post about based on what I've been learning."_
- _"Summarize what I've been learning this month."_

Built on a RAG pipeline using pgvector. Every answer shows which notes it cited. Strictly scoped to your data — never cross-tenant, never hallucinated context.

---

### ✦ Notion Sync

> **Your Notion knowledge base. In Mintmark. In sync.**

Two-way sync between Mintmark notes and your Notion workspace. Pull pages in. Push notes back. Conflicts are flagged — never silently overwritten. Runs every 30 minutes via background job.

---

### ✦ Productivity Suite

<!-- Replace with actual screenshot -->
<img src="https://placehold.co/1200x500/111111/d4af37?text=Dashboard+Widgets+Screenshot&font=montserrat" alt="Productivity Widgets" width="100%" />

<br />

A modular widget dashboard you control. Show what you need, hide what you don't.

- **Pomodoro timer** — focus sessions with configurable intervals
- **Stopwatch** — track time against any task
- **Spotify embed** — music without leaving the tab
- **Quick notes** — frictionless capture
- **Manual session logger** — log offline work ("worked on X for 90 min"), AI auto-tags topics, feeds into the heatmap

---

### ✦ Early Access System

Waitlist landing page with referral-based queue movement (each referral moves you up 5 positions, minimum position 1), invite-only signup with single-use token verification (48-hour expiry), configurable invite cap adjustable at runtime via the admin dashboard (stored in `system_config` DB table — no redeploy needed), and an admin panel for individual and batch approvals.

---

## Screenshots

<table>
  <tr>
    <td width="50%">
      <!-- Replace with actual screenshot -->
      <img src="https://placehold.co/600x400/111111/d4af37?text=Dashboard+View&font=montserrat" alt="Dashboard" width="100%" />
      <p align="center"><sub>Dashboard</sub></p>
    </td>
    <td width="50%">
      <!-- Replace with actual screenshot -->
      <img src="https://placehold.co/600x400/111111/d4af37?text=Content+Studio&font=montserrat" alt="Content Studio" width="100%" />
      <p align="center"><sub>Content Studio</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <!-- Replace with actual screenshot -->
      <img src="https://placehold.co/600x400/111111/d4af37?text=AI+Assistant&font=montserrat" alt="AI Assistant" width="100%" />
      <p align="center"><sub>AI Assistant</sub></p>
    </td>
    <td width="50%">
      <!-- Replace with actual screenshot -->
      <img src="https://placehold.co/600x400/111111/d4af37?text=Heatmap+View&font=montserrat" alt="Unified Heatmap" width="100%" />
      <p align="center"><sub>Unified Heatmap</sub></p>
    </td>
  </tr>
</table>

---

## Current Status

Phase 1 — Early Access. Waitlist open.

- [x] Waitlist landing page with referral tracking
- [x] Referral queue mechanics (each referral = move up 5 spots, min position 1)
- [x] Configurable invite cap (runtime-adjustable via `system_config` table)
- [x] Email infrastructure (Brevo + React Email templates)
- [x] State management (TanStack Query v5 + Zustand v5)
- [x] Invite acceptance page (`/invite/[token]`) — single-use token, 48h expiry
- [x] Login page with NextAuth.js v5 Credentials provider
- [x] Admin dashboard (`/admin`) — waitlist management, individual + batch invites, inline config editor
- [x] Onboarding: database schema extension (`api_keys`, `platform_connections`, `platform_instructions`, `unified_activity`, `topic_nodes`)
- [x] Onboarding: routing + 4-step wizard shell (Zustand store, progress indicator, proxy protection for `/onboarding` and `/dashboard`)
- [ ] Onboarding: platform OAuth connections (GitHub, LinkedIn, X, Medium) + GitHub commit backfill
- [ ] Onboarding: active platforms, per-platform AI instructions, BYOK API key
- [ ] Dashboard scaffold (heatmap widget, week calendar, streak, empty state)
- [ ] Main app (Content Studio, AI Assistant, Notes)

---

## Tech Stack

| Layer                     | Technology                                               |
| ------------------------- | -------------------------------------------------------- |
| **Framework**             | Next.js 16.2 + React 19.2 + TypeScript                   |
| **Styling**               | Tailwind CSS v4 + shadcn/ui                              |
| **Animations**            | Framer Motion                                            |
| **State Management**      | TanStack Query v5 (server state) · Zustand v5 (UI state) |
| **HTTP Client**           | Axios (shared instance, `withCredentials: true`)         |
| **Auth**                  | NextAuth.js v5 beta (Credentials provider, JWT strategy) |
| **Database**              | Supabase (PostgreSQL + pgvector + RLS)                   |
| **Storage**               | Supabase Storage                                         |
| **Background Jobs**       | Trigger.dev v3                                           |
| **Cache + Rate Limiting** | Upstash Redis                                            |
| **AI Adapter**            | Unified BYOK layer — Anthropic, OpenAI, Gemini, Groq     |
| **Email**                 | Brevo (React Email templates)                            |
| **Deployment**            | Vercel (frontend) + Supabase (backend)                   |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- An Upstash Redis database
- A Brevo account (for transactional email)

### Installation

```bash
# Clone the repository
git clone https://github.com/vishal-jadeja/mintmark.git
cd mintmark

# Install dependencies
npm install

# Copy the environment variable template
cp .env.example .env.local
```

Fill in your environment variables (see [Environment Variables](#environment-variables) below), then run the SQL in `supabase/schema.sql` against your Supabase project, and start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file at the project root. Never commit this file.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key

# Auth (NextAuth.js v5)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here        # openssl rand -hex 32

# Encryption (AES-256 for sensitive data)
ENCRYPTION_KEY=your_64_hex_char_key_here         # openssl rand -hex 32

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=notifications@yourdomain.com

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# App URL (used in email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Platform OAuth (add the ones you want to enable — Phase 2+)
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
MEDIUM_CLIENT_ID=
MEDIUM_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
```

> **Security note:** `SUPABASE_SECRET_KEY`, `NEXTAUTH_SECRET`, and `ENCRYPTION_KEY` are server-only. They must never reach the client bundle — never prefix them with `NEXT_PUBLIC_`.

---

## Database Setup

Mintmark uses Supabase with Row Level Security enabled on every table. Apply the schema by running the SQL in `supabase/schema.sql` in your Supabase project's SQL editor.

The schema is a single cumulative file — run it top-to-bottom on a fresh project. Re-running it is safe; all statements use `CREATE IF NOT EXISTS` / `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

### Key tables

| Table           | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| `users`                   | Authenticated user records (created on invite acceptance)          |
| `user_settings`           | Per-user preferences (theme, timezone, active platforms, onboarding state) |
| `waitlist`                | Early access signups with referral codes and queue position        |
| `invite_tokens`           | Single-use invite tokens (48h expiry)                              |
| `system_config`           | Runtime-editable config (`invite_cap`, `referral_bonus`)           |
| `api_keys`                | BYOK AI keys per provider (AES-256-GCM encrypted at rest)          |
| `platform_connections`    | OAuth tokens per connected platform (encrypted at rest)            |
| `platform_instructions`   | Per-platform AI tone, format, and instruction preferences          |
| `unified_activity`        | Single source of truth for heatmap + calendar (all sources)        |
| `topic_nodes`             | Knowledge graph nodes built up by the intelligence layer           |

### Key database functions

| Function                   | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `generate_referral_code()` | Trigger — auto-generates unique 8-char referral code    |
| `get_waitlist_position()`  | Returns effective queue position accounting for bonuses |
| `accept_invite_account()`  | Atomically creates user + settings + marks token used   |
| `get_admin_waitlist()`     | Paginated waitlist with referral counts (no N+1)        |

---

## Project Structure

```
mintmark/
├── src/
│   ├── app/
│   │   ├── admin/              # Admin dashboard (role-protected)
│   │   ├── invite/[token]/     # Invite acceptance page
│   │   ├── login/              # Login page (NextAuth)
│   │   ├── onboarding/         # 4-step onboarding wizard (layout + page)
│   │   ├── ref/[code]/         # Referral code tracking
│   │   ├── api/
│   │   │   ├── auth/           # NextAuth handlers + verify-token + accept-invite
│   │   │   ├── admin/          # Admin API routes (stats, waitlist, invites, config)
│   │   │   ├── user/           # User API routes (onboarding PATCH)
│   │   │   └── waitlist/       # Public waitlist API (join, count, referral-stats, verify)
│   │   ├── layout.tsx          # Root layout (QueryProvider, fonts, dark theme)
│   │   └── page.tsx            # Landing page
│   │
│   ├── components/
│   │   ├── admin/              # AdminDashboard component
│   │   ├── auth/               # InviteSignupForm
│   │   ├── landing/            # LandingPage, sections, GlassCard
│   │   ├── onboarding/         # OnboardingWizard, OnboardingProgress, step components
│   │   ├── waitlist/           # WaitlistForm
│   │   └── ui/                 # shadcn/ui base components + LogoMark
│   │
│   ├── lib/
│   │   ├── auth/               # requireAdmin server guard
│   │   ├── email/              # send.ts + React Email templates
│   │   ├── queries/            # TanStack Query hooks (waitlist, admin, tokens, onboarding)
│   │   ├── supabase/           # admin.ts, server.ts, client.ts
│   │   ├── axios.ts            # Shared Axios instance
│   │   ├── config.ts           # REFERRAL_SLOTS_BONUS, getEarlyAccessLimit()
│   │   ├── design.ts           # Design tokens for Framer Motion
│   │   └── rate-limit.ts       # Upstash rate limiters
│   │
│   ├── proxy.ts                # Next.js 16 proxy — admin + app route protection (NextAuth JWT)
│   ├── auth.ts                 # NextAuth v5 config
│   ├── providers/              # QueryProvider (TanStack Query)
│   ├── stores/                 # Zustand stores (uiStore, adminStore, onboardingStore)
│   ├── styles/                 # tokens.css, themes.css, bridge.css
│   └── types/                  # database.ts, next-auth.d.ts
│
├── supabase/
│   ├── schema.sql              # Phase 1 cumulative schema
│   └── phase8_schema.sql       # Phase 8 schema extension (5 new tables)
│
└── public/                     # Static assets (mintmark-logo.png)
```

---

## Security

Mintmark treats security as a first-class concern, not an afterthought.

- **Encrypted token storage** — all OAuth tokens encrypted with AES-256 before hitting Supabase. The encryption key never leaves the server.
- **httpOnly cookies only** — no tokens in `localStorage` or client-accessible storage, ever.
- **Row Level Security** — enabled on every single Supabase table. Application layer also filters by `user_id` — RLS is the safety net, not the only guard.
- **PKCE flow** — used for all OAuth connections (LinkedIn, X, Medium, GitHub, Notion).
- **Refresh token rotation** — rotated on every use.
- **Rate limiting** — dedicated Upstash limiters on every sensitive endpoint (waitlist join: 10/hr, invite verify: 20/hr, invite accept: 5/hr, admin stats: inherited from API limiter).
- **CSRF protection** — on all mutation endpoints.
- **Input sanitization** — before any DB write or AI prompt.
- **Webhook signature verification** — for all incoming platform webhooks.
- **Single-use invite tokens** — 32-byte hex, expire in 48 hours, marked used atomically in a Postgres transaction.
- **Admin role guard** — `src/middleware.ts` checks NextAuth JWT `role` claim on all `/admin/*` routes; returns redirect (never 404) to prevent route enumeration.
- **AI assistant isolation** — every RAG query scopes to `user_id` first. No cross-tenant data access is architecturally possible.

---

## Roadmap

| Phase       | Status         | Focus                                                                            |
| ----------- | -------------- | -------------------------------------------------------------------------------- |
| **Phase 1** | ✅ Complete    | Early access system — waitlist, invites, admin dashboard                         |
| **Phase 2** | 🟡 In Progress | Onboarding (Steps 8.1–8.2 done), platform OAuth, Content Studio, AI              |
| **Phase 3** | 🔲 Planned     | Notes editor, Notion sync, AI assistant, Unified Heatmap, Chrome extension       |
| **Phase 4** | 🔲 Planned     | GitHub, YouTube, LeetCode tracking, VS Code extension, public portfolio          |
| **Phase 5** | 🔲 Planned     | Weekly digest, trending topics, LinkedIn analytics, content calendar             |
| **Phase 6** | 🔲 Planned     | XP system, streak gamification, milestone posts, open source release             |

See [`mintmark-project-intelligence.md`](./mintmark-project-intelligence.md) for detailed specs on every phase.

---

## Contributing

Mintmark is currently in **private early access**. The repository is public for transparency and feedback, but we are not accepting pull requests yet.

If you find a bug or have a feature suggestion:

1. Search [existing issues](https://github.com/vishal-jadeja/mintmark/issues) first
2. Open a new issue with as much context as possible
3. Use the appropriate label: `bug`, `feature`, or `question`

We plan to fully open-source Mintmark in Phase 6. Follow along for updates.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with focus by [Vishal Jadeja](https://github.com/vishal-jadeja)

<br />

<a href="https://mintmark-vishal.vercel.app">mintmark-vishal.vercel.app</a> · <a href="https://twitter.com/ImVishalJadeja">@ImVishalJadeja</a>

<br />
<br />

<sub>If Mintmark has helped you build your personal brand, consider giving it a ⭐ — it helps more people find it.</sub>

</div>
