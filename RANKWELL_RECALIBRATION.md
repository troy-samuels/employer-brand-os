# Rankwell Product Recalibration — Evidence-Based Pivot

**Date:** 19 February 2026
**Trigger:** Citation factors research reveals llms.txt has zero impact; current scoring model and value proposition are misaligned with evidence.

---

## The Problem

Rankwell's current product is built on assumptions that the citation research has disproven:

| Assumption | Reality | Impact |
|-----------|---------|--------|
| llms.txt helps AI describe your company | Zero AI bots read it (10M+ requests studied) | 10% of our score is meaningless |
| Employers should create llms.txt files | No measurable citation impact (300K domains studied) | Core blog post and tool are recommending something useless |
| Structured data is important | TRUE — 30-40% citation improvement | But we only weight it 20% |
| Careers page matters | Partially true — for content, not for AI discovery | 30% weight may be too high for AI visibility specifically |
| Brand search volume doesn't matter | It's the #1 predictor of AI citations (0.334 correlation) | We don't measure it at all |
| Content format doesn't matter | Comparative listicles, FAQ, tables get cited disproportionately | We don't measure this |

## What Needs Changing

### 1. Scoring Model (website-checks.ts)

**Current weights (total: 100):**
- Careers page: 30
- Structured data (JSON-LD): 20
- Salary transparency: 15
- Brand reputation: 15
- Bot access (robots.txt): 10
- llms.txt: 10 ← **PROVEN USELESS**

**New evidence-based weights (total: 100):**
- Structured data (schema.org/JSON-LD): 25 (+5, proven 30-40% citation boost)
- Content format & structure: 20 (NEW — answer-first, FAQ, tables, semantic HTML)
- Bot access (robots.txt + sitemap): 15 (+5, foundational gate)
- Brand reputation signals: 15 (keep — proxy for brand search volume)
- Careers page quality: 15 (-15, still matters but less for AI specifically)
- Salary transparency: 10 (-5, important but secondary to structure)
- llms.txt: 0 (-10, **remove from scoring**)

**New checks to add:**
- Content format scoring (does the careers page use FAQ schema, tables, clear Q&A format?)
- Semantic HTML check (proper heading hierarchy, structured content)
- Multi-platform presence check (LinkedIn, Glassdoor, Wikipedia, news mentions)
- Sitemap.xml quality (already detected but not scored)

### 2. Value Proposition

**Current:** "Is AI telling the truth about your company? Find out in 30 seconds."
→ This is still valid. The audit concept works.

**What changes:** The "fix" recommendations shift from "create an llms.txt file" to:
1. Add schema.org structured data to your careers page
2. Format content in FAQ/Q&A style that AI prefers to cite
3. Ensure AI crawlers can access your site
4. Publish salary data in machine-readable format
5. Build brand presence across multiple platforms

### 3. Blog Content Affected

| Post | Issue | Action |
|------|-------|--------|
| "llms.txt: the file every employer needs in 2026" | **Entire post is wrong** | Rewrite as "The llms.txt myth: why the file employers are creating doesn't work" |
| "What AI tells candidates about your company" | References llms.txt as fix #1 | Replace llms.txt recommendation with structured data |
| "Why your Glassdoor profile doesn't matter anymore" | Lists llms.txt as replacement | Replace with JSON-LD + content format |
| "The zero-click candidate" | Links to llms.txt guide | Replace with structured data guide |
| "AI is hallucinating your salary data" | Links to llms.txt guide | Replace with JSON-LD salary schema |
| "GEO for employer branding" | Lists llms.txt as step 2 | Replace with evidence-backed steps |
| "AI Employer Brand Score" | Mentions llms.txt in scoring | Remove, replace with structured data |

### 4. UI/Product Pages Affected

| Page | Issue | Action |
|------|-------|--------|
| `/tools/llms-txt` | Entire tool generates a useless file | Either remove or pivot to "AI-Readable Employer Profile" generator that outputs JSON-LD instead |
| `/how-we-score` | Lists llms.txt as scoring factor | Update to new scoring factors |
| `/fix/[slug]` | Recommends llms.txt creation (25 points) | Replace with JSON-LD structured data recommendations |
| `/company/[slug]` | Shows llms.txt pass/fail | Replace with content format / structured data pass/fail |
| `/compare` | Shows llms.txt adoption stat | Replace with structured data adoption stat |
| `/index` | Shows llms.txt column | Replace with content format column |
| `/faq` | llms.txt FAQ entry | Update with accurate information |
| Audit results component | llms.txt status messages | Replace with structured data messages |

### 5. Database Schema Impact

- `audit_website_checks.has_llms_txt` → keep the column (historical data) but stop using it for scoring
- `audit_website_checks.llms_txt_has_employment` → same, keep but deprecate
- `public_audits.has_llms_txt` → keep but deprecate
- **New columns needed:** `content_format_score`, `semantic_html_score`, `multi_platform_count`

### 6. The llms.txt Tool Pivot

Instead of killing `/tools/llms-txt`, pivot it to `/tools/employer-schema` — a JSON-LD generator that creates:
- Organization schema
- EmployerAggregateRating schema
- JobPosting schema with salary data
- FAQ schema for careers page content

This is the same "give employers a tool to control their AI presence" value prop, but with a format AI actually reads.

## Execution Priority

### Phase 1: Immediate (this week)
1. ✅ Update scoring weights — remove llms.txt, add content format
2. ✅ Update fix recommendations
3. ✅ Rewrite the llms.txt blog post as the "myth debunked" post
4. ✅ Update all other blog posts to remove llms.txt references
5. ✅ Update `/how-we-score` page

### Phase 2: This sprint
6. Build content format scoring (FAQ detection, semantic HTML, Q&A format)
7. Pivot `/tools/llms-txt` to `/tools/employer-schema` (JSON-LD generator)
8. Update company pages and fix pages
9. Re-run benchmark with new scoring

### Phase 3: Next sprint
10. Add multi-platform presence checking
11. Add brand search volume estimation
12. Build "AI Citation Factors" educational page
13. Publish "What Actually Gets You Cited by AI" blog post based on research

---

## The Opportunity

This recalibration is actually a competitive advantage. Competitors (including PerceptionX, Otterly, Profound) are all still recommending llms.txt. We now have evidence they don't. By pivoting to evidence-based recommendations, Rankwell becomes the **only** tool in the market that aligns its advice with peer-reviewed research.

The blog post "The llms.txt myth" alone could be a viral piece — it's contrarian, evidence-backed, and challenges the entire industry's current advice.
