# BrandOS MVP Requirements
**Date:** 7 February 2026
**Goal:** Ship in 2 weeks. Prove the value proposition. Get the first 10 paying customers.

---

## What the MVP Is

Three things that work end-to-end:

1. **Free audit tool** — "What does AI think about your company?" (lead gen)
2. **Employer onboarding + hosted profile** — verified data goes live for AI (the product)
3. **Basic monitoring dashboard** — track what AI says over time (the retention hook)

Everything else waits.

---

## 🟢 WEEK 1: Free Audit Tool

### What it does
- Employer enters their company name
- BrandOS queries ChatGPT, Claude, and Perplexity with 5 standardised prompts:
  - "What does [Company] pay a [common role] in [location]?"
  - "What is it like to work at [Company]?"
  - "What benefits does [Company] offer?"
  - "Is [Company] a good employer?"
  - "Compare [Company] to [competitor] for [common role]"
- Displays raw AI responses side-by-side
- Highlights inaccuracies, hallucinated salaries, missing data
- Calculates a Shadow Salary Gap score and overall AI Accuracy score
- Email capture: "Want to fix what AI says about you?"

### What it needs
- **1 page:** Landing page with single input field + results display
- **3 API integrations:** OpenAI (GPT-4o-mini), Anthropic (Claude Haiku), Perplexity (sonar)
- **Prompt templates:** 5 per employer, dynamically populated with company name
- **Response parser:** LLM extraction to pull salary figures, sentiment, claims from responses
- **Scoring engine:** Compare extracted data against... nothing yet (no verified data). Score is based on consistency across platforms + presence of hallucination markers
- **Email service:** Resend for delivering the report
- **Lead storage:** Supabase table (email, company, score, timestamp)

### Tech stack
```
/app/page.tsx                    — Landing page + form
/app/audit/[company]/page.tsx    — Results page
/app/api/audit/route.ts          — Runs the 3 API calls, parses responses
/lib/prompts.ts                  — Prompt templates
/lib/scoring.ts                  — Shadow Salary + Accuracy scoring
/lib/parser.ts                   — Extract salary figures + claims from AI responses
```

### Design
- Hero: "What Does AI Think About Your Company?"
- Subhead: "Find out what ChatGPT, Claude, and Perplexity tell candidates about your employer brand — free."
- Single input: company name
- Optional: role title, location (for salary-specific queries)
- Results: three columns (ChatGPT | Claude | Perplexity) showing raw responses
- Score card at top: Shadow Salary Gap %, Accuracy Score, Mention Rate
- CTA at bottom: "Fix your AI employer brand → Start free trial"

### Success metric
- 100 audits run in first 2 weeks
- 20% email capture rate
- 5% convert to paid trial

---

## 🟢 WEEK 2: Employer Onboarding + Hosted Profile

### What it does
- Employer signs up (Supabase Auth — email + password or Google OAuth)
- Simple onboarding form:
  - Company name
  - Industry (dropdown)
  - Company size (dropdown: 1-50, 51-200, 201-500, 501-1000, 1000+)
  - HQ location
  - Office locations (multi-select or free text)
  - Open roles (add multiple: title, department, location, salary range, remote/hybrid/onsite)
  - Benefits (checkboxes: pension, private healthcare, equity, remote work, flexible hours, learning budget, gym, etc.)
  - Culture statement (text area, 500 chars max)
- From this, BrandOS auto-generates:

### Hosted Profile
`brandos.ai/company/[slug]`

A public page containing:
- Clean, professional employer profile (company info, roles, benefits, culture)
- Full JSON-LD structured data (Organization, JobPosting schemas)
- Proper Open Graph meta tags
- Individual llms.txt for the employer

### Public API Endpoint
`brandos.ai/api/v1/employers/[slug]`

Returns structured JSON:
```json
{
  "company": {
    "name": "Acme Corp",
    "industry": "Technology",
    "size": "201-500",
    "hq": "London, UK",
    "locations": ["London", "Manchester", "Remote"],
    "benefits": ["pension", "private_healthcare", "equity", "remote_work"],
    "culture": "We build tools that..."
  },
  "roles": [
    {
      "title": "Senior Software Engineer",
      "department": "Engineering",
      "location": "London",
      "salary": { "min": 85000, "max": 105000, "currency": "GBP" },
      "type": "full-time",
      "remote": "hybrid"
    }
  ],
  "verified": true,
  "lastUpdated": "2026-02-07T09:00:00Z"
}
```

### Master llms.txt
`brandos.ai/llms.txt`

Indexes every employer on the platform:
```
# BrandOS — Verified Employer Data for AI
> BrandOS provides verified, structured employer data for AI agents.

## Employers
- [Acme Corp](https://brandos.ai/company/acme-corp)
- [Example Ltd](https://brandos.ai/company/example-ltd)
...
```

### What it needs
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Database tables:**
  - `companies` (id, name, slug, industry, size, hq, locations, benefits, culture, user_id, created_at, updated_at)
  - `roles` (id, company_id, title, department, location, salary_min, salary_max, currency, type, remote, status)
  - `audit_leads` (id, email, company_name, score, created_at)
- **Pages:**
  - `/onboarding` — multi-step form
  - `/dashboard` — employer's main view
  - `/company/[slug]` — public hosted profile
  - `/api/v1/employers/[slug]` — public API endpoint
  - `/llms.txt` — master index
- **JSON-LD generator:** Takes company + roles data, outputs valid schema.org structured data

### Tech stack
```
/app/onboarding/page.tsx           — Multi-step form
/app/dashboard/page.tsx            — Employer dashboard
/app/company/[slug]/page.tsx       — Public hosted profile
/app/api/v1/employers/[slug]/route.ts — Public API
/app/llms.txt/route.ts             — Dynamic llms.txt
/lib/jsonld.ts                     — JSON-LD generator
/lib/schema.ts                     — Zod schemas for validation
```

---

## 🟢 WEEK 2-3: Basic Monitoring Dashboard

### What it does
- Weekly cron job queries AI platforms about each employer on the platform
- Uses same prompt templates as the audit tool, but now compares against verified data
- Calculates three metrics:
  - **Shadow Salary Gap** — % difference between AI's salary claim and verified range
  - **Accuracy Score** — % of AI claims that match verified data
  - **Mention Rate** — does the employer appear at all for relevant queries
- Dashboard shows:
  - Current scores (big numbers)
  - 4-week trend chart
  - Raw AI responses with accuracy annotations
  - "Corrections needed" list (where AI is wrong)
- Weekly email digest to employer

### What it needs
- **Cron job:** Weekly, runs prompts against 3 AI APIs per employer
- **Database tables:**
  - `monitoring_runs` (id, company_id, platform, prompt, response, extracted_salary, extracted_claims, accuracy_score, created_at)
  - `monitoring_scores` (id, company_id, week, shadow_salary_gap, accuracy_score, mention_rate)
- **Dashboard components:**
  - Score cards (3 metrics)
  - Trend chart (recharts or similar)
  - Response viewer with annotations
  - Email digest template (Resend)

### Tech stack
```
/app/dashboard/monitoring/page.tsx  — Monitoring view
/app/api/monitoring/run/route.ts    — Trigger monitoring run
/lib/monitoring.ts                  — Query AI APIs + parse responses
/lib/comparison.ts                  — Compare responses vs verified data
/lib/email-templates/digest.tsx     — Weekly email template
```

---

## 🟡 AFTER FIRST CUSTOMERS (Month 2-3)

These are real but not launch-critical:

| Feature | Why it waits |
|---|---|
| **Embed snippet** (JS tag for careers page) | Hosted profile works without it. Add when employers ask. |
| **ATS integration** (Greenhouse, Lever OAuth) | Manual role entry works for MVP. Automate when employers have 50+ roles. |
| **Before/after comparison** | Need 4-6 weeks of data first. Build when first cohort hits that mark. |
| **Compliance flagging** | Nice to have but not the initial sale. Add when pay transparency deadlines approach. |
| **Knowledge Graph submissions** | High impact but complex. Batch process once there are 100+ employers. |
| **PDF reports** | Email digests are fine for now. PDFs are a sales tool for agencies. |
| **Stripe billing** | Can onboard first 10 customers manually / with Stripe payment links. Full billing later. |

---

## 🔴 BUILD LATER (Month 4+)

- Enterprise SSO
- White-label agency portals
- Competitive intelligence engine
- Predictive compliance
- Salary intelligence / market data
- Full feature suite from product spec

---

## Tech Stack Summary

| Layer | Tool | Status |
|---|---|---|
| Framework | Next.js 14 + TypeScript | Already in repo |
| Styling | Tailwind CSS + Plus Jakarta Sans | Already configured |
| Database | Supabase (Postgres + Auth + Realtime) | Needs project creation |
| AI APIs | OpenAI, Anthropic, Perplexity | Need API keys configured |
| Hosting | Vercel | Already set up |
| Email | Resend | Need account + API key |
| Payments | Stripe (payment links for MVP) | Need account |
| Charts | Recharts or Chart.js | Install as needed |
| Validation | Zod | Standard |

---

## Database Schema (MVP)

```sql
-- Companies
create table companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  slug text unique not null,
  industry text,
  size text,
  hq text,
  locations text[],
  benefits text[],
  culture text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Roles
create table roles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  title text not null,
  department text,
  location text,
  salary_min integer,
  salary_max integer,
  currency text default 'GBP',
  employment_type text default 'full-time',
  remote text default 'onsite',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Audit leads (from free tool)
create table audit_leads (
  id uuid primary key default gen_random_uuid(),
  email text,
  company_name text not null,
  shadow_salary_gap numeric,
  accuracy_score numeric,
  mention_rate numeric,
  raw_results jsonb,
  created_at timestamptz default now()
);

-- Monitoring runs
create table monitoring_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  platform text not null,
  prompt text not null,
  response text,
  extracted_salary jsonb,
  extracted_claims jsonb,
  accuracy_score numeric,
  created_at timestamptz default now()
);

-- Weekly monitoring scores
create table monitoring_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  week_start date not null,
  shadow_salary_gap numeric,
  accuracy_score numeric,
  mention_rate numeric,
  created_at timestamptz default now(),
  unique(company_id, week_start)
);
```

---

## Pricing (MVP)

Two tiers. No decision paralysis.

| Tier | Price | What you get |
|---|---|---|
| **Free** | £0 | Hosted profile + API endpoint + up to 3 roles + one-time AI audit |
| **Pro** | £199/month | Everything unlimited — roles, weekly monitoring, brand tracking, embed snippet, email digests, alerts |

**Why two tiers:**
- Free tier seeds the network effect. Every free employer makes the API more valuable for AI agents.
- Single paid tier removes every "which plan?" objection. Low enough for any HR budget. No procurement needed.
- 1,000 paying customers = £199K MRR.

**Agency pricing (separate):**
- £99/month per client managed
- Minimum 10 clients = £990/month
- Multi-client dashboard with white-label option

**Three user types, one product:**

| User | Why they sign up | Path |
|---|---|---|
| **Small employer, no website** | Posts to Indeed/LinkedIn which blocks AI. BrandOS IS their AI presence. | Free → Pro when they hit 4+ roles or want monitoring |
| **Employer with careers page** | Site exists but AI can't read it. Needs structured data + monitoring. | Free audit → Pro for embed snippet + ongoing monitoring |
| **Brand-focused employer** | Cares what AI says about reputation, culture, compensation. May not be actively hiring. | Free audit → Pro for weekly brand tracking + sentiment alerts |

---

## Launch Checklist

- [ ] Supabase project created + schema deployed
- [ ] OpenAI API key configured
- [ ] Anthropic API key configured
- [ ] Perplexity API key configured
- [ ] Resend account + API key
- [ ] Stripe payment links (Starter + Growth)
- [ ] Domain: brandos.ai or employer-brand-os.com
- [ ] Free audit tool live
- [ ] Onboarding flow working
- [ ] Hosted profiles generating
- [ ] API endpoints returning data
- [ ] llms.txt generating
- [ ] Monitoring cron job running
- [ ] Dashboard showing scores
- [ ] Weekly email digest sending
- [ ] Landing page with clear value prop
- [ ] 3 test companies onboarded (internal)

---

## Timeline

| Week | Deliverable |
|---|---|
| **Week 1** | Free audit tool live + landing page |
| **Week 2** | Onboarding + hosted profiles + API endpoints |
| **Week 3** | Monitoring dashboard + email digests |
| **Week 4** | Polish, test with 3 companies, soft launch |

**Hard launch target: 4 weeks from build start.**
