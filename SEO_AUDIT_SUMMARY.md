# OpenRole SEO Audit — February 2026

**Audit Date:** 19 February 2026  
**Domain:** openrole.co.uk  
**Framework:** Next.js 15 (App Router)  
**Deployment:** Vercel

---

## Executive Summary

**Current State:** Basic SEO infrastructure in place, but significant gaps in metadata, structured data, and content optimization.

**Score:** 4/10

**Priority Fixes:**
1. Add OpenGraph and Twitter Card metadata to all pages
2. Implement JSON-LD structured data across the site
3. Create blog content directory and populate with SEO-optimized posts
4. Add canonical URLs site-wide
5. Enhance company page metadata for programmatic SEO
6. Build internal linking strategy

---

## 1. Technical SEO Audit

### ✅ Working
- Sitemap.xml implemented with dynamic company pages
- Robots.txt configured (allows all crawlers)
- Basic page metadata in root layout
- Clean URL structure
- Proper heading hierarchy in most components

### ❌ Missing
- **No OpenGraph metadata** — poor social sharing
- **No Twitter Card metadata** — missed Twitter visibility
- **No JSON-LD structured data** — AI can't reliably extract facts
- **No canonical URLs** — risk of duplicate content penalties
- **No breadcrumb structured data** — missed navigation context
- **No alt text audit** — accessibility and image SEO gaps

### ⚠️ Needs Improvement
- Homepage metadata is generic (needs unique description per section)
- Blog pages exist but no actual blog content files
- Company pages missing rich metadata
- No robots meta tags for controlling indexing
- Page load performance not optimized

---

## 2. Metadata Audit

### Homepage (/)
**Current:**
- Title: "OpenRole — Take Back Your Reputation from AI"
- Description: "AI is telling candidates the wrong things..."
- ❌ No OpenGraph
- ❌ No Twitter Cards
- ❌ No canonical URL
- ❌ No JSON-LD

**Recommendation:** Add Organization schema, Product schema, and rich social metadata.

### Blog Hub (/blog)
**Current:**
- Title: "Blog | OpenRole — AI Employer Visibility Insights"
- Description: Present
- ✅ Canonical URL set
- ❌ No OpenGraph
- ❌ No blog content files

**Recommendation:** Add WebSite schema, publish blog posts as markdown/MDX.

### Blog Posts (/blog/[slug])
**Current:**
- Hardcoded HTML content in page.tsx
- Basic metadata per post
- ✅ Titles and descriptions customized
- ❌ No Article schema
- ❌ No FAQ schema
- ❌ No author metadata
- ❌ No published/modified dates in schema

**Recommendation:** Migrate to markdown files, add Article schema with author, datePublished, FAQ schema for each post.

### Pricing (/pricing)
**Current:**
- ❌ No metadata export (client component)
- ❌ No Product schema
- ❌ No AggregateOffer schema

**Recommendation:** Extract to separate metadata file, add Offer schema for each plan.

### Company Pages (/company/[slug])
**Current:**
- ✅ Dynamic metadata generation
- ✅ OpenGraph title and description
- ❌ No Organization schema for the company being audited
- ❌ No breadcrumbs

**Recommendation:** Add Organization schema for the audited company, breadcrumb navigation.

### Tool Pages (/tools/*)
**Current:**
- Not audited yet
- Likely missing metadata

**Recommendation:** Add SoftwareApplication schema, proper metadata.

---

## 3. Content Audit

### Blog Posts
**Hardcoded in blog/[slug]/page.tsx:**
- "What AI tells candidates about your company"
- "Why your Glassdoor profile doesn't matter anymore"
- "The zero-click candidate"
- "llms.txt: the file every employer needs" (NEEDS REWRITE per OPENROLE_RECALIBRATION.md)
- "AI is hallucinating your salary data"
- "800 million people use ChatGPT every week"
- "GEO for employer branding" (PARTIALLY IMPLEMENTED)
- "AI Employer Brand Score"

**Missing from hardcoded set:**
- None currently in code

**Content Quality:**
- 2000-3000 words each ✅
- Proper H2/H3 hierarchy ✅
- FAQ sections ⚠️ (some have them)
- Internal links ⚠️ (some present, inconsistent)
- Sources cited ✅

**Issue:** Content is hardcoded HTML in TypeScript. Should be markdown/MDX files for:
- Better authoring workflow
- Version control
- Easier updates
- Frontmatter metadata
- Reusable across platforms

---

## 4. Structured Data Gaps

### Homepage
**Needed:**
- Organization schema (OpenRole company info)
- WebSite schema (search action)
- Product schema (OpenRole tool)

### Blog Posts
**Needed:**
- Article schema (per post)
- FAQ schema (where applicable)
- Breadcrumb schema

### Pricing
**Needed:**
- Product schema for each tier
- AggregateOffer for pricing options
- Organization schema

### Company Pages
**Needed:**
- Organization schema (the audited company)
- BreadcrumbList schema

### Tool Pages
**Needed:**
- SoftwareApplication schema
- HowTo schema (where applicable)

---

## 5. Internal Linking Audit

**Current State:** Ad hoc linking, no systematic strategy.

**Missing:**
- Content cluster architecture (pillar + spoke model)
- Consistent anchor text strategy
- Cross-linking between related posts
- Footer navigation to key pages

**Recommendation:** Create SEO_INTERNAL_LINKING.md with cluster map.

---

## 6. Programmatic SEO Opportunities

### Company Directory (/index)
- Already implemented ✅
- Needs enhanced metadata

### Compare Tool (/compare)
- Already implemented ✅
- Needs better SEO metadata for comparison queries

### Dynamic Company Pages (/company/[slug])
- ✅ Already in sitemap
- ⚠️ Needs richer structured data
- Could rank for "[Company Name] AI employer brand" queries

---

## 7. Priority Fixes (Ranked)

### P0 — Critical (Do First)
1. **Create blog content directory** — Move hardcoded posts to markdown
2. **Add JSON-LD to homepage** — Organization + Product schema
3. **Add JSON-LD to blog posts** — Article + FAQ schema
4. **Rewrite llms.txt blog post** — Per OPENROLE_RECALIBRATION.md (it's currently recommending something proven not to work)
5. **Add OpenGraph to all pages** — Social sharing essential

### P1 — High (This Week)
6. **Add canonical URLs site-wide**
7. **Enhance company page structured data**
8. **Create internal linking strategy doc**
9. **Add breadcrumb structured data**
10. **Write missing blog posts** (if any new ones needed)

### P2 — Medium (Next Sprint)
11. **Image alt text audit**
12. **Page speed optimization**
13. **Add Twitter Card metadata**
14. **Implement WebSite schema with search action**
15. **Add author pages for blog attribution**

---

## 8. Blog Content Gap Analysis

**Current Posts (in code):**
- 8 posts hardcoded

**Needed Posts (from brief):**
a. ✅ "The llms.txt Myth" — **REWRITE EXISTING**
b. ✅ "AI SEO for Employer Branding: Complete Guide" — PARTIAL (GEO post covers this)
c. ❌ "How AI Models Really Decide What to Say About Your Company" — **NEW**
d. ✅ "The Cost of AI Misinformation: Why Wrong Salary Data..." — COVERED (AI hallucinating post)
e. ❌ "Structured Data for Employer Brands: Technical Guide to JSON-LD" — **NEW**
f. ✅ "AI Employer Brand Audit: What Your Score Really Means" — COVERED

**New Posts Needed:**
1. "How AI Models Really Decide What to Say About Your Company" (technical deep-dive)
2. "Structured Data for Employer Brands: A Technical Guide to JSON-LD" (developer audience)

**Posts to Rewrite:**
1. "llms.txt: the file every employer needs" → "The llms.txt Myth: Why the File Every Employer Is Creating Doesn't Work"

---

## 9. SEO Score by Page

| Page | Current | Target | Gap |
|------|---------|--------|-----|
| Homepage | 5/10 | 9/10 | Missing OG, JSON-LD, canonical |
| Blog Hub | 6/10 | 9/10 | Missing OG, no content files |
| Blog Posts | 7/10 | 9/10 | Need Article schema, FAQ schema |
| Pricing | 3/10 | 9/10 | No metadata, no Product schema |
| Company Pages | 6/10 | 9/10 | Need Organization schema |
| Tools | ?/10 | 9/10 | Not yet audited |

**Overall Site:** 4/10 → Target: 9/10

---

## 10. Competitive Benchmark

**Competitors:**
- PerceptionX
- Profound
- Otterly.ai

**What they have that we don't:**
- Rich blog content (20+ posts each)
- Comprehensive structured data
- Content clusters (pillar pages + supporting posts)

**What we can do better:**
- Evidence-based recommendations (llms.txt myth post will differentiate us)
- Programmatic company pages (we already have this)
- Free audit tool for acquisition

---

## Next Steps

1. ✅ Create content/blog/ directory
2. ✅ Migrate existing blog posts to markdown with frontmatter
3. ✅ Rewrite llms.txt post as "The Myth" post
4. ✅ Write 2 new posts (AI decision-making, JSON-LD guide)
5. ✅ Add JSON-LD schemas to all pages
6. ✅ Add OpenGraph metadata
7. ✅ Create SEO_INTERNAL_LINKING.md
8. ✅ Commit all changes with clear messages

**Estimated Impact:** 4/10 → 8/10 SEO score within 2 weeks of implementation.
