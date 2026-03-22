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

## Tech Stack

| Layer                     | Technology                                           |
| ------------------------- | ---------------------------------------------------- |
| **Framework**             | Next.js 16.2 + React 19.2 + TypeScript               |
| **Styling**               | Tailwind CSS v4 + shadcn/ui                          |
| **Animations**            | Framer Motion                                        |
| **State Management**      | TanStack Query v5 (server state) · Zustand v5 (UI state) |
| **HTTP Client**           | Axios                                                |
| **Auth**                  | NextAuth.js v5 (App Router)                          |
| **Database**              | Supabase (PostgreSQL + pgvector + Realtime)          |
| **Storage**               | Supabase Storage                                     |
| **Background Jobs**       | Trigger.dev v3                                       |
| **Cache + Rate Limiting** | Upstash Redis                                        |
| **AI Adapter**            | Unified BYOK layer — Anthropic, OpenAI, Gemini, Groq |
| **Email**                 | Brevo (React Email templates)                        |
| **PWA**                   | next-pwa                                             |
| **Chrome Extension**      | Manifest V3                                          |
| **VS Code Extension**     | Separate package (Phase 4)                           |
| **Deployment**            | Vercel (frontend) + Supabase (backend)               |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- An Upstash Redis database
- A Resend account (for email)

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

Fill in your environment variables (see [Environment Variables](#environment-variables) below), then:

```bash
# Run database migrations
npm run db:migrate

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file at the project root. Never commit this file.

```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Encryption (AES-256 for OAuth token storage)
ENCRYPTION_KEY=your_32_byte_encryption_key_here

# Email
RESEND_API_KEY=your_resend_api_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Trigger.dev
TRIGGER_API_KEY=your_trigger_dev_api_key
TRIGGER_API_URL=https://api.trigger.dev

# Platform OAuth (add the ones you want to enable)
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

> **Security note:** `NEXTAUTH_SECRET`, `SUPABASE_SERVICE_KEY`, `ENCRYPTION_KEY`, and `RESEND_API_KEY` must **never** be exposed to the client bundle. All are server-only.

---

## Database Setup

Mintmark uses Supabase with Row Level Security enabled on every table. Run migrations in order:

```bash
# Apply all migrations
npm run db:migrate

# Or apply manually via Supabase CLI
supabase db push
```

### Key tables

| Table                              | Purpose                                |
| ---------------------------------- | -------------------------------------- |
| `users`                            | Core user records                      |
| `platform_connections`             | Encrypted OAuth tokens per platform    |
| `platform_instructions`            | Per-platform AI tone and format rules  |
| `content_inputs`                   | Raw learning inputs                    |
| `generated_content`                | AI-generated posts (draft → published) |
| `unified_activity`                 | Single source of truth for the heatmap |
| `notes`                            | User notes with pgvector embeddings    |
| `ai_conversations` / `ai_messages` | AI assistant history                   |
| `waitlist` / `invite_tokens`       | Early access system                    |

Full schema is in [`/supabase/migrations`](./supabase/migrations).

---

## Project Structure

```
mintmark/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes (login, signup, invite)
│   ├── (dashboard)/            # Main app (protected)
│   │   ├── dashboard/          # Widget grid
│   │   ├── studio/             # Content generation
│   │   ├── assistant/          # AI chat interface
│   │   ├── heatmap/            # Unified activity heatmap
│   │   ├── notes/              # Notes editor
│   │   └── settings/           # Platform connections, API keys
│   ├── api/                    # API route handlers
│   │   ├── auth/               # NextAuth routes
│   │   ├── content/            # Generation and publish endpoints
│   │   ├── heatmap/            # Heatmap data endpoints
│   │   ├── assistant/          # RAG query endpoints
│   │   └── webhooks/           # Incoming platform webhooks
│   └── u/[username]/           # Public portfolio pages
│
├── components/                 # Shared UI components
│   ├── dashboard/              # Widget components
│   ├── studio/                 # Content studio components
│   ├── heatmap/                # Heatmap renderer (D3)
│   └── ui/                     # shadcn/ui base components
│
├── lib/                        # Core utilities
│   ├── ai/                     # Unified BYOK AI adapter
│   ├── encryption/             # AES-256 token encryption
│   ├── supabase/               # DB client + typed queries
│   ├── redis/                  # Upstash rate limiting + cache
│   └── platforms/              # LinkedIn, X, Medium API clients
│
├── jobs/                       # Trigger.dev background jobs
│   ├── heatmap-sync/           # Per-source activity sync jobs
│   ├── notion-sync/            # Two-way Notion sync
│   ├── rss-fetch/              # RSS feed polling
│   └── email/                  # All email send jobs
│
├── supabase/
│   └── migrations/             # SQL migrations in order
│
└── public/                     # Static assets + PWA manifest
```

---

## Security

Mintmark treats security as a first-class concern, not an afterthought.

- **Encrypted token storage** — all OAuth tokens encrypted with AES-256 before hitting Supabase. The encryption key never leaves the server.
- **httpOnly cookies only** — no tokens in `localStorage` or client-accessible storage, ever.
- **Row Level Security** — enabled on every single Supabase table. Application layer also filters by `user_id` — RLS is the safety net, not the only guard.
- **PKCE flow** — used for all OAuth connections (LinkedIn, X, Medium, GitHub, Notion).
- **Refresh token rotation** — rotated on every use.
- **Rate limiting** — 100 req/min per user on all API routes via Upstash. 10 waitlist signups per IP per hour.
- **CSRF protection** — on all mutation endpoints.
- **Input sanitization** — before any DB write or AI prompt.
- **Webhook signature verification** — for all incoming platform webhooks.
- **Single-use invite tokens** — expire in 48 hours, marked used immediately on signup.
- **AI assistant isolation** — every RAG query scopes to `user_id` first. No cross-tenant data access is architecturally possible.

---

## Roadmap

| Phase       | Status         | Focus                                                                            |
| ----------- | -------------- | -------------------------------------------------------------------------------- |
| **Phase 1** | 🟡 In Progress | Content studio, platform connections, productivity widgets, early access         |
| **Phase 2** | 🔲 Planned     | Notes editor, Notion sync, AI assistant, knowledge graph, RSS tracker            |
| **Phase 3** | 🔲 Planned     | Chrome extension, YouTube tracking, unified heatmap, voice-to-content            |
| **Phase 4** | 🔲 Planned     | Gmail, GitHub commits, LeetCode, Codeforces, VS Code extension, public portfolio |
| **Phase 5** | 🔲 Planned     | Weekly digest, trending topics, LinkedIn analytics, content calendar             |
| **Phase 6** | 🔲 Planned     | XP system, streak gamification, milestone posts, open source release             |

See the [full project intelligence document](./MINTMARK_PROJECT_INTELLIGENCE.md) for detailed specs on every phase.

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
