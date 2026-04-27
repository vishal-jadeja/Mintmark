# Mintmark — Step 10: Deploy

## Overview

Step 10 takes the fully-built app (Steps 1–9) to production. No new
features are added. The goal is a clean, reproducible deployment that
any developer can follow from a fresh checkout.

```
Phase 10.1  →  Production config (next.config.ts, vercel.json)   ✅
Phase 10.2  →  Environment variable reference (.env.example)      ✅
Phase 10.3  →  Vercel deployment                                   ⬜
Phase 10.4  →  Supabase production schema                          ⬜
Phase 10.5  →  Upstash Redis verification                          ⬜
Phase 10.6  →  Trigger.dev cloud deployment                        ⬜
Phase 10.7  →  OAuth app production credentials                    ⬜
Phase 10.8  →  Brevo domain verification                           ⬜
Phase 10.9  →  Smoke test checklist                                ⬜
```

---

## Phase 10.1 — Production config

### `next.config.ts`

Adds security headers and image remote patterns. No functional changes.

Security headers applied to every response:

- `Strict-Transport-Security` — force HTTPS, preload-eligible
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, microphone, geolocation all blocked

Image remote patterns (Next.js Image component):

- `avatars.githubusercontent.com` — GitHub avatars
- `lh3.googleusercontent.com` — Google/Gmail profile photos
- `media.licdn.com` — LinkedIn profile photos

### `vercel.json`

Minimal config:

- Framework: nextjs (tells Vercel build system)
- API function max duration: 30s (default is 10s, too short for
  batch invite jobs and OAuth token exchanges)
- Trigger.dev tasks run on their own cloud — no Vercel functions needed

---

## Phase 10.2 — Environment variable reference

`.env.example` documents every env var required to run Mintmark.
Copy it to `.env.local` for local dev, populate all values.

---

## Phase 10.3 — Vercel deployment

### Steps

1. Push the repo to GitHub (if not already done).

2. Import the project at vercel.com/new:
   - Select the GitHub repo
   - Framework: Next.js (auto-detected)
   - Root directory: `.` (default)
   - Build command: `next build`
   - Output directory: `.next`

3. Set all environment variables from `.env.example`.
   Do NOT set `NEXT_PUBLIC_APP_URL` to localhost — set it to the
   Vercel domain (`https://your-project.vercel.app`) or custom domain.

4. Deploy.

5. After first deploy, add the production domain in Vercel → Settings →
   Domains. Update `NEXT_PUBLIC_APP_URL` to match.

### Environment variable notes

- `AUTH_SECRET`: generate with `openssl rand -hex 32`
- `ENCRYPTION_KEY`: generate with `openssl rand -hex 32`
- `NEXT_PUBLIC_APP_URL`: must be the exact production URL including
  protocol, no trailing slash

---

## Phase 10.4 — Supabase production schema

If using a separate Supabase project for production (recommended):

1. Create a new project at app.supabase.com.
2. In the SQL editor, run `supabase/schema.sql` top-to-bottom.
3. Then run `supabase/phase8_schema.sql`.
4. Enable RLS on all tables — the schema includes the RLS policies
   but verify them in Table Editor → each table → RLS enabled.
5. Copy `NEXT_PUBLIC_SUPABASE_URL` and keys from Supabase → Settings
   → API. Use the new naming convention this project requires:
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = anon/public key
   - `SUPABASE_SECRET_KEY` = service_role key

### Verify functions exist

Run this in the SQL editor to confirm all Postgres functions are present:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
  AND routine_schema = 'public'
ORDER BY routine_name;
```

Expected: `accept_invite_account`, `generate_referral_code`,
`get_admin_waitlist`, `get_waitlist_position`.

### Create system_config defaults

```sql
INSERT INTO system_config (key, value)
VALUES ('invite_cap', '100')
ON CONFLICT (key) DO NOTHING;
```

---

## Phase 10.5 — Upstash Redis

1. Create a database at console.upstash.com (free tier is sufficient).
2. Select the REST API tab.
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` into
   Vercel environment variables.
4. No other setup needed — rate limiters and cache helpers initialize
   lazily on first request.

Verify: hit any admin route in production and check Upstash console
for incoming commands. The `admin:stats` key should appear after the
first admin dashboard load.

---

## Phase 10.6 — Trigger.dev cloud deployment

Trigger.dev v3 tasks must be deployed to the Trigger.dev cloud
separately from Vercel. They run on Trigger.dev's own infrastructure.

### Steps

1. Sign in at cloud.trigger.dev, create a project.
2. Copy the project ID (`proj_...`) → `TRIGGER_PROJECT_ID` env var.
3. Copy the secret key (`tr_prod_...`) → `TRIGGER_SECRET_KEY` env var.
4. Update `trigger.config.ts` if the project ID was hard-coded.
5. Deploy tasks:
   ```bash
   npx trigger.dev@latest deploy
   ```
   This bundles and uploads all tasks in `src/trigger/`.
6. In the Trigger.dev dashboard, verify all 5 tasks appear:
   - `github-backfill`
   - `send-batch-invites`
   - `cleanup-expired-tokens`
   - `daily-intelligence`
   - `topic-extraction`
7. `cleanup-expired-tokens` is a scheduled task (cron `0 2 * * *`).
   Verify the schedule is registered in Trigger.dev → Schedules tab.

### Trigger.dev access to Supabase

Trigger.dev tasks need the same Supabase and email env vars.
Set them in Trigger.dev → Project → Environment Variables:

```
SUPABASE_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
BREVO_API_KEY
EMAIL_FROM
NEXT_PUBLIC_APP_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

---

## Phase 10.7 — OAuth app production credentials

Each OAuth provider needs its own production app with the production
callback URL. Local OAuth credentials will not work in production
(redirect URIs must match exactly).

### Callback URL pattern

`https://YOUR_PRODUCTION_DOMAIN/api/connections/[platform]/callback`

### GitHub

1. github.com → Settings → Developer settings → OAuth Apps → New
2. Homepage URL: `https://YOUR_DOMAIN`
3. Authorization callback URL:
   `https://YOUR_DOMAIN/api/connections/github/callback`
4. Copy client ID → `GITHUB_CLIENT_ID`
5. Generate a new client secret → `GITHUB_CLIENT_SECRET`

### Google (Gmail)

1. console.cloud.google.com → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs:
   `https://YOUR_DOMAIN/api/connections/gmail/callback`
4. Enable the Gmail API in the project
5. Copy → `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`

### LinkedIn

1. developer.linkedin.com → My apps → Create app
2. Products: Sign In with LinkedIn using OpenID Connect + Share on LinkedIn
3. Authorized redirect URL:
   `https://YOUR_DOMAIN/api/connections/linkedin/callback`
4. Copy → `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`

### X (Twitter)

1. developer.twitter.com → Projects & Apps → New app
2. App permissions: Read and Write
3. Callback URL:
   `https://YOUR_DOMAIN/api/connections/x/callback`
4. Copy client ID and secret → `X_CLIENT_ID`, `X_CLIENT_SECRET`

### Medium

1. medium.com/me/settings → Security and apps → Developers → New app
2. Callback URL:
   `https://YOUR_DOMAIN/api/connections/medium/callback`
3. Copy → `MEDIUM_CLIENT_ID`, `MEDIUM_CLIENT_SECRET`

---

## Phase 10.8 — Brevo domain verification

Mintmark sends transactional email from `EMAIL_FROM` via Brevo.
Sending from an unverified domain will result in high bounce rates.

### Steps

1. app.brevo.com → Senders, Domains & IPs → Domains → Add a domain
2. Enter your sending domain (the domain part of `EMAIL_FROM`)
3. Add the DNS records Brevo provides:
   - SPF record (TXT): `v=spf1 include:spf.brevo.com ~all`
   - DKIM record (TXT): provided by Brevo
   - DMARC record (TXT): `v=DMARC1; p=none` (tighten later)
4. Click Verify — DNS propagation can take up to 24h
5. Once verified, test with Brevo's email test tool

Note: `EMAIL_FROM` must match the verified domain exactly.

---

## Phase 10.9 — Smoke test checklist

Run through this after deploying to production. Mark each item.

### Public routes

- [ ] `GET /` — landing page loads, waitlist form visible
- [ ] `POST /api/waitlist/join` — submission succeeds, email received
- [ ] `GET /api/waitlist/count` — returns a number
- [ ] `GET /ref/[code]` — redirects correctly, increments referral

### Auth routes

- [ ] `/login` — login page loads
- [ ] Invite email → `/invite/[token]` — form loads, account created
- [ ] Login with created account — redirects to `/onboarding`

### Onboarding

- [ ] Onboarding wizard loads, 4 steps work
- [ ] Connect GitHub → OAuth flow completes → redirect back → GitHub shown as connected
- [ ] Completing onboarding → redirects to `/dashboard`

### Dashboard

- [ ] `/dashboard` loads with real data (or empty state if no activity)
- [ ] Heatmap renders
- [ ] Streak counter is correct

### Admin

- [ ] `/admin` loads for admin account
- [ ] Admin can send invite → email received → invite token valid

### Background jobs

- [ ] Trigger.dev dashboard shows tasks as deployed
- [ ] `cleanup-expired-tokens` schedule shows next run at 2am UTC
- [ ] Manual trigger of `send-batch-invites` → invite sent

### Security

- [ ] Response headers include HSTS, X-Content-Type-Options, etc.
- [ ] `/admin` returns redirect for non-admin user, not 404
- [ ] `/dashboard` redirects to `/login` for unauthenticated user

---

## Files created/modified in this step

| File                        | Action                                     |
| --------------------------- | ------------------------------------------ |
| `mintmark-step10-deploy.md` | New spec (this file)                       |
| `vercel.json`               | New                                        |
| `.env.example`              | New                                        |
| `next.config.ts`            | Modified — security headers + image config |
| `CLAUDE.md`                 | Updated — Step 10 status                   |
| `README.md`                 | Updated — current status + env var section |
