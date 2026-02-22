# OpenRole — Comprehensive Thesis & Strategy

**Last updated:** 22 February 2026
**Status:** Revised thesis — awaiting employer validation
**URL:** openrole.co.uk

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What We Tested](#2-what-we-tested)
3. [What We Found](#3-what-we-found)
4. [The Competitive Landscape](#4-the-competitive-landscape)
5. [The Revised Thesis](#5-the-revised-thesis)
6. [The Offering](#6-the-offering)
7. [The Pitch](#7-the-pitch)
8. [Pricing](#8-pricing)
9. [Bull Case](#9-bull-case)
10. [Bear Case](#10-bear-case)
11. [Validation Plan](#11-validation-plan)
12. [Sources & Evidence](#12-sources--evidence)

---

## 1. Executive Summary

OpenRole helps employers understand and control what AI tells candidates about them.

The original thesis — "Glassdoor blocks AI crawlers, creating a data vacuum OpenRole fills" — was invalidated through live testing on 22 Feb 2026. AI search tools (ChatGPT, Perplexity, Claude) access Glassdoor and Indeed freely through browser-based search, not training crawlers. The robots.txt argument is irrelevant to search-mode AI.

**The revised thesis is built on a different, validated insight:**

AI can answer broad opinion questions using Glassdoor ("what's it like working there?"). But AI **cannot** answer specific factual questions — salary bands, benefits details, tech stack, interview process, remote policy — unless the employer has published that content. Most haven't. That's the gap.

OpenRole audits what AI says, identifies the information gaps, and gives employers a content playbook to fill them — on their own domains, where the authority lives.

---

## 2. What We Tested

### Live Testing (22 February 2026)

We ran identical employer queries across Google, ChatGPT (GPT-5.2), and Perplexity for three company sizes:

| Company | Size | Google #1 | ChatGPT sources | Perplexity sources |
|---|---|---|---|---|
| Deloitte | Enterprise | Glassdoor (featured snippet) | Indeed, Glassdoor, AmbitionBox, Reddit, Trustpilot, Deloitte.com | Indeed, Glassdoor, Reddit, Great Place to Work, Deloitte.com |
| Bloom & Wild | Mid-size (~300) | Glassdoor (featured snippet) | The Work Index, Glassdoor, Indeed, Welcome to the Jungle | Not tested |
| Butternut Box | Startup (~200) | Glassdoor (featured snippet) | Not tested (rate limited) | Not tested |

**Key findings:**
- Glassdoor owns the featured snippet on Google for every company size tested
- ChatGPT browses the web like a user (not a training crawler) — robots.txt blocks are irrelevant
- ChatGPT citations include `utm_source=chatgpt.com` links to Glassdoor and Indeed
- AI search is functionally Google with a summary layer — same sources dominate both
- Even a small startup (Butternut Box, 170 Glassdoor reviews) has full Glassdoor coverage

### Gemini Stress Test (OpenRole-specific)

Troy stress-tested OpenRole's own assumptions via Gemini with Google Search grounding:

**Stress Test 1 — llms.txt Fallacy:**
- Readability is not the bottleneck. Authority is.
- LLMs use RAG (Retrieval-Augmented Generation) — they query Google/Bing Search APIs first
- If your URL isn't in the top 5 search results, your llms.txt never gets seen
- Verdict: llms.txt is a future-proofing measure, not a current solution

**Stress Test 2 — "Deep Research" Timeline:**
- llms.txt was designed for API documentation, not employer data
- No HR/recruiting AI agents actively seek llms.txt files for benefits information
- Selling a solution for a standard that hasn't been adopted = vitamin, not painkiller

**Stress Test 3 — Aggregator Pivot:**
- Pivoting to Glassdoor optimisation requires a completely different tech stack
- Those sites actively block scrapers
- Throws away existing product work

---

## 3. What We Found

### The Core Insight

**Broad queries → Glassdoor wins.** "What's it like working at X?" will always be dominated by aggregators. They have 20+ years of domain authority, millions of reviews, and billions of backlinks. This is not a fight worth picking.

**Specific queries → Gap exists.** When candidates ask factual, detailed questions:
- "What's the salary for a senior engineer at X?"
- "Does X offer remote work?"
- "What benefits does X provide?"
- "What tech stack does X use?"
- "How do I prepare for an interview at X?"

Glassdoor often has thin or outdated answers. Indeed has generic listings. Reddit may have anecdotes. If the employer hasn't published this content anywhere, AI either guesses, hallucinates, or admits it doesn't know.

**This is the information gap.** The employer has the answers. AI can't find them. OpenRole bridges that gap.

### Evidence for the Gap

**Profound case studies prove content changes work:**
- 1840&Co: Published ONE targeted blog post → went from 0% to 11% AI visibility in 2 weeks
- Ramp: Rewrote website copy → AI visibility jumped from 3.2% to 22.2%
- Statsig: Published AI-friendly comparison content → visibility from 24.2% to 46.5% in one month
- OpusClip: Optimised content → 20% more AI traffic, 37% more signups, 40% more subscriptions

**Interview prep testing (live, 22 Feb 2026):**
- Perplexity returned a detailed 7-section interview prep guide for Monzo — heavily citing Monzo's own careers page and blog posts
- For Deliveroo, the company's careers page (careers.deliveroo.co.uk) was the dominant citation source
- Companies with good content control the AI narrative. Companies without don't.

**ATS career pages are genuinely terrible:**
- Lever hosted pages (jobs.lever.co/x) return almost zero content — just job titles
- Workable hosted pages (apply.workable.com/x) are nearly empty
- These pages give AI nothing to cite. Glassdoor fills the void by default.

### Candidate Behaviour Data

| Stat | Source |
|---|---|
| 38% of job seekers under 30 used AI to research employers (2025) | PDF research / industry data |
| 70% of UK adults use generative AI for everyday research | EY survey, cited in Wiser blog |
| Reddit drives 40%+ of AI citations across major models | Wiser employer branding blog |
| Claude gives ~65% weight to high-authority directory data | Industry analysis |
| Candidates trust AI more than recruiters for employer info | Wiser blog |

### How AI Search Actually Works (Technical Reality)

1. User asks a question ("What's it like working at X?")
2. AI triggers a web search via Bing/Google Search API
3. Top 5-10 results are retrieved (ranked by domain authority, relevance, freshness)
4. AI reads and synthesises those pages into a summary
5. Sources are cited with links

**Implications:**
- Domain authority still determines what AI sees (same as SEO)
- If your content isn't ranking on Google, AI won't find it
- On-site optimisations (llms.txt, JSON-LD) don't override domain authority
- But for specific queries where no aggregator has the answer, ANY source with a direct answer can surface
- Content freshness (dates) and specificity (direct Q&A format) increase chances of citation

---

## 4. The Competitive Landscape

### Direct Competitors (AI + Employer Brand)

| Company | What They Do | Market | Pricing | Key Strength | Key Weakness |
|---|---|---|---|---|---|
| **Built In** | AI Employer Intelligence Platform. Free reputation report, optimised profiles, content distribution. | US-only, tech companies only | ~$20-60K/year (enterprise) | 15 years of content = massive domain authority. AI already cites Built In. 443M monthly AI search audience. | US-only. Tech-only. Enterprise pricing. No weekly monitoring. |
| **Visiblie** | AI visibility platform for employer brands. Free audit tool. Employer branding solution. | Global (early stage) | Unknown (likely SaaS) | Directly targets employer brand use case. Has audit hook. | Early, limited evidence of traction. |
| **PerceptionX** | AI Employer Perception Score and Visibility Index. Benchmarking tool. | Global (early stage) | Unknown | Benchmarking/ranking angle. | Primarily an index, not a full solution. |

### Adjacent Competitors (AI Visibility, General Brand)

| Company | What They Do | Market | Pricing | Relevance to OpenRole |
|---|---|---|---|---|
| **Profound** | General brand AI visibility. AEO platform. Content workflows. | Enterprise brands (CMOs) | Custom enterprise ($2-10K+/mo est.) | Validates the mechanism. NOT a competitor — different buyer (CMO), different use case (product marketing), different price. Raised $35M (Sequoia, Kleiner Perkins). |
| **SE Visible** | AI visibility tracking (part of SE Ranking) | Marketing agencies | From $79/mo | SEO/AEO hybrid. Not employer-specific. |
| **AIclicks** | AI visibility + content generation | SMBs/agencies | From $99/mo | Generic, not employer-focused. |
| **Otterly** | AI brand monitoring | Brands | Unknown | SWOT-based audits. Not employer-specific. |

### Incumbent Tools (What Employers Already Pay For)

| Tool | What It Does | Typical Spend | Overlap with OpenRole |
|---|---|---|---|
| **Glassdoor Enhanced Profile** | Review responses, featured content, analytics | £5-15K/year | Manages opinions. Doesn't address AI answers or factual gaps. |
| **LinkedIn Talent Solutions** | Recruiter seats, job posts, employer branding | £8-15K/seat/year | Distribution. Doesn't address AI search. |
| **Indeed Sponsored Jobs** | Job distribution | £3-20K/year | Job ads, not employer narrative. |
| **Employer brand agencies** | EVP, careers page, content creation | £15-50K/project | High-touch, expensive. No AI monitoring. OpenRole could be the affordable alternative or a complement. |

### OpenRole's Position

**The gap:** Nobody is doing AI employer reputation monitoring + actionable content playbook for UK mid-market employers across all sectors.

- Built In = US tech enterprise
- Profound = General brand marketing, enterprise
- Glassdoor = Reviews, not AI-specific
- Agencies = Expensive, project-based, no monitoring

**OpenRole = UK-focused, mid-market (100-2000 employees), all sectors, affordable SaaS, monitoring + playbook.**

---

## 5. The Revised Thesis

### The Old Thesis (Invalidated)

> "Glassdoor and Indeed block AI crawlers via robots.txt, creating a data vacuum. OpenRole provides verified employer data that AI can access, filling the gap."

**Why it failed:** AI search uses browser-based access (like a user), not training crawlers. robots.txt blocks don't apply. Glassdoor data is fully visible to ChatGPT, Perplexity, etc.

### The New Thesis

> "AI answers broad employer questions using Glassdoor and Indeed. But for specific factual questions — salary, benefits, tech stack, interview process, policies — aggregators have thin or outdated data. Employers hold the answers but haven't published them where AI can find them. OpenRole identifies these information gaps and gives employers a content playbook to fill them on their own domains."

### Why This Thesis Holds Up

1. **Testable and verified:** Profound case studies prove targeted content changes AI answers within weeks
2. **Not fighting Glassdoor:** We don't compete on opinions. We fill the gaps opinions can't cover
3. **Employer controls the outcome:** The content lives on their domain, where they have authority
4. **AI mechanics support it:** For specific queries with no good aggregator answer, ANY relevant source can surface
5. **Market timing:** 38% of under-30 candidates already use AI for employer research and growing
6. **ROI is concrete:** One lost hire from bad AI info costs £5-30K. OpenRole costs £1,788/year.

---

## 6. The Offering

### Step 1: Free AI Audit (Lead Generation)

Enter your company name. We query ChatGPT, Perplexity, Claude and Gemini with the questions your candidates actually ask:

- "What's it like working at [Company]?"
- "What's the salary for [role] at [Company]?"
- "Does [Company] offer remote work?"
- "How do I prepare for an interview at [Company]?"
- "What benefits does [Company] offer?"

You see the actual AI answers, word for word, with sources cited.

**Purpose:** Shock value. Most employers have never seen this. It makes the problem concrete and personal.

### Step 2: Information Gap Report

The differentiator. Not just "what AI says" but "what AI CAN'T say because the information doesn't exist."

For each candidate question, the report shows:
- What AI currently answers
- Which source it cites
- What's missing or wrong
- What content the employer needs to publish to fill the gap

This is the sale. Employers see the specific gaps costing them candidates and the specific fix for each one.

### Step 3: Content Playbook

For each information gap:
- **What to publish** — the specific content that answers the question
- **Where to publish it** — on the employer's own domain (careers page, blog, FAQ)
- **How to format it** — AI-friendly structure (headings, direct answers, dates, Q&A format)
- **Template/draft** — ready-to-edit content

Key principle: **Content lives on the employer's domain.** Not on openrole.co.uk. The employer's site has the authority. OpenRole tells them what to put there.

### Step 4: Weekly Monitoring

Every Monday:
- AI Reputation Score across monitored models
- Changes since last week
- Gaps filled (employer content now being cited)
- Gaps remaining
- Hallucination alerts (AI stating something factually wrong)
- Competitor comparison
- New questions candidates are asking

---

## 7. The Pitch

### The Headline

**"Candidates ask AI about you before they apply. We show you what it says — and help you take control."**

### The Problem Statement (for sales conversations)

"When a candidate asks ChatGPT about your company, the answer comes from Glassdoor reviews, Reddit threads, and Indeed listings. For broad opinions — 'is it a good place to work?' — those sources are fine. But for the specific questions that influence whether someone applies or accepts your offer — salary, benefits, remote policy, interview process, tech stack — Glassdoor has thin or outdated data. If you haven't published those answers somewhere AI can find them, candidates get the wrong impression. Or no impression at all."

### The Solution Statement

"OpenRole audits what AI says about you across every major model. But more importantly, we identify the information gaps — the specific questions AI can't answer about you because the content doesn't exist. Then we give you a playbook: exactly what to publish, where, and how to format it so AI cites your content instead of guessing."

### The Differentiator

"We're not trying to outrank Glassdoor on opinions. We're helping you own the facts. Salary, benefits, tech stack, interview process — these are things only you know, and Glassdoor can't provide. When candidates ask specific questions, your content should be the source. Right now, it probably isn't."

### The Demo Moment (Interview Prep)

In sales calls, demo this:

> "Let me show you what happens when a candidate asks AI to help them prepare for an interview at your company."

Run the query live. Show the AI answer. Point out:
- Which sources it cited (Glassdoor? Reddit? Company site?)
- What the candidate would walk in believing
- What's wrong or missing

This is visceral. Every HR leader cares about interview preparation.

### Objection Handling

**"Can you guarantee AI will change what it says?"**
> Nobody controls AI outputs. What we can show you: companies that publish targeted content see measurable shifts within 2-4 weeks. One company published a single blog post and went from 0% to 11% AI visibility. We give you the playbook and track whether it's working.

**"We already manage our Glassdoor."**
> Good — you should. But Glassdoor handles opinions. OpenRole handles facts. When a candidate asks "what's the salary?" or "what's the interview process?", Glassdoor can't answer that accurately. Your own content can. We're complementary, not competing.

**"Isn't this just content marketing?"**
> It's targeted content for a specific channel — AI search. The difference: we tell you exactly which questions AI can't answer about you, give you templates for each one, and track whether AI picks them up. It's data-driven, not guesswork.

**"We don't have time to create all this content."**
> Most gaps need 2-3 paragraphs. A benefits section takes 20 minutes. An interview process FAQ takes 30 minutes. We provide templates. On the Scale plan, we draft it for you.

**"This seems like a nice-to-have."**
> Run the free audit. If AI is getting your salary right, benefits right, culture right — you don't need us. If it's citing 3-year-old reviews and guessing your salary, every candidate gets a wrong first impression. That's a leaky pipeline, not a nice-to-have.

---

## 8. Pricing

| Plan | Price | For | Includes |
|---|---|---|---|
| **Free** | £0 | Anyone | Unlimited AI audits. See what AI says about any company. No signup. |
| **Starter** | £49/month | 1-50 employees | 3 AI models, monthly gap report, content templates (top 5 gaps), monthly snapshot |
| **Growth** | £149/month ⭐ | 51-500 employees | 4 AI models, weekly Monday report, full gap analysis + content playbook, hallucination alerts, up to 5 locations, 2 competitor benchmarks |
| **Scale** | £399/month | 500+ employees | 6 AI models, everything in Growth, unlimited locations + competitors, done-for-you content drafts, priority support + dedicated onboarding |
| **Enterprise** | Custom | 2,000+ / multi-brand | White-label, custom integrations, SLA-backed, dedicated account manager |
| **Agency** | From £99/mo per client | Recruitment agencies | Wholesale pricing, multi-client dashboard |

**ROI anchor:** One bad hire costs £30K+. One lost offer from bad AI information costs the same. Growth plan = £1,788/year. One saved hire pays for 17 years.

**Competitor pricing context:**
- Glassdoor Enhanced Profile: £5-15K/year
- LinkedIn Recruiter seat: £8-15K/year
- Built In: ~$20-60K/year
- Profound: Custom enterprise (est. $2-10K+/month)
- Employer brand agency: £15-50K per project

OpenRole at £149/month is significantly cheaper than every alternative.

---

## 9. Bull Case

### How OpenRole becomes a £10M+ business

1. **AI job research becomes mainstream** — 38% of under-30s already use AI. If it hits 70-80% by 2027, employer AI visibility moves from experimental to essential. LinkedIn's planned AI integration will expose millions of candidates to AI-generated employer info by default.

2. **The pain becomes acute** — companies start losing star candidates who cite AI misinformation. CHROs mandate "AI reputation management" budgets. "Remember when companies ignored Glassdoor? Don't make the same mistake with AI."

3. **Early results compound** — OpenRole's first customers see measurable shifts in AI answers. Case studies drive FOMO. Being the early category leader creates a data moat (prompt patterns, effective tactics per model, citation analysis).

4. **UK gap is wide open** — Built In is US/tech-only. Profound is enterprise marketing. No one serves UK mid-market employers. OpenRole owns this segment.

5. **Adjacent expansion** — AI reputation management applies beyond employer brand (consumer brand, investor relations). Could expand scope or attract acquisition interest from HR tech / marketing platforms.

6. **Numbers:** 5.5M UK businesses. ~250K with 50+ employees. If 2% adopt at £149/month average = £8.9M ARR. At 4% = £17.9M ARR.

---

## 10. Bear Case

### Why OpenRole might struggle

1. **Slow market adoption** — HR leaders don't feel the pain yet. "AI employer brand" stays in nice-to-have territory. Long sales cycle, lots of education required.

2. **Can't move the needle** — Even with perfect content, Glassdoor still dominates broad queries. If clients don't see visible change in AI answers, they churn. AI output is somewhat binary — either your content gets cited or it doesn't.

3. **Hard to prove ROI** — "Improved AI narrative" is squishy. CFOs want numbers. Connecting OpenRole to offer acceptance rates or applicant quality is indirect at best.

4. **Platform risk** — If Glassdoor, LinkedIn, or Google add native AI reputation features, they could solve the problem at the platform level, eliminating the need for a third party.

5. **Consulting trap** — The content playbook has a consulting flavor. If every client needs bespoke analysis, margins suffer and it doesn't scale. Need to productise the gap analysis and playbook generation.

6. **Moving target** — LLM behavior changes constantly. Strategies that work today may not work if OpenAI/Google tweak their search integration. OpenRole would be constantly chasing algorithm changes.

### Mitigations

- **For slow adoption:** Free audit as lead gen reduces friction. Shock value of seeing AI answers drives urgency.
- **For ROI:** Track proxy metrics (AI visibility score over time, citation sources shifting, content appearing in AI answers). Build case studies fast.
- **For platform risk:** Move fast. Establish brand and customer base before incumbents react.
- **For consulting trap:** Automate gap analysis. Template the playbook. Reserve done-for-you for Scale/Enterprise only.

---

## 11. Validation Plan

### What We Need to Learn

| Question | How to test |
|---|---|
| Do employers care what AI says about them? | Run free audits, observe reaction |
| Does the information gap report feel actionable? | Share report, get feedback |
| Would they pay £149/month? | Direct pricing validation in calls |
| Who's the buyer? | Track which role engages (TA Lead? HR Director? Employer Brand?) |
| What's their current spend on Glassdoor/LinkedIn? | Ask in calls (anchoring for pricing) |
| Have they lost candidates due to "research"? | Pain validation |
| Would they actually publish the content we suggest? | Implementation friction test |

### Method

1. **Identify 10 UK companies** — 100-500 employees, actively hiring, mix of sectors
2. **Run free audits** for each (automated through the product)
3. **Create gap reports** showing information gaps with specific content recommendations
4. **Send cold** to HR/TA contacts with the audit results attached
5. **Book 15-minute calls** to walk through findings
6. **Ask the validation questions** above
7. **Track:** Engagement, interest, willingness to pay, objections

### Target Company Criteria
- 100-500 employees (big enough for TA function, small enough to lack agency)
- Actively hiring (5+ live roles)
- UK-based or UK HQ
- Mix: 5 tech, 5 non-tech
- Bonus: Glassdoor score 2.5-3.5 (highest pain)

### Success Criteria
- 7/10 employers find the audit surprising/valuable
- 5/10 express interest in the gap report and playbook
- 3/10 would pay £149/month or indicate budget exists
- Clear signal on who the buyer is

### Timeline
- Week 1: Identify companies, run audits, create gap reports
- Week 2: Send outreach, book calls
- Week 3: Conduct calls, gather feedback
- Week 4: Synthesise findings, decide go/no-go

---

## 12. Sources & Evidence

### Live Testing (22 Feb 2026)
- Google search results for "what is it like working at Deloitte UK" — Glassdoor featured snippet
- Google search results for "what is it like working at Bloom & Wild UK" — Glassdoor featured snippet
- Google search results for "what is it like working at Butternut Box UK" — Glassdoor featured snippet
- ChatGPT (GPT-5.2) query "what is it like working at Deloitte UK" — cited Indeed, Glassdoor, AmbitionBox, Reddit, Trustpilot
- ChatGPT query "what is it like working at Bloom & Wild UK" — cited The Work Index, Glassdoor, Indeed, Welcome to the Jungle
- Perplexity query "what is it like working at Deloitte UK" — cited Indeed, Glassdoor, Reddit, Great Place to Work (10 sources)
- Perplexity query "help me prepare for interview at Monzo" — cited Monzo's own careers page and blog posts as primary sources
- Perplexity query "Deliveroo UK salary benefits culture" — cited careers.deliveroo.co.uk as dominant source

### Competitive Research
- [tryprofound.com](https://www.tryprofound.com/) — AI brand visibility platform. Sequoia-backed. $35M+ raised.
- [tryprofound.com/customers/ramp-case-study](https://www.tryprofound.com/customers/ramp-case-study) — 3.2% → 22.2% visibility
- [tryprofound.com/customers/1840-co](https://www.tryprofound.com/customers/1840-co-answer-engine-optimization-case-study) — 0% → 11% with one blog post
- [tryprofound.com/customers/statsig](https://www.tryprofound.com/customers/statsig) — 24.2% → 46.5% in one month
- [tryprofound.com/customers/opus-clip](https://www.tryprofound.com/customers/opus-clip) — 20% more AI traffic, 37% more signups
- [employers.builtin.com](https://employers.builtin.com/) — AI Employer Intelligence Platform (US-only, tech-only)
- [employers.builtin.com/reputationreport](https://employers.builtin.com/reputationreport/) — Free AI reputation score (same hook as OpenRole)
- [visiblie.com/solutions/employer-branding](https://www.visiblie.com/solutions/employer-branding) — AI visibility for employer brands
- [perceptionx.ai/visibility-index](https://www.perceptionx.ai/visibility-index) — AI Employer Perception Score
- [sequoiacap.com/article/partnering-with-profound](https://sequoiacap.com/article/partnering-with-profound-winning-on-the-ai-stage/) — Sequoia investment thesis
- [adweek.com — Profound $20M pitch deck](https://www.adweek.com/media/profounds-20m-pitch-deck-brands-show-up-ai-search/)

### Industry Data & Research
- [wearewiser.com/blog/the-impact-of-llms-on-your-employer-brand](https://wearewiser.com/blog/the-impact-of-llms-on-your-employer-brand) — Reddit drives 40%+ of AI citations; 70% UK adults use AI for research
- [firstpagesage.com/seo-blog/generative-engine-optimization-best-practices](https://firstpagesage.com/seo-blog/generative-engine-optimization-best-practices/) — GEO mirrors traditional search; authority still dominates
- [britopian.com/geo/vuori-ai-brand-sentiment](https://www.britopian.com/geo/vuori-ai-brand-sentiment/) — AI sentiment varies across models
- [cxr.works — Evolving Landscape of Employer Branding in AI](https://cxr.works/the-evolving-landscape-of-employer-branding-in-the-age-of-ai/) — Low adoption by HR teams
- [glassdoor.com/blog — ChatGPT workplace usage](https://www.glassdoor.com/blog/conversation-starter-chatgpt-usage-in-the-workplace-more-than-doubles-year-over-year/) — Majority of professionals using ChatGPT at work
- [llmstxt.org](https://llmstxt.org/) — llms.txt specification
- Troy's commissioned PDF research: "OpenRole in the AI Job Search Ecosystem: Viability Analysis (2026-2027)" — 14-page report with 51 citations

### Career Page Audits (22 Feb 2026)
- Lever hosted pages (jobs.lever.co/) — minimal content, just job titles
- Workable hosted pages (apply.workable.com/) — nearly empty
- Monzo careers page — rich content, heavily cited by AI
- Deliveroo careers page — dominant citation source in Perplexity
- Ocado careers page — good content, fully indexable
- Revolut careers page — blocked by Cloudflare
- BrewDog careers page — broken/error page

---

*This document consolidates all research, testing, and strategy work conducted on 22 February 2026. It replaces the previous BRANDOS_STRATEGY_2026.md thesis. The offering requires employer validation before further product development.*
