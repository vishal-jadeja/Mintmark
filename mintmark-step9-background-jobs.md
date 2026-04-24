# Mintmark — Step 9: Background Jobs (Trigger.dev)

## Overview

Step 9 establishes the background job layer. It moves work that should not
block API routes into Trigger.dev tasks, and creates the scaffolding that
Phase 2 features (daily intelligence, topic extraction) will grow into.

The existing synchronous admin invite routes stay intact — this step adds
background equivalents alongside them, and lays down the cron infrastructure.

```
Phase 9.1  →  send-batch-invites task          ✅ DONE
Phase 9.2  →  cleanup-expired-tokens cron      ✅ DONE
Phase 9.3  →  daily-intelligence stub          ✅ DONE
Phase 9.4  →  topic-extraction stub            ✅ DONE

```

---

## Existing Trigger.dev foundation (from Phase 8.4)

- `trigger.config.ts` — project config, scans `./src/trigger`
- `src/trigger/index.ts` — task registry
- `src/trigger/github-backfill.ts` — canonical task pattern example
- SDK: `@trigger.dev/sdk v4.4.3`

---

## Phase 9.1 — send-batch-invites

**Goal:** Background equivalent of `POST /api/admin/batch-invite`. Lets
the admin trigger large invite batches without risking an HTTP timeout,
and gives Trigger.dev retry/observability over each email send.

The existing synchronous route is kept intact — it's fine for the admin
dashboard's interactive flow. This task enables future automation
(scheduled drips, webhook-triggered invites, etc.).

**File:** `src/trigger/send-batch-invites.ts`

```typescript
Task id: "send-batch-invites"
Payload: { count: number; triggeredBy?: string }

Steps:
1. Check remaining capacity (invite_cap vs invited+joined count)
2. Cap count at remaining capacity
3. Fetch top N waiting users ordered by position, then created_at
4. For each candidate in parallel (Promise.allSettled):
   a. Generate 64-char hex token
   b. Insert into invite_tokens (email, token, expires_at = +48h)
   c. Update waitlist status → 'invited'
   d. Send InviteEmail via sendEmail()
5. Delete admin:stats from Redis cache
6. Return { invited: number, failed: string[] }
```

Reuses: `sendEmail`, `InviteEmail`, `INVITE_SUBJECT` from existing email lib.
Reuses: `createAdminClient`, `Redis` patterns from existing batch-invite route.

---

## Phase 9.2 — cleanup-expired-tokens

**Goal:** Daily cron that resets stale invites. Invite tokens expire after
48 hours. If a user never accepted, they remain stuck as 'invited' on the
waitlist and cannot be re-invited until the token is cleaned up. This job
runs automatically every night.

**File:** `src/trigger/cleanup-expired-tokens.ts`

```typescript
Task id: "cleanup-expired-tokens"
Schedule: cron "0 2 * * *"  (2am UTC daily)
Payload: none (scheduled task)

Steps:
1. Find expired, unused tokens:
   SELECT email FROM invite_tokens
   WHERE expires_at < now() AND used_at IS NULL
2. Collect affected emails
3. Delete expired unused tokens
4. Revert waitlist entries back to 'waiting'
   for all emails that are currently 'invited' AND have no remaining
   valid token (prevents reverting users who have a newer valid token)
5. Invalidate admin:stats Redis cache if any tokens cleaned
6. Return { cleaned: number, emailsReverted: string[] }
```

---

## Phase 9.3 — daily-intelligence stub

**Goal:** Scaffold the task that Phase 2's intelligence layer will fill.
Having the task registered now means Phase 2 can implement the body
without touching the registration or config.

**File:** `src/trigger/daily-intelligence.ts`

```typescript
Task id: "daily-intelligence"
Payload: { userId: string; date?: string }

Phase 2 will implement:
  - Load user's unified_activity for the date
  - Load topic_nodes context
  - Run Significance Agent (threshold check before AI call)
  - Run Pattern Agent (rule-based, no AI)
  - Run Opportunity Agent (only if threshold met)
  - Write results to daily_intelligence table
  - Invalidate dashboard cache in Upstash

Phase 1 stub: logs payload, returns { status: 'not_implemented' }
```

---

## Phase 9.4 — topic-extraction stub

**Goal:** Scaffold the task that will auto-tag topics from session notes
and free-text in Phase 2. Called after a session is logged with notes.

**File:** `src/trigger/topic-extraction.ts`

```typescript
Task id: "topic-extraction"
Payload: { userId: string; rawText: string; sourceId: string; sourceType: 'session' | 'note' }

Phase 2 will implement:
  - Embed rawText via BYOK provider (debounced, not on every call)
  - Extract topic tags via LLM (threshold: text must be > 50 words)
  - Upsert into topic_nodes
  - Update source row with extracted tags

Phase 1 stub: logs payload, returns { status: 'not_implemented' }
```

---

## Files to create/modify

| File | Action |
|------|--------|
| `mintmark-step9-background-jobs.md` | New spec (this file) |
| `src/trigger/send-batch-invites.ts` | New task |
| `src/trigger/cleanup-expired-tokens.ts` | New cron task |
| `src/trigger/daily-intelligence.ts` | New stub task |
| `src/trigger/topic-extraction.ts` | New stub task |
| `src/trigger/index.ts` | Register all 4 new tasks |
| `CLAUDE.md` | Update Step 9 status |

---

## Env vars required

```
TRIGGER_SECRET_KEY      # from Trigger.dev dashboard (already needed for Phase 8.4)
TRIGGER_PROJECT_ID      # from Trigger.dev dashboard
NEXT_PUBLIC_APP_URL     # already present
UPSTASH_REDIS_REST_URL  # already present
UPSTASH_REDIS_REST_TOKEN # already present
```

---

## Verification

1. `npx trigger.dev@latest dev` — all 5 tasks register without errors
2. Manually trigger `send-batch-invites` with `{ count: 1 }` from Trigger.dev dashboard
   → waitlist entry moves to 'invited', invite email sent, admin:stats cache cleared
3. Manually trigger `cleanup-expired-tokens` from Trigger.dev dashboard
   → expired tokens deleted, affected emails reverted to 'waiting'
4. Manually trigger `daily-intelligence` with `{ userId: "any" }`
   → returns `{ status: 'not_implemented' }`, no error
5. Manually trigger `topic-extraction` with test payload
   → returns `{ status: 'not_implemented' }`, no error
