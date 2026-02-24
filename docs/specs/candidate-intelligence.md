# OpenRole: Candidate Intelligence Strategy
**Product:** OpenRole
**Author:** Malcolm + Troy
**Date:** 24 Feb 2026
**Status:** Draft v3 — Final strategic direction
**Iterations:** v1 (B2C toolkit — killed), v2 (Trojan Horse portal — killed), v3 (Pure B2B)

---

## Core Thesis

Candidates now use LLMs (ChatGPT, Perplexity, Gemini, Google AI Overviews) as their primary research tool when evaluating employers. These LLMs hallucinate employer data — fabricating salary ranges, inventing remote policies, confidently presenting wrong information as fact.

The **Digital Advantage (DA)** is the measurable gap between what AI says about an employer and what's actually true.

**OpenRole's business:** Help employers close that gap. Diagnose the problem, install the fix, prove it's working.

---

## The Strategic Evolution (Why We Killed B2C Twice)

### v1: B2C Job Application Toolkit
*Kanban boards, CV tailoring, cover letter generation for candidates.*
**Killed because:** Two-front war. £87 LTV vs £3,600+ B2B LTV. Fights Teal, Huntr, AIApply on their turf with their funding. Features don't generate DA evidence.

### v2: Trojan Horse Candidate Portal
*Free company audit search on openrole.co.uk. "Request Verified Data" button turns candidates into outbound sales reps.*
**Killed because:** Contradicts the core thesis. If our pitch is "candidates use ChatGPT, not your careers page," then asking those same candidates to use openrole.co.uk fights user behaviour. Building a consumer portal requires consumer marketing (TikTok, SEO, influencers) — a completely different muscle from B2B SaaS.

### v3: Pure B2B — Simulate the Candidate, Track the Bots
*No candidate-facing product at all. Simulate candidate queries programmatically. Track AI bot activity on employer sites. Prove ROI through analytics.*
**Why this wins:** Zero B2C complexity. No consumer audience to build. Doesn't contradict the thesis — it rides the behaviour instead of fighting it. Pure B2B SaaS with clean unit economics.

---

## The Three-Layer Product

### Layer 1: Diagnostic — "Here's what AI tells candidates about you right now"

**The Simulation Engine.** OpenRole programmatically runs the 10-20 most common candidate queries about an employer through ChatGPT, Claude, Perplexity, and Google AI Overviews:

```
Simulated queries:
1. "What is the interview process at [Company]?"
2. "What is the salary range for [Role] at [Company]?"
3. "Is [Company] a good place to work?"
4. "What is the remote work policy at [Company]?"
5. "What is the tech stack at [Company]?"
6. "What benefits does [Company] offer?"
7. "What is the culture like at [Company]?"
8. "Is [Company] growing or laying off?"
9. "How long is the hiring process at [Company]?"
10. "What do employees say about [Company]?"
```

**Output: The Vulnerability Report**

For each query, OpenRole shows:
- What each LLM actually said (verbatim transcript)
- What's accurate vs hallucinated vs outdated vs missing
- Where the AI sourced its answer (Glassdoor? Reddit? Outdated blog post?)
- The employer's **AI Transparency Score** (0-100)

**The pitch to employers:**
> "We ran the 10 most common candidate queries through ChatGPT. In 6 out of 10 answers, the AI hallucinated or cited a negative Reddit thread. Here is the exact transcript of what AI is telling candidates about you right now."

**Why this replaces the candidate portal:** You don't need real candidates to generate the data. The simulation engine acts as a proxy for every candidate who will ever ask ChatGPT about this company. It's reproducible, consistent, and available on demand — no consumer audience required.

**How it serves the DA:** This IS the DA measurement. Every simulated query that returns a hallucination is a quantified gap in the employer's AI presence.

---

### Layer 2: Infrastructure — "Fix what AI says about you"

**The product employers pay for.** Once the Diagnostic shows the problem, OpenRole provides the tools to fix it:

#### llms.txt
A standardised, AI-readable file hosted on the employer's domain (like robots.txt for LLMs). Contains verified, structured data about the company that LLMs can consume directly:

```
# llms.txt — Monzo (verified by OpenRole)
Company: Monzo Bank Ltd
HQ: London, UK
Remote Policy: Hybrid — 2 days/week in office minimum
Engineering Team Size: 340 (as of Feb 2026)
Interview Process: Phone screen → Technical assessment → On-site (2 rounds) → Offer
Salary Range (Senior Engineer): £85,000 - £115,000 base
Benefits: 25 days holiday, private healthcare, equity...
Last verified: 2026-02-24
```

#### Schema Markup / Structured Data
JSON-LD and schema.org markup injected into the employer's careers pages so AI crawlers can extract verified facts:

- JobPosting schema with accurate salary ranges
- Organization schema with verified company data
- FAQPage schema answering common candidate questions
- HowTo schema for interview process steps

#### AEO (Answer Engine Optimisation)
Content strategy and technical implementation to ensure AI assistants serve the employer's verified data instead of outdated Glassdoor reviews or Reddit threads:

- Optimised careers page copy that LLMs can parse
- FAQ pages structured for AI extraction
- Blog content answering common candidate queries
- Strategic internal linking for AI crawler navigation

**How it serves the DA:** This is the DA fix. Every piece of infrastructure installed moves the AI Transparency Score upward. The gap between what AI says and what's true shrinks measurably.

---

### Layer 3: Analytics — "Prove it's working"

**The retention engine.** Employers need ongoing proof that OpenRole is worth the subscription. Analytics provide that proof.

#### AI Bot Crawl Tracking
When a candidate asks ChatGPT "What is Monzo's remote work policy?", the LLM's RAG pipeline (via Bing, OAI-SearchBot, PerplexityBot) crawls the web for the answer. If OpenRole's llms.txt or structured data is hosted on the employer's site, every AI bot crawl is logged:

**The dashboard shows:**
```
AI Bot Activity — Monzo — February 2026

OAI-SearchBot:        412 crawls  (+23% vs Jan)
PerplexityBot:        189 crawls  (+45% vs Jan)
GoogleOther:          267 crawls  (+12% vs Jan)
ClaudeBot:             94 crawls  (new)

Top queries triggering crawls:
1. Remote work policy       — 234 crawls
2. Salary/compensation      — 198 crawls
3. Interview process        — 156 crawls
4. Engineering culture      — 89 crawls
5. Benefits/perks           — 67 crawls

Estimated candidate queries this month: ~960
```

**The pitch:**
> "Perplexity's bot scraped your remote work policy data 189 times this month. That's roughly 189 candidates who asked an AI about your WFH setup. Because OpenRole's verified data was installed, the bot served the correct policy — not the outdated Glassdoor answer from 2023."

#### Citation Click-Throughs
In AI search (Perplexity, Google AI Overviews, ChatGPT with browse), answers include citation links. When OpenRole's infrastructure successfully formats employer data, the AI cites the employer's verified source:

**The dashboard shows:**
```
Citation Performance — Monzo — February 2026

Times cited as source by AI:     89
Click-throughs to careers page:  34
Estimated applications sourced:  8-12

Source breakdown:
- Perplexity citations:  52 (19 clicks)
- Google AI Overview:    31 (12 clicks)
- ChatGPT browse:         6 (3 clicks)
```

**The pitch:**
> "OpenRole's verified data injection resulted in your company being cited 89 times by AI assistants this week, driving 34 highly-qualified candidates directly to your application page. That's a measurable talent pipeline from AI search — and it didn't exist before OpenRole."

#### Periodic Re-Simulation
Monthly re-run of the Simulation Engine queries to show improvement:

```
AI Transparency Score — Monzo

January 2026:   45/100 (before OpenRole)
February 2026:  78/100 (after llms.txt + AEO)
March 2026:     84/100 (after schema markup)

Hallucinations remaining: 2 (down from 8)
```

**How it serves the DA:** Analytics prove the DA is closing. The score goes up, hallucinations go down, bot crawls increase, citations drive pipeline. This is the retention loop — employers see measurable ROI every month.

---

## How Everything Connects to the Core Thesis

| Business Layer | What It Does | How It Proves the Thesis |
|---------------|-------------|-------------------------|
| **Diagnostic** | Simulates candidate queries through LLMs | Shows employers exactly what candidates hear when they ask AI |
| **Infrastructure** | Installs verified data for AI to consume | Fixes what AI says — measurable before/after |
| **Analytics** | Tracks bot crawls and citation click-throughs | Proves candidates ARE asking AI, and proves the fix works |

**The closed loop:** Diagnose → Fix → Prove → Renew. Every layer feeds the next. Every data point reinforces the thesis. No consumer product needed.

---

## What We Killed (And Why It Stays Dead)

| Feature | Why It's Dead | What Replaced It |
|---------|--------------|-----------------|
| Candidate Kanban board | Fights Teal/Huntr. No DA evidence generated. | N/A — not our war |
| CV tailoring engine | Fights AIApply. Off-thesis. Wrong economics. | N/A — not our war |
| Cover letter generator | Fights AIApply. Off-thesis. | N/A — not our war |
| Candidate portal / search bar | Contradicts thesis — asks candidates to change behaviour | Simulation Engine (proxy for candidates) |
| "Request Verified Data" button | Requires consumer audience to function | Employer Alert System (bot data + simulation results) |
| £29/mo candidate subscription | £87 LTV. Terrible economics. | Killed permanently |
| £79/mo Executive tier | Only valid B2C model, but adds B2C complexity | Deferred — reconsider only if B2B is printing money and we want diversification |

**The filter for all future feature decisions:** Does this feature generate data that supports the DA or reinforce the thesis that LLMs are the new front door for candidates? If not, it doesn't ship.

---

## Monetisation (Pure B2B)

### Tier 1: Audit (Free → Lead Gen)
- One-time AI Transparency Score
- Vulnerability Report showing top 3 hallucinations
- "Here's what AI is telling candidates about you — want to fix it?"

### Tier 2: Monitor (£149/mo)
- Monthly re-simulation of candidate queries
- AI Transparency Score tracking over time
- Basic bot crawl analytics
- Email alerts when new hallucinations detected

### Tier 3: Compete (£299/mo)
- Everything in Monitor
- llms.txt generation and hosting
- Schema markup implementation guidance
- Full bot crawl analytics dashboard
- Citation click-through tracking
- Competitor DA comparison ("Your score vs industry average")

### Tier 4: Enterprise (£1,500/mo)
- Everything in Compete
- Full AEO strategy and implementation
- Dedicated account management
- Multi-brand / multi-location support
- API access for internal dashboards
- Custom simulation queries
- Priority re-crawl requests

### Unit Economics
- **Average contract:** £299/mo × 12 months = £3,588/year
- **Target CAC:** < £500 (simulation engine is the sales tool — low-cost acquisition)
- **LTV:CAC ratio:** 7:1+ at Monitor tier, 14:1+ at Compete tier
- **Gross margin:** 85%+ (AI API costs are the primary COGS, declining with scale)

---

## Revised Phasing

### Phase 0: Dogfood (Now — Week 1)
- Run Troy's 6 priority target companies through the Simulation Engine
- Document what ChatGPT, Claude, and Perplexity say about each one
- Identify exact hallucinations, outdated data, missing information
- This serves dual purpose: Troy's job search prep AND product proof-of-concept

### Phase 1: Simulation Engine + Vulnerability Report (Weeks 2-4)
- Build automated simulation pipeline (query LLMs programmatically)
- Generate formatted Vulnerability Reports
- Integrate with existing audit flow
- Launch free audits as lead gen tool
- Cold outbound using simulation results as the hook

### Phase 2: Infrastructure Tools (Weeks 5-8)
- llms.txt generator
- Schema markup templates and implementation guide
- AEO content recommendations
- Employer self-serve dashboard for managing verified data

### Phase 3: Analytics Dashboard (Weeks 9-12)
- AI bot crawl tracking (parse server logs for OAI-SearchBot, PerplexityBot, ClaudeBot, GoogleOther)
- Citation click-through tracking
- Monthly re-simulation with before/after scoring
- Automated employer reports

### Phase 4: Scale (Weeks 13+)
- Enterprise tier features
- API for partner integrations
- Industry benchmarking data
- Automated competitor monitoring

---

## Technical Notes

### Simulation Engine
- **APIs needed:** OpenAI API (GPT-4), Anthropic API (Claude), Perplexity API (Sonar)
- **Query template library:** 10-20 standardised candidate queries, parameterised per company/role
- **Output parsing:** Extract factual claims from each response, cross-reference against verified data
- **Hallucination detection:** Compare LLM responses against ground truth (employer-verified data or manually verified facts)
- **Caching:** Cache simulation results for 7 days. Re-run on demand or monthly for subscribers.

### Bot Crawl Tracking
- **Implementation:** JavaScript snippet (existing Smart Pixel) enhanced to log bot user-agents
- **Bot identification:** OAI-SearchBot, PerplexityBot, ClaudeBot, GoogleOther, Amazonbot, AppleBot
- **Server-side:** Parse access logs for llms.txt requests by bot user-agent
- **Privacy:** No candidate PII collected. Only bot activity is tracked.

### Citation Tracking
- **Referrer analysis:** Track traffic from chatgpt.com, perplexity.ai, google.com (AI Overview clicks)
- **UTM parameters:** Embed tracking in structured data citation URLs
- **Attribution:** Map citation clicks to specific verified data fields

### Data Model (New/Modified Tables)
```
simulation_runs
  - id, company_id, run_type (initial | monthly | on_demand)
  - queries (jsonb — list of queries run)
  - results (jsonb — per-query, per-LLM responses)
  - ai_transparency_score (0-100)
  - hallucinations_found (integer)
  - run_at, completed_at

simulation_results_detail
  - id, simulation_run_id, query_text
  - llm_provider (openai | anthropic | perplexity | google)
  - response_text, factual_claims (jsonb)
  - accuracy_rating (accurate | partially_wrong | hallucinated | missing)
  - source_cited (url)
  - verified_against (jsonb — ground truth data)

bot_crawl_events
  - id, company_id, pixel_id
  - bot_user_agent, bot_provider (openai | perplexity | google | anthropic | other)
  - url_crawled, resource_type (llms_txt | careers_page | schema_markup)
  - crawled_at

citation_clicks
  - id, company_id
  - referrer_domain (chatgpt.com | perplexity.ai | google.com)
  - landing_url, utm_params (jsonb)
  - clicked_at

vulnerability_reports
  - id, company_id, simulation_run_id
  - report_html, report_pdf_url
  - score_before, score_after (nullable — for re-runs)
  - generated_at, sent_at, opened_at
```

---

## Open Questions

1. **LLM API costs at scale** — running 10 queries across 4 providers per company = 40 API calls per audit. At scale (1,000 companies/month), this is significant. Need to optimise: cache aggressively, use cheaper models for initial screening, full models for report generation.

2. **Bot crawl attribution accuracy** — can we definitively link a bot crawl to a candidate query? Not 1:1, but statistically: "X bot crawls ≈ X candidate queries" is defensible at scale.

3. **llms.txt adoption** — this is an emerging standard. Will LLMs actually respect it? Early signals are positive (Anthropic, Perplexity have expressed support), but it's not guaranteed. Schema markup is the more established fallback.

4. **Competitor response** — if this works, Glassdoor/Indeed could build it. Our moat is speed-to-market + the simulation engine + the analytics layer. First-mover advantage matters here.

5. **Legal: simulating queries** — are there ToS implications in programmatically querying LLMs to generate employer reports? Need legal review. Perplexity and OpenAI have commercial APIs, so this should be fine via API. Web scraping of consumer interfaces would be riskier.

---

## The One-Line Strategy

**Simulate what candidates ask AI. Show employers how badly AI answers. Sell them the infrastructure to fix it. Prove it works with bot analytics. Renew forever.**

## The Filter

Every feature decision passes through one question:

**"Does this generate data that supports the Digital Advantage, or reinforce the thesis that LLMs are the new front door for candidates?"**

If yes → build it.
If no → kill it.
If maybe → it's a no.
