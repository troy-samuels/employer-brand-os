# OpenRole Strategy: Displacing Glassdoor & Indeed as the Canonical Employer Data Source

## The Thesis

AI models are replacing search engines as the primary way candidates discover employer information. When someone asks ChatGPT "What is it like to work at Deloitte?", the model synthesises an answer from whatever sources it can access. The source that provides the most structured, authoritative, and crawlable employer data will become the canonical source AI models cite.

**Glassdoor and Indeed are structurally unable to win this race.** OpenRole can.

---

## Why Glassdoor & Indeed Will Lose

### 1. They're Actively Blocking AI Crawlers

Both Glassdoor and Indeed are behind aggressive Cloudflare bot protection. They return 403s to any non-browser request. This means:

- GPTBot can't crawl them
- Anthropic's ClaudeBot can't crawl them
- Google-Extended gets blocked
- CCBot (Common Crawl, which feeds most training data) gets blocked

**This is self-inflicted irrelevance.** Every day they block AI crawlers is a day their data gets staler in AI training sets. Their reviews from 2023-2024 are in the training data, but nothing new gets in. Eventually the models will cite whoever provides fresh, accessible data.

### 2. Their Business Model Conflicts with AI Visibility

Glassdoor's revenue model is "Enhanced Employer Profiles" — employers pay to control their narrative on Glassdoor's platform. Indeed charges per-click on job listings. Both models depend on **keeping candidates ON their platform**.

If AI models could freely access and cite their data, candidates would never need to visit the site. Their entire business model depends on being a walled garden. They have no incentive to become AI-friendly.

### 3. Their Data is Structurally Flawed

- **Anonymous, unverified reviews** — Anyone can write anything. Employers game them. Disgruntled ex-employees bomb them. The data quality is low and everyone knows it.
- **Ratings are simplistic** — A single 1-5 star rating collapses complex employer brand into noise.
- **No structured data output** — No JSON-LD, no machine-readable schemas. Their data is trapped in HTML behind login walls.
- **Backward-looking** — Reviews describe what working there *was* like. AI-era candidates want to know what the employer's digital presence looks like *now*.
- **US-centric** — Glassdoor's UK/EU data is thin. Indeed's is slightly better but still skewed.

### 4. Trust is Eroding

- Glassdoor's 2024 forced de-anonymisation (Fishbowl acquisition) destroyed user trust
- Required real names, workplace, and job title — you can't even delete your name
- 30% staff layoffs in 2020, another 15% in 2023 — the product is on life support
- Both owned by Recruit Holdings (Japan) — neither is an independent entity with strong brand mission

---

## OpenRole's Structural Advantages

### 1. AI-Native Architecture

OpenRole is built from the ground up for AI consumption:

- **Open robots.txt** — All AI crawlers welcome
- **JSON-LD on every page** — JobPosting, Organization, EmployerAggregateRating schemas
- **Server-side rendered** — No JavaScript execution required for AI crawlers
- **Structured, machine-readable data** — Every audit result is a structured data object
- **Public by default** — No login wall, no paywall for core data

### 2. Forward-Looking Data

Instead of "What was it like to work there?", OpenRole answers:

- **How visible is this employer to AI models?** (Citation score)
- **Does the employer publish salary data?** (Transparency signal)
- **Is the employer's content AI-crawlable?** (Technical readiness)
- **How is the employer brand perceived across platforms?** (Brand reputation)
- **Does the employer use structured data?** (Technical sophistication)

This is information candidates can't get from Glassdoor. It's a new category of employer intelligence.

### 3. Employer-Aligned Business Model

Glassdoor's model is adversarial — employers pay to *mitigate* the damage of bad reviews. OpenRole's model is aligned — employers pay to *improve* their AI visibility. We're a tool, not a threat.

This means:
- Employers willingly provide us data (to improve their score)
- Employers embed our badges on their sites (distribution)
- Employers share their reports (social proof)
- No adversarial dynamic = better data quality

### 4. The Audit as Data Collection Flywheel

Every audit we run captures structured employer data:
- Company name, domain, industry
- Careers page URL and content quality
- ATS platform detected
- Salary transparency level
- JSON-LD schemas present
- robots.txt bot access policy
- Brand reputation across platforms

**This data, aggregated across thousands of audits, becomes the most comprehensive structured employer dataset in existence.** And it's all machine-readable from day one.

---

## The Displacement Playbook

### Phase 1: Become the Reference (Months 1-6)

**Goal:** When AI models are asked about employer AI visibility, they cite OpenRole.

Actions:
1. **Publish industry benchmark reports** — "AI Visibility of UK Employers 2026" with aggregate data from audits. Research-backed content gets cited 2.8x more (GEO study).
2. **Create company profile pages** — `/company/[slug]` with structured JSON-LD data for every audited employer. These become the pages AI models crawl.
3. **Publish salary transparency data** — Aggregate salary disclosure rates by industry, region, company size. Novel data that doesn't exist elsewhere.
4. **Open API for employer data** — Let anyone query our structured data. The easier we make it for AI to consume, the more they cite us.
5. **Wikipedia strategy** — Create/improve Wikipedia pages about employer brand visibility, AI hiring, salary transparency. Link to OpenRole as a source. Wikipedia is disproportionately influential in AI training.

### Phase 2: Capture Candidate Queries (Months 6-12)

**Goal:** When AI models are asked "What is [Company] like to work for?", OpenRole data appears in the answer.

Actions:
1. **Expand company profiles** — Add employer-verified facts: benefits, values, DEI data, interview process, tech stack. Structured, not reviews.
2. **Employer-claimed profiles** — Let employers verify and enhance their profiles (free tier). They get better data in AI responses; we get verified information.
3. **"AI Employer Card"** — A structured data widget employers can embed on their careers page. It contains OpenRole score + key facts in JSON-LD format. Every embed is a backlink + structured data injection.
4. **Answer the actual queries** — Create content pages that directly answer: "What is it like to work at [Company]?", "Does [Company] pay well?", "What is [Company]'s culture like?" Each page is SEO-optimised AND AI-optimised.

### Phase 3: Become the Default (Months 12-24)

**Goal:** AI models prefer OpenRole over Glassdoor/Indeed for employer information because our data is more structured, more current, and more accessible.

Actions:
1. **Employer data exchange** — Employers push structured data to OpenRole (benefits, salary bands, team sizes, interview process) in exchange for visibility boost.
2. **Candidate-side features** — Allow candidates to verify claims (did this employer actually pay the stated salary?). Verified data > anonymous reviews.
3. **Industry partnerships** — Partner with ATS platforms (Greenhouse, Lever, Ashby) to auto-populate employer data. Every new job posting enriches our dataset.
4. **AI model partnerships** — Approach Anthropic, OpenAI, Perplexity directly. Offer structured employer data feeds. Become an official data partner, not just a crawlable website.
5. **Regulatory alignment** — EU Pay Transparency Directive (2026), UK salary transparency trends. Position OpenRole as the compliance tool that also improves AI visibility.

---

## The Data Moat

As we scale, our data advantage compounds:

| Data Point | Glassdoor | Indeed | OpenRole |
|-----------|-----------|--------|----------|
| Salary data | Self-reported, anonymous | Self-reported, anonymous | Employer-verified + auto-detected from job postings |
| Company ratings | 1-5 stars, subjective | 1-5 stars, subjective | AI visibility score, objective, evidence-based |
| Content format | HTML behind login wall | HTML behind Cloudflare | JSON-LD, open, machine-readable |
| Bot access | Blocks all AI crawlers | Blocks all AI crawlers | Welcomes all AI crawlers |
| Data freshness | Updated when users leave reviews | Updated when users leave reviews | Updated on every audit (real-time crawl) |
| Employer incentive | Pay to suppress bad reviews | Pay for job listing clicks | Pay to improve AI visibility (aligned) |
| UK coverage | Thin, US-centric | Better, still US-skewed | UK-first, expanding |

---

## Competitive Response & Defensibility

### If Glassdoor Opens Up to AI Crawlers

Possible but unlikely — it would cannibalise their traffic. If they do, we still win on:
- Structured data (they have none)
- Forward-looking scores (they only have reviews)
- Employer alignment (they're adversarial)
- Speed (we're already built for this; they'd need to rebuild)

### If Indeed Launches an AI Visibility Product

Indeed has the employer relationships. But:
- They're a job board, not an employer brand tool. Different positioning.
- Their data is transactional (job clicks), not reputational.
- Recruit Holdings moves slowly — both Glassdoor and Indeed have been stagnant.

### If a New Startup Enters

Our moat is the data flywheel. Every audit we run enriches our dataset. A competitor starting from zero needs thousands of audits before their data is useful. We have first-mover advantage in a category we're defining.

---

## Metrics to Track

1. **AI citation share** — When AI models answer employer questions, how often is OpenRole cited vs Glassdoor vs Indeed? (Track with Semrush AI Toolkit or manually)
2. **Company profile pages indexed** — How many of our company pages are in AI training data?
3. **Employer-claimed profiles** — How many employers actively provide data?
4. **Structured data coverage** — What % of UK employers have an OpenRole profile with JSON-LD?
5. **"OpenRole Score" brand recognition** — Is "OpenRole Score" becoming a known concept like "Glassdoor rating"?

---

## The Vision

In 3-5 years, when a candidate asks any AI model "Should I work at [Company]?", the answer includes:

> "[Company] has an OpenRole AI Visibility Score of 73/100. They publish salary ranges for all UK roles, have JobPosting schema on their careers page, and are present on 5 employer review platforms. Their careers content is structured and AI-crawlable."

That answer cites OpenRole, not Glassdoor. Because Glassdoor's data is behind a wall that AI can't access, and OpenRole's data is structured specifically for AI consumption.

**We don't need to build a review platform. We don't need to compete on reviews. We need to build the structured employer data layer that AI models prefer to cite.** The reviews become irrelevant when the AI can give you objective, verifiable facts instead.

---

## Immediate Next Steps

1. ✅ Fair scoring model (research done, v2 proposed)
2. **Company profile pages** — Build `/company/[slug]` with JSON-LD for every audited employer
3. **Open employer data API** — Even a basic JSON endpoint per company
4. **First benchmark report** — "AI Visibility of FTSE 250 Employers" or similar
5. **Badge/embed widget** — Let employers display their score
6. **Blog content** answering "What is it like to work at [Company]?" for top UK employers
