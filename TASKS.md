# Rankwell — Phase 1 Build Tasks
*Build the Audit Engine — the foundation for all user journeys*

Reference docs:
- `PRODUCT_VISION.md` — full product vision, tiers, metrics
- `USER_JOURNEYS.md` — 5 user journeys with emotional arcs
- `frontend/src/` — existing Next.js 16 + React 19 + Supabase codebase

---

## Task 1: Company Autocomplete Input
**What:** Replace the current URL-based audit input with a company name autocomplete powered by the 460K company database.

**Files to create/modify:**
- `src/components/audit/company-search.tsx` — new autocomplete component
- `src/app/api/companies/search/route.ts` — new API endpoint
- `src/app/page.tsx` — update hero section to use new input

**Acceptance Criteria:**
- [ ] Single text input with placeholder "Enter your company name"
- [ ] Debounced search (300ms) triggers on 2+ characters
- [ ] API returns max 8 results, each with: `id`, `name`, `domain`, `industry`, `employee_count`
- [ ] Dropdown renders below input showing company name + domain + industry
- [ ] Keyboard navigation works: arrow up/down to highlight, Enter to select, Escape to dismiss
- [ ] Selecting a company populates the input and stores the company object in state
- [ ] "Run Free Audit" button appears after selection, disabled until a company is selected
- [ ] If company not found, show: "Can't find your company? Enter your website URL instead" with fallback URL input
- [ ] Input is XSS-safe: all user input sanitised before rendering
- [ ] API endpoint uses Supabase `ilike` query with proper parameterisation (no SQL injection)
- [ ] API responds in <200ms for typical queries (indexed column)
- [ ] Loading state shown during search (subtle spinner in input)
- [ ] Mobile responsive: dropdown doesn't overflow viewport on small screens
- [ ] Zero TypeScript errors, zero ESLint warnings
- [ ] Component has JSDoc comment explaining its purpose

**Test criteria:**
- [ ] Vitest unit test: renders input, types "Merid", verifies API called after debounce
- [ ] Vitest unit test: keyboard navigation selects correct item
- [ ] Vitest unit test: fallback URL input appears when no results found

---

## Task 2: Citation Chain Engine
**What:** Build the core engine that queries AI models AND Google for the same employer queries, then maps which sources each AI model cites.

**Files to create/modify:**
- `src/lib/citation-chain/engine.ts` — orchestrator
- `src/lib/citation-chain/google-search.ts` — Google SERP scraping/API
- `src/lib/citation-chain/llm-query.ts` — query AI models with employer prompts
- `src/lib/citation-chain/source-mapper.ts` — map AI citations to Google results
- `src/lib/citation-chain/types.ts` — all TypeScript types
- `src/lib/citation-chain/prompts.ts` — standardised employer prompt templates

**Acceptance Criteria:**
- [ ] `types.ts` exports interfaces: `CitationChainResult`, `GoogleResult`, `LlmResponse`, `SourceMapping`, `PromptCategory`
- [ ] 8 prompt categories defined: salary, culture, benefits, remote_policy, interview, competitors, reviews, growth
- [ ] For each category, a standardised prompt template exists: e.g. "What is the salary for a {role} at {company}?"
- [ ] `google-search.ts` accepts a query string, returns top 10 organic results with: `url`, `domain`, `title`, `snippet`, `position`
- [ ] Google search uses server-side fetch (Serper API or direct scrape with appropriate User-Agent) — no client-side calls
- [ ] `llm-query.ts` exports `queryModel(modelId, prompt)` that returns `{ response: string, citations: string[], modelId }`
- [ ] Supports 3 models minimum: `chatgpt`, `claude`, `perplexity` (stubbed with realistic mock data until API keys provided)
- [ ] Mock data is realistic and company-specific (uses company name in responses), not generic placeholders
- [ ] `source-mapper.ts` takes Google results + LLM citations, returns a mapping showing which Google results appear as LLM citations
- [ ] Mapping includes: `{ googlePosition: number, domain: string, citedByModels: string[], sourceType: 'review-platform' | 'employer' | 'forum' | 'news' | 'other' }`
- [ ] `engine.ts` orchestrates: accepts company name + domain, runs all queries in parallel, returns complete `CitationChainResult`
- [ ] `CitationChainResult` includes: `companyName`, `companyDomain`, `googleResults[]`, `llmResponses[]`, `sourceMappings[]`, `citationScore`, `timestamp`
- [ ] `citationScore` calculated as: (citations from company domain / total citations) × 100, capped at 100
- [ ] Engine handles timeouts gracefully: if one model fails, others still return results
- [ ] All functions have JSDoc comments
- [ ] Zero TypeScript errors

**Test criteria:**
- [ ] Vitest unit test: `source-mapper` correctly identifies Glassdoor domain across URL variants (glassdoor.com, glassdoor.co.uk, glassdoor.sg)
- [ ] Vitest unit test: `citationScore` returns 0 when no employer domain cited, 100 when all citations are employer domain
- [ ] Vitest unit test: engine returns partial results when one model times out
- [ ] Vitest unit test: prompt templates correctly interpolate company name

---

## Task 3: Source Gap Matrix
**What:** Analyse the citation chain results to produce a per-category gap analysis showing where the company's domain appears vs doesn't.

**Files to create/modify:**
- `src/lib/citation-chain/gap-analysis.ts` — gap analysis logic
- `src/components/audit/source-gap-matrix.tsx` — visual matrix component

**Acceptance Criteria:**
- [ ] `gap-analysis.ts` exports `analyseGaps(chainResult, companyDomain)` returning `GapAnalysis`
- [ ] `GapAnalysis` contains 8 rows (one per prompt category), each with:
  - `category`: prompt category id
  - `status`: `'red' | 'amber' | 'green'`
  - `googleTopDomains`: top 3 domains ranking on Google for this query
  - `aiCitedDomains`: domains AI models cited for this category
  - `companyAppears`: boolean — does company domain appear in either Google or AI citations
  - `companyGooglePosition`: number | null — position in Google results, null if absent
  - `recommendedAction`: string — specific fix recommendation
  - `impactLevel`: `'high' | 'medium' | 'low'`
- [ ] Status logic: green = company domain cited by 2+ models, amber = cited by 1 model, red = not cited at all
- [ ] `source-gap-matrix.tsx` renders an 8-row visual grid
- [ ] Each row shows: category icon + label, status dot (red/amber/green), top Google domains, AI-cited domains, company presence indicator
- [ ] Rows sorted by impact: high first, then medium, then low
- [ ] Red rows have a subtle red background tint, green rows have green tint
- [ ] Component is responsive: on mobile, collapses to a card-per-row layout instead of a table
- [ ] Each row is expandable (click to reveal): the specific Google results and AI citations for that category
- [ ] Export button: "Download as PDF" placeholder (wired but shows "Coming soon" toast)
- [ ] Zero TypeScript errors, zero ESLint warnings
- [ ] Component has JSDoc comment

**Test criteria:**
- [ ] Vitest unit test: `analyseGaps` returns red status when company domain not in any citations
- [ ] Vitest unit test: `analyseGaps` returns green status when company domain cited by 3 models
- [ ] Vitest unit test: all 8 categories present in output regardless of input data
- [ ] Vitest unit test: rows are sorted by impact descending

---

## Task 4: Entity Confusion Detection
**What:** Detect when AI models conflate the target company with similarly-named entities.

**Files to create/modify:**
- `src/lib/citation-chain/entity-detection.ts` — detection logic
- `src/components/audit/entity-confusion-alert.tsx` — alert component

**Acceptance Criteria:**
- [ ] `entity-detection.ts` exports `detectEntityConfusion(llmResponses, companyName, companyDomain)` returning `EntityConfusionResult`
- [ ] `EntityConfusionResult` contains:
  - `isConfused`: boolean
  - `severity`: `'none' | 'low' | 'medium' | 'high'`
  - `confusedEntities`: array of `{ name: string, mentionedInModels: string[], evidenceSnippet: string }`
  - `correctIdentificationRate`: number (0-100) — % of models that correctly identified the company
  - `recommendation`: string
- [ ] Detection works by: extracting all company/organisation names mentioned in LLM responses, comparing against the target company name using fuzzy matching (Levenshtein distance or similar), flagging any distinct entities that share partial names
- [ ] Common suffixes handled: "Ltd", "Inc", "Group", "PLC", "Corp", "Limited", "Holdings" — these are normalised before comparison
- [ ] Detection recognises when AI mentions a different industry for a same-name company (e.g., "Meridian Health Plan" vs "Meridian Tech")
- [ ] `entity-confusion-alert.tsx` renders a warning banner when `isConfused === true`
- [ ] Banner shows: severity icon, number of confused entities, list of confused entity names, which AI models were affected
- [ ] Banner has a "Learn more" expandable section explaining the legal/brand risk
- [ ] Banner does NOT render when `isConfused === false` (no empty state)
- [ ] High severity (3+ confused entities or <50% correct identification) uses red styling
- [ ] Medium severity (1-2 confused entities) uses amber styling
- [ ] Zero TypeScript errors

**Test criteria:**
- [ ] Vitest unit test: detects "Meridian IT" vs "Meridian Technology Group" as confused entities
- [ ] Vitest unit test: does NOT flag when all models correctly reference the same company
- [ ] Vitest unit test: normalises "Liberty Financial Ltd" and "Liberty Financial" as the same entity
- [ ] Vitest unit test: severity escalates correctly based on number of confused entities

---

## Task 5: Trust Delta & Cost Calculator
**What:** Calculate the gap between AI-reported data and show the financial impact of misinformation.

**Files to create/modify:**
- `src/lib/citation-chain/trust-delta.ts` — delta calculation logic
- `src/components/audit/trust-delta-table.tsx` — visual delta table
- `src/components/audit/cost-calculator.tsx` — interactive cost calculator

**Acceptance Criteria:**
- [ ] `trust-delta.ts` exports `calculateTrustDelta(llmResponses, companyDomain)` returning `TrustDeltaResult`
- [ ] `TrustDeltaResult` contains an array of `DeltaItem`:
  - `category`: string (e.g. "Senior Engineer Salary")
  - `aiSays`: string (what AI reported)
  - `reality`: string | null (null if company hasn't published data — shows "?" in UI)
  - `delta`: string | null (human-readable gap, e.g. "-£20K" or "Outdated by 3 years")
  - `source`: string (where AI got it: "Glassdoor", "Indeed", etc.)
  - `confidence`: `'high' | 'medium' | 'low'` (how confident the AI response was)
- [ ] Delta extraction parses salary ranges from LLM responses using regex (handles £, $, €, K, k, per annum, /yr patterns)
- [ ] When company data is unknown (reality is null), UI shows "?" with tooltip: "Publish this data to close the gap"
- [ ] `trust-delta-table.tsx` renders a clean table with columns: Category, AI Says, Reality, Delta
- [ ] Delta column shows red text for negative deltas, green for when reality matches
- [ ] "?" reality cells are styled distinctly (dashed border, muted text) to emphasise the gap
- [ ] `cost-calculator.tsx` is an interactive component below the delta table
- [ ] Calculator has 3 editable inputs: Active roles (default: 10), Monthly AI-assisted job views (default: 2000), Average cost-per-hire (default: £8,500)
- [ ] Formula: `(views × hallucination_rate × estimated_dropoff × cost_per_hire / views_per_hire)`
- [ ] `hallucination_rate` derived from the actual audit data (% of categories with wrong/missing data)
- [ ] Result displays as large formatted number: "£XX,XXX / month in estimated wasted recruiting spend"
- [ ] Below the number: "Rankwell Pro: £299/month — ROI: XXx"
- [ ] Inputs update the calculation in real-time (no submit button)
- [ ] All currency formatted with locale-appropriate separators
- [ ] Mobile responsive: table scrolls horizontally if needed, calculator stacks vertically
- [ ] Zero TypeScript errors

**Test criteria:**
- [ ] Vitest unit test: salary regex correctly parses "£55,000 – £68,000", "$150K - $250K/yr", "€45k-60k per annum"
- [ ] Vitest unit test: cost calculator produces correct output for known inputs
- [ ] Vitest unit test: hallucination rate correctly derived from audit data (5/8 categories wrong = 62.5%)
- [ ] Vitest unit test: delta is null when reality is null (not a computed gap)

---

## Task 6: Audit Report Page
**What:** Build the full audit report page that displays all results from Tasks 2-5 in a beautiful, scrollable layout matching the user journey.

**Files to create/modify:**
- `src/app/audit/[slug]/page.tsx` — the audit report page (SSR or ISR)
- `src/app/api/audit/citation-chain/route.ts` — new API endpoint triggering the full citation chain audit
- `src/components/audit/audit-report.tsx` — report layout component
- `src/components/audit/citation-score-hero.tsx` — the big score display at top
- `src/components/audit/citation-chain-visual.tsx` — Google → AI visual mapping
- `src/components/audit/loading-theatre.tsx` — the animated loading state

**Acceptance Criteria:**
- [ ] `/audit/[slug]` page loads for any company slug (e.g., `/audit/currencycloud`)
- [ ] `loading-theatre.tsx` shows an animated progress feed during audit:
  - Lines appear sequentially with check marks: "Querying ChatGPT...", "Querying Claude...", "Querying Perplexity...", "Mapping Google citation chain...", "Detecting entity accuracy...", "Calculating Citation Score..."
  - Each line animates in with a 1-2 second stagger
  - Progress bar fills as steps complete
  - Total loading time: 15-30 seconds (real or simulated)
- [ ] `citation-score-hero.tsx` displays:
  - Company name (large, bold)
  - Citation Score as a large number with circular progress ring (like the monitor preview)
  - Score colour: 0-30 red, 31-60 amber, 61-100 green
  - Subtitle: "X% of what AI tells candidates about you comes from sources you don't control"
  - The percentage is `100 - citationScore`
- [ ] `citation-chain-visual.tsx` shows a two-column visual:
  - Left: Google organic results (domain, position, snippet preview)
  - Right: AI model citations (which models cite which domains)
  - Lines connecting Google results to AI citations
  - Company domain highlighted in green if present, Glassdoor/Indeed in red
- [ ] Report page layout (top to bottom):
  1. Citation Score Hero
  2. Citation Chain Visual
  3. Source Gap Matrix (from Task 3)
  4. Entity Confusion Alert (from Task 4, only if detected)
  5. Trust Delta Table (from Task 5)
  6. Cost Calculator (from Task 5)
  7. Email gate CTA: "Want the full fix playbook? Enter your work email"
- [ ] All sections use `framer-motion` for scroll-triggered animations (fade up on enter viewport)
- [ ] Page is shareable: unique URL per audit, OG meta tags with company name + score
- [ ] Page works without JavaScript for core content (SSR)
- [ ] Mobile responsive: all sections stack cleanly on mobile
- [ ] Dark background sections alternate with light for visual rhythm
- [ ] Zero TypeScript errors, zero ESLint warnings

**Test criteria:**
- [ ] Vitest unit test: `citation-score-hero` renders correct colour for score 25 (red), 50 (amber), 75 (green)
- [ ] Vitest unit test: loading theatre renders all 6 steps in sequence
- [ ] Vitest unit test: report page renders all 7 sections when full data provided
- [ ] Vitest unit test: email gate form validates work email format (rejects gmail.com, yahoo.com, etc.)

---

## Task 7: Audit API Endpoint (Citation Chain)
**What:** New API endpoint that orchestrates the full citation chain audit and returns structured results.

**Files to create/modify:**
- `src/app/api/audit/citation-chain/route.ts` — new POST endpoint

**Acceptance Criteria:**
- [ ] POST `/api/audit/citation-chain` accepts `{ companyName: string, companyDomain: string }`
- [ ] Validates input with Zod: companyName 1-200 chars, companyDomain valid domain format
- [ ] CSRF validation using existing `validateCsrf` utility
- [ ] Rate limiting: 10 requests per IP per hour (uses existing `RateLimiter`)
- [ ] Calls `CitationChainEngine.run(companyName, companyDomain)` from Task 2
- [ ] Calls `analyseGaps` from Task 3
- [ ] Calls `detectEntityConfusion` from Task 4
- [ ] Calls `calculateTrustDelta` from Task 5
- [ ] Returns combined result:
  ```typescript
  {
    citationChain: CitationChainResult,
    gapAnalysis: GapAnalysis,
    entityConfusion: EntityConfusionResult,
    trustDelta: TrustDeltaResult,
    meta: { generatedAt: string, auditVersion: string }
  }
  ```
- [ ] Errors from individual modules don't crash the whole endpoint — partial results returned with error flags
- [ ] Response time target: <30 seconds (parallel execution of Google + LLM queries)
- [ ] Logs audit request using existing `logAuditRequest` utility
- [ ] Runtime is `nodejs` (not edge — needs longer execution time)
- [ ] Zero TypeScript errors

**Test criteria:**
- [ ] Vitest unit test: returns 400 for missing companyName
- [ ] Vitest unit test: returns 400 for invalid domain format
- [ ] Vitest unit test: returns 429 when rate limit exceeded
- [ ] Vitest unit test: returns partial results when one module throws

---

## Build Order & Dependencies

```
Task 2 (Citation Chain Engine) — no dependencies, core foundation
  ↓
Task 3 (Source Gap Matrix) — depends on Task 2 types/output
Task 4 (Entity Confusion) — depends on Task 2 types/output  
Task 5 (Trust Delta + Calculator) — depends on Task 2 types/output
  ↓ (all three can be parallel)
Task 7 (API Endpoint) — depends on Tasks 2-5
  ↓
Task 1 (Company Autocomplete) — independent, can be parallel with Tasks 2-5
Task 6 (Audit Report Page) — depends on Tasks 1-5, 7
```

**Optimal execution:**
- Wave 1: Task 1 + Task 2 (parallel)
- Wave 2: Task 3 + Task 4 + Task 5 (parallel, after Task 2)
- Wave 3: Task 7 (after Tasks 2-5)
- Wave 4: Task 6 (after all)

---

## Global Constraints (Apply to ALL Tasks)

1. **TypeScript strict mode** — zero `any` types, zero `@ts-ignore`
2. **All exports have JSDoc comments** — every exported function, type, and component
3. **No client-side API keys** — all LLM/Google queries happen server-side only
4. **Existing patterns** — follow the codebase's existing patterns for API routes, error handling, response format
5. **Existing UI library** — use Radix UI, Lucide icons, Tailwind, framer-motion (already in deps)
6. **Test every module** — every `.ts` file gets a corresponding `.test.ts` with Vitest
7. **Clean build** — `npm run build` must succeed with zero errors after each task
8. **British English** — all user-facing copy uses UK spelling (organised, realised, colour, etc.)
9. **No new dependencies** unless absolutely necessary — if needed, document why
10. **Sanitise all user input** — use existing `sanitize-html.ts` utility, never render unsanitised strings
