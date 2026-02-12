# Rankwell: Executive Research Summary

> Compiled 12 Feb 2026 by Malcolm

---

## The Problem

**AI is giving candidates wrong information about employers, and nobody is monitoring it.**

When candidates ask ChatGPT "What's it like to work at [Company]?" they get synthesised answers from Glassdoor, Reddit, LinkedIn, and news articles. These answers are often **wrong** — hallucinated salary data, outdated reviews, conflated companies, fabricated benefits. Companies can't see this, can't correct it, and can't measure the talent they're losing because of it.

## The Opportunity

**Rankwell owns the whitespace between employer branding and AI search optimisation.**

| What Exists | What's Missing (Rankwell) |
|-------------|--------------------------|
| Glassdoor monitors *reviews* | Nobody monitors *AI outputs* |
| LinkedIn manages *profiles* | Nobody tracks *what AI synthesises* |
| Brand24 tracks *social mentions* | Nobody tracks *AI model responses* |
| GEO tools do *generic optimisation* | Nobody does *employer-specific GEO* |

### Market Size
- Employer branding market: $6-8B globally (12-15% CAGR)
- Recruitment marketing: ~$2.7B
- GEO market: Nascent but emerging from $80B SEO market
- **Rankwell's initial SOM:** 500 UK companies × £500/mo = **£3M ARR**

## Key Research Findings

### Pain Points (from real sources)
1. **AI hallucination is rampant** — 78%+ of salary estimates from AI are wrong (our audit data)
2. **Companies are invisible** — most employers have no AI optimisation strategy whatsoever
3. **Legal risks are real** — Air Canada paid damages for chatbot misinformation; courts globally are sanctioning AI-generated false information
4. **Candidates already use AI to research employers** — "Is [X] a good place to work?" is now a conversational AI query, not a Google search
5. **The problem is getting worse** — AI adoption is growing while accuracy isn't improving

### Competitive Landscape
- **No direct competitor** does what Rankwell does
- **Emerge Tech** and **MyMarky AI** do AI employer content creation (not monitoring)
- **The Martec** does employee advocacy (not AI output tracking)
- **Otterly.ai** and **Profound** do generic AI brand monitoring (not employer-specific)
- **Agencies** (AB&C, That Little Agency) are writing about the problem but building consulting, not products

### Quotes That Sell
> "The candidates you want to hire are already using AI to research employers. If your brand doesn't perform well in these new discovery channels, you're losing talent before they even visit your careers page." — Tucker Barker, LinkedIn

> "AI will amplify whatever story your organisation is already telling. Make sure it is the right one." — AB&C Creative

## What's Been Built

### Already Complete ✅
- **Landing page** — rankwell.io with value prop, social proof, audit CTA
- **Free audit tool** — enter domain, get AI visibility score across 6 models
- **AI Employer Index** — live leaderboard at /index ranking companies by score
- **Company profiles** — /company/[slug] with detailed breakdown per company
- **Blog** — /blog with 5+ research-backed articles ready to publish
- **Dashboard** — logged-in area for companies to monitor and manage
- **Scoring methodology** — /how-we-score explaining the methodology
- **Full build pipeline** — Next.js 16, Supabase, deploys clean

### What's Needed to Launch 🟡
- Vercel deployment (need CLI auth)
- GitHub push (need CLI auth)
- Brave Search API key (for ongoing research)
- OpenAI/Anthropic keys (for audit engine)
- Domain setup (rankwell.io)

## Strategic Recommendations

1. **Launch the free audit ASAP** — every audit builds the dataset moat
2. **Seed the Index with 50+ companies** — run bulk audits to populate the leaderboard
3. **Publish the blog content** — 5 SEO-optimised articles are ready
4. **Target UK tech HR directors first** — most likely to understand and feel the pain
5. **Partner with employer brand agencies** — they'll be channel-to-market
6. **Position as "Glassdoor for AI"** — simple, memorable, defensible

---

*Full research available in pain-points.md and competitive-landscape.md*
