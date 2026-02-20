---
title: "AI Employer Brand Audit: What Your Score Really Means"
description: "A detailed breakdown of how Rankwell calculates your AI Visibility Score, what each factor measures, and what score you need to be competitive."
date: "2026-02-22"
author: "Rankwell Product Team"
category: "Education"
readTime: "10 min"
tags: ["AI score", "audit", "metrics", "benchmarking", "product"]
featured: false
---

# AI Employer Brand Audit: What Your Score Really Means

You ran the [free Rankwell audit](https://rankwell.io). You got a score. Maybe it was 34/100. Maybe it was 67. Maybe it was 12.

**What does that number actually mean?**

More importantly: **Is your score good enough? And if not, what do you fix first?**

This is a complete breakdown of how the AI Visibility Score works, what each factor measures, and how to interpret your results.

---

## What is the AI Visibility Score?

The **AI Visibility Score** is a composite metric (0-100) that measures how accurately and frequently AI models represent your employer brand.

It's not a vanity metric. It's a **predictive indicator** of how many candidates you're losing to AI misinformation.

**Formula:**
```
AI Visibility Score = Σ (Factor Weight × Factor Performance)
```

We measure **7 factors**, each weighted by impact on AI citation rates (based on analysis of 300,000+ domains and 680M AI citations).

---

## The 7 Factors (And Their Weights)

| Factor | Weight | What It Measures |
|--------|--------|------------------|
| 1. Structured Data (JSON-LD) | 25% | Do you have machine-readable facts on your site? |
| 2. Content Format & Structure | 20% | Is your content easy for AI to extract and quote? |
| 3. Bot Access | 15% | Can AI crawlers access your careers page? |
| 4. Brand Reputation Signals | 15% | Do you have cross-platform presence? |
| 5. Careers Page Quality | 15% | Is your careers page discoverable and informative? |
| 6. Salary Transparency | 10% | Do you publish salary data in a machine-readable format? |
| **Total** | **100%** | |

Let's break down each factor.

---

## Factor 1: Structured Data (25 Points)

**What we check:**
- Does your homepage have **Organization schema** (JSON-LD)?
- Does your careers page have **FAQPage schema**?
- Do your job listings have **JobPosting schema** with salary data?

**Scoring:**
- **Organization schema present:** +10 points
- **FAQPage schema present:** +8 points
- **JobPosting schema with salary data:** +7 points

**Why it matters:**  
Structured data is the **only format AI models reliably parse as authoritative**. Without it, AI guesses. With it, AI cites your facts.

**Evidence:**  
Companies with complete schema markup had **32% higher citation rates** and **40% better factual accuracy** in AI responses.

**How to improve:**
- Add [Organization schema](/blog/structured-data-guide#organization-schema) to your homepage
- Add [FAQPage schema](/blog/structured-data-guide#faqpage-schema) to your careers page
- Add [JobPosting schema](/blog/structured-data-guide#jobposting-schema) to job listings

**Typical score:**
- **0-5:** No structured data (91% of employers we audited)
- **6-15:** Partial implementation (homepage only)
- **16-25:** Full implementation (all three schemas)

---

## Factor 2: Content Format & Structure (20 Points)

**What we check:**
- Is your careers page in **FAQ format**?
- Do you have **comparison tables** (e.g., salary ranges, benefits)?
- Is content structured with **proper headings** (H1 → H2 → H3)?
- Are facts **easily extractable** (bulleted lists vs. prose)?

**Scoring:**
- **FAQ format:** +8 points
- **Tables or structured lists:** +6 points
- **Proper semantic HTML:** +4 points
- **Clear, extractable facts:** +2 points

**Why it matters:**  
AI models prefer content that's **easy to quote**. FAQ format is **3.2x more likely** to be cited than prose paragraphs.

**Evidence:**  
Content formatted as Q&A or lists had **20-25% higher citation rates** compared to marketing prose.

**How to improve:**
- Rewrite careers page with questions as H2 headings
- Add tables for salary ranges, benefits, locations
- Use bulleted lists instead of paragraphs where possible
- [See examples in the Complete Guide](/blog/ai-seo-complete-guide#content-format)

**Typical score:**
- **0-5:** All prose, no structure
- **6-12:** Some structure (headings, lists)
- **13-20:** Full FAQ format with tables

---

## Factor 3: Bot Access (15 Points)

**What we check:**
- Does your `robots.txt` **allow AI crawlers**?
- Is your careers page in your **sitemap.xml**?
- Can AI bots **render your careers page** (server-side rendering)?

**Scoring:**
- **AI crawlers allowed:** +8 points
- **Careers page in sitemap:** +4 points
- **Server-side rendering (no JS requirement):** +3 points

**Why it matters:**  
If AI can't crawl your site, it relies entirely on third-party sources (Reddit, Wikipedia, outdated articles). You lose control of the narrative.

**Evidence:**  
Domains accessible to AI crawlers had **2.3x higher citation rates** than those that blocked crawlers.

**How to improve:**
- Check `yourcompany.com/robots.txt` — remove blocks on GPTBot, ClaudeBot, Google-Extended
- Add careers page to sitemap.xml
- Ensure site renders without JavaScript (or use SSR)

**Typical score:**
- **0:** Blocking all AI crawlers (43% of companies)
- **8-12:** Allowing crawlers, missing sitemap
- **13-15:** Full access + sitemap + SSR

---

## Factor 4: Brand Reputation Signals (15 Points)

**What we check:**
- Do you have a **LinkedIn Company Page** (complete)?
- Do you have a **Glassdoor profile** (claimed)?
- Do you have an **Indeed Company Page**?
- Do you have a **Wikipedia page** (if applicable)?
- Is your company mentioned in **news/media** (last 12 months)?

**Scoring:**
- **LinkedIn (complete):** +5 points
- **Glassdoor (claimed):** +4 points
- **Indeed:** +3 points
- **Wikipedia or major news coverage:** +3 points

**Why it matters:**  
AI models **cross-reference**. If three sources say the same thing about you, AI trusts it. If only your website says it, AI treats it as unverified.

**Evidence:**  
Companies with 4+ verified profiles had **2.8x higher accurate citation rates** and **64% fewer hallucinations**.

**How to improve:**
- Complete your LinkedIn Company Page (full About section, logo, employee count)
- Claim your Glassdoor profile (even if you can't control reviews)
- Create an Indeed Company Page
- Build media presence (PR, guest posts, speaking)

**Typical score:**
- **0-4:** No profiles or incomplete
- **5-10:** 2-3 platforms, partially complete
- **11-15:** 4+ platforms, fully populated

---

## Factor 5: Careers Page Quality (15 Points)

**What we check:**
- Is your careers page **indexed by Google**?
- Does it have **unique, descriptive meta title and description**?
- Does it **load fast** (<3 seconds)?
- Is it **mobile-friendly**?

**Scoring:**
- **Indexed by Google:** +6 points
- **Unique metadata:** +4 points
- **Fast load time:** +3 points
- **Mobile-friendly:** +2 points

**Why it matters:**  
If Google can't find your careers page, AI can't either. This is foundational.

**Evidence:**  
Pages with proper SEO metadata were **1.8x more likely** to be retrieved by AI during RAG (Retrieval Augmented Generation).

**How to improve:**
- Check Google: `site:yourcompany.com/careers`
- Add unique title and meta description
- Optimize images, enable compression
- Test mobile rendering

**Typical score:**
- **0-5:** Not indexed or severely broken
- **6-10:** Indexed but poor metadata/performance
- **11-15:** Fully optimized

---

## Factor 6: Salary Transparency (10 Points)

**What we check:**
- Do you publish **salary ranges** on job listings?
- Are ranges in a **machine-readable format** (JSON-LD JobPosting schema)?
- Are ranges **realistic** (not "competitive" or "DOE")?

**Scoring:**
- **Salary ranges published:** +5 points
- **In JSON-LD JobPosting schema:** +3 points
- **Specific numbers (not vague):** +2 points

**Why it matters:**  
"What does [Company] pay?" is the **#1 candidate query** to AI. If you don't publish ranges, AI guesses — and [usually underestimates by £20K+](/blog/cost-of-ai-misinformation).

**Evidence:**  
Companies with published salary data in schema had **87% fewer salary hallucinations** in AI responses.

**How to improve:**
- Add salary ranges to job listings
- Implement JobPosting schema with `baseSalary` field
- Use real numbers (£75K-£95K), not "competitive compensation"

**Typical score:**
- **0:** No salary data published
- **5-7:** Ranges published but not in schema
- **8-10:** Full transparency with schema markup

---

## What Score Do You Need?

Based on our analysis of 500 UK employers, here's the distribution:

| Score Range | Rating | % of Companies | What It Means |
|-------------|--------|----------------|---------------|
| 0-20 | Critical | 34% | AI has almost no accurate information about you |
| 21-40 | Poor | 38% | AI gets basic facts (name, industry) but guesses everything else |
| 41-60 | Fair | 19% | AI has some accurate data but missing key facts (salary, culture) |
| 61-80 | Good | 7% | AI represents you mostly accurately; minor gaps |
| 81-100 | Excellent | 2% | AI has comprehensive, accurate information |

**Average score across all 500 companies:** **34/100**

**Translation:** Most employers are in the "Poor" range. If you're above 50, you're already ahead of 70%+ of companies.

---

## Competitive Benchmarks by Industry

| Industry | Median Score | Top Quartile |
|----------|--------------|--------------|
| Tech/SaaS | 42 | 68 |
| Financial Services | 38 | 61 |
| Healthcare | 31 | 55 |
| Retail | 28 | 52 |
| Manufacturing | 24 | 48 |

**Why tech scores higher:**  
Tech companies are more likely to have:
- Developer-friendly careers pages (already using schema.org)
- Salary transparency (norm in tech recruiting)
- Strong LinkedIn/GitHub presence

---

## What to Fix First (By Impact)

If you have limited time/budget, prioritize this way:

### Priority 1: Structured Data (25 Points Available)
**Time:** 4-8 hours  
**Cost:** £500-£2,000 (one-time dev work)  
**Impact:** Highest ROI — immediate improvement in factual accuracy

**Actions:**
1. Add Organization schema to homepage
2. Add FAQPage schema to careers page
3. Add JobPosting schema to top 3-5 roles

---

### Priority 2: Content Format (20 Points Available)
**Time:** 2-4 days  
**Cost:** £1,000-£3,000 (content rewrite)  
**Impact:** High — dramatically improves extractability

**Actions:**
1. Rewrite careers page in FAQ format
2. Add salary table
3. Add benefits table

---

### Priority 3: Bot Access (15 Points Available)
**Time:** 30 minutes  
**Cost:** £0  
**Impact:** Medium-High — enables retrieval

**Actions:**
1. Check robots.txt — remove AI crawler blocks
2. Add careers page to sitemap.xml
3. Verify server-side rendering

---

### Priority 4: Salary Transparency (10 Points Available)
**Time:** 1-2 hours  
**Cost:** £0 (policy decision)  
**Impact:** Medium — eliminates salary hallucinations

**Actions:**
1. Publish salary ranges on job listings
2. Add to JobPosting schema

---

### Priority 5: Multi-Platform Presence (15 Points Available)
**Time:** 2-3 days  
**Cost:** £0 (time only)  
**Impact:** Medium — builds cross-reference trust

**Actions:**
1. Complete LinkedIn Company Page
2. Claim Glassdoor profile
3. Create Indeed Company Page

---

## Score Improvement Timeline

Based on clients we've worked with, here's a realistic timeline:

**Month 1:**
- Implement structured data → **+20 points**
- Fix bot access → **+10 points**
- **New score:** +30 points from baseline

**Month 2:**
- Reformat careers page → **+15 points**
- Publish salary data → **+8 points**
- **New score:** +23 additional points

**Month 3:**
- Complete multi-platform profiles → **+12 points**
- Optimize careers page SEO → **+8 points**
- **New score:** +20 additional points

**Total improvement over 3 months:** **+73 points**

**Example:**
- **Starting score:** 28/100 (Poor)
- **After 3 months:** 101/100 → **capped at 100** (Excellent)

**Typical result:** 28 → 85 in 90 days.

---

## FAQ About the Score

**Q: Is 100/100 achievable?**  
A: Yes. 2% of companies in our database have scores of 81+. All have full structured data implementation, salary transparency, and strong multi-platform presence.

**Q: How often does my score change?**  
A: We recalculate weekly based on:
- Changes to your website (schema updates, content changes)
- Changes in AI crawler access
- New job listings
- External platform updates (LinkedIn, Glassdoor)

**Q: Can my score go down?**  
A: Yes, if:
- You remove structured data
- You block AI crawlers
- Your careers page goes down
- You remove salary data

**Q: How does this compare to Glassdoor ratings?**  
A: Completely different. Glassdoor measures human perception (employee reviews). AI Visibility Score measures machine perception (what AI models cite).

**Q: What if I score 80+ but AI still gets things wrong?**  
A: Run a detailed audit. Scores measure infrastructure (schema, access, structure). They don't catch all factual errors. That's why we offer weekly AI monitoring for paid plans.

**Q: Do competitors' scores matter?**  
A: Only for relative positioning. If you're in tech and your score is 45 but competitors are averaging 55, you're losing candidates to better AI visibility.

---

## Conclusion: Your Score is a Starting Point, Not a Destination

The AI Visibility Score tells you **where you are today**.

But what matters most is **what you do with that information**.

- **Score 0-20:** You're invisible to AI. Candidates asking about you get hallucinations. Fix bot access and add basic structured data **this week**.

- **Score 21-40:** AI knows you exist but guesses most facts. Add structured data and salary transparency **this month**.

- **Score 41-60:** AI has some accurate data. Fill the gaps with content formatting and multi-platform presence **this quarter**.

- **Score 61-80:** You're ahead of most competitors. Optimize for edge cases and maintain your lead.

- **Score 81-100:** You're in the top 2%. Focus on monitoring and continuous updates.

The gap between **what AI could say** (if you give it good data) and **what AI actually says** (based on guessing) is the opportunity.

---

**Want to check your score?**  
[Run a free Rankwell audit](https://rankwell.io) — takes 30 seconds, shows your score and the exact factors bringing it down.

Then use this guide to prioritize your fixes. Check back in 30 days and see the improvement.

---

**Sources:**
- Rankwell audit data: 500 UK employers (Feb 2026)
- Profound: 680M LLM citation analysis (2024-2025)
- Schema.org impact study: 300K domains (2025)
- Industry benchmarks: Internal Rankwell data (2024-2026)