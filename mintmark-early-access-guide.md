# Mintmark — Early Access Build Guide

## Step-by-step with Claude Code prompts

---

## CURRENT STATUS — Phase 1 Early Access Complete

```
Step 1  → Project bootstrap + Stitch MCP design pull          ✅ DONE
Step 2  → Supabase schema + RLS setup                         ✅ DONE
Step 3  → Waitlist landing page                               ✅ DONE
Step 4  → Email infrastructure (Resend)                       ✅ DONE
Step 5  → Referral system                                     ✅ DONE
Step 6  → Invite token system + login + NextAuth v5           ✅ DONE
Step 7  → Admin dashboard + NextAuth role protection          ✅ DONE
──────────────────────────────────────────────────────────────────────
Step 8  → Onboarding (platform connections, active platforms, ⬅ YOU ARE HERE
           per-platform AI instructions, onboarding data pump)
Step 9  → Trigger.dev background jobs                         ⬜ TODO
Step 10 → Deploy                                              ⬜ TODO
```

### Completed — what exists in the codebase

**Step 1** — Design system pulled from Stitch MCP. `DESIGN.md`, `tailwind.config.ts`,
`src/styles/globals.css` + `tokens.css` + `themes.css` + `bridge.css`, `src/lib/design.ts`.

**Step 2** — Supabase schema created. Tables: `users`, `waitlist`, `invite_tokens`,
`user_settings`. RLS policies, indexes, DB functions (`generate_referral_code`,
`get_waitlist_position`). TypeScript types at `src/types/database.ts`.

**Step 3** — Waitlist landing page at `src/app/page.tsx` +
`src/components/landing/LandingPage.tsx`. Hero with ambient glow, dynamic count,
WaitlistForm with success state + referral link. Framer Motion animations throughout.

**Step 4** — Full API + email layer. Supabase clients (admin/server/browser),
`src/proxy.ts` (Supabase SSR cookie helper),
rate limiting, AES-256-GCM encryption, React Email templates, Resend wrapper.
API routes: `POST /api/waitlist/join`, `GET /api/waitlist/verify`,
`GET /api/waitlist/count`.

**Step 5** — Referral system. `src/app/ref/[code]/page.tsx` sets cookie + redirects.
`WaitlistForm` reads cookie on mount, sends `referred_by` in payload.
`GET /api/waitlist/referral-stats` returns position + referral count.
Success state shows live stats, auto-refreshes every 30s.
`src/lib/config.ts` added: `REFERRAL_SLOTS_BONUS = 5` and `getEarlyAccessLimit(supabase)`
for DB-backed invite cap (default 100, editable from admin dashboard without redeploy).
`system_config` table added to schema + `src/types/database.ts`.
`WaitlistForm` referral copy is now position-aware: users already in the top
`REFERRAL_SLOTS_BONUS` positions see "You're near the top" instead of "Move Up Faster".

**Step 6** — Invite token system + authentication.
`src/app/invite/[token]/page.tsx` (server-side token verify, shows form or error).
`src/components/auth/InviteSignupForm.tsx` (name + password fields, useActionState).
`GET /api/auth/verify-token` + `POST /api/auth/accept-invite`.
`src/app/login/page.tsx` — clean login page.
`src/auth.ts` — NextAuth v5 config: Credentials provider, JWT strategy, admin role in token.
`src/types/next-auth.d.ts` — module augmentation for role field.

**Step 7** — Admin dashboard + route protection.
`src/app/admin/page.tsx` + `src/components/admin/AdminDashboard.tsx`.
5 API routes: `GET /api/admin/stats`, `GET /api/admin/waitlist`,
`POST /api/admin/send-invite`, `POST /api/admin/batch-invite`, `PATCH /api/admin/config`.
`src/lib/auth/requireAdmin.ts` — server-side admin guard used in all admin routes.
`src/middleware.ts` — Next.js middleware protecting `/admin` routes via NextAuth JWT role check.
> Note: Implementation uses NextAuth JWT role-based protection instead of the ADMIN_SECRET
> bearer token approach described in the original Step 7 prompt. The middleware reads the
> JWT, checks `token.role === "admin"`, and redirects to `/login` if not authorized.

### Remaining — what still needs to be built

**Step 8 — Onboarding** (critical for tracking-first model — see CLAUDE.md spec)
Platform connections: LinkedIn, X, Medium (OAuth).
Active platform selection stored in `user_settings.active_platforms`.
Per-platform AI instructions (tone, format, length per platform).
Onboarding data pump — seeds unified_activity before user leaves onboarding.

**Step 9** — Trigger.dev v3: `send-batch-invites` task, `cleanup-expired-tokens`
daily schedule, `weekly-digest` stub.

**Step 10** — Vercel deploy, Resend domain verification, Upstash Redis,
Trigger.dev deploy.

---

## STEP 1 — Project Bootstrap + Stitch MCP

### What to do manually first

1. Create a new Next.js project:

```bash
npx create-next-app@latest mintmark --typescript --tailwind --app --src-dir --import-alias "@/*"
cd mintmark
```

2. Install core dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr next-auth@beta
npm install @upstash/redis @upstash/ratelimit
npm install resend
npm install @trigger.dev/sdk
npm install framer-motion
npm install lucide-react
npx shadcn@latest init
```

3. Add the Stitch MCP to Claude Code:

```bash
claude mcp add stitch \
  --transport http \
  --url "https://stitch.googleapis.com/mcp" \
  --header "X-Goog-Api-Key: YOUR_KEY_HERE"
```

4. Open Claude Code in your project root:

```bash
claude
```

### Claude Code Prompt — Step 1

```
I'm building Mintmark, a personal branding platform. Before writing any code,
use the Stitch MCP to fetch the design system from my project at:
https://stitch.withgoogle.com/projects/3017715713759689498

Extract and save the complete design system including:
- Color tokens (primary, secondary, accent, backgrounds, borders)
- Typography (font families, sizes, weights, line heights)
- Spacing scale
- Border radius values
- Shadow definitions
- Component styles for buttons, inputs, cards, badges

Save this as DESIGN.md in the project root.

Then create the following config files that reference those tokens:

1. tailwind.config.ts — extend the default config with all Mintmark design
   tokens from the Stitch export. Use CSS custom properties as the bridge
   so the values work with both Tailwind classes and raw CSS.

2. src/styles/globals.css — define all CSS custom properties from the
   design system. Dark mode by default using the [data-theme="dark"]
   selector, with [data-theme="light"] as the override.

3. src/lib/design.ts — export typed constants for all design tokens so
   they can be referenced in TypeScript (e.g. for Framer Motion animations
   that need raw values).

The design direction is: dark background, gold/amber accent (coin heritage),
minimal and dense like Linear or Vercel dashboard. Name "Mintmark" comes from
the stamp a mint presses on a coin — authentic, certified, from a specific source.
```

---

## STEP 2 — Supabase Schema + RLS

### What to do manually first

1. Create a new Supabase project at supabase.com
2. Copy your project URL and anon key
3. Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...   # from Supabase dashboard → API Keys
SUPABASE_SECRET_KEY=sb_secret_...                         # from Supabase dashboard → API Keys
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
ENCRYPTION_KEY=generate_with_openssl_rand_base64_32
```

Note: New Supabase projects (created after Nov 1 2025) use `sb_publishable_` and `sb_secret_`
keys instead of the legacy JWT anon/service_role keys. Get both from your Supabase dashboard
under Project Settings → API Keys.

### Claude Code Prompt — Step 2

```
Create the complete Supabase database schema for Mintmark's early access system.

Run this in the Supabase SQL editor (output as a file I can copy):

TABLES NEEDED (early access phase only):

1. users
   - id uuid primary key default gen_random_uuid()
   - email text unique not null
   - name text
   - avatar text
   - created_at timestamptz default now()

2. waitlist
   - id uuid primary key default gen_random_uuid()
   - email text unique not null
   - name text
   - reason text (why do you want access — optional)
   - referral_code text unique not null
   - referred_by text (referral_code of whoever referred them)
   - position integer
   - status text default 'waiting' — constraint: waiting | invited | joined
   - email_verified boolean default false
   - verification_token text
   - created_at timestamptz default now()

3. invite_tokens
   - id uuid primary key default gen_random_uuid()
   - email text not null
   - token text unique not null
   - expires_at timestamptz not null
   - used_at timestamptz
   - created_at timestamptz default now()

4. user_settings (stub for later)
   - user_id uuid references users(id) on delete cascade
   - theme text default 'dark'
   - created_at timestamptz default now()

5. system_config (key-value store for runtime-editable settings)
   - key text primary key
   - value text not null
   - updated_at timestamptz default now()

   Seed row:
   INSERT INTO system_config (key, value) VALUES ('early_access_limit', '100');

   RLS: enable RLS, only service role can SELECT/INSERT/UPDATE/DELETE.
   This table holds admin-editable values (like the invite cap) so they
   can be changed from the admin dashboard without a redeploy.

INDEXES:
- waitlist: email, referral_code, referred_by, status, created_at
- invite_tokens: token, email, expires_at

RLS RULES:
- waitlist table: enable RLS.
  Public can INSERT (signup).
  Only service role can SELECT/UPDATE/DELETE.
- invite_tokens table: enable RLS.
  Public can SELECT where token = $token AND used_at IS NULL AND expires_at > now() (for token verification).
  Only service role can INSERT/UPDATE/DELETE.
- users table: enable RLS.
  Users can only SELECT/UPDATE their own row (auth.uid() = id).
  Only service role can INSERT.
- user_settings: users can SELECT/UPDATE their own row.

FUNCTIONS:
- generate_referral_code() — returns an 8-char alphanumeric code,
  uppercase, guaranteed unique in the waitlist table.
  Use this as a trigger on waitlist INSERT to auto-populate referral_code.

- get_waitlist_position(p_email text) — returns the current queue
  position for an email based on: original signup order + bonus
  positions from referrals (-5 spots per referral, capped at position 1).

Also output the TypeScript types file at src/types/database.ts
that matches this schema exactly. Use the Supabase type generation
format with Database, Tables, and Insert/Update helper types.
```

---

## STEP 3 — Waitlist Landing Page

### What to do manually first

- Decide if this lives at `/` (root) or a subdomain like `early.mintmark.app`
- For now, build it as the root `/` page — it will be replaced when the main app launches

### Claude Code Prompt — Step 3

```
Build the Mintmark waitlist landing page at src/app/page.tsx.

First read DESIGN.md to get the exact design tokens before writing any code.

PAGE SECTIONS (in order, single scrollable page):

1. HERO SECTION
   - Full viewport height
   - Background: dark, near-black (from DESIGN.md bg primary)
   - Animated ambient glow — a subtle gold/amber radial gradient that
     slowly pulses. Use Framer Motion animate with repeat: Infinity.
     Keep it tasteful — like light catching a coin, not a rave.
   - Logo mark: SVG of an M inside a circular stamp/seal shape.
     Gold accent color. ~48px.
   - Product name: "Mintmark" — large, the hero typeface from DESIGN.md
   - Tagline: "Stamp your knowledge on the internet"
   - Subline (smaller, muted): "Turn what you learn into content that
     builds your personal brand. LinkedIn, X, and Medium — all at once."
   - CTA: The waitlist form (email input + submit button) embedded
     directly in the hero. Not a link — the form IS the CTA.
   - Below the form: "Join 0 people on the waitlist" — dynamically
     loaded from /api/waitlist/count. Show a skeleton while loading.
   - Entrance animation: content fades in and shifts up 20px on load,
     staggered 100ms between each element.

2. WAITLIST FORM (embedded in hero, also as standalone component)
   Component: src/components/waitlist/WaitlistForm.tsx

   Fields:
   - Email (required)
   - Name (optional, placeholder: "Your name (optional)")
   - Why do you want access? (optional textarea,
     placeholder: "What are you hoping to use Mintmark for?")
   - HONEYPOT: hidden input named "website" — if filled, reject silently
     on the server. Never show this field. Use CSS to hide it
     (position absolute, left -9999px), NOT display:none (bots see through that).

   Behavior:
   - On submit: POST to /api/waitlist/join
   - Show loading state on button during submission
   - On success: replace form with success state showing:
     * "You're on the list! Check your email to confirm your spot."
     * Their referral link: mintmark.app/ref/[their_referral_code]
     * Copy button for the referral link
     * "Share your link — move up the queue for every friend who joins"
   - On error: show inline error, never clear the form

   Validation (client + server):
   - Email: valid format
   - All fields: trimmed, max lengths enforced
   - Rate limiting handled server-side (show friendly error if hit)

3. HOW IT WORKS SECTION
   Three cards in a row (stack on mobile):
   - "Learn anything" — YouTube, articles, your own notes
   - "Generate in seconds" — LinkedIn post, X thread, Medium article —
     all at once, in your voice
   - "Grow your brand" — track what you share, see what works,
     know what to post next
   Each card: icon (use lucide-react), title, 2-line description.
   Cards should feel like glass/surface tiles, not flat boxes.
   Use subtle border from DESIGN.md.

4. WHO IT'S FOR SECTION
   Horizontal scroll of persona chips on mobile, grid on desktop:
   Developers • Designers • Marketers • Writers • Students •
   Entrepreneurs • Consultants • Researchers
   Each chip shows an emoji + label. Muted styling, just to communicate breadth.
   Heading: "For anyone who learns and wants to be known for it"

5. SOCIAL PROOF PLACEHOLDER
   "Early access spots are limited" with a progress bar (mock data,
   e.g. 847/1000 spots claimed). Use an amber/gold progress fill.
   This is intentionally vague — just creates urgency.

6. FOOTER
   - Logo + tagline
   - Links: Privacy Policy, Terms (both link to placeholder /legal pages)
   - "© 2025 Mintmark"

ANIMATIONS:
- All sections: scroll-triggered fade-in using Framer Motion's
  whileInView with once: true
- Form submit button: subtle scale on hover/active
- Success state: animate in with spring physics
- No layout shifts — all animations are opacity + transform only

MOBILE:
- Full responsive, mobile-first
- Form takes full width on mobile
- Referral link: truncate with copy button
- Hero section: reduce font sizes gracefully

PERFORMANCE:
- No images — all SVG or CSS
- Keep the JS bundle lean — no unnecessary imports
```

---

## STEP 4 — API Routes + Email

### Claude Code Prompt — Step 4

```
Build the API layer for the Mintmark waitlist system.

Read DESIGN.md first. Then build these files:

--- src/lib/supabase/admin.ts ---
Admin Supabase client — uses SUPABASE_SECRET_KEY (sb_secret_...), bypasses RLS.
Use @supabase/supabase-js createClient directly (not @supabase/ssr).
Server-side only. NEVER import in Client Components.
Export: createAdminClient() — for privileged DB operations (waitlist writes,
invite tokens, admin actions).

--- src/lib/supabase/server.ts ---
Server Supabase client — uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, respects RLS.
Use @supabase/ssr createServerClient with Next.js cookies().
Export: createClient() — for Server Components, Route Handlers, Server Actions
that should respect Row Level Security.

--- src/lib/supabase/client.ts ---
Browser Supabase client — uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, respects RLS.
Use @supabase/ssr createBrowserClient.
Export: createClient() — for Client Components ("use client") only.

--- src/proxy.ts ---
Supabase session refresh proxy. Must use @supabase/ssr createServerClient
with both getAll and setAll cookie methods (reads from request, writes to response).
Calls supabase.auth.getUser() — NOT getSession() — to refresh tokens on every request.
Required by Supabase SSR for correct session handling.

--- src/lib/rate-limit.ts ---
Upstash Redis rate limiter using @upstash/ratelimit.
Export these limiters:
- waitlistLimiter: 10 requests per IP per hour (sliding window)
- apiLimiter: 100 requests per user per minute (fixed window)

Helper function: checkRateLimit(identifier: string, limiter)
→ returns { success: boolean, reset: number, remaining: number }

--- src/lib/encryption.ts ---
AES-256-GCM encryption for sensitive values.
Use Node.js crypto module (built-in, no extra deps).
Export:
- encrypt(plaintext: string): string — returns base64 encoded
  "iv:authTag:ciphertext"
- decrypt(encoded: string): string — reverses it
- Uses ENCRYPTION_KEY env var (must be 32 bytes / 64 hex chars)

--- src/app/api/waitlist/join/route.ts ---
POST handler for waitlist signup.

Steps:
1. Parse request body — extract email, name, reason, referred_by,
   website (honeypot), plus any ref query param
2. Check honeypot — if website field is not empty, return 200 silently
   (don't reveal you're rejecting it)
3. Rate limit by IP — use waitlistLimiter.
   If exceeded: return 429 with "Too many signups from this location.
   Try again later."
4. Validate email format (use a simple regex, no external libraries)
5. Check if email already on waitlist — if so, return 200 with
   message "You're already on the list! Check your email."
6. Generate a 6-char alphanumeric verification token
7. Insert into waitlist table:
   - email, name, reason
   - referral_code (generated by DB trigger)
   - referred_by (if ref param present and valid)
   - verification_token
   - status: 'waiting'
   - email_verified: false
8. Send verification email via Resend (see email templates below)
9. If referred_by is valid, log that a new referral happened
   (the position recalculation happens in the DB function)
10. Return 200 with: { message, position (estimated) }

Error handling: Never expose DB errors to client. Log server-side,
return generic "Something went wrong" to client.

--- src/app/api/waitlist/verify/route.ts ---
GET handler: /api/waitlist/verify?token=xxx
1. Find the token in waitlist.verification_token
2. If found: set email_verified = true, clear verification_token
3. Return a redirect to /?verified=true
   (the landing page will show a success message based on this param)
4. If not found: redirect to /?verified=false

--- src/app/api/waitlist/count/route.ts ---
GET handler — returns total waitlist count.
Cache this response for 60 seconds (set Cache-Control header).
Return: { count: number }

--- src/lib/email/templates.ts ---
Resend email templates using React Email components.
Install: npm install @react-email/components react-email

Templates to build:

1. WaitlistConfirmationEmail
   Props: { name?: string, email: string, verificationUrl: string,
            referralCode: string, referralUrl: string }
   Content:
   - Subject: "Confirm your spot on the Mintmark waitlist"
   - Header: Mintmark logo (text-based, styled)
   - Body: "Thanks for joining! Confirm your email to lock in your spot."
   - Big CTA button: "Confirm my spot" → verificationUrl
   - Section: "Move up the queue" — show referral link,
     explain that each referral moves them up
   - Footer: unsubscribe handled by Resend, plain text version required

2. InviteEmail
   Props: { name?: string, email: string, inviteUrl: string,
            expiresAt: string }
   Content:
   - Subject: "You're invited to Mintmark — your access is ready"
   - Body: You've been invited. This link expires in 48 hours.
   - Big CTA: "Accept your invitation" → inviteUrl
   - Warning: "This link is single-use and expires [expiresAt]"

--- src/lib/email/send.ts ---
Wrapper around Resend.
Export: sendEmail({ to, subject, react, text })
Uses RESEND_API_KEY env var.
Never throws — catches errors, logs them, returns { success: boolean }.
From address: notifications@mintmark.app

Make sure RESEND_API_KEY never reaches the client bundle.
All email sending happens server-side only.
```

---

## STEP 5 — Referral System

### Claude Code Prompt — Step 5

```
Build the referral tracking system for Mintmark's waitlist.

--- src/app/ref/[code]/page.tsx ---
When someone visits /ref/[code]:
1. Read the referral code from the URL
2. Set a cookie: referral_code=[code] with 30 day expiry,
   httpOnly: false (needs to be read client-side for the form)
3. Redirect to / (the landing page)
The WaitlistForm already reads this cookie and pre-fills the
referred_by field on the join API call.

Update src/components/waitlist/WaitlistForm.tsx:
- On mount, read the referral_code cookie
- If present, include it as referred_by in the POST body
- Don't show this to the user — it's invisible tracking

--- src/app/api/waitlist/referral-stats/route.ts ---
GET /api/waitlist/referral-stats?email=xxx
Returns how many successful referrals an email has made and
their current estimated queue position.
Use the get_waitlist_position() Supabase function.
Rate limit: 10 req per IP per minute.

Add to the WaitlistForm success state:
After joining, show a "Your referral stats" section that
auto-refreshes every 30 seconds while the user has the tab open.
Show:
- "Your position: #[X] of [total]"
- "Referrals: [N] friends joined with your link"
- "Each referral moves you up 5 spots"
This makes the referral loop feel rewarding immediately.
```

---

## STEP 6 — Invite Token System

### What exists already (added in Step 5 refactor)

`src/lib/config.ts` — already created. Exports:
- `REFERRAL_SLOTS_BONUS = 5` — must stay in sync with the `-5 per referral`
  logic in the `get_waitlist_position` DB function.
- `getEarlyAccessLimit(supabase)` — reads `system_config` table key
  `early_access_limit`, falls back to `EARLY_ACCESS_LIMIT` env var, then 100.
  Import this in admin invite routes (Step 7) — do NOT hardcode the limit.

### Claude Code Prompt — Step 6

```
Build the invite token system for Mintmark early access.

--- src/lib/tokens.ts ---
Export:
- generateInviteToken(): string — cryptographically random
  32-byte hex string using crypto.randomBytes
- createInviteToken(email: string): Promise<{ token, expiresAt }>
  Inserts into invite_tokens table, sets expires_at = now() + 48 hours
  Returns the token and expiry.
- verifyInviteToken(token: string): Promise<{ valid: boolean, email?: string }>
  Checks: token exists, used_at IS NULL, expires_at > now()
  Returns email if valid.
- consumeInviteToken(token: string): Promise<boolean>
  Sets used_at = now() on the token. Idempotent — returns false if
  already used. Must be atomic (use a Supabase RPC with FOR UPDATE).

--- src/app/invite/[token]/page.tsx ---
The invite acceptance page.
1. Server component — verify the token server-side on page load
2. If invalid or expired: show an error page with message
   "This invite link has expired or already been used.
   You can rejoin the waitlist for the next batch."
   Include a link back to /?from=expired-invite
3. If valid: show the signup form (see below)
4. The token is passed to the form as a prop — never put it in
   a hidden input, pass it through a server action instead

--- src/components/auth/InviteSignupForm.tsx ---
The signup form shown on /invite/[token].
Fields: name (required), email (pre-filled from token, read-only),
password (min 8 chars), confirm password.
On submit: POST to /api/auth/invite-signup with the token
(handled as a server action, not client-side).

--- src/app/api/auth/invite-signup/route.ts ---
POST handler for invite-based signup.
1. Re-verify the token (always re-verify, never trust client state)
2. Verify token email matches submitted email exactly
3. Validate password strength (min 8 chars, 1 number, 1 uppercase)
4. Create the user in Supabase Auth using admin client
5. Consume the invite token (mark used_at)
6. Update waitlist record: status = 'joined'
7. Create user_settings row with defaults
8. Send welcome email via Resend
9. Return success — client redirects to /dashboard
   (which will be the main app, gated)

Security requirements:
- Token consumption must happen AFTER user creation succeeds
  (don't burn the token if user creation fails)
- If user already exists with that email, return a friendly error
- Rate limit: 5 attempts per IP per hour on this endpoint
- Log all signup attempts (success and failure) server-side
  with timestamp and IP (hashed, not raw)
```

---

## STEP 7 — Admin Dashboard

### Claude Code Prompt — Step 7

```
Build the Mintmark admin dashboard for managing early access.

This lives at /admin — protected by a simple admin secret in env vars
(ADMIN_SECRET). Not a full auth system — just a bearer token check
in middleware. We'll add proper admin auth in a later phase.

--- src/proxy.ts ---
Add a check: if path starts with /admin, verify the request has
the header Authorization: Bearer [ADMIN_SECRET] OR a cookie
admin_token=[ADMIN_SECRET].
If not present: redirect to /admin/login.
Don't interfere with any other routes.

--- src/app/admin/login/page.tsx ---
Simple password form. On submit, if password matches ADMIN_SECRET,
set admin_token cookie (httpOnly, 24hr expiry), redirect to /admin.

--- src/app/admin/page.tsx --- (Server Component)
The main admin view. Fetches data server-side using service role.

Display:
1. STATS ROW (5 cards):
   - Total waitlist signups
   - Verified emails
   - Invites sent (tokens created)
   - Joined (used their invite)
   - Capacity: "X / Y slots used" where Y = getEarlyAccessLimit()
     Include an inline edit (pencil icon) that PATCHes the
     system_config row key="early_access_limit" without a page reload.
     Show a confirmation dialog before reducing the limit.

2. WAITLIST TABLE
   Columns: Position | Name | Email | Joined | Referrals | Status | Actions
   - Sortable by position, joined date, referrals count
   - Filter by status: all | waiting | invited | joined
   - Search by email (client-side filter, data already loaded)
   - Status badges: waiting (gray), invited (amber), joined (green)
   - Actions column:
     * "Send invite" button (status=waiting only) → calls
       /api/admin/send-invite with the email
     * "Copy invite link" (status=invited, if token not yet used)
     * "View" → shows a detail modal with full signup info
   - Pagination: 50 rows per page

3. BATCH INVITE SECTION
   - Input: number of invites to send (default 10)
   - Select: send to "top N by position" or "top N by referrals"
   - Button: "Send batch invites"
   - Calls /api/admin/batch-invite
   - Shows a confirmation modal before sending

--- src/app/api/admin/send-invite/route.ts ---
POST handler (admin only — verify ADMIN_SECRET in header).
Body: { email: string }
1. Call getEarlyAccessLimit(adminSupabase) from src/lib/config.ts
2. Count rows in waitlist where status IN ('invited', 'joined')
3. If count >= limit: return 409 { error: "Early access capacity reached
   (X/Y slots used). Increase the limit in admin settings first." }
4. Check the email is on the waitlist and status = 'waiting'
5. Generate an invite token (48hr expiry)
6. Send the InviteEmail via Resend
7. Update waitlist status to 'invited'
8. Return { success: true, expiresAt, slotsRemaining: limit - (count + 1) }

--- src/app/api/admin/batch-invite/route.ts ---
POST handler (admin only).
Body: { count: number, strategy: 'position' | 'referrals' }
1. Call getEarlyAccessLimit(adminSupabase) from src/lib/config.ts
2. Count rows where status IN ('invited', 'joined')
3. Compute available = limit - count. If available <= 0, return 409.
4. Clamp requested count to available: effectiveCount = min(count, available)
   (don't silently send more than the cap allows)
5. Select top effectiveCount emails from waitlist where status='waiting',
   ordered by position ASC (or referrals DESC)
2. For each: call the send-invite logic
3. Return { sent: number, failed: number, emails: string[] }
Queue this as a Trigger.dev job for large batches (>20)
so the HTTP response doesn't time out.

All admin routes must:
- Verify ADMIN_SECRET before any DB operation
- Never expose internal error details in responses
- Log all actions with timestamp

Use the same DESIGN.md design system for the admin UI.
Dark theme, dense table layout like Linear's issue list.
```

---

## STEP 8 — Early Access Gate

### Claude Code Prompt — Step 8

```
Add the early access gate to the main Mintmark app.

The main app will live at /app/* routes (not yet built — just the gate for now).

--- src/proxy.ts (update) ---
Extend the existing proxy:
- If path starts with /app or /dashboard:
  1. Check for a valid NextAuth session
  2. If no session: redirect to /invite-required
     (not /login — we want to be clear it's invite-only)
  3. If session exists but user was somehow created without
     going through invite flow: show a blocked state

--- src/app/invite-required/page.tsx ---
Shown when someone tries to access the app without an invite.
Content:
- Mintmark logo
- "Mintmark is currently invite-only"
- "We're letting people in gradually to make sure everything
  works great."
- If they have a referral link in their cookies (referral_code cookie):
  show "You were referred! You have a higher chance of getting
  an early invite."
- CTA: "Join the waitlist" → back to /
- If they're already on the waitlist (check via email cookie
  if we stored one): "You're already on the list at position #X.
  We'll email you when your invite is ready."

This page should feel warm, not like a rejection.
Brand voice: "You're almost in."

--- src/app/dashboard/page.tsx (stub) ---
For now, just a placeholder that shows:
- "Welcome to Mintmark, [user name]"
- "You're one of our early access members."
- A card saying "The full app is being built. Check back soon."
- The Mintmark logo and tagline

This will be replaced with the real dashboard in the next build phase.

NextAuth config:
Set up NextAuth v5 at src/auth.ts with:
- Credentials provider disabled (invite-only)
- No OAuth providers yet (those come in Phase 1 full build)
- Just the invite signup flow creates users in Supabase Auth
- Session: JWT strategy, store user id and email
- Callbacks: on session, attach the user's DB id
```

---

## STEP 9 — Trigger.dev Background Jobs

### Claude Code Prompt — Step 9

```
Set up Trigger.dev v3 for Mintmark's background jobs.

Install and initialize:
npm install @trigger.dev/sdk@v3
npx trigger.dev@v3 init

Create these jobs at src/trigger/:

--- src/trigger/send-batch-invites.ts ---
task id: "send-batch-invites"
payload: { count: number, strategy: 'position' | 'referrals',
           requestedBy: string }

Steps:
1. Query Supabase for top N waiting emails using strategy
2. For each email (process sequentially, not Promise.all —
   we don't want to hammer Resend):
   a. Generate invite token
   b. Send InviteEmail via Resend
   c. Update waitlist status to 'invited'
   d. Wait 100ms between sends (avoid rate limits)
3. Log results: { sent, failed, errors }

Add retry: { maxAttempts: 2 } on the task config.

--- src/trigger/weekly-digest.ts ---
task id: "weekly-digest" (stub for Phase 5 — create the file but
mark it as a TODO stub so it's ready for later)

--- src/trigger/cleanup-expired-tokens.ts ---
task id: "cleanup-expired-tokens"
Runs on a schedule: every day at 2am UTC
Deletes invite_tokens where expires_at < now() AND used_at IS NULL
Returns count of deleted tokens.

Update the batch invite API route to use the Trigger.dev task
for batches > 20 instead of processing inline.

Also create src/trigger/index.ts that exports all tasks.

Add TRIGGER_SECRET_KEY to the env vars list in the README.
```

---

## STEP 10 — Deploy

### What to do manually

1. Push to GitHub
2. Connect repo to Vercel
3. Add all environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   SUPABASE_SECRET_KEY
   NEXTAUTH_SECRET
   NEXTAUTH_URL (your Vercel URL)
   ENCRYPTION_KEY
   RESEND_API_KEY
   UPSTASH_REDIS_REST_URL
   UPSTASH_REDIS_REST_TOKEN
   ADMIN_SECRET
   TRIGGER_SECRET_KEY
   ```
4. Set up Resend: verify mintmark.app domain, add DNS records
5. Set up Upstash: create a Redis database, copy credentials
6. Deploy Trigger.dev: `npx trigger.dev@v3 deploy`

### Claude Code Prompt — Step 10

```
Do a pre-deploy audit of the Mintmark early access codebase.

Check every file and flag any issues in these categories:

SECURITY AUDIT:
- Any env vars referenced in client components or client-side code
  that should be server-only (SUPABASE_SECRET_KEY, ENCRYPTION_KEY,
  RESEND_API_KEY, NEXTAUTH_SECRET must NEVER appear in any file
  that runs client-side)
- Any API route missing rate limiting
- Any DB query missing user_id scoping
- Any input that reaches the DB without sanitization
- Any token or sensitive value that gets logged or returned to client
- Verify all RLS is enabled on all tables

PERFORMANCE AUDIT:
- Any API route doing synchronous work that should be a background job
- Any missing indexes (check all WHERE clauses against the schema)
- Any N+1 query patterns

CODE QUALITY:
- TypeScript: no any types, all DB operations use the typed
  Database types from src/types/database.ts
- All error paths handled — no unhandled promise rejections
- All Resend calls wrapped in try/catch

MISSING PIECES:
- Any TODO or placeholder that would break the live flow
- Any hardcoded values that should be env vars
- Any missing loading or error states in the UI

Output a prioritized list: P0 (blocks launch), P1 (fix soon), P2 (nice to have).
Fix all P0 issues automatically.
```

---

## ENVIRONMENT VARIABLES CHECKLIST

Copy this into your Vercel project settings:

| Variable                             | Source                                               | Client?        |
| ------------------------------------ | ---------------------------------------------------- | -------------- |
| NEXT_PUBLIC_SUPABASE_URL             | Supabase dashboard → API Keys                        | ✅ yes         |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Supabase dashboard → API Keys (`sb_publishable_...`) | ✅ yes         |
| SUPABASE_SECRET_KEY                  | Supabase dashboard → API Keys (`sb_secret_...`)      | ❌ server only |
| NEXTAUTH_SECRET                      | `openssl rand -base64 32`                            | ❌ server only |
| NEXTAUTH_URL                         | your domain                                          | ❌ server only |
| ENCRYPTION_KEY                       | `openssl rand -hex 32`                               | ❌ server only |
| RESEND_API_KEY                       | resend.com dashboard                                 | ❌ server only |
| UPSTASH_REDIS_REST_URL               | upstash.com dashboard                                | ❌ server only |
| UPSTASH_REDIS_REST_TOKEN             | upstash.com dashboard                                | ❌ server only |
| ADMIN_SECRET                         | make up a strong password                            | ❌ server only |
| TRIGGER_SECRET_KEY                   | trigger.dev dashboard                                | ❌ server only |
| EARLY_ACCESS_LIMIT                   | number of invite slots (default 100, overridden by system_config DB row) | ❌ server only |

---

## TIPS FOR WORKING WITH CLAUDE CODE

1. **Always start with DESIGN.md** — Every UI prompt should begin with
   "Read DESIGN.md first." Claude Code will use those tokens exactly.

2. **One step at a time** — Don't combine steps in one prompt.
   Each prompt above is scoped deliberately.

3. **When Stitch MCP returns design data** — Ask Claude Code to
   reconcile it with any hardcoded values and update DESIGN.md
   if the tokens changed.

4. **After each step** — Run `npm run build` and fix any TypeScript
   errors before moving to the next step. Accumulated errors compound.

5. **DB migrations** — Always ask for the full migration SQL,
   not just the diff. Run it in Supabase's SQL editor, not via code.

6. **Testing the flow** — After Step 6, manually test the full
   journey: signup → email → verify → invite → accept → dashboard.
   Fix any gaps before Step 7.