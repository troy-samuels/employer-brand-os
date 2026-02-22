# OpenRole Scoring Model — Research & Evidence Base

## Purpose

This document compiles evidence from academic research, industry studies, and AI search platform behaviour to inform a fair, defensible scoring model for employer AI visibility audits.

**Principle:** Every weight must be traceable to evidence. If we can't cite why a factor matters, it shouldn't be in the score.

---

## Source 1: Princeton GEO Study (KDD 2024)

**Paper:** "GEO: Generative Engine Optimization" — Aggarwal et al., 2024
**Source:** arxiv.org/abs/2311.09735 (Accepted to KDD 2024)
**Scale:** 10,000 real-world queries across multiple domains, tested on Perplexity.ai

### Key Findings

1. **Citations and statistics boost visibility up to 40%** — Pages containing quotes from relevant sources and quantitative statistics had 30-40% higher visibility in AI-generated responses vs content without them.

2. **Domain-specific optimisation matters** — The efficacy of strategies varies significantly across domains. A one-size-fits-all model is inadequate; employer brand is a specific domain that may respond differently to general web content.

3. **Content format > keyword stuffing** — Traditional SEO keyword stuffing showed minimal impact. What mattered was content structure: how information was presented, not how many keywords were crammed in.

4. **Authoritative tone helps** — Modifying text to be more persuasive and authoritative improved visibility, but less than adding citations and statistics.

5. **Unique, technical terminology helps** — Adding specific, domain-relevant terminology improved citation likelihood.

### Implications for Scoring

- **Structured data (JSON-LD) is validated** — Machine-readable data with specific schemas (JobPosting, Organization) is the digital equivalent of "statistics and citations" for employer data.
- **Content quality matters more than content existence** — A careers page with structured, well-formatted content should score higher than one that merely exists.
- **We should not score keyword presence** — The study found keyword stuffing ineffective.

---

## Source 2: Semrush GEO Analysis (2025-2026)

**Source:** semrush.com/blog/generative-engine-optimization
**Context:** Practitioner-focused guide synthesising multiple data points

### Key Findings

1. **Unlinked brand mentions carry weight** — AI systems may give brand mentions more weight even without hyperlinks. Casual mentions across the web boost AI visibility.

2. **Content with quotes and statistics performs well** — Corroborates Princeton GEO findings.

3. **Server-side rendering matters** — Many AI crawlers have trouble executing JavaScript. Client-side rendered content may be invisible to AI models.

4. **Fresh content gets preference** — AI tools prefer the most current information.

5. **Wikipedia presence may boost AI visibility** — Wikipedia makes up a significant portion of AI training data.

6. **UGC platforms influence generative visibility** — Reddit, YouTube, Facebook have high exposure in generative engines. Brand presence on UGC platforms is an emerging factor.

### Implications for Scoring

- **Brand presence scoring is validated** but should measure breadth of mentions (UGC, media, review platforms) rather than just review platform count.
- **Crawlability is foundational** — If AI crawlers can't render your page, nothing else matters. Bot access / SSR should be weighted appropriately.
- **Freshness could be a signal** — We could measure content recency, but this is hard to do reliably in a static crawl.

---

## Source 3: Moz / Exposure Ninja GEO Practice (2025-2026)

**Source:** moz.com/blog/generative-engine-optimization
**Context:** Agency-tested strategies across multiple industries

### Key Findings

1. **"Extreme close matching"** — Content that precisely matches the query phrasing gets cited. For employer brand, this means content should directly answer questions like "What is it like to work at [Company]?"

2. **Direct answers + bullet points** — Simple, structured content with direct answers and bullet-pointed breakdowns gets cited more than complex prose.

3. **Traditional organic ranking is prerequisite** — You need to be visible in traditional search to earn citations in generative search. 87% of ChatGPT citations correlate with Bing indexation (referenced in multiple sources).

4. **Local SEO plays a role** — Google Business Profile data feeds into Gemini responses.

5. **Brand positioning consistency** — Brands that consistently use the same positioning phrases across all touchpoints (PR, product pages, reviews, social) get those phrases reflected back in AI responses.

6. **Data/research sources get priority** — Generative engines prioritise authoritative, evidence-backed content. Being cited as a data source is more powerful than being cited as a product page.

### Implications for Scoring

- **Organic search visibility is a leading indicator** but hard to measure in a quick audit.
- **Consistent brand messaging across platforms** is a strong signal — this aligns with our brand reputation dimension.
- **Structured, answer-first content format** should be scored.

---

## Source 4: Microsoft AEO/GEO Guidelines (2025)

**Source:** Microsoft "From Discovery to Influence" PDF
**Context:** Official guidelines from a major AI search provider (Copilot/Bing Chat)

### Key Recommendations (from metadata)

1. **Make catalogs machine-readable** — Structured data is explicitly recommended.
2. **Structure content to answer real questions** — Q&A format, FAQ schemas.
3. **Establish authority through credible sources and expertise signals** — E-E-A-T equivalent for AI search.

### Implications for Scoring

- **Structured data is confirmed critical** by the platform operator itself.
- **FAQ/Q&A format explicitly recommended** — Validates our content format scoring.

---

## Source 5: Senthor & SE Ranking llms.txt Studies

**Referenced in existing codebase comments**
**Scale:** Senthor (10M+ requests), SE Ranking (300K domains)

### Key Finding

- **llms.txt has zero measurable impact on AI citations.** Two independent large-scale studies found no correlation between having a llms.txt file and AI citation frequency.

### Implication

- **llms.txt weight should remain 0.** Already implemented.

---

## Evidence Gaps

These factors appear important but lack rigorous quantitative studies:

1. **Exact impact of JSON-LD schemas on employer-specific AI citations** — The GEO study measured general content, not specifically structured data schemas. The "30-40% boost" is for citations+statistics generally, not JobPosting schema specifically.

2. **Salary transparency impact on AI citations** — No study measures whether salary data on careers pages affects AI citation rates. This is a candidate-value signal, not a proven AI citation factor.

3. **Review platform count → AI citation correlation** — The "4+ platforms = 2.8x citations" claim (attributed to "Digital Bloom") needs verification. The actual study may not exist or may measure something different.

4. **Geographic/industry normalisation** — No study provides benchmarks for "good" employer AI visibility by country or sector.

5. **Content freshness quantified** — How much does recency matter? No study provides a decay function.

---

## Proposed Scoring Philosophy

### What We Know (High Confidence)
- Structured data improves AI citation likelihood (GEO study + Microsoft guidelines)
- Bot accessibility is prerequisite (Semrush + Moz + industry consensus)
- Content quality and structure matter more than content existence (GEO study)
- Brand mentions across platforms correlate with AI visibility (Semrush + Moz)
- Answer-first, structured content format is preferred (GEO study + Microsoft)

### What We Believe (Medium Confidence)
- JSON-LD JobPosting schema specifically helps employer AI visibility (logical extension of structured data evidence)
- Salary data in machine-readable format improves citation for compensation queries (logical but unproven)
- More review platforms = more brand mentions = higher AI visibility (plausible chain but unquantified)

### What We Don't Know (Low Confidence)
- Exact weight any single factor should receive
- Whether salary transparency helps AI citation or just helps candidates
- Whether brand reputation score is measuring signal or just company size
- How to normalise fairly across geographies and industries

---

## Recommended Scoring Model v2

### Design Principles

1. **Actionable** — Every scored dimension must be something the employer can improve
2. **Evidence-linked** — Each weight must reference at least one study/source
3. **Transparent** — Employers should understand why they scored what they scored
4. **Fair** — Should not structurally disadvantage smaller companies or specific geographies

### Proposed Weights (Total: 100)

| Dimension | Weight | Evidence | Notes |
|-----------|--------|----------|-------|
| **Content Accessibility** | 20 | Semrush (SSR), Moz (organic prerequisite), Microsoft (machine-readable) | Can AI crawlers reach and parse your content? Combines robots.txt + SSR + sitemap |
| **Structured Data** | 20 | GEO study (30-40% boost), Microsoft guidelines | JSON-LD with employer-relevant schemas (JobPosting, Organization, FAQ) |
| **Careers Content Quality** | 20 | GEO study (content structure), Moz (extreme close matching), Microsoft (answer real questions) | Not just "exists" — measures richness, structure, direct answers |
| **Content Format** | 15 | GEO study (citations, statistics, structure), Microsoft (Q&A format) | Semantic HTML, FAQ patterns, answer-first paragraphs, statistics |
| **Brand Presence** | 15 | Semrush (UGC platforms, unlinked mentions), Moz (brand positioning consistency) | Multi-platform presence. Capped to reduce size bias — presence on 3+ = full marks |
| **Salary Transparency** | 10 | No direct AI citation study — scored as candidate-value signal | Machine-readable salary ranges. Reduced weight due to regional variation + evidence gap |

### Changes from v1

| Dimension | v1 | v2 | Rationale |
|-----------|-----|-----|-----------|
| JSON-LD | 28 | 20 | Was overweighted vs evidence. 30-40% boost is for content+citations generally, not schema specifically |
| Bot access | 17 | 20 (merged into Content Accessibility) | Elevated but merged with SSR/sitemap as a single "can AI reach you" dimension |
| Careers page | 17 | 20 | Increased to reflect content quality emphasis in GEO study |
| Brand reputation | 17 | 15 | Reduced and capped earlier (3+ platforms = full marks) to reduce size bias |
| Salary | 12 | 10 | Reduced due to regional variation and lack of AI citation evidence |
| Content format | 9 | 15 | Elevated significantly — multiple studies emphasise structure/format as a primary driver |
| llms.txt | 0 | 0 | No change — proven zero impact |

### Fairness Mechanisms

1. **Brand presence cap at 3 platforms** — A 20-person startup on Glassdoor, LinkedIn, and their own site gets the same brand score as Google. Levels the playing field.

2. **Salary scoring as bonus, not penalty** — Base 0 if no salary data (not a deduction). Bonus points for machine-readable ranges. No penalty for "competitive salary" — that's still a mention.

3. **Content quality over content existence** — A rich, well-structured single page scores higher than a bare-bones careers page with 50 job listings. Quality > quantity.

4. **No company size proxy signals** — We don't score number of job listings, company revenue, headcount, or anything that structurally favours large companies.

5. **Geographic context (future)** — When we have enough data, normalise salary transparency scoring by country (e.g., UK/EU/US have higher expectations than Japan/Germany historically). Not implemented yet due to evidence gap.

---

## Open Questions for Troy

1. **Should we weight equally or have tiers?** The current model uses a flat 100-point scale. Should we instead have "must-have" factors (bot access, careers page) that gate the score, with "boost" factors (structured data, salary, format) that add points?

2. **Do we show the breakdown?** Transparency is a selling point — showing employers exactly where they lose points gives them a clear action plan. But it also exposes our methodology to competitors.

3. **Should brand presence include UGC (Reddit, YouTube)?** Currently we only check review platforms (Glassdoor, Indeed, etc). The evidence suggests UGC platforms matter too, but they're harder to detect reliably.

4. **Is 100 the right scale?** Some audit tools use letter grades (A-F), stars (1-5), or percentages. What feels right for employer brand?

---

## References

1. Aggarwal, P. et al. (2024). "GEO: Generative Engine Optimization." KDD 2024. arxiv.org/abs/2311.09735
2. Semrush (2025-2026). "Generative Engine Optimization: The New Era of Search." semrush.com/blog/generative-engine-optimization
3. Moz / Exposure Ninja (2025-2026). "What Is Generative Engine Optimization." moz.com/blog/generative-engine-optimization
4. Microsoft Advertising (2025). "From Discovery to Influence: A Guide to AEO and GEO." (PDF)
5. Senthor (2025). llms.txt impact study. Referenced in industry discussion. 10M+ request sample.
6. SE Ranking (2025). llms.txt domain study. Referenced in industry discussion. 300K domain sample.
