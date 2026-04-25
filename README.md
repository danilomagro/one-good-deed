# One Good Deed

> An anonymous, ephemeral stream of kindness. Share your good deeds — no accounts, no data, no limits. Real-time, AI-moderated, beautifully impermanent.

*Conceived by human, coded by AI.*

**[→ See it live](https://danilomagro.github.io/one-good-deed/)**

---

## What it is

A single page where people anonymously share one good deed at a time. Messages float across a starfield alongside those of others, in real time, then quietly disappear. The ephemerality is a deliberate design choice — not a technical limitation.

No accounts. No personal data collected. No trace left behind, except the good deed itself, briefly visible to whoever is watching.

You can sign your deed with a name, a nickname, or nothing at all.

## How it works

1. You type your good deed — and optionally your name — and press Release
2. Before going live, every message passes through an AI classifier (Claude Haiku) that checks: is this genuinely a good deed? Should it be reviewed? Should it be blocked?
3. Approved messages are broadcast in real time to everyone currently on the page
4. Messages drift slowly upward and disappear after a few hours
5. An admin dashboard allows manual review of flagged content

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS + JS · hosted on GitHub Pages |
| Serverless backend | Supabase Edge Functions (Deno / TypeScript) |
| Database | Supabase PostgreSQL |
| Real-time | Supabase Realtime (WebSocket) |
| AI moderation | Claude Haiku via Anthropic API |
| Admin dashboard | Password-protected · brute-force lockout |
| Hourly snapshots | GitHub Actions cron · Playwright headless browser |

## Architecture decisions

**Why serverless?** No server to manage, no infrastructure to maintain. The Edge Function wakes up when a deed is submitted, runs the AI moderation, writes to the database, and goes back to sleep. Cost at this scale: effectively zero.

**Why Supabase?** One platform for database, real-time WebSocket broadcast, and serverless functions. The Realtime layer means every connected browser receives new approved deeds instantly — no polling, no refresh.

**Why Claude Haiku for moderation?** Fast (~500ms), cheap (fractions of a cent per message), and capable of understanding nuance. The classifier returns a structured JSON verdict with three possible outcomes: `approved`, `pending_review`, or `rejected`. Every message is logged regardless of outcome.

**Why ephemeral?** Messages expire 12 hours after submission. The frontend filters them out — they remain in the database briefly but are never shown again. The sky clears itself. What stays is the habit of noticing kindness.

**Why anonymous?** No accounts means no friction and no data. A name field exists but is entirely optional and unverified. You can be Sarah, you can be Anonymous, you can be a star.

## Ephemerality by design

Messages are stored with an `expires_at` timestamp. Queries filter out expired rows. A future cleanup job will remove old records physically. The hourly GitHub Actions screenshot captures whatever was visible at that exact moment: a polaroid, not an archive.

→ [Browse the hourly polaroids](/screenshots)

## Privacy and moderation

- No IP addresses logged
- No cookies, no session tracking, no accounts
- Author name is optional, unverified, and not linked to any identity
- AI moderation runs before any message reaches the database
- A ⚑ report button is available on every visible deed
- Flagged content is reviewed via the admin dashboard and removed promptly

This project operates under the EU Digital Services Act passive hosting regime.

## Security notes

The admin dashboard (`/admin.html`) is password-protected with a server-side check and client-side brute-force lockout (3 attempts → 60s cooldown). The admin password never touches the frontend — it is verified inside a Supabase Edge Function.


## Repository structure

```
one-good-deed/
├── index.html                          # Frontend — single file
├── admin.html                          # Admin moderation dashboard
├── README.md
├── .github/
│   └── workflows/
│       └── screenshot.yml             # Hourly Playwright snapshot
├── screenshots/                        # Auto-generated hourly polaroids
└── supabase/
    ├── functions/
    │   ├── moderate-deed/index.ts     # AI moderation Edge Function
    │   └── admin-deed/index.ts        # Admin actions Edge Function
    ├── migrations/
    │   └── 001_initial_schema.sql     # Database schema
    └── seeds/
        └── seed.sql                   # Launch seed data (52 deeds)
```

## Running locally

The frontend works as a static file — open `index.html` directly in a browser. It connects to the live Supabase instance, so real-time and moderation work even locally.

To deploy your own instance:
1. Create a Supabase project
2. Run `supabase/migrations/001_initial_schema.sql`
3. Deploy both Edge Functions with your Anthropic API key as a secret
4. Update the config constants in `index.html` and `admin.html`
5. Push to GitHub and enable GitHub Pages

## Status

✅ Live and running.

---

*Third public repo in a series exploring the boundary between human intent and AI execution.*  
*Previous: [nexus-sentinel](https://github.com/danilomagro/nexus-sentinel) · [gantt-heatmap](https://github.com/danilomagro/gantt-heatmap)*
