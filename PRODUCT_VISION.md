# OpenRole — Product Vision
*Last updated: 2026-02-11*

## Core Thesis
**Google Search Results = AI Knowledge.** LLMs inherit Google's ranking hierarchy. If Glassdoor ranks #1 for "[Company] salary", AI cites Glassdoor. The company's own domain doesn't exist in the chain. OpenRole maps this chain and fixes it.

## The Citation Chain (How AI Gets Its "Knowledge")
1. Google ranks pages for employer queries (salary, culture, benefits, etc.)
2. LLMs use search-augmented retrieval, pulling from Google's top results
3. Glassdoor/Indeed dominate Google for employer queries
4. Therefore AI responses are 90%+ sourced from Glassdoor/Indeed/Reddit
5. Company's own domain rarely appears — 0% citation rate is common
6. Data is often years old, entities get confused, salary figures are wrong

**OpenRole turns "AI Hallucinations" into "SEO Failures" — a problem companies already know how to fix.**

---

## Product Tiers

### Tier 1: The Audit (Free / Lead Gen)
**Result: Fear and Clarity**

- **Citation Chain Mapping** — Run employer queries on Google, capture top 10-20 organic results, cross-reference with what AI models cite. Show the 1:1 mirror.
- **Citation Score** — % of AI citations from company's own domain vs third parties. The "Credit Score" for reputation.
- **Source Gap Matrix** — For each of 8 prompt categories (salary, culture, benefits, remote, interview, competitors, reviews, growth): what Google ranks, what AI cites, whether company domain appears. Red/amber/green.
- **Sentiment Weight** — If the #1 Google result is a 2-star Glassdoor page and the company's 5-star careers page is at #50, show the chain is mathematically broken. Weight by position × sentiment.
- **Entity Confusion Detection** — Flag when AI conflates company with similarly-named entities. Meridian Tech → Meridian IT + Meridian Technology Group + Meridian Solutions + Meridian Health Plan. This is a Legal/Compliance issue, not just an HR one.
- **Trust Delta** — If AI says £55K (3rd party) but company actual is £75K (1st party), the Delta is £20K. Quantify in lost candidates: (Delta × estimated applicant volume) = cost.
- **Cost of Misinformation Calculator** — The CFO Closer: (Job Views) × (Hallucination Rate) × (Est. Cost per Hire) = Total Reputation Loss. "AI hallucinations are costing you £240K/month in lost engineering talent. OpenRole costs £899. Pays for itself in 3 hours."

### Tier 2: The Monitor (Monday Morning Subscription)
**Result: Accountability**

- **Weekly Citation Score tracking** — Score trend over time
- **Freshness Score** — Average age of sources AI uses. "Average source age: 3.2 years. Oldest: 7 years."
- **Weekly Trust Delta Report** — What changed, what improved, what degraded
- **Entity Confusion Alerts** — New conflation events detected
- **Agent-Switch Analysis** — Different AI models use different retrieval strategies. "You're winning on Perplexity but losing on SearchGPT because SearchGPT prioritises LinkedIn data." Forces cross-platform awareness.
- **Monday email digest** — Score, changes, recommendations, competitor movement

### Tier 3: The Fix (Infrastructure Premium)
**Result: Control**

- **Smart Pixel** — Automated, always-fresh JSON-LD (Organization, JobPosting, FAQPage, EmployerAggregateRating). "Real-Time Heartbeat" — tells AI crawlers "this data is 4 minutes old." Static JSON-LD is the hook; pixel is the product.
- **Structured Data Generator (Freemium hook)** — Copy-paste JSON-LD for one job. When they have 500 jobs and manual updates are a nightmare, Smart Pixel becomes the only logical solution.
- **Content Playbooks** — For each gap in the Source Gap Matrix, generate specific content briefs. Target query, page structure, headings, structured data. Use LLM to write first draft: "We found the gap, mapped the query, and already wrote the page. Just hit 'Publish.'"
- **Pre-Crawl Simulator** — Paste new content → see predicted Citation Score change. "If you publish this, your score jumps from 12% to 35%." Immediate gratification before they even publish.
- **Competitor Citation Benchmarking** — Who in their sector IS getting cited from their own domain. Competition drives action.

---

## Buyer Personas (Multi-Door Strategy)

| Door | Persona | Hook | Budget |
|------|---------|------|--------|
| HR/TA | Head of Talent, VP People | "Candidates are seeing wrong salary data" | Recruitment budget |
| Legal | General Counsel, Brand Protection | "AI is confusing you with other companies" | Trademark/compliance budget |
| Finance | CFO | "Misinformation costs £240K/month in lost hires" | Cost reduction budget |
| Marketing | CMO, Employer Brand Manager | "Your brand doesn't exist in AI" | Brand budget |

Entity Confusion is the **Trojan Horse** — it lets you talk to Legal, who have much deeper pockets for "Brand Protection."

---

## Build Priority

### Phase 1: The Audit Tool (NOW)
1. Citation Chain engine — query Google + AI models, map sources
2. Citation Score calculation
3. Source Gap Matrix visualisation
4. Entity Confusion detection
5. Trust Delta with cost quantification
6. Beautiful audit report (PDF + web)

### Phase 2: The Monitor
7. Weekly automated re-audit
8. Score trending + change detection
9. Monday email digest
10. Agent-switch analysis (per-model differences)

### Phase 3: The Fix
11. Structured Data Generator (freemium)
12. Smart Pixel (premium)
13. Content Playbook generator (LLM-powered)
14. Pre-Crawl Simulator
15. Competitor benchmarking

---

## Key Metrics to Track
- **Citation Score** — % first-party citations across AI models
- **Trust Delta** — £ gap between AI-reported and actual data
- **Freshness Score** — Average age of cited sources
- **Entity Accuracy** — Whether AI correctly identifies the company
- **Source Diversity** — How many unique domains AI cites (Glassdoor monopoly = bad)
- **Query Coverage** — How many of 8 prompt categories have first-party data

---

## Positioning
**OpenRole is a Search Intelligence Agency in a Box.**

Not a monitoring tool. Not an SEO tool. A new category:
**AI Reputation Infrastructure.**

By focusing on Entity Confusion and Freshness, the product moves into **Risk Mitigation** — where enterprise money lives.

The collapse of the Glassdoor/Indeed system is the tailwind. Companies that optimise for AI citation now will dominate talent acquisition for the next decade. OpenRole is the picks-and-shovels play.
