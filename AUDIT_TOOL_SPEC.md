# OpenRole: Free Audit Tool — Product Specification
**Date:** 7 February 2026
**Status:** Definitive spec. Supersedes audit sections in AI_READINESS_AUDIT_FRAMEWORK.md and MVP_REQUIREMENTS.md.

---

## What This Is

The free audit tool is the entire top of funnel for OpenRole. It proves the problem, captures leads, seeds the competitive benchmark database, and pre-builds the conversion path — all in one experience.

**Designed for:** HR directors, marketing leads, C-suite. Non-technical people who need to see a problem and a fix, not a technical report.

**Lives at:** `openrole.co.uk` — the audit IS the homepage. Not buried behind a nav link. The first thing anyone sees is a single input field.

---

## Two-Phase Architecture

The audit runs in two phases. Phase 1 is free and instant. Phase 2 is gated behind a work email. This protects against abuse, captures qualified leads, and keeps the frictionless experience intact — because Phase 1 alone is valuable enough to create the "oh shit" moment.

### Why Two Phases

| | Phase 1: Website Audit | Phase 2: AI Response Audit |
|---|---|---|
| **Cost per run** | ~£0.001 (HTTP fetches + HTML parsing) | ~£0.05–0.10 (3 AI API calls × 4+ prompts) |
| **Gated?** | No — instant, no sign-up | Yes — work email required |
| **What it proves** | "Your website is invisible to AI" | "Here's what AI actually tells candidates about you" |
| **Data captured** | Company name, URL, industry, technical scores | Email, full AI responses, extracted salary claims |

---

## Phase 1: Instant Website Audit (No Gate)

### The Entry Point

The homepage is one thing:

```
openrole.co.uk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  What does AI tell candidates
  about your company?

  [Company name or website     ] [Check now →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Below the fold: social proof, how it works, pricing. But the input field is the product. Value in 30 seconds. No sign-up, no demo booking, no "talk to sales."

### What Happens When They Click "Check Now"

1. **Company resolution** — we take the input and resolve it:
   - If they entered a URL → use it directly
   - If they entered a company name → attempt to find their website via:
     - Companies House API (free, UK companies)
     - Quick web search fallback
     - If no website found → still run Phase 2 later (some companies have no site — that's one of our three customer types)
   - Detect: industry, approximate size, HQ location from available data

2. **Run five technical checks** (all HTTP fetches + HTML parsing, near-zero cost):

| Check | What We Look For | Display Label (non-technical) | How It's Scored |
|---|---|---|---|
| **llms.txt** | Fetch `domain.com/llms.txt` — does it exist? Does it mention careers/employment? | "AI Instructions File" | ✅ Present with employment data / ⚠️ Present but no employment data / ❌ Missing |
| **JSON-LD Structured Data** | Parse HTML for `<script type="application/ld+json">`. Look for `Organization`, `JobPosting`, `EmployerAggregateRating` schemas | "Structured Data for AI" | ✅ Employment schemas found / ⚠️ Basic schemas only / ❌ None |
| **Salary Data Accessible** | Check if any salary/compensation information exists in crawlable HTML (not behind JS rendering, login walls, or iframes) | "Salary Information Visible to AI" | ✅ Found in markup / ❌ Not found or blocked |
| **Careers Page Crawlable** | Fetch the careers/jobs page. Does a simple HTTP GET return meaningful content, or is it an ATS iframe/SPA that returns empty HTML? | "Careers Page AI-Readable" | ✅ Content accessible / ⚠️ Partial (some content, but ATS-heavy) / ❌ Empty or blocked |
| **robots.txt AI Policy** | Fetch `robots.txt`. Check for AI-specific crawler rules (GPTBot, ClaudeBot, Anthropic, PerplexityBot, etc.) | "AI Crawler Policy" | ✅ AI crawlers explicitly allowed / ⚠️ No AI-specific rules / ❌ AI crawlers blocked |

3. **Calculate AI Readiness Score** (0–100):

Weighted scoring:
- llms.txt: 25 points (highest weight — it's the newest and most directly relevant standard)
- JSON-LD structured data: 25 points (most impactful for AI comprehension)
- Salary data accessible: 20 points (core to the shadow salary thesis)
- Careers page crawlable: 15 points (foundational)
- robots.txt AI policy: 15 points (important but many sites score poorly by default)

Each check scores 0 / partial / full for its allocated points.

4. **Pull industry benchmark** from our database:
   - Look up average AI Readiness Score for companies in the same industry + size band
   - If we don't have enough data in that segment yet, use the global average
   - Display: "You're behind X% of companies in your industry"

### Phase 1 Results Screen

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ACME CORP                                           │
│  AI READINESS SCORE                                  │
│                                                      │
│  ████░░░░░░░░░░░░░░░░  12 / 100                     │
│                                                      │
│  You're behind 78% of [Technology] companies.        │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  ❌  AI Instructions File (llms.txt)     Missing     │
│  ❌  Structured Data for AI              Missing     │
│  ❌  Salary Information Visible to AI    Not found   │
│  ⚠️  Careers Page AI-Readable            Partial     │
│  ⚠️  AI Crawler Policy                   No rules    │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  ℹ️  What does this mean?                             │
│  When candidates ask ChatGPT, Claude, or Perplexity  │
│  about your company, AI has almost no verified data   │
│  to work with. It guesses — and often gets it wrong.  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Each check item has a **hover/tap tooltip** explaining it in plain English:
- "AI Instructions File" → "A file on your website that tells AI what your company does, what you offer, and where to find key information. Think of it as a cheat sheet for ChatGPT."
- "Structured Data for AI" → "Hidden code on your website that tells AI exactly what roles you have, what they pay, and what benefits you offer — in a format AI can read perfectly."
- etc.

**No jargon on the main screen. Ever.** The technical terms (llms.txt, JSON-LD) only appear in tooltips for anyone curious.

### Results URL

Results live at `openrole.co.uk/audit/[company-slug]`

This URL is shareable. HR director runs the audit, copies the link, drops it in Slack to their CMO or Head of Talent. The URL is the sales pitch.

---

## Phase 2: AI Response Audit (Email-Gated)

### The Gate

Directly below the Phase 1 results:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  🔒  What does AI actually say about you?            │
│                                                      │
│  We query ChatGPT, Claude & Perplexity with the      │
│  same questions candidates ask. See exactly what      │
│  they're being told about your salary, culture,       │
│  and reputation.                                      │
│                                                      │
│  [Your work email              ] [Unlock report →]   │
│                                                      │
│  Free. No credit card. Takes 60 seconds.             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Email Validation

**Work email required.** Reject consumer domains:
- gmail.com, googlemail.com
- hotmail.com, hotmail.co.uk, outlook.com, live.com
- yahoo.com, yahoo.co.uk
- icloud.com, me.com, mac.com
- aol.com, protonmail.com

**Why:** Kills abuse, ensures we're capturing real business leads, and a `@acme.com` email is soft verification that they're actually from that company.

**Rejection message:** Friendly, not hostile. "We send the full report to your work email so your team can access it too. Please use your company email address."

### What Runs After Email Submission

1. **Show a progress screen** — "Querying AI about Acme Corp..." with a clean animation. Not a spinner. A stepped progress indicator:
   - ✅ Website analysed
   - 🔄 Asking ChatGPT...
   - ⏳ Asking Claude...
   - ⏳ Asking Perplexity...

2. **Run AI queries** against three platforms:

#### Query Set (Dynamic Per Company)

Queries are built dynamically based on what we detected about the company in Phase 1.

**Always run (core 4):**

| # | Query Template | What It Tests |
|---|---|---|
| 1 | "What does [Company] pay a [likely role] in [HQ location]?" | Shadow Salary — does AI know real compensation? |
| 2 | "What is it like to work at [Company]?" | Culture/reputation — what narrative has AI built? |
| 3 | "What benefits does [Company] offer employees?" | Benefits accuracy — does AI know the real package? |
| 4 | "Would you recommend [Company] as a good place to work?" | Overall sentiment — positive, negative, uncertain? |

**Conditional queries (added based on company signals):**

| Condition | Additional Query | Why |
|---|---|---|
| Tech/engineering company | "What does [Company] pay a Software Engineer in [location]?" | Most searched salary query in tech |
| Multiple locations detected | "How does working at [Company] in [City A] compare to [City B]?" | Tests location-specific knowledge |
| Well-known brand (>500 employees or recognisable name) | "Compare [Company] to [likely competitor] for [common role]" | Tests competitive positioning |
| Small/unknown company | "Name some good [industry] companies to work for in [location]" | Tests whether they appear AT ALL in AI's awareness |
| Company has no website | Skip website-specific queries, add: "Where can I find salary information for [Company]?" | Tests discoverability without a web presence |

**How "likely role" is determined:**
- Industry detection from Phase 1 → mapped to common roles:
  - Technology → "Software Engineer" or "Senior Developer"
  - Finance → "Financial Analyst" or "Accountant"
  - Healthcare → "Registered Nurse" or "Healthcare Assistant"
  - Retail → "Store Manager" or "Retail Associate"
  - Professional Services → "Consultant" or "Project Manager"
  - Default fallback → "mid-level professional"

**How "likely competitor" is determined:**
- Not a real-time lookup. Mapped from industry + size + location to well-known players in that space.
- Only used for well-known brands where the comparison is obvious and useful.
- Never for small companies — the comparison would be meaningless.

#### AI Platform Configuration

| Platform | Model | Why This One |
|---|---|---|
| **ChatGPT** | GPT-4o-mini | Cheapest that gives representative responses. Candidates use the full GPT-4o, but mini gives similar employer knowledge. |
| **Claude** | Claude 3.5 Haiku | Fast, cheap, good at admitting uncertainty. Shows a different perspective. |
| **Perplexity** | Sonar (via API) | Critical because it cites sources. We can show WHERE AI is pulling its (wrong) information from. |

**System prompt for all queries:**
"You are answering a job candidate's question about a potential employer. Provide specific, factual information where available. Include salary figures, benefits, and your assessment of the company as an employer."

This prompt encourages the AI to be specific (and therefore more likely to hallucinate specific numbers we can check), which is exactly what we need to demonstrate the problem.

3. **Parse responses** — LLM extraction (one cheap call) pulls structured data from each response:
   - Salary figures mentioned (and currency)
   - Benefits listed
   - Sentiment (positive/negative/neutral/uncertain)
   - Confidence level (stated confidently vs hedged)
   - Sources cited (Perplexity especially)
   - Whether the AI admitted to limited information

4. **Calculate Phase 2 scores:**

| Metric | What It Measures | How It's Calculated |
|---|---|---|
| **Shadow Salary Gap** | How far off AI's salary claims are from each other (and from reality if we have data) | Variance across 3 platforms. If all three say different numbers, the gap is wide. If we have any verified data (from their website or our database), compare against that. |
| **AI Confidence Level** | How certain AI sounds about this company | % of responses that state facts confidently vs hedge with "I don't have specific information" |
| **Consistency Score** | Do the three AIs agree with each other? | Cross-platform comparison of key claims (salary, benefits, sentiment). High consistency = the narrative is set (good or bad). Low consistency = AI is guessing. |

### Phase 2 Results Screen

Appears on the same page, below Phase 1 results, after queries complete:

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  WHAT AI TELLS CANDIDATES ABOUT ACME CORP            │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  💰 SHADOW SALARY                                    │
│                                                      │
│  "Senior Developer in London"                        │
│                                                      │
│  ChatGPT says:    £52,000                            │
│  Claude says:     £58,000 – £65,000                  │
│  Perplexity says: £48,000 (citing 2023 Glassdoor)    │
│                                                      │
│  ⚠️ AI is estimating your salaries with no verified   │
│  data. Candidates see these numbers.                 │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  💬 WHAT AI SAYS ABOUT YOUR CULTURE                  │
│                                                      │
│  ChatGPT: "Acme Corp is known for a fast-paced       │
│  environment with competitive benefits..."            │
│                                                      │
│  Claude: "I don't have specific information about     │
│  Acme Corp's workplace culture..."                    │
│                                                      │
│  Perplexity: "Based on Glassdoor reviews from 2022,  │
│  employees describe a high-pressure culture..."       │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  📊 YOUR AI EMPLOYER PROFILE                         │
│                                                      │
│  Consistency:  Low — AIs disagree on key facts        │
│  Confidence:   Medium — some guessing, some hedging   │
│  Data sources: Stale (oldest citation: 2022)          │
│                                                      │
│  ─────────────────────────────────────────────────   │
│                                                      │
│  🔧 FIX THIS IN 5 MINUTES                           │
│  [Create your verified AI employer profile →]        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### The Full Report (Email)

Sent within 2 minutes of email submission. Contains everything shown on screen PLUS:
- All raw AI responses (not just excerpts)
- Technical audit details with explanations
- Industry benchmark comparison
- "What your competitors' AI profiles look like" (anonymised averages)
- Direct link back to their results page
- CTA: "We've started building your AI employer profile → Verify your data and go live"

The email is the thing they forward to their boss. It needs to look premium and be self-explanatory without the recipient needing to visit the site.

---

## Abuse Prevention

All prevention is invisible to legitimate users. No CAPTCHAs, no account creation, no friction.

### Rate Limiting

| Limit | Scope | What It Prevents |
|---|---|---|
| 5 Phase 1 audits per hour per IP | IP-based | Bot scraping, curiosity browsing abuse |
| 1 Phase 2 unlock per email address | Email-based | Repeat queries on same email |
| 3 Phase 2 unlocks per domain per day | Email domain-based | One company running 50 audits |
| Global: 500 Phase 2 audits per day | System-wide | Cost ceiling. At £0.10 each = max £50/day |

### Work Email Enforcement

Consumer email domains rejected (see list above). Friendly error message, not a wall.

### Response Caching

**Critical cost control:** If someone audits "Acme Corp" and we already ran AI queries for that company in the last 7 days, serve cached results. Zero repeat API spend.

- Phase 1 (website checks): Always run fresh — costs nothing and websites change
- Phase 2 (AI responses): Cache for 7 days per company
- Cache key: normalised company name + location
- Cache hit: instant results, no queue, no waiting animation
- Cache miss: run queries, store results, serve and cache

This means the second person from Acme Corp who runs the audit gets instant Phase 2 results — which actually improves their experience.

### Queue Management

If there's a traffic spike, Phase 2 queries queue server-side. The user sees the progress animation. If they close the tab, the email still delivers. No lost leads.

---

## The Knowledge Database

**Every audit — Phase 1 and Phase 2 — feeds the database. This is the most valuable asset OpenRole builds.**

### What Gets Stored (Phase 1 — every visit)

```
audit_website_checks
├── id (uuid)
├── company_name (text)
├── company_slug (text, normalised)
├── website_url (text, nullable)
├── industry (text, detected)
├── size_band (text, detected)
├── hq_location (text, detected)
├── has_llms_txt (boolean)
├── llms_txt_has_employment (boolean)
├── has_jsonld (boolean)
├── jsonld_schemas_found (text[])  — e.g. ['Organization', 'JobPosting']
├── has_salary_data (boolean)
├── careers_page_crawlable (enum: full/partial/none/not_found)
├── careers_page_url (text, nullable)
├── robots_txt_ai_policy (enum: allows/blocks/no_rules/not_found)
├── robots_txt_blocked_bots (text[])  — e.g. ['GPTBot', 'ClaudeBot']
├── ai_readiness_score (integer, 0-100)
├── source_ip_hash (text, hashed for rate limiting, not stored raw)
├── created_at (timestamptz)
```

### What Gets Stored (Phase 2 — email-gated)

```
audit_ai_responses
├── id (uuid)
├── company_slug (text, FK to website_checks)
├── lead_email (text)
├── lead_email_domain (text)
├── queries_run (jsonb)  — array of {template, populated_query, platform}
├── responses (jsonb)    — array of {platform, query, raw_response, parsed}
├── extracted_salaries (jsonb)  — {platform: {role, min, max, currency, confidence}}
├── extracted_benefits (jsonb)  — {platform: [benefit_list]}
├── extracted_sentiment (jsonb) — {platform: positive/negative/neutral/uncertain}
├── shadow_salary_gap (numeric) — variance across platforms
├── consistency_score (numeric)
├── ai_confidence_level (numeric)
├── sources_cited (jsonb)  — what Perplexity cited
├── cached (boolean)  — was this served from cache?
├── created_at (timestamptz)
├── expires_at (timestamptz)  — cache TTL (created_at + 7 days)
```

### What the Database Enables

**1. Industry Benchmarks (free, automatic)**
- Average AI Readiness Score by industry + size band
- "You're behind X% of companies" — calculated from real data
- Improves with every audit run
- No additional cost — it's a byproduct of normal usage

**2. Competitor Context (free, no extra queries)**
- When Company X runs an audit, we don't query AI about their competitors in real-time
- We already have data from previous audits of companies in the same industry
- Displayed as anonymised benchmarks: "Companies in your industry average 34/100"
- As the database grows: "Top performers in [Technology] score 72/100"
- Never name specific competitors — anonymised averages are more credible and avoid legal issues

**3. Market Intelligence (long-term asset)**
- After 1,000 audits: "We analysed 500 UK tech companies. 97% are invisible to AI." → content marketing, PR, investor materials
- Trend data over time: "AI readiness improved 12% across all industries in Q2 2026"
- Sector reports: "Financial services leads AI readiness at 38/100. Retail trails at 11/100."

**4. Pre-Seeding**
Before launch, we run Phase 1 audits ourselves on 100+ well-known companies across key sectors (tech, finance, healthcare, retail, professional services). This:
- Seeds the benchmark database so the first real user sees meaningful comparisons
- Gives us content for launch marketing ("We audited the FTSE 250's AI employer readiness")
- Costs almost nothing (Phase 1 is HTTP fetches only)

---

## Conversion Flow

### From Audit to Customer

The audit isn't the end — it's the beginning of a pre-built onboarding path.

**During Phase 2 (while AI queries run):**
- In the background, we scrape the employer's own website for any careers/about data
- Pre-populate a draft OpenRole profile: company name, detected industry, location, any benefits/roles found
- This draft is stored but NOT shown yet

**After results display:**
- CTA: "Fix this in 5 minutes → Create your verified AI employer profile"
- Click-through lands on a **pre-filled onboarding form** — not a blank form
- The employer verifies what we detected, adds salary ranges, fills gaps, publishes
- Their profile goes live at `openrole.co.uk/company/[slug]`

**4–6 weeks later (automated):**
- OpenRole re-runs the Phase 2 audit automatically
- If AI responses have improved (because structured data has been crawled), send an email:
  "Your Shadow Salary Gap dropped from 28% to 9%. Here's what changed."
- That's the free-to-paid conversion trigger: proof that OpenRole works

### From Audit to Share

The results URL (`openrole.co.uk/audit/[company-slug]`) is designed to be shared:
- HR director → CMO: "Look what AI says about us"
- HR director → CEO: "We need to fix this"
- Recruiter → HR director: "I keep getting asked about salaries AI is making up"

Every share is a potential new lead seeing the OpenRole brand for the first time.

---

## UX Principles

**1. Credit score, not technical audit.**
The experience should feel like checking your credit score — type your name, see a number, understand immediately if it's good or bad. No technical knowledge required.

**2. Traffic lights, not percentages.**
Red/amber/green for each check. The headline score is the only number. Everything else is visual.

**3. One number to rule them all.**
AI Readiness Score (0–100) is the headline. It's the thing people remember. "We scored 12." That's the conversation starter.

**4. Comparison is the motivator.**
"12/100" is bad. "You're behind 78% of companies in your industry" is urgent. Always show the benchmark.

**5. Tooltips, not jargon.**
Main screen uses plain English labels. Technical terms only appear on hover/tap for curious users. An HR director should never feel lost.

**6. The CTA is action, not education.**
Never "Learn about structured data." Always "Fix this in 5 minutes →"

**7. Mobile-first.**
HR directors check this on their phone in a meeting. The results page must work perfectly on mobile. Score card stacks vertically. AI quotes are readable. CTA is thumb-reachable.

---

## Technical Architecture

### Route Structure

```
/app/page.tsx                           — Homepage (audit input)
/app/audit/[company-slug]/page.tsx      — Results page (Phase 1 + Phase 2)
/app/api/audit/website/route.ts         — Phase 1: website checks
/app/api/audit/ai/route.ts             — Phase 2: AI queries (email-gated)
/app/api/audit/email/route.ts          — Email validation + report delivery
```

### Core Libraries

```
/lib/audit/website-checks.ts           — llms.txt, JSON-LD, robots.txt, crawlability checks
/lib/audit/company-resolver.ts         — Name → website URL resolution (Companies House + fallback)
/lib/audit/query-builder.ts            — Dynamic query generation per company
/lib/audit/ai-clients.ts              — OpenAI, Anthropic, Perplexity API wrappers
/lib/audit/response-parser.ts          — Extract salaries, benefits, sentiment from AI responses
/lib/audit/scoring.ts                  — AI Readiness Score + Phase 2 metrics
/lib/audit/benchmarks.ts              — Industry benchmark lookups from database
/lib/audit/cache.ts                    — 7-day response caching logic
/lib/audit/rate-limiter.ts            — IP + email + domain rate limiting
/lib/audit/report-email.ts            — Full report email template (Resend)
```

### Database Tables

```sql
-- Phase 1 results (every audit, no gate)
create table audit_website_checks (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  company_slug text not null,
  website_url text,
  industry text,
  size_band text,
  hq_location text,
  has_llms_txt boolean default false,
  llms_txt_has_employment boolean default false,
  has_jsonld boolean default false,
  jsonld_schemas_found text[] default '{}',
  has_salary_data boolean default false,
  careers_page_crawlable text default 'not_found',
  careers_page_url text,
  robots_txt_ai_policy text default 'not_found',
  robots_txt_blocked_bots text[] default '{}',
  ai_readiness_score integer default 0,
  source_ip_hash text,
  created_at timestamptz default now()
);

create index idx_website_checks_slug on audit_website_checks(company_slug);
create index idx_website_checks_industry on audit_website_checks(industry);
create index idx_website_checks_created on audit_website_checks(created_at desc);

-- Phase 2 results (email-gated)
create table audit_ai_responses (
  id uuid primary key default gen_random_uuid(),
  company_slug text not null,
  lead_email text not null,
  lead_email_domain text not null,
  queries_run jsonb not null default '[]',
  responses jsonb not null default '[]',
  extracted_salaries jsonb default '{}',
  extracted_benefits jsonb default '{}',
  extracted_sentiment jsonb default '{}',
  shadow_salary_gap numeric,
  consistency_score numeric,
  ai_confidence_level numeric,
  sources_cited jsonb default '[]',
  cached boolean default false,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

create index idx_ai_responses_slug on audit_ai_responses(company_slug);
create index idx_ai_responses_email_domain on audit_ai_responses(lead_email_domain);
create index idx_ai_responses_expires on audit_ai_responses(expires_at);

-- Industry benchmarks (materialised from audit data, refreshed daily)
create materialized view industry_benchmarks as
select
  industry,
  size_band,
  count(*) as company_count,
  avg(ai_readiness_score) as avg_score,
  percentile_cont(0.25) within group (order by ai_readiness_score) as p25_score,
  percentile_cont(0.75) within group (order by ai_readiness_score) as p75_score,
  avg(case when has_llms_txt then 1 else 0 end) as pct_has_llms_txt,
  avg(case when has_jsonld then 1 else 0 end) as pct_has_jsonld,
  avg(case when has_salary_data then 1 else 0 end) as pct_has_salary_data
from audit_website_checks
where created_at > now() - interval '90 days'
group by industry, size_band;
```

### API Cost Ceiling

| Scenario | Daily audits | Daily cost |
|---|---|---|
| Quiet day | 50 Phase 2 | £5 |
| Busy day | 200 Phase 2 | £20 |
| System limit | 500 Phase 2 | £50 |
| Cached (repeat companies) | Unlimited | £0 |

Phase 1 costs are negligible at any volume. The hard cap of 500 Phase 2 audits/day is a safety net — adjustable as revenue grows.

---

## Pre-Launch Checklist

- [ ] Seed database: run Phase 1 on 100+ companies across 5 key sectors
- [ ] Compile industry role mappings (industry → common role for salary queries)
- [ ] Compile consumer email domain blocklist
- [ ] Design email report template (Resend)
- [ ] Set up rate limiting (Upstash Redis or similar)
- [ ] Configure AI API keys (OpenAI, Anthropic, Perplexity)
- [ ] Test caching logic with duplicate company audits
- [ ] Mobile test the full results flow
- [ ] Set up materialised view refresh cron (daily)
