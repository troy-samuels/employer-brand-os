# OpenRole Analytics & Authority Engine — Spec

**Purpose:** Turn raw audit data into the definitive authority on how AI represents employers. Every audit feeds the flywheel. The data becomes the moat.

---

## 1. Data Collection (What Each Audit Captures)

### Already Captured (Phase 1 — Website Checks)
```
company_name, company_domain, company_slug
score (0-100)
score_breakdown: { careersPage, jsonld, salaryData, robotsTxt, llmsTxt, brandReputation }
has_llms_txt, has_jsonld, has_salary_data
careers_page_status: full | partial | bot_protected | none
robots_txt_status: allows | partial | blocks | no_rules
ats_detected: string | null
created_at, updated_at
```

### Needs Adding (Enrichment on Audit)
```
industry: string           — classify via domain/careers page content (auto-detect)
company_size: string       — 1-50 | 51-200 | 201-500 | 501-2000 | 2000+
region: string             — UK | US | EU | APAC | Other (from TLD + content signals)
country: string            — GB, US, DE, etc.
is_public: boolean         — listed company flag
sector: string             — tech | finance | healthcare | retail | manufacturing | etc.
```

### Phase 2 (LLM Response Data)
```
llm_results: [
  {
    model_id: chatgpt | google-ai | perplexity | copilot | claude | meta-ai
    raw_response: string
    claims: [{ category, statement, accuracy, severity }]
    score: 0-100
    hallucination_count: number
    checked_at: timestamp
  }
]
consensus: [{ category, agreement_count, dominant_claim, accuracy }]
top_risks: string[]
```

---

## 2. Database Schema — Aggregate Tables

### Migration: `006_analytics_aggregates.sql`

```sql
-- ============================================================
-- Enriched audit data (extends public_audits)
-- ============================================================
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- ============================================================
-- Daily aggregate snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  
  -- Volume
  total_audits INTEGER NOT NULL DEFAULT 0,
  unique_companies INTEGER NOT NULL DEFAULT 0,
  
  -- Score distribution
  avg_score NUMERIC(5,2),
  median_score NUMERIC(5,2),
  p25_score NUMERIC(5,2),
  p75_score NUMERIC(5,2),
  
  -- Check pass rates (% of audits that pass each check)
  pass_rate_careers NUMERIC(5,2),
  pass_rate_jsonld NUMERIC(5,2),
  pass_rate_salary NUMERIC(5,2),
  pass_rate_robots NUMERIC(5,2),
  pass_rate_llms_txt NUMERIC(5,2),
  pass_rate_brand_rep NUMERIC(5,2),
  
  -- ATS breakdown
  ats_distribution JSONB,  -- { "greenhouse": 45, "lever": 23, "workday": 18, ... }
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(date)
);

-- ============================================================
-- Segment aggregates (industry × size × region)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL,            -- '2026-Q1', '2026-02', '2026-W07'
  segment_type TEXT NOT NULL,      -- 'industry' | 'size' | 'region' | 'sector'
  segment_value TEXT NOT NULL,     -- 'tech' | '51-200' | 'UK' | 'finance'
  
  audit_count INTEGER NOT NULL DEFAULT 0,
  unique_companies INTEGER NOT NULL DEFAULT 0,
  
  avg_score NUMERIC(5,2),
  median_score NUMERIC(5,2),
  
  pass_rate_careers NUMERIC(5,2),
  pass_rate_jsonld NUMERIC(5,2),
  pass_rate_salary NUMERIC(5,2),
  pass_rate_robots NUMERIC(5,2),
  pass_rate_llms_txt NUMERIC(5,2),
  pass_rate_brand_rep NUMERIC(5,2),
  
  -- Top/bottom performers
  top_companies JSONB,       -- [{ name, domain, score }] top 10
  bottom_companies JSONB,    -- [{ name, domain, score }] bottom 10
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period, segment_type, segment_value)
);

-- ============================================================
-- LLM-specific aggregates (Phase 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_llm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL,
  model_id TEXT NOT NULL,
  
  audits_checked INTEGER NOT NULL DEFAULT 0,
  avg_accuracy_score NUMERIC(5,2),
  
  total_claims INTEGER NOT NULL DEFAULT 0,
  accurate_claims INTEGER NOT NULL DEFAULT 0,
  hallucinated_claims INTEGER NOT NULL DEFAULT 0,
  outdated_claims INTEGER NOT NULL DEFAULT 0,
  
  -- Most common hallucination categories
  hallucination_categories JSONB,  -- { "salary": 340, "benefits": 210, "remote_policy": 180 }
  
  -- Most common accurate categories
  accurate_categories JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period, model_id)
);

-- ============================================================
-- Headline stats (cached, updated daily)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_headlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  total_audits_all_time INTEGER,
  total_companies_all_time INTEGER,
  avg_score_all_time NUMERIC(5,2),
  avg_score_this_month NUMERIC(5,2),
  avg_score_last_month NUMERIC(5,2),
  score_trend NUMERIC(5,2),          -- month-over-month change
  
  -- Headline stats for marketing
  pct_companies_no_llms_txt NUMERIC(5,2),
  pct_companies_no_salary NUMERIC(5,2),
  pct_companies_bot_blocked NUMERIC(5,2),
  pct_companies_no_jsonld NUMERIC(5,2),
  
  -- LLM stats (Phase 2)
  pct_hallucinated_salary NUMERIC(5,2),
  pct_hallucinated_benefits NUMERIC(5,2),
  pct_hallucinated_culture NUMERIC(5,2),
  most_accurate_llm TEXT,
  least_accurate_llm TEXT,
  
  -- For public display
  companies_audited_display TEXT,    -- "2,400+" rounded for marketing
  industries_covered INTEGER,
  countries_covered INTEGER
);

-- ============================================================
-- RLS — analytics are public read, service-role write
-- ============================================================
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_llm ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_headlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read analytics_daily" ON analytics_daily FOR SELECT USING (true);
CREATE POLICY "Service write analytics_daily" ON analytics_daily FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read analytics_segments" ON analytics_segments FOR SELECT USING (true);
CREATE POLICY "Service write analytics_segments" ON analytics_segments FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read analytics_llm" ON analytics_llm FOR SELECT USING (true);
CREATE POLICY "Service write analytics_llm" ON analytics_llm FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read analytics_headlines" ON analytics_headlines FOR SELECT USING (true);
CREATE POLICY "Service write analytics_headlines" ON analytics_headlines FOR ALL USING (auth.role() = 'service_role');
```

---

## 3. Aggregation Pipeline

### Cron Job: Nightly Aggregation (runs 02:00 UTC)

```
src/lib/analytics/aggregate-daily.ts
```

**Process:**
1. Query all audits from yesterday
2. Enrich missing fields (industry, size, region) using domain heuristics
3. Calculate daily stats → INSERT into `analytics_daily`
4. Recalculate segment aggregates for current month/quarter → UPSERT into `analytics_segments`
5. Recalculate headline stats → UPSERT into `analytics_headlines`
6. (Phase 2) Aggregate LLM accuracy data → UPSERT into `analytics_llm`

### Industry Auto-Classification

Detect from:
- Careers page content keywords
- JSON-LD `@type` and `industry` fields
- Domain patterns (`.nhs.uk` → healthcare, `.ac.uk` → education)
- Companies House SIC codes (when API key available)
- Fallback: "Unclassified" (manually reviewable)

### Company Size Detection

Detect from:
- Job listing count on careers page
- LinkedIn employee count (if publicly visible in meta tags)
- Companies House data
- Self-reported during signup (most reliable)
- Fallback: estimate from careers page depth

---

## 4. Public-Facing Authority Pages

### 4a. `/insights` — The Authority Hub

The public face of all aggregated data. Updated daily.

**Layout:**
```
Hero: "How AI Represents [X,XXX] UK Employers"
       Live counter of total audits run

Headline Stats Bar:
  [Average Score: 34/100] [XX% have no llms.txt] [XX% block AI crawlers]

Section: Score Distribution
  - Histogram of scores across all audits
  - Industry comparison bars
  - Size comparison bars

Section: The Biggest Gaps
  - "X% of companies have no structured data"
  - "X% block AI crawlers entirely"
  - "Only X% include salary information"
  - Each with trend arrow (improving/worsening)

Section: Industry Breakdown
  - Sortable table: Industry | Avg Score | Companies Audited | Top Gap
  - Click through to /insights/industry/[slug]

Section: LLM Accuracy (Phase 2)
  - Which LLM is most accurate about employers?
  - Most common hallucination categories
  - Model comparison chart

CTA: "How does your company compare? Run a free audit."
```

### 4b. `/insights/industry/[slug]` — Industry Deep Dives

Auto-generated pages per industry with enough data (>20 audits).

```
"AI Visibility in UK Tech Companies"
- Average score, distribution, top performers
- Common gaps specific to this industry
- Comparison with other industries
- "Audit your tech company" CTA
```

### 4c. `/insights/reports/[slug]` — Quarterly Reports

Long-form authority content, auto-generated from aggregate data + editorial intro.

```
"Q1 2026: The State of AI Employer Visibility"
- Executive summary
- Key findings with charts
- Industry trends
- LLM accuracy trends
- Methodology
- Full data tables
- Downloadable PDF (email-gated → lead gen)
```

### 4d. `/insights/stats` — Embeddable Stats API

Public JSON endpoint for journalists, bloggers, HR analysts to cite.

```
GET /api/insights/stats
→ {
    totalAudits: 4200,
    avgScore: 34,
    pctNoLlmsTxt: 91,
    pctNoSalary: 78,
    pctBotBlocked: 23,
    lastUpdated: "2026-03-01",
    citation: "Source: OpenRole AI Visibility Index, openrole.co.uk/insights"
  }
```

Embed widget:
```html
<script src="https://openrole.co.uk/embed/stats.js"></script>
```
Renders a small "Powered by OpenRole" stat card. Free backlink.

---

## 5. Lead Generation From Data

### Email-Gated Reports
- Quarterly PDF reports require email to download
- "Get the full dataset" → email gate
- Industry-specific reports → targeted lead gen

### Company Ranking Notifications
- When a company is audited, auto-email:
  "Your company scored 28/100. You rank #342 out of 400 in UK Tech."
- Compare to industry average
- Clear CTA to upgrade

### PR / Media Kit
- Auto-generated press release template with latest headline stats
- Embeddable charts for journalists
- "For media enquiries" contact
- Quarterly press push with key findings

### Conference / Speaking Data
- Pre-built slide decks with latest stats
- "X% of UK employers are invisible to AI" — talk-ready headline
- Troy can present at HR conferences as the authority

---

## 6. Implementation Priority

### Phase A — Foundation (Week 1)
1. Add enrichment columns to `public_audits` (industry, size, region)
2. Build industry auto-classifier
3. Build nightly aggregation cron job
4. Create `analytics_headlines` table + populate from existing data
5. Build `/insights` page with headline stats

### Phase B — Segments (Week 2)
1. Build segment aggregation (industry, size, region breakdowns)
2. Build `/insights/industry/[slug]` pages
3. Add score distribution charts
4. Build embeddable stats API (`/api/insights/stats`)

### Phase C — Authority Content (Week 3)
1. Build quarterly report generator
2. Email-gated PDF downloads
3. Press/media kit page
4. Embed widget for external sites

### Phase D — LLM Layer (Phase 2 dependency)
1. LLM accuracy aggregation once per-model audits are live
2. Model comparison charts
3. Hallucination category tracking
4. "Which LLM is most accurate?" leaderboard

---

## 7. The Moat Over Time

| Audits | What You Have | Authority Level |
|--------|--------------|-----------------|
| 100 | Basic averages | Blog post |
| 1,000 | Industry benchmarks | Conference talk |
| 5,000 | Statistically significant trends | Press citations |
| 10,000 | Definitive UK employer data | Industry standard |
| 50,000 | Global employer AI benchmark | Category ownership |

Every free audit makes the dataset more valuable. The data is the product. The pixel is the fix. The authority is the moat.

---

*Spec: Malcolm — 10 Feb 2026*
