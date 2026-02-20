---
company: Deliveroo
industry: Food Delivery / Technology
employees: 4000+
headquarters: UK (London)
website: https://www.deliveroo.co.uk
careers_url: https://careers.deliveroo.co.uk
audit_date: 2026-02-20
---

# Deliveroo: AI Employer Visibility Audit

## Executive Summary
Deliveroo positions itself as a technology-first company solving complex marketplace problems. Careers content emphasizes innovation and impact but lacks technical AI discovery infrastructure.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers

- **Location:** https://deliveroo.co.uk/robots.txt
- **AI Bot Blocking:** None detected
- **Notable:** Explicitly allows Twitterbot
- **Crawl-delay:** 1 second (respectful to crawlers)

**Analysis:** Focused on blocking user account pages, API endpoints, and GraphQL queries. No AI bot restrictions. The NoIndex directives for login and media partner parameters suggest SEO sophistication.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- No llms.txt file found

### 3. Careers Page Structure
**URL:** https://careers.deliveroo.co.uk

**Content Quality:** ✅ Strong tech/innovation positioning

**Key Messaging:**
- **Mission:** "Transform the way you shop and eat, bringing the neighbourhood to your door"
- **Three-sided marketplace:** Consumers, restaurants/shops, riders (unique complexity)
- **Scale:** Operating since 2013, millions of interactions coordinated in real-time
- **Tech Focus:** "Complex scale and machine learning problems"
- **Innovation:** Deliveroo Shopping, Deliveroo HOP (groceries in minutes)

**Employee Testimonials:**
- Annie Baldwin (Data Scientist): Women in Tech community, BelEve programme
- Olga Afanasieva (Staff Product Manager): Customer impact focus
- Vasilis Vryniotis (Senior Staff MLE): End-to-end ML ownership, product influence
- Ana Abenza (Senior Head of Transformation): 6-year journey, operational excellence

**Cultural Elements:**
- Team of 4,000+ individuals
- "Culture of welcome" emphasized
- Diversity programmes highlighted (Women in Tech, BelEve)
- Employee ownership of product lifecycle

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Not verified

Could not verify JSON-LD implementation from text extraction.

### 5. Salary Transparency
**Status:** ❌ Not visible

No salary information on careers overview page. Employee testimonials don't mention compensation.

## Recommendations

### High Priority
1. **Implement llms.txt** - Guide AI to the strong tech differentiation story (ML, three-sided marketplace, real-time coordination)
2. **Add JobPosting Schema** - Ensure engineering roles are discoverable with proper structured data
3. **Quantify Technical Scale** - Make "millions of interactions" and other metrics machine-readable

### Medium Priority
4. **Highlight Tech Stack** - AI searches for "companies using [technology]" could drive engineering talent
5. **Structure Diversity Data** - Women in Tech and BelEve programmes should be discoverable
6. **Salary Ranges** - Especially for technical roles where compensation is a key decision factor

### Low Priority
7. **Track AI-Driven Applications** - Monitor which roles get discovered via AI-powered search

## AI Visibility Score: 5/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 2/2 | Allows all AI bots, polite crawl-delay |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Not verified |
| Salary Transparency | 0/2 | No salary data |
| Content Quality | 3/2 | Strong tech positioning |

## Competitive Position
Deliveroo competes for ML/data science talent with companies like Uber, DoorDash, and traditional tech giants. The "three-sided marketplace" complexity is a strong differentiator for engineers who want challenging problems. However, AI systems may not surface this when engineers search for "complex ML problems" or "marketplace engineering."

## Unique Differentiators for AI Discovery

These phrases should be structured for AI:
- "Three-sided marketplace" (unique vs two-sided)
- "Real-time coordination at scale"
- "End-to-end ML model ownership"
- "Material influence on product roadmap"
- "Groceries in minutes" (HOP product)

## Employee Testimonial Insight

Vasilis Vryniotis (Senior Staff MLE) quote is gold for AI:
> "Engineers have end-to-end ownership of the life-cycle of the Machine Learning models, work closely with the product teams, have a material influence on the roadmap"

This addresses common ML engineer pain points (ownership, product influence, scope) but isn't structured for AI to extract and reference.

## Strategic Opportunity
When an AI is asked "Which companies give ML engineers product influence?", Deliveroo should be in the answer. Currently, it likely isn't.
