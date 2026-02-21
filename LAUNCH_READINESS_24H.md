# OpenRole — 24-Hour Launch Readiness Plan
*Created: 2026-02-20 00:30*

---

## Current State Assessment

### ✅ What's Built
- Full Next.js app with audit engine (company search → website analysis → scoring)
- Citation chain engine (Google SERP + LLM query + source mapping)
- Smart Pixel (JavaScript snippet for JSON-LD injection on careers pages)
- Employer Schema Generator tool (free lead-gen tool)
- Blog with 7+ posts (being updated to remove llms.txt references)
- Company pages (/company/[slug]) with audit results
- Fix pages (/fix/[slug]) with recommendations
- Compare page, Index page, FAQ, How We Score
- Dashboard with analytics, pixel management, compliance
- Supabase backend with audit data
- Vercel deployment pipeline
- Evidence-based scoring model (llms.txt removed, structured data weighted up)

### ⏳ In Progress Tonight
- PhD-level AI SEO research (sub-agent 1)
- Pixel security hardening & testing (sub-agent 2)
- 2.5M contacts database + GTM strategy (sub-agent 3)
- SEO infrastructure + blog content (sub-agent 4)

### 🔴 Blockers for Tomorrow
- **OpenRouter API key** — needed for live AI model queries in the audit
- **Resend API key** — needed for email outreach and Monday email digest
- **Domain verification** — is openrole.co.uk live? DNS configured?
- **Vercel deployment** — need to verify production build works

---

## Launch Strategy: The 5 Doors

### Door 1: Product Hunt Launch
**Timeline:** Day 1-2 after API keys connected
**Requirements:**
- Working audit tool (needs OpenRouter)
- Beautiful landing page ✅
- Blog content ✅ (tonight)
- Social proof (pre-run audits on notable companies)
- Maker comment prepared
- Hunter lined up (or self-launch)

**Actions:**
- [ ] Pre-audit 50 UK companies to populate the index
- [ ] Create screenshot/video of audit running
- [ ] Write PH tagline, description, maker comment
- [ ] Prepare first-day responses

### Door 2: Content-Led Organic
**Timeline:** Continuous from Day 1
**Requirements:**
- Blog posts published ✅ (tonight)
- SEO infrastructure ✅ (tonight)
- Social distribution channels

**Actions:**
- [ ] Publish "The llms.txt Myth" contrarian post (highest viral potential)
- [ ] Distribute on HN, Reddit r/SEO, r/ArtificialIntelligence, r/humanresources
- [ ] LinkedIn articles from Troy's profile
- [ ] Twitter threads from research data

### Door 3: Direct Outreach (2.5M Contacts)
**Timeline:** Week 1-2 (after Resend + warming)
**Requirements:**
- Resend API (coming tomorrow)
- Contact database in Supabase (building tonight)
- Email sequences designed
- Domain warming strategy
- GDPR compliance framework

**Sequence:**
1. **Week 1:** Warm domain (50 emails/day → 100 → 200 → 500)
2. **Week 2:** Tier 1 segment (UK, VP/Director level) — 5,000 contacts
3. **Week 3:** Tier 2 (UK + US, Head of/Senior) — 20,000 contacts
4. **Week 4:** Scale to 50,000/week with optimization

### Door 4: Community Infiltration
**Timeline:** Already started
**Requirements:**
- Facebook groups ✅ (16 groups, building presence)
- Reddit accounts
- LinkedIn presence

**Actions:**
- [ ] Continue Facebook group commenting (value-first)
- [ ] Reddit posts in r/SEO, r/Recruiting, r/HumanResources
- [ ] LinkedIn thought leadership posts
- [ ] Answer Quora questions about employer branding + AI

### Door 5: Partnerships
**Timeline:** Week 2-4
**Targets:**
- HR tech platforms (integrate audit into their tools)
- Recruitment agencies (white-label audit for clients)
- Employer brand consultancies (referral partnerships)
- Job boards (Indeed, Glassdoor — they have the problem data)

---

## Revenue Acceleration Tactics

### Freemium → Paid Conversion
1. **Free audit** with limited results (score + top 3 issues)
2. **Email gate** for full results (captures leads automatically)
3. **Upsell to monitoring** ($49/month — weekly email digest)
4. **Enterprise upsell** ($899/month — Smart Pixel + full dashboard)

### Quick Revenue Experiments
- **Pre-audited company reports** — Sell detailed reports to companies who've never used the tool (cold outreach: "We audited your AI presence. Here's what we found.")
- **API access** — Sell audit-as-a-service to HR tech platforms
- **White-label** — Let recruitment agencies run audits under their brand
- **Data products** — Aggregate audit data into industry benchmarks (quarterly report)

---

## What Moves the Needle Most (Prioritised)

### 🔴 Critical Path (Today)
1. Get OpenRouter API key working → enables live audits
2. Get Resend API key → enables email outreach
3. Deploy latest code to production → live at openrole.co.uk
4. Pre-audit 50 UK companies → populate index + create social proof

### 🟡 High Impact (This Week)
5. Send first email batch to Tier 1 contacts (UK VP/Directors)
6. Publish "llms.txt Myth" blog post → HN/Reddit distribution
7. Product Hunt submission
8. Create 60-second demo video
9. LinkedIn outreach to 100 HR leaders

### 🟢 Medium Impact (Next 2 Weeks)
10. Build weekly monitoring emails
11. Partner with 3 employer brand consultancies
12. Webinar: "What AI Says About Your Company"
13. Case studies from early adopters
14. Competitor comparison pages for SEO

---

## Competitive Positioning (Why Now)

**The window is NOW because:**
1. llms.txt hype is at peak — we're the ONLY ones calling it out with evidence
2. AI citation research is brand new — we're first to productize it
3. Competitors (Otterly, PerceptionX) are general-purpose — we're employer-brand-specific
4. 2.5M HR contacts gives us distribution nobody else has
5. Enterprise buyers are starting to budget for "AI reputation" (new budget line item)

**Our edge:**
- Evidence-based (peer-reviewed research backing our methodology)
- Employer-brand specific (not generic AI SEO)
- Full-stack solution (audit + monitor + fix vs. competitors who only do monitor)
- Smart Pixel is unique — nobody else has a real-time structured data injection tool
- 2.5M direct contacts to decision makers

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| OpenRouter rate limits | Implement caching, queue system, stagger audits |
| Email deliverability | Warm domain slowly, use verified sender, A/B test copy |
| GDPR complaints from cold email | Clear opt-out, legitimate interest basis, UK-first focus |
| Competitor copies our approach | Speed advantage — ship weekly, stay 3 months ahead |
| Audit tool gives wrong results | Add confidence intervals, caveat language, manual review option |
| Enterprise sales cycle too long | Focus on self-serve first, enterprise as expansion |

---

## The Vision (6-Month Arc)

**Month 1:** Launch audit tool. 10,000 free audits. 500 email captures. First paying customers.
**Month 2:** Weekly monitoring live. 100 paying customers. First enterprise pilot.
**Month 3:** Smart Pixel deployed on 50 customer sites. Content playbooks generating pipeline.
**Month 4:** API partnerships with 3 HR tech platforms. White-label program launched.
**Month 5:** 500 paying customers. £30K MRR. Seed round conversations.
**Month 6:** Industry benchmark report published. Conference keynote. 1,000 customers.

---

*This document is the north star for the next 24-48 hours. Every action should trace back to one of these priorities.*
