# BrandOS: The SSL Certificate of Employer Branding

## The Problem: AI Doesn't Know the Truth

In 2026, candidates don't browse career sites—they ask AI agents (ChatGPT, Gemini, Perplexity) for job recommendations. But these AI models **hallucinate**. They cite outdated Glassdoor reviews, guess at salaries, and spread misinformation about company culture.

**The result:** Companies lose top talent to competitors because the AI is telling the wrong story.

## The Solution: Data Sovereignty via Smart Pixel

BrandOS provides **infrastructure, not marketing**. Our "Smart Pixel" technology injects verified employer data (JSON-LD schema) directly into company websites, ensuring AI agents receive accurate, structured information.

Think of it like SSL certificates for websites—invisible, essential, and impossible to remove without breaking something important.

---

## The BrandOS Trinity

### 1. BrandCore (The "Fix")
**The Smart Pixel** - A single line of JavaScript deployed via Google Tag Manager that dynamically injects `JSON-LD` schema and `EmployerAggregateRating` data into any page.

- Zero-IT deployment (HR/Marketing can install it)
- If they churn, we kill the API key—the schema vanishes, hallucinations return

### 2. BrandShield (The "Moat")
**Hallucination Radar** - Weekly automated monitoring of AI models (OpenAI, Anthropic, Google) to detect factual errors about the employer.

- **Compliance Guard:** Checks job listings against Pay Transparency Laws (EU, NY/CA/CO)
- Acts as "Reputation Insurance"

### 3. BrandPulse (The "Scale")
**Verified Benchmarking** - Aggregated, anonymized salary and benefit data from our verified clients.

- The only *real* salary benchmark (unlike Glassdoor's user-guessed data)
- Network effect: Gets more valuable as more companies join

---

## Target Market: "3-Star Purgatory"

We target the **Misunderstood Mid-Market**:
- **Company Size:** 50–1,000 employees
- **Glassdoor Rating:** Between 2.5 and 3.8
- **Pain:** They're trying to hire but are being hurt by outdated/inaccurate AI data
- **Budget:** Big enough to pay, small enough to lack a massive tech team

---

## Pricing

| Tier | Price | Target | Includes |
|------|-------|--------|----------|
| **Verify** | $299/mo | SMB / Franchise | Hosted Truth Page, Basic Schema, "Verified" Badge |
| **Control** | $899/mo | Mid-Market | Smart Pixel, BrandShield, Compliance Checks |
| **Command** | $2,000/mo | Enterprise | Multi-location, BrandPulse Benchmarking, API Access |

---

## Tech Stack

- **Frontend:** Next.js (App Router) + Shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL with RLS) + Edge Functions
- **Smart Pixel:** JavaScript SDK hosted on Cloudflare CDN
- **AI:** Claude API (analysis), Perplexity API (hallucination detection)
- **Scripts:** Python (BrandOS Auditor for lead generation)

---

## Project Structure

```
employer-brand-os/
├── frontend/           # Next.js dashboard for clients
├── backend/            # Backend services (serverless)
├── scripts/            # Python audit scripts (lead generation)
│   ├── audit_brand.py
│   └── companies.csv   # 460k Glassdoor contacts
├── database-schema.sql # Supabase schema
├── BUSINESS_PLAN.md    # 2026 Strategic Plan
├── CLAUDE.md           # AI Developer Rules
├── tech-stack.md       # Architecture Decisions
├── design-system.md    # Visual Identity
└── do_do_not.md        # Development Guardrails
```

---

## Quick Links

- [Business Plan](./BUSINESS_PLAN.md) - 2026 Strategic Roadmap
- [Tech Stack](./tech-stack.md) - Architecture Decisions
- [Design System](./design-system.md) - Visual Identity Guidelines
- [Guardrails](./do_do_not.md) - Do's and Don'ts

---

## The Moat

1. **Data Sovereignty:** We're infrastructure, not an aggregator. The client owns their data; we just deliver it.
2. **High Switching Costs:** Removing the Smart Pixel breaks their "AI SEO."
3. **Regulatory Tailwinds:** Pay Transparency laws force companies to structure their data. We automate compliance.
