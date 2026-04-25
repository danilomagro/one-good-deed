# One Good Deed

> An anonymous, ephemeral stream of kindness. Share your good deeds — no accounts, no data, no limits. Real-time, AI-moderated, beautifully impermanent.

*Conceived by human, coded by AI.*

**[→ See it live](https://danilomagro.github.io/one-good-deed/)**

---

## What it is

A single page where people anonymously share one good deed at a time. Messages float across the screen alongside those of others, in real time, then quietly disappear. The ephemerality is a deliberate design choice — not a technical limitation.

No accounts. No personal data collected. No trace left behind, except the good deed itself, briefly visible to whoever is watching.

## How it works

1. You type your good deed and post it
2. Before going live, every message passes through an AI classifier (Claude Haiku) that checks: is this genuinely a good deed? Should it be reviewed? Should it be blocked?
3. Approved messages are broadcast in real time to everyone currently on the page
4. Messages expire and disappear after a few hours

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS + JS, hosted on GitHub Pages |
| Serverless backend | Supabase Edge Functions (Deno / TypeScript) |
| Database | Supabase PostgreSQL with Row Level Security |
| Real-time | Supabase Realtime (WebSocket) |
| AI moderation | Claude Haiku via Anthropic API |
| Admin snapshots | GitHub Actions cron — hourly Playwright screenshots |

## Why serverless

No server to manage, no infrastructure to maintain. The Edge Function wakes up when a deed is submitted, runs the AI moderation, writes to the database, and goes back to sleep. You pay only for what you use — which, for a project at this scale, is effectively nothing.

## Ephemerality by design

Messages are stored in the database with an `expires_at` timestamp. Queries filter out expired rows — the data is still there, briefly, but no longer shown. A nightly cleanup job removes old records. The hourly admin screenshot captures whatever was visible at that exact moment: a polaroid, not an archive.

## Privacy and moderation

- No IP addresses logged
- No cookies, no session tracking, no accounts
- AI moderation runs before any message reaches the database
- A report button is available on every visible deed
- Reported content is reviewed and removed promptly

This project operates under the EU Digital Services Act passive hosting regime.

## Status

🚧 Work in progress — building in public.

---

*Third public repo in a series exploring the boundary between human intent and AI execution.*
