# OpenRole

**Take control of what AI tells your candidates.**

OpenRole helps employers understand and improve what AI platforms (ChatGPT, Perplexity, Google AI) say about them to job seekers. We identify the information gaps that cause AI to guess, hallucinate, or default to outdated Glassdoor data — then give employers a playbook to fix it.

🌐 **[openrole.co.uk](https://openrole.co.uk)**

---

## The Problem

38% of under-30 job seekers now use AI to research employers. When a candidate asks ChatGPT "What's it like working at [company]?", AI pulls from whatever it can find — often thin, outdated, or wrong.

AI handles broad opinion queries fine (it cites Glassdoor). But for **specific factual questions** — salary bands, benefits, tech stack, interview process, remote policy — most employers haven't published the answers anywhere AI can find them. So AI guesses.

**The result:** Employers lose candidates to competitors who simply have better-published information.

---

## How It Works

1. **Free AI Audit** — Run your company through our tool. See exactly what 4 AI models say about you, scored out of 100.
2. **Information Gap Report** — We show you what AI *can't* answer about your company — the questions where it's guessing or hallucinating.
3. **Content Playbook** — What to publish, where to publish it, and how to structure it so AI cites your own domain (Growth plan).
4. **Weekly Monitoring** — Track how AI answers change over time. Get alerts when something shifts.

---

## Key Features

- **AI Visibility Score** — 0-100 score across 4 AI models (ChatGPT, Perplexity, Google AI, Claude)
- **Company Scorecard Pages** — Public, shareable pages with SEO and dynamic OG images
- **UK Visibility Index** — Rankings of UK employers by AI visibility
- **Head-to-Head Comparisons** — Compare any two companies side by side
- **PDF Executive Briefing** — One-page leave-behind for CFO/leadership conversations
- **Blog & Research** — 10 original articles on AI employer branding
- **Free Tools** — Badge generator, employer schema builder, llms.txt generator
- **Email Nurture Sequence** — Automated follow-up (Day 1, 3, 7) after audit
- **Stripe Checkout** — Self-serve signup with monthly/annual billing
- **Dashboard** — Plan-gated features: monitoring, playbook, compliance, analytics

---

## Pricing

| Plan | Monthly | Annual | Target |
|------|---------|--------|--------|
| **Free** | £0 | — | Anyone — unlimited audits, no signup |
| **Starter** | £59/mo | £49/mo | ≤100 employees — monitoring + gap alerts |
| **Growth** ⭐ | £179/mo | £149/mo | 100–1,000 employees — full playbook + competitors |
| **Scale** | £449/mo | £379/mo | 1,000+ employees — API, unlimited competitors |
| **Enterprise** | Custom | Custom | 2,000+ / multi-brand — SSO, SLA, dedicated CSM |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL, RLS on all 33 tables)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Payments:** Stripe (Checkout, webhooks, customer portal)
- **Email:** Resend (transactional + nurture sequences)
- **Hosting:** Vercel (production at openrole.co.uk)
- **Monitoring:** Sentry (error tracking)
- **Styling:** Tailwind CSS + custom design system

---

## Project Structure

```
open-role/
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/                # Pages + API routes
│   │   │   ├── api/            # audit, stripe, pdf, cron, email, pixel
│   │   │   ├── company/[slug]/ # Public company scorecards
│   │   │   ├── compare/        # Head-to-head comparisons
│   │   │   ├── dashboard/      # Authenticated dashboard (plan-gated)
│   │   │   └── ...             # pricing, blog, tools, uk-index, etc.
│   │   ├── components/         # React components
│   │   ├── lib/                # Core logic
│   │   │   ├── audit/          # Audit engine + scoring
│   │   │   ├── email/          # Resend client + templates
│   │   │   ├── pdf/            # React-PDF briefing generator
│   │   │   ├── stripe/         # Stripe client + helpers
│   │   │   └── supabase/       # DB client + typed queries
│   │   └── data/               # Static data (industries, scores)
│   ├── content/blog/           # Markdown blog posts (10)
│   ├── public/                 # Static assets, llms.txt, robots.txt
│   ├── supabase/migrations/    # Database migrations (11)
│   └── vercel.json             # Cron config
├── scripts/                    # Utility scripts
├── OPENROLE_THESIS.md          # Full strategy document (27K words)
├── PRICING_RESEARCH.md         # Competitor pricing analysis
├── GEMINI_GROWTH_ANALYSIS.md   # Feature roadmap (Gemini-generated)
├── AUDIT_FIXES_CHECKLIST.md    # Security/tech debt tracker
├── COLD_OUTREACH_PLAYBOOK.md   # Sales playbook
├── CONTACTS_INDEX.md           # Lead pipeline
├── VALIDATION_TARGETS.md       # Employer outreach targets
└── ATS_INTEGRATION_RESEARCH.md # Future: ATS platform APIs
```

---

## Local Development

```bash
cd frontend
cp .env.example .env.local      # Add your keys
npm install
npm run dev                     # http://localhost:3000
```

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional (features degrade gracefully):**
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` — payments
- `RESEND_API_KEY` — email delivery
- `BRAVE_SEARCH_API_KEY` — audit web checks
- `NEXT_PUBLIC_SENTRY_DSN` — error monitoring

---

## Evidence

- **1840&Co** published one blog post → 0% to 11% AI visibility in 2 weeks
- **Monzo's** careers page is the dominant AI citation source for interview prep queries
- ATS-hosted pages (Lever, Workable) are nearly empty — AI defaults to Glassdoor when employers provide nothing
- Nobody is serving UK mid-market employers across all sectors at self-serve prices

---

## Status

**Live at [openrole.co.uk](https://openrole.co.uk).** MVP complete. Validating with employers.
