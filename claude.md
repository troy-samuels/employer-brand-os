# OpenRole — Agent Instructions

## Product

OpenRole helps employers understand and improve what AI platforms (ChatGPT, Perplexity, Google AI) say about them to job seekers. We identify information gaps that cause AI to guess or hallucinate, then provide a content playbook to fix it.

**Live at [openrole.co.uk](https://openrole.co.uk).**

## Core Thesis

AI answers broad opinion queries using Glassdoor. But for specific factual questions (salary, benefits, tech stack, interview process, remote policy), aggregators have thin/outdated data. If employers haven't published these answers, AI guesses. OpenRole identifies these information gaps and gives employers a content playbook to fill them on their own domains.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL, RLS on all tables)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Payments:** Stripe (Checkout + webhooks)
- **Email:** Resend (transactional + nurture)
- **Hosting:** Vercel (openrole.co.uk)
- **Monitoring:** Sentry
- **Styling:** Tailwind CSS

## Architecture

All code lives in `frontend/`. Key directories:

- `src/app/` — Pages and API routes
- `src/lib/audit/` — Audit engine, scoring, shared utilities
- `src/lib/email/` — Resend client + email templates (audit report, nurture day 1/3/7)
- `src/lib/pdf/` — React-PDF briefing generator
- `src/lib/stripe/` — Stripe client (lazy-init, server-only)
- `src/lib/supabase/` — DB client, server/browser variants
- `src/lib/security/` — CSRF, request metadata, rate limiting
- `src/components/` — React components (shared, dashboard, pricing)
- `supabase/migrations/` — 11 migrations, all applied to remote

## Pricing

| Plan | Monthly | Annual | Target |
|------|---------|--------|--------|
| Free | £0 | — | Anyone — unlimited audits |
| Starter | £59 | £49 | ≤100 employees |
| Growth ⭐ | £179 | £149 | 100–1,000 employees |
| Scale | £449 | £379 | 1,000+ employees |
| Enterprise | Custom | Custom | 2,000+ / multi-brand |

## Development Principles

- **Graceful degradation** — Missing env vars log warnings, don't crash
- **RLS everywhere** — All 33 tables have Row Level Security
- **Server-only secrets** — Stripe, Resend, service role keys never touch the client
- **Zod validation** — All API inputs validated with schemas
- **CSRF + rate limiting** — On all public write endpoints
- **UK English** — British spelling throughout

## Key Files

| File | Purpose |
|------|---------|
| `OPENROLE_THESIS.md` | Full strategy (27K words) |
| `PRICING_RESEARCH.md` | Competitor pricing data |
| `GEMINI_GROWTH_ANALYSIS.md` | Feature roadmap |
| `AUDIT_FIXES_CHECKLIST.md` | Security/tech debt tracker |
| `COLD_OUTREACH_PLAYBOOK.md` | Sales playbook |
| `CONTACTS_INDEX.md` | Lead pipeline |
| `VALIDATION_TARGETS.md` | Employer outreach targets |
