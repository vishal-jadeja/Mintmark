# Mintmark — Project Intelligence

## What is Mintmark

Mintmark is an AI layer on your intellectual life. It passively observes
what you read, what you build, what you write, and what matters in your
inbox. It understands your patterns over time. It shows you a clear,
honest picture of where your attention is going — and then, when you need
it, acts as an AI assistant who already knows your context deeply enough
to help you think, plan, and create without being briefed from scratch.

The name comes from a mintmark — the tiny stamp a mint presses onto a
coin to certify it is real, authentic, and came from a specific source.
Mintmark helps users understand what they genuinely know and how they are
genuinely growing. The stamp is for them first. Sharing is optional.

Target audience is anyone who learns actively and wants to understand their
own growth: developers, designers, marketers, writers, students,
entrepreneurs — any professional who consumes knowledge and wants to
compound it intentionally.

Core philosophy: **Observe first. Understand always. Act only when ready.**
The app accumulates intelligence in the background even when the user does
nothing manually. The user comes to understand themselves better over time
with or without active engagement.

Primary mission: Show users where their attention is going and how their
knowledge is compounding.
Secondary mission: Help them share it when they are ready.

Mintmark is being built as a scalable, cost-conscious system from day one.
Architecture decisions must always account for multi-tenant scale.
User costs must never increase unnecessarily — every AI call must be
justified by clear user value.

---

## Core Identity (Non-Negotiable)

Mintmark is NOT a social media scheduling tool.
Mintmark is NOT a content generation machine.
Mintmark is NOT a general AI chatbot.
Mintmark IS an AI layer on your intellectual life that happens to make
posting effortless.

The difference: Buffer asks "what do you want to post?"
Mintmark already knows what you have been learning and asks
"are you ready to share this yet?"

The posting features are real and good — but they are the output of
intelligence, not the reason to open the app.
A user who never posts is still getting full value from Mintmark.

---

## Core User Flow

```
OBSERVE (always running, passive)
  Sessions logged, GitHub commits recorded, browser reading tracked,
  Gmail surfaced, notes saved — everything → unified_activity

      ↓

UNDERSTAND (daily intelligence job, background)
  What was notable today?
  Any patterns forming or breaking?
  What topics is the user investing in most?
  What gaps are opening up?
  Everything → dashboard cards, calendar annotations

      ↓

USER OPENS MINTMARK
  Dashboard shows where their time went this week
  Intelligence cards surface only when genuinely useful
  AI assistant already knows their context — no briefing required
  No noise, no prompts unless there is a real reason

      ↓

ACT (user-initiated, entirely optional)
  Plan what to study next
  Ask the AI to quiz them on what they have been reading
  Decide to write a post about something they know well
  Select only their active platforms, generate, review, publish
```

---

## Pages (Complete List — 10 Total)

### Public / Pre-Auth

1. **`/` — Landing + Waitlist**
   Single page. Email capture, referral mechanics, social proof.
   Already built. ✅

2. **`/invite/[token]` — Invite Acceptance**
   Token verification, name + password form, account creation.
   ✅ Done.

3. **`/login` — Authentication**
   NextAuth handled. Clean, minimal. ✅ Done.

### Core App (auth required)

4. **`/dashboard` — Home**
   The page users open every day. Answers one question clearly:
   *what have I been investing my mind in, and how is it going?*
   Components: week-at-a-glance (7 day cells with source dots),
   topic time distribution (ranked, honest numbers), streak counter,
   heatmap widget (compact), intelligence cards (max 2, only when
   there is something real to surface), Gmail intelligence widget
   (Phase 2). No clutter — only what is genuinely useful right now.

5. **`/notes` — Notes**
   Lightweight but capable markdown editor. Exists to feed the AI's
   understanding of the user — their own synthesis of what they are
   studying. Topic tags auto-extracted in background after save.
   Folder organization. Search. Notion sync status if connected (Phase 2).

6. **`/studio` — Content Studio**
   User-initiated only — the user navigates here when they decide to post.
   Entry points: intelligence card suggests a topic, or user navigates
   directly, or user asks the AI assistant to turn a synthesis into a post.
   Platform selector showing only active platforms. Generates drafts for
   selected platforms only. Edit inline, schedule or publish.
   No analytics. No extra prompts. Clean and fast.

7. **`/assistant` — AI Assistant**
   Full-page chat interface. Not a floating widget. Not a general chatbot.
   A thinking partner who already knows your context: your notes, sessions,
   reading patterns, GitHub activity, published posts.
   Every response cites sources (collapsible). Streaming responses.
   Conversation history in sidebar. Scoped strictly to user's own data.
   Accessible from sidebar and Cmd+K.

8. **`/settings` — Settings**
   Platform connections (connect / disconnect / status).
   Active platform selection — which ones to generate content for.
   Browser extension status and category tracking toggles.
   BYOK API key management per provider.
   Privacy controls: view all tracked data by category, export as JSON,
   delete by category or time period.
   Notification preferences (minimal — only meaningful events).
   Public portfolio toggle and username claim (Phase 4).
   Notion sync configuration (Phase 2).

### Admin

9. **`/admin` — Admin Dashboard**
   Waitlist management, invite sending, batch invites, capacity config.
   Protected by NextAuth admin role check via `src/middleware.ts`.
   ✅ Done.

### Public

10. **`/u/[username]` — Public Portfolio**
    Opt-in, off by default. Heatmap intensity only (no source breakdown),
    topic cloud, recent published posts, activity stats.
    Phase 4. ISR on Vercel, revalidated hourly.

---

## Product Phases

### Phase 1 (Current — In Progress)

**EARLY ACCESS SYSTEM** ✅ All 7 steps complete
✅ Waitlist landing page with referral tracking
✅ Referral queue mechanics (each referral = -5 positions, min 1)
✅ Configurable invite cap (runtime-adjustable via system_config table)
✅ API: /api/waitlist/join, /api/waitlist/count,
        /api/waitlist/referral-stats, /api/waitlist/verify
✅ Existing users re-submitting get their rank + referral link
✅ Invite acceptance page /invite/[token], login page, NextAuth v5 — Step 6
✅ Admin dashboard /admin, 5 API routes, NextAuth JWT proxy protection — Step 7

**STEP 8 — ONBOARDING** 🟡 In Progress (Phases 8.1–8.2 of 8 complete)
✅ Phase 8.1 — DB schema: api_keys, platform_connections, platform_instructions,
  unified_activity, topic_nodes (supabase/phase8_schema.sql)
✅ Phase 8.2 — Routing + wizard shell: /onboarding layout + page, 4-step wizard,
  progress indicator, onboardingStore, PATCH /api/user/onboarding, proxy protection
⬜ Phase 8.3 — Platform OAuth connections (GitHub, LinkedIn, X, Medium)
⬜ Phase 8.4 — GitHub commit backfill (Trigger.dev, 90 days → unified_activity)
⬜ Phase 8.5 — Active platforms + per-platform AI instructions
⬜ Phase 8.6 — First manual session log → unified_activity + topic_nodes
⬜ Phase 8.7 — BYOK API key (optional onboarding step)
⬜ Phase 8.8 — Dashboard scaffold (heatmap, week calendar, streak, empty state)

**MAIN APP** (post-Step-8)
GitHub integration: OAuth connect + 90-day commit backfill → unified_activity
Manual session logger: log offline work → AI auto-tags into topics →
  feeds unified_activity → visible on calendar immediately
Dashboard: week-at-a-glance, topic time distribution, heatmap widget,
  streak counter, intelligence cards (only when genuinely useful)
Content studio: paste or describe what you learned → generate drafts
  only for active platforms → edit → schedule or publish
Notes: markdown editor, auto-topic tagging, folder organization, search
AI assistant scaffold: stub page + BYOK check, full RAG in Phase 2
PWA: installable on mobile, offline support, bottom nav on mobile
Security: encrypted OAuth token storage, BYOK AI keys, RLS everywhere

### Phase 2 (Planned)

Daily intelligence job (Trigger.dev cron, midnight per user)
AI assistant full implementation: RAG pipeline, pgvector, streaming,
  topic graph queries, activity summaries, source citations
Notes embedding: embed on save (debounced), pgvector search
Topic extraction and tagging from notes (background job, debounced 10 min)
Knowledge graph: D3 force layout, topic_nodes + topic_edges
Calendar view: full month, activity overlay per source, task reminders,
  scheduled posts display
Gmail intelligence widget on dashboard: surface newsletters, flag
  important threads, one-click article → note
  (Gmail connection established in onboarding; intelligence surfaced here)
Auto-brief system: suggestion card when notable learning detected →
  one-tap note save, never auto-saves silently
Weekly Learning Review: Monday card, 3–5 suggestions, stable all week,
  generated Sunday night by Trigger.dev
Notion two-way sync: pull/push notes, conflict resolution, 30-min cron

### Phase 3 (Planned)

Chrome Extension (Manifest V3)
  Browser activity: domain + time, processed locally, category auto-tag
  YouTube tracking: title, channel, duration, completion %, transcript
    if watched > 50%
  LeetCode: problem title, difficulty, topic tags, solve status
  Privacy-first: raw URLs never leave browser, only aggregated summaries
    sent to backend, full delete at any time
Browser + YouTube activity → unified_activity via extension
Voice-to-Content: record voice note → transcribe → generate platform drafts
Privacy controls dashboard: full data viewer per source and date range

### Phase 4 (Planned)

GitHub commit feed with auto topic-tagging
Readwise / Kindle Highlights import
VS Code Extension: coding time per project/language → unified_activity
Public Portfolio Page: /u/[username], opt-in, ISR revalidated hourly
Codeforces + LeetCode deeper integration

### Phase 5 (Planned)

Weekly digest email (Monday 9am user's timezone)
Content calendar view (full planner)
Public Accountability Mode: optional posting goal on portfolio

### Phase 6 (Planned)

XP and leveling system across all activity tracks
Unified streak system: one contribution from any source = one active day
Gamification milestones with auto-generated celebration posts
Full open source prep + case study writeup

---

## Current Development State

> Update this section whenever a phase step completes or a major feature ships.
> Last updated: 2026-04-16 — Step 8 in progress: Phases 8.1 + 8.2 complete.
> Project intelligence updated to v2 — repositioned as AI layer on
> intellectual life. Posting is a secondary output, not the primary mission.

### What has been built

| Area | File(s) | Status |
|------|---------|--------|
| TanStack Query provider | src/providers/QueryProvider.tsx | ✅ Done |
| Shared Axios instance | src/lib/axios.ts | ✅ Done |
| Runtime config (invite cap, referral bonus) | src/lib/config.ts | ✅ Done |
| Waitlist query hooks | src/lib/queries/waitlist.ts | ✅ Done |
| Admin query hooks | src/lib/queries/admin.ts | ✅ Done |
| Token query hook | src/lib/queries/tokens.ts | ✅ Done |
| UI Zustand store | src/stores/uiStore.ts | ✅ Done |
| Admin Zustand store | src/stores/adminStore.ts | ✅ Done |
| WaitlistForm | src/components/waitlist/WaitlistForm.tsx | ✅ Done |
| LandingPage | src/components/landing/LandingPage.tsx | ✅ Done |
| Waitlist API routes (4 routes) | src/app/api/waitlist/ | ✅ Done |
| Supabase SSR cookie helper | src/proxy.ts | ✅ Done |
| Invite acceptance page | src/app/invite/[token]/page.tsx | ✅ Done |
| Invite signup form | src/components/auth/InviteSignupForm.tsx | ✅ Done |
| Invite auth API routes | src/app/api/auth/verify-token/ + accept-invite/ | ✅ Done |
| Login page | src/app/login/page.tsx | ✅ Done |
| NextAuth v5 config | src/auth.ts | ✅ Done |
| NextAuth type augmentation | src/types/next-auth.d.ts | ✅ Done |
| Admin dashboard | src/app/admin/page.tsx + AdminDashboard.tsx | ✅ Done |
| Admin API routes (5 routes) | src/app/api/admin/ | ✅ Done |
| Admin server-side guard | src/lib/auth/requireAdmin.ts | ✅ Done |
| Next.js proxy (admin + app JWT protection) | src/proxy.ts | ✅ Done |
| CLAUDE.md | CLAUDE.md | ✅ Done |
| Phase 8.1 — DB schema extension (5 tables) | supabase/phase8_schema.sql | ✅ Done |
| DB types update (onboarding + API keys) | src/types/database.ts | ✅ Done |
| Onboarding Zustand store | src/stores/onboardingStore.ts | ✅ Done |
| Onboarding wizard + progress indicator | src/components/onboarding/OnboardingWizard.tsx + OnboardingProgress.tsx | ✅ Done |
| Onboarding step components (4 shells) | src/components/onboarding/steps/ | ✅ Done |
| Onboarding layout + page (server component) | src/app/onboarding/layout.tsx + page.tsx | ✅ Done |
| Onboarding PATCH API route | src/app/api/user/onboarding/route.ts | ✅ Done |
| Onboarding TanStack Query hooks | src/lib/queries/onboarding.ts | ✅ Done |
| App route protection (/dashboard, /onboarding, /api/user) | src/proxy.ts | ✅ Done |

### What's next

**Step 8 — Onboarding (Phases 8.3–8.8 remaining)**

Phases 8.1 (DB schema) and 8.2 (wizard shell + routing) are complete.
Remaining phases in order:

- **Phase 8.3** — OAuth platform connections (GitHub, LinkedIn, X, Medium)
  - `/api/connections` GET + DELETE routes
  - `/api/connections/[platform]/callback` OAuth callback per platform
  - Encrypted token storage via existing `encryption.ts`
- **Phase 8.4** — GitHub commit backfill (Trigger.dev background task)
  - 90 days of commits → `unified_activity` on connect
  - Backfill status polling endpoint
- **Phase 8.5** — Active platforms + per-platform AI instructions
  - `/api/user/settings` GET + PATCH
  - `/api/user/platform-instructions` GET + POST
- **Phase 8.6** — First manual session log
  - `/api/activity/session` POST → seeds `unified_activity` + `topic_nodes`
- **Phase 8.7** — BYOK API key (optional onboarding step)
  - `/api/user/api-key` POST + DELETE, `/api/user/api-keys` GET
- **Phase 8.8** — Dashboard scaffold
  - D3.js heatmap widget, week-at-a-glance (7 day cells), topic time
    distribution (ranked list), streak counter, empty state
  - `/api/dashboard/activity` GET route

**Step 9 — Trigger.dev background jobs**
`send-batch-invites`, `cleanup-expired-tokens` (daily cron), stubs for
`daily-intelligence` and `topic-extraction`.

**Step 10 — Deploy**
Vercel, Brevo domain verification, Upstash Redis, Trigger.dev cloud.

---

## Onboarding — Time to Value Problem

The intelligence-first model has one critical risk: a new user opens
Mintmark, the dashboard is empty, the heatmap is blank, and the AI
assistant has no context to work from. They leave before the intelligence
layer ever gets a chance.

Onboarding must solve this on day one.

### Onboarding flow (do not skip any step)

**Step 1 — Platform connections**
Connect at least one: GitHub, Gmail, LinkedIn, X.
Connecting GitHub → immediately backfill 90 days of commit history
  into unified_activity. Heatmap is populated before they leave onboarding.
Connecting Gmail → establish permission; intelligence surfacing begins in
  Phase 2. Connection is made now so Phase 2 has no auth friction.
All backfills run as Trigger.dev background tasks, not blocking.

**Step 2 — Platform selection**
"Which platforms do you actually post on?"
Checkboxes: LinkedIn, X, Medium. User selects their active set.
Stored in user_settings.active_platforms.
This drives content generation — only active platforms get drafts.
Can be changed any time in Settings.

**Step 3 — First session log**
Guide user to log their first manual session: "What have you been
working on or learning lately?" Duration + topic.
This seeds unified_activity immediately. The dashboard is no longer empty.
Shows the core loop in action within 2 minutes of signing up.

**Step 4 — BYOK API key (optional at onboarding)**
"To use the AI assistant or generate content, add your API key."
Skip link clearly visible — user can add it later in Settings.
If skipped, assistant and studio show a gentle prompt linking to Settings.
Never an error, always a next action.

**Step 5 — Quick wins on dashboard after onboarding**
Dashboard must never be blank after onboarding:
- GitHub connected → heatmap shows real data
- Session logged → calendar shows today's dot, streak starts at 1
- Both → topic distribution shows first data point
- Neither → illustrated empty state with one clear next action per section

---

## Intelligence Architecture

### The Daily Intelligence Job

Runs at midnight per user via Trigger.dev cron.
Quiet — no user interaction required.
Touches AI at most twice per run (significance check + opportunity check).
Stores results in DB — user reads from DB, not from AI on demand.
One fan-out cron across all users — not one cron job per user.

```
[Trigger.dev Cron — midnight, fans out per user]
        ↓
   [Orchestrator Task]
   Loads user's unified_activity for the day
   Loads topic_nodes context
        ↓ (parallel Trigger.dev batch)

  [Significance Agent]
   Threshold rules (checked before any AI call):
     - Session ≥ 20 minutes AND has a topic tag
     - 3+ activity signals on same topic in one day
     - New topic appearing for first time
     - Streak at risk (no activity today by 10pm)
   If threshold met → AI call to draft a brief suggestion
   If threshold not met → skip entirely, no AI call
   Output: brief_suggestion or null

  [Pattern Agent] (rule-based only, no AI call)
   Streak status check
   Topic gap detection: topic not touched in 14+ days
     but user has previously invested heavily in it
   Output: pattern_flags array

  [Opportunity Agent]
   Only runs if: 3+ signals on same topic this week AND
     user has not posted on that topic in 7+ days AND
     user has at least one active platform selected
   AI call: "Is there enough here for a post?"
   Output: post_opportunity suggestion or null
        ↓
   Write to: daily_intelligence table (keyed user_id + date)
   Invalidate dashboard cache in Upstash
```

### What surfaces to the user

Only meaningful suggestions reach the dashboard.
The intelligence layer is aggressive about filtering.
A quiet day shows nothing — no cards, no noise, no filler.

Suggestion card types:
- **Brief suggestion**: "You spent 90 min on system design today.
  Want to save a quick note?" → one-tap save, or dismiss.
  Never auto-saves. User stays in control.
- **Opportunity suggestion**: "You've been deep in distributed systems
  this week. Your notes have good material — ready to turn it into
  a post?" → links to Content Studio with topic pre-filled.
  Only appears if user has active platforms configured.
- **Pattern flag**: "You haven't touched TypeScript in 2 weeks —
  your longest gap in 3 months." Only shown if genuinely unusual
  for that user — not just any gap.

Rule: Never show more than 2 suggestion cards at once.
Rule: Never show the same suggestion type two days in a row.
Rule: Always show a clear dismiss option, never guilt-trip dismissal.

---

## AI Assistant

The AI assistant is the most important feature in Mintmark after the
unified activity feed. It is valuable precisely because it is scoped to
the user's own data — not general knowledge retrieval.

The assistant knows:
- What the user has been studying (sessions + browser activity)
- What they have built (GitHub activity)
- What they have written and synthesized (notes)
- What they have already shared (published posts)
- Their topic patterns over time (topic_nodes, unified_activity)

What it handles well:
- "What do I actually know about system design? Where are my gaps?"
- "I've been reading about load balancers for a week. Quiz me."
- "What should I study next given what I've been working on?"
- "I want to write a post about caching. What do my notes say?"
- "How has my focus distribution changed in the last month?"
- "I have a system design interview in 2 weeks. Help me plan."

What it does NOT do:
- General internet search (that is what Google is for)
- Answer questions outside the user's own data without flagging it
- Auto-save anything (suggestions only, user decides)

Key UX rules:
- Every response shows which notes / sessions it referenced (collapsible)
- Streaming responses — never wait for a full answer
- Full page, not a floating widget. Cmd+K to open.
- No key configured → clear message with Settings link, not an error
- Strictly scoped: every query WHERE user_id = $current_user first
  RLS is the safety net — application layer filters first always

RAG pipeline details in Multi-Agent Architecture section below.

---

## Multi-Agent Architecture

All agents implemented as Trigger.dev tasks.
No external agent framework (no LangGraph, no CrewAI, no LangChain).
The BYOK AI adapter handles provider abstraction — agents just call it.
Trigger.dev provides: parallelism (batch), waiting (triggerAndWait),
retries, timeouts, and observability. Nothing else is needed.

### Agent patterns used in Mintmark

**Pattern 1 — Sequential pipeline**
Each agent's output feeds into the next.
Used for: enrichment chains (session → topic extraction → brief draft)

**Pattern 2 — Parallel fan-out**
Orchestrator dispatches to multiple agents simultaneously.
Used for: content generation (LinkedIn agent + X agent run in parallel)

**Pattern 3 — Threshold-gated**
Rule-based check runs first. AI agent only fires if threshold met.
Used for: daily intelligence job. Prevents unnecessary AI calls.
This is the primary cost control mechanism.

### AI Assistant RAG Pipeline

```
User message
        ↓
[Query Planner Agent]
  Simple factual query → direct retrieval, skip planner
  Complex query → break into 2–4 retrieval sub-queries
        ↓ (parallel)
  [Notes Retrieval] — pgvector search, WHERE user_id = $user first
  [Topic Graph]     — query topic_nodes for context
  [Activity Agent]  — recent unified_activity summary (if relevant)
        ↓
[Synthesis Agent]
  Combines retrieved context
  Generates answer citing specific sources
  Streams response to UI
  Stores sources in ai_messages.sources jsonb
  Max top 8 results — never retrieve more
```

### Content Generation Pipeline

Only runs when user explicitly requests it in Content Studio.
Only generates for user's active platforms — never all three by default.

```
User submits input in Content Studio
        ↓
[Research Agent]
  Vector search: user's notes on this topic (user_id scoped always)
  Fetch: user's past posts on this topic (last 90 days)
  Fetch: user's platform instructions per active platform
  Output: enriched brief + user voice patterns
        ↓
[Parallel fan-out — only active platforms]
  [LinkedIn Agent] — if LinkedIn in active_platforms
  [X Agent]        — if X in active_platforms
  [Medium Agent]   — if Medium in active_platforms
        ↓
[Critic Agent per platform]
  Scores against user's platform instructions
  Checks: tone, format, length constraints
  Returns: pass or specific revision note
        ↓
[Reviser Agent] — only if critic fails
  Takes draft + critique → improved draft
  Max 2 revision loops, then ship what we have
        ↓
Stream final drafts to Content Studio UI
Save as status=draft in generated_content
```

---

## Platform Connections — Honest API Reality

### What is actually possible per platform

**GitHub**
- OAuth app flow ✅
- Commits, PRs, reviews via REST API ✅
- 90-day backfill on connect ✅
- Feeds unified_activity as source=github

**Gmail**
- OAuth scope: gmail.readonly ✅
- Surface newsletters and flagged threads on dashboard ✅ (Phase 2)
- One-click article → note ✅ (Phase 2)
- Never reads email content for any purpose other than surfacing
- Never sends email on user's behalf

**LinkedIn**
- Publish posts via API ✅
- OAuth PKCE flow ✅
- Basic post performance (impressions, reactions, comments) ✅
  Used internally by Opportunity Agent — never displayed as metrics

**X (Twitter)**
- Publish posts via API ✅
- OAuth PKCE flow ✅
- Post performance: limited on free API tier
  Track: published at, post URL only on free tier.

**Medium**
- Publish posts via API ✅
- OAuth flow ✅
- No public analytics API — Mintmark tracks published_at + post_url only
  User views Medium analytics on Medium's own dashboard

### No analytics feature

Mintmark does not have a dedicated analytics page.
Post performance data is not a core feature.
The intelligence layer uses topic patterns and posting frequency
internally — but no metrics dashboard is exposed to the user.

---

## Content Studio Rules

### Platform selection
User sets active platforms once in Settings.
Content Studio shows only active platform panels.
User can override for a specific post without changing global setting.
Fewer platforms = fewer AI calls = lower cost on user's BYOK key.

### Generation rules
Only generate when user explicitly submits in Content Studio.
Never auto-generate in the background without user action.
All active platforms generated in parallel (Promise.all).
Stream responses per platform so UI feels responsive.
Content saved as status=draft first.
Published only on explicit user action — never automatic.

### Per-platform format rules (enforced at agent level)
LinkedIn: max 3000 chars, professional storytelling, hook in first line,
  whitespace-friendly formatting
X: max 280 chars, punchy, hook-first, no filler
Medium: unlimited, deep dive, well-structured with headers,
  intro that earns the scroll

### AI instructions
User defines per-platform tone, style, and examples in Settings.
Stored in platform_instructions table.
Every generation call: system prompt = platform instructions +
  format rules + enriched brief from Research Agent.
Switching providers (Anthropic → OpenAI etc.) requires zero UI change.

---

## UX Principles (Enforce on Every Screen)

**No unnecessary prompts.**
Only surface a suggestion, notification, or prompt when there is
a genuine reason backed by data. If in doubt, do not show it.

**User is always in control.**
Auto-brief is a suggestion card, never an auto-save.
Platform selection is always visible and adjustable.
Every piece of tracked data is viewable, exportable, deletable.
Nothing happens to user data without user awareness.

**Empty states are never blank.**
Every page has a designed empty state with one clear next action.
Never show a blank calendar, blank heatmap, or blank notes list
without guiding the user toward their first meaningful action.

**Loading states: skeleton shimmer only, never spinners.**

**Errors: one clear sentence, one clear action.**
Never show a stack trace, error code, or vague "something went wrong."
Always tell the user what to do next.

**Mobile-first on interactions.**
Bottom navigation below 768px.
All tap targets minimum 44px.
Calendar, heatmap, and cards all work on small screens.
Horizontal scroll on heatmap on mobile — same grid, smaller cells.

**Animations: purposeful, not decorative.**
Framer Motion for all transitions.
Spring physics for drag interactions.
Staggered entrance on dashboard cards.
Page transitions: content fades and shifts 8px up — never hard cuts.
If an animation does not help the user understand what happened, remove it.

**Command palette: Cmd+K from anywhere.**
Access: new note, new session, open assistant, go to studio.

**Design reference feel:**
Linear (information density), Vercel dashboard (dark polish),
Raycast (command palette UX), Stripe (typography and spacing).

---

## Tech Stack (Finalized — Do Not Change)

Framework: Next.js 16.2 + TypeScript + React 19.2
Styling: Tailwind CSS v4 + shadcn/ui (customized via DESIGN.md)
Animations: Framer Motion
State: TanStack Query v5 (server state) + Zustand v5 (UI state)
HTTP Client: Axios — shared instance at src/lib/axios.ts
Auth: NextAuth.js v5
Database: Supabase (PostgreSQL + pgvector + Realtime)
Storage: Supabase Storage
Background Jobs: Trigger.dev v3
Cache + Rate Limiting: Upstash Redis
AI: Unified BYOK adapter (Anthropic, OpenAI, Gemini, Groq)
Email: Brevo + React Email templates
Chrome Extension: Manifest V3 (Phase 3 — browser + YouTube tracking)
VS Code Extension: separate package (Phase 4)
PWA: next-pwa
Deployment: Vercel + Supabase
Heatmap rendering: D3.js (not a third-party library)
Knowledge graph rendering: D3.js force layout
Design workflow: Google Stitch → DESIGN.md → Claude Code

### State architecture rules (enforce always)

Server state (API data, mutations) → TanStack Query (src/lib/queries/)
Never use useState + useEffect to fetch.
All client HTTP through shared Axios instance.

Global UI / cross-component state → Zustand (src/stores/)
Use store flags when mutation success must reach a component
that did not trigger the mutation.

Local ephemeral state → useState only (inputs, toggles, one-time reads)

Polling disabled by default.
Use manual refetch() or invalidateQueries only.

---

## Database Schema

```sql
-- Core users
users                  id, email, name, avatar, created_at
user_settings          user_id, theme, active_widgets, timezone,
                       active_platforms jsonb,
                       -- e.g. ["linkedin", "x"] — drives generation only
                       public_profile_enabled, public_username
api_keys               user_id, provider, encrypted_key, is_active

-- Early access
waitlist               id, email, referral_code, referred_by,
                       position, reason, status (waiting|invited|joined),
                       created_at
invite_tokens          id, email, token, expires_at, used_at, created_at

-- Platform connections
platform_connections   user_id, platform (linkedin|x|medium|github|
                       gmail|leetcode|codeforces|notion|readwise),
                       access_token (encrypted), refresh_token,
                       expires_at, profile_data, is_active

-- Per-platform AI instructions (content generation only)
platform_instructions  user_id, platform, instruction_text,
                       tone, format_rules, max_length, updated_at

-- Content
content_inputs         user_id, raw_text, source_type, created_at
generated_content      user_id, input_id, platform, content_text,
                       status (draft|published|scheduled),
                       scheduled_at timestamptz,
                       published_at timestamptz,
                       post_url text,
                       created_at
-- scheduled_at drives the calendar view for future posts
-- published_at + post_url written on successful publish

-- Notes
notes                  user_id, title, body, tags, folder_id,
                       notion_page_id, notion_synced_at,
                       embedding vector(1536), created_at, updated_at
folders                user_id, name, parent_id, color

-- Sessions (manual logging — primary Phase 1 activity input)
sessions               user_id, type (focus|manual_offline),
                       duration_minutes, tag, source (manual|vscode),
                       project_name, notes, started_at, ended_at

-- Unified activity — single source of truth for heatmap and calendar
-- One row per calendar day per user per source
unified_activity       id, user_id, activity_date (date),
                       source (github|gmail|leetcode|codeforces|youtube|
                               medium|linkedin|x|notes|session|browser|vscode),
                       activity_count int,
                       intensity int (0-4, computed on write),
                       metadata jsonb,
                       created_at, updated_at
-- Index: (user_id, activity_date) — primary heatmap + calendar query
-- Index: (user_id, source, activity_date) — per-source filtering

-- Daily intelligence output
daily_intelligence     id, user_id, intelligence_date (date),
                       brief_suggestion jsonb,
                       -- {title, body, topic, source_session_id}
                       pattern_flags jsonb,
                       -- [{type, topic, last_active, gap_days}]
                       opportunity_suggestion jsonb,
                       -- {topic, platform, note_count, days_since_post}
                       dismissed_at timestamptz,
                       created_at
-- Index: (user_id, intelligence_date)

-- Calendar tasks
calendar_tasks         id, user_id, title, description,
                       due_date (date), due_time (time),
                       reminder_at timestamptz,
                       status (pending|done|dismissed),
                       source (manual|ai_suggested),
                       linked_content_id,
                       linked_note_id,
                       created_at, updated_at

-- Notion sync
notion_sync_log        user_id, notion_page_id, mintmark_note_id,
                       direction (push|pull), synced_at, conflict_resolved

-- AI Assistant
ai_conversations       user_id, title, created_at, updated_at
ai_messages            id, conversation_id, user_id,
                       role (user|assistant), content, sources jsonb,
                       created_at

-- Weekly Learning Review
weekly_suggestions     id, user_id, week_start_date (date),
                       suggestions jsonb,
                       dismissed_ids jsonb,
                       generated_at, created_at
-- Index: (user_id, week_start_date)

-- Knowledge graph
topic_nodes            user_id, topic, post_count, note_count,
                       session_count, last_activity_at,
                       embedding vector(1536)
topic_edges            user_id, topic_a, topic_b, strength float,
                       computed_at

-- Public portfolio
portfolio_settings     user_id, username (unique), bio, show_heatmap,
                       show_posts, show_topics, show_stats, is_public

-- Extension data (Phase 3)
youtube_activity       user_id, video_title, channel, category,
                       watch_duration_seconds, completion_percent,
                       transcript_extracted, captured_at
browsing_activity      user_id, domain, category, time_spent_seconds,
                       captured_date
-- Raw browsing data processed locally in extension first
-- Only aggregated domain + time reaches the server — never full URLs

-- Activity log (all sources, raw)
activity_log           user_id, source, type, metadata,
                       captured_at, is_auto_captured

-- Voice notes (Phase 3)
voice_notes            user_id, audio_url, transcript, duration_seconds,
                       generated_content_ids jsonb, created_at
```

---

## Unified Heatmap System

### What it is

One GitHub-style contribution grid visualizing every form of productive
intellectual activity across all connected sources.

One square = one calendar day.
Intensity (0–4) = how much was done across all sources that day.
The calendar view and the heatmap read from the same unified_activity
table — two views of the same data.

### Intensity calculation

Per source, define thresholds in a config map (not hardcoded).
Example for github: 0=0, 1=1-3, 2=4-7, 3=8-14, 4=15+ commits.
Merged intensity for a day = max(all source intensities that day).
Not a sum — one very active source shows full intensity.
Individual source rows preserved for filtering.

### Rendering rules

52 weeks × 7 days grid, Sunday-to-Saturday
Tooltip on hover: "3 commits, 1 session, 2 notes — April 14"
Filter by source: toggle individual sources
Year switcher: previous 365 days default, navigate by year
Mobile: horizontal scroll, same grid at reduced cell size
Streak counter above: "current streak: 12 days"
Longest streak below: "longest streak: 47 days"
Colors: intensity 0 = bg-secondary, 1–4 = gold accent ramp
Rendered with D3.js — never a third-party heatmap library

### Sources by phase

| Source  | What counts                        | Phase |
|---------|------------------------------------|-------|
| session | manual sessions logged             | 1     |
| github  | commits, PRs, reviews              | 1     |
| linkedin| posts published                    | 1     |
| x       | posts published                    | 1     |
| notes   | notes created or updated           | 2     |
| gmail   | newsletters read, articles opened  | 2     |
| browser | time on domain (from extension)    | 3     |
| youtube | videos watched >50%                | 3     |
| leetcode| problems solved                    | 3     |
| medium  | articles read                      | 3     |
| vscode  | coding time tracked                | 4     |
| codeforces | problems solved, contests       | 4     |

### Caching

Cache per-user heatmap in Upstash Redis (TTL: 1 hour).
Invalidate on any new unified_activity write for that user.
Never recalculate full heatmap on every page load.

---

## Calendar View

### What it is

The temporal view of the heatmap. The heatmap answers "how much."
The calendar answers "what exactly, and when."

Past days: read from unified_activity.
Each day cell shows colored source dots.
Click a past day → side panel: full breakdown with links to the
actual content (note, post, session, GitHub repo).

Today: completed activity + pending calendar tasks + suggestion cards.

Future days: scheduled posts from generated_content (status=scheduled),
  user-set reminders from calendar_tasks.
  No AI suggestions on future dates — only confirmed items.

### Task reminders

User can add a reminder to any day from the calendar view.
Minimal: title, due date, optional time, optional link to a note.
Reminder notifications via email only. User can disable in Settings.

---

## Notion Sync System (Phase 2)

Pull: Notion page → Mintmark note (notion_page_id stored)
Push: Mintmark note → Notion page (create or update)
Conflict resolution: most recent updated_at wins.
If timestamps within 5 minutes: flag to user, let them choose.
Never silently overwrite.
Sync via Trigger.dev cron every 30 minutes.
Manual sync available from Settings.
Deleted Mintmark notes: do not auto-delete Notion page.
Deleted Notion pages: mark note as notion_unlinked, keep note.
Syncs: title, body (markdown), tags.
Code blocks and images in Notion: stripped to plain text on pull.

---

## Chrome Extension (Phase 3) — Privacy Rules

What is tracked (opt-in per category):
- Browser: domain only (not full URL), time spent, category tag
  No page content, no keystrokes, no form data — ever
- YouTube: title, channel, category, duration, completion %
  Transcript: only if watched > 50%
- LeetCode: problem title, difficulty, topic tags, solve status

What is never tracked:
- Full URLs or page content of any site
- Any input, form, password, or personal data
- Sites on user's personal blocklist
- Anything outside opted-in categories

Data handling:
- Raw browsing data processed locally in extension first
- Only aggregated domain + time summary sent to backend
- Raw URL data never leaves the browser
- Export as JSON available at any time
- Full delete removes all captured data

---

## Security Requirements (Non-Negotiable)

All OAuth tokens encrypted at rest (AES-256) before Supabase storage
API keys encrypted with server-side secret, never to frontend
Tokens in httpOnly cookies only, never localStorage
RLS on every single table — no exceptions
PKCE flow for all OAuth connections
Refresh token rotation on every use
Rate limiting on all API routes: 100 req/min per user via Upstash
Rate limiting on waitlist: 10 per IP per hour
CSRF protection on all mutation endpoints
Input sanitization before any DB write or AI prompt
Invite tokens: single use, expire 48 hours, verified on signup
Honeypot on waitlist form
AI assistant: user_id filter first, always — RLS is safety net only
Gmail: readonly scope only, never send on user's behalf
Voice audio: private Supabase Storage bucket, user-scoped policies

Must never reach client bundle:
NEXTAUTH_SECRET, SUPABASE_SERVICE_KEY, ENCRYPTION_KEY, BREVO_API_KEY

---

## Cost Architecture (Build Cheap, Stay Cheap)

### Free tier targets

Supabase free: 500MB DB, 50k MAU, 1GB storage
Trigger.dev free: 50k task runs/month
Upstash free: 10k commands/day
Brevo free: 300 emails/day
Vercel free: adequate until serious traffic

### AI cost rules (BYOK — user's key, not ours)

Never fire an AI call without a threshold check first.
Batch embed jobs: run on note save (debounced 10 min), not on note read.
Daily intelligence job: max 2 AI calls per user per run.
Content generation: fires only on explicit user action.
Auto-brief: only if session ≥ 20 min AND has a topic tag.
Opportunity Agent: only if 3+ signals on topic this week
  AND no post on that topic in 7+ days.
Assistant RAG: never retrieve more than top 8 results.
Critic/Reviser loop: max 2 iterations before shipping draft.

### Upstash command efficiency

One get + one set per heatmap load.
One get + one set per dashboard intelligence card load.
Never query Redis in a loop.
Batch related cache reads into single operations.

### Trigger.dev run efficiency

Debounce topic extraction: 10 minutes after last note save.
Debounce knowledge graph recompute: 5 minutes after last note save.
Daily intelligence: one cron job fans out to all users,
  not one cron job per user.

---

## Scalability Architecture

### Core principles

Every feature built assuming 100k users from day one.
No hardcoded user limits in business logic.
All heavy processing in Trigger.dev background tasks,
  never blocking API route handlers.
All DB queries scoped with indexes on user_id + created_at.
No N+1 queries — always batch or join.

### Caching strategy

Upstash Redis:
  Heatmap per user — 1 hour TTL, invalidate on activity write
  Dashboard intelligence cards — 1 hour TTL, invalidate on new intelligence
  Platform connection status per user — 5 min TTL
  Rate limiting — no TTL, sliding window
  Never cache auth or token data

### Database scaling

Connection pooling: Supabase pgBouncer in transaction mode.
Partition heavy tables (unified_activity, activity_log,
  generated_content) by created_at month when rows exceed 10M.
Vector search always scoped to user's embeddings — never global.
All new tables require: user_id index + created_at index minimum.

### Infrastructure path

Now: Vercel free + Supabase free (~1k DAU)
Next: Vercel pro + Supabase pro (~50k DAU)
Scale: Supabase read replicas + Vercel edge caching
No full rewrite needed at any tier — just upgrades.

### Multi-tenancy

Every DB table: user_id is the first filter in every query.
RLS at DB level as safety net — application layer filters first.
AI assistant RAG: user_id scoping checked before any vector search.

---

## Email Infrastructure

Provider: Brevo — @getbrevo/brevo SDK + React Email templates
From: notifications@mintmark.app

Email types:
- Waitlist confirmation (immediate, transactional)
- Referral milestone (moved up X spots)
- Invite (unique token, 48hr expiry)
- Welcome (on first login after invite)
- Weekly digest (Monday 9am user's timezone, Phase 5)
- Streak reminder (48hr no activity, opt-in only)
- Notion conflict alert (when manual resolution needed)

Rules:
- Plain text version always included
- Unsubscribe in every non-transactional email
- User controls per email type in Settings
- Never more than 2 emails per day per user
- Never send an email that does not have a clear reason

---

## Public Portfolio (Phase 4)

Auto-generated at mintmark.app/u/[username].
Off by default. Opt-in in Settings.
Shows: heatmap (intensity only, no source breakdown),
  topic cloud, recent published posts, activity stats summary.
Never shows: notes content, session details, browsing data,
  source breakdown of heatmap, AI conversations.
ISR on Vercel, revalidated hourly.
Username: alphanumeric + hyphens, 3–30 chars, no reserved words.

---

## Design System

Design pipeline: Google Stitch → DESIGN.md → Claude Code builds
Every Claude Code prompt for UI reads DESIGN.md first.
DESIGN.md is the single source of truth for all design tokens.
Never use default shadcn styling — always override to match DESIGN.md.

Typography: Sora (headings) + DM Sans (body)
Colors: warm antique gold accent on near-black background
Themes: Vault (default dark), Midnight, Studio, Daylight
Dark mode by default, light mode toggle available.

Stitch project: https://stitch.withgoogle.com/projects/3017715713759689498
Stitch MCP: claude mcp add stitch --transport http
  --url "https://stitch.googleapis.com/mcp"
  --header "X-Goog-Api-Key: [key]"

---

## Naming and Branding

Product name: Mintmark
Tagline: "Your AI layer on your intellectual life"
Alt tagline: "Know what you know. See how you're growing."
Logo: minimal stamp or seal mark, M geometry
Domain: mintmark.app or mintmark.so

---

## What Mintmark Is Not (Scope Guard)

Not a social media scheduling tool (Buffer, Hootsuite, Taplio)
Not a content generation machine — posting is output, not the core
Not a CMS or full blogging platform
Not a general AI chatbot — assistant is strictly scoped to user's data
Not a replacement for Notion — sync target only
Not an analytics dashboard — no metrics surface to the user
Not developer-only — any professional learner is the audience
Not a surveillance tool — minimum viable data, always local-first
Not a public leaderboard — all activity data private by default
Not a notification machine — surface only what genuinely matters
Not a Pomodoro or productivity timer — Mintmark tracks, it does not time

---

## How to Help Me

When writing data-fetching code: TanStack Query always,
  never useState + useEffect to fetch, all HTTP via src/lib/axios.ts.

When cross-component state needed after mutation: Zustand store flag.

When building any AI feature:
  - Confirm it uses the BYOK adapter
  - Confirm it is strictly scoped to requesting user's data (user_id first)
  - Confirm it has a threshold check before the AI call
  - Confirm it streams where UX benefits from streaming
  - Confirm it cites sources when answering from user's data

When the AI assistant is involved: it must never behave as a general
  chatbot. If the user asks something outside their own data, the
  assistant acknowledges the limit and redirects to what it does know.

When suggesting AI calls: ask "does this justify a call?"
  If a rule-based check can answer the same question, use the rule.

When building any agent: implement as a Trigger.dev task.
  No external agent framework. Native TypeScript orchestration only.

When building heatmap or calendar features:
  Always write to unified_activity.
  Never create source-specific tables.
  Always include (user_id, activity_date) index.

When building the intelligence layer:
  Threshold check before AI call — always.
  Never surface more than 2 suggestion cards at once.
  Never show the same suggestion type two days in a row.
  A quiet day must show nothing — no filler cards.

When building content generation:
  Read user_settings.active_platforms first.
  Only generate for active platforms — never all three by default.
  Check platform is in active set before creating an agent task for it.

When building the Gmail intelligence widget (Phase 2):
  Read-only scope — never send, never store raw email content.
  Surface only — links out to Gmail for full management.
  Process server-side, user-scoped, never store raw.

When building browser or YouTube tracking (Phase 3):
  Processing happens in the Chrome extension first.
  Only aggregated summaries reach the backend.
  Full URLs never leave the browser.
  Always provide delete controls per category and date range.

When suggesting DB changes: show full migration SQL.

When building API routes: rate limiting + input validation +
  RLS verification — all three, always.

When building any user-facing data feature:
  Include view, export (JSON), and delete controls.

When a phase step completes: update Current Development State.
  Do not wait to be asked.

When asked about UI: remind to design in Google Stitch first,
  then build from DESIGN.md.

When building for mobile: bottom nav below 768px,
  44px minimum tap targets, test calendar and heatmap on small screens.

When evaluating a new feature idea: check if it belongs in the
  defined phase plan, flag scope creep, flag if it adds unnecessary
  cost or noise for the user.

When someone suggests adding timers, stopwatches, or Pomodoro:
  Mintmark tracks activity, it does not manage time.
  A session logger that records duration is the correct pattern.
  A live timer widget is out of scope.

Always think about the non-developer user.
Mintmark is for any professional who learns — not just engineers.