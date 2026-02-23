# OpenRole Frontend

Next.js 16 application powering [openrole.co.uk](https://openrole.co.uk) — public site, AI audit engine, dashboard, and API.

## Setup

```bash
cp .env.example .env.local    # Add your keys
npm install
npm run dev                   # http://localhost:3000
```

**Node 20+ required.**

## Environment Variables

### Required
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access |

### Optional (graceful degradation)
| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe checkout/webhooks |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature validation |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe |
| `NEXT_PUBLIC_STRIPE_PRICE_*` | 6 price IDs (starter/growth/scale × monthly/annual) |
| `RESEND_API_KEY` | Email delivery (audit reports + nurture) |
| `RESEND_FROM_EMAIL` | Sender address (default: hello@mail.openrole.co.uk) |
| `BRAVE_SEARCH_API_KEY` | Web checks in audit engine |
| `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring |
| `NEXT_PUBLIC_APP_URL` | Canonical URL for auth redirects |
| `CRON_SECRET` | Protect /api/cron/* endpoints |

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript checks |
| `npm run test` | Vitest suite |

## Key Directories

```
src/
├── app/                    # Pages + API routes
│   ├── api/audit/          # Core audit engine
│   ├── api/stripe/         # Checkout, webhook, portal
│   ├── api/cron/           # Nurture email cron
│   ├── api/pdf/            # PDF briefing generator
│   ├── company/[slug]/     # Public company scorecards
│   ├── compare/            # Head-to-head comparisons
│   ├── dashboard/          # Authenticated, plan-gated
│   └── ...
├── components/             # React components
├── lib/
│   ├── audit/              # Scoring engine + shared utils
│   ├── email/              # Resend client + templates
│   ├── pdf/                # React-PDF briefing
│   ├── stripe/             # Stripe client (lazy-init)
│   ├── supabase/           # DB clients (server + browser)
│   ├── security/           # CSRF, rate limiting, request metadata
│   └── utils/              # Formatters, validators, errors
├── data/                   # Static data (industries, scores)
└── __tests__/              # Unit + integration tests

content/blog/               # 10 markdown blog posts
public/                     # Static assets, llms.txt
supabase/migrations/        # 11 DB migrations (all applied)
```

## Database

11 migrations, all pushed to remote Supabase. RLS enabled on all 33 tables.

```bash
cd frontend
supabase migration list     # Check sync status
supabase db push            # Apply pending migrations
```

## Deployment

Hosted on Vercel. No auto-deploy from Git — deploy manually:

```bash
vercel --prod
```

Cron jobs configured in `vercel.json`:
- `/api/cron/nurture` — Daily 9am, processes email nurture sequence
