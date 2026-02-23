# OpenRole: The Stripe for Employer Truth

## The Problem: Invisible and Illegal

In 2026, the "Apply" button is dying. 40% of job searches now happen via AI Agents (ChatGPT, Perplexity, Gemini) or Aggregators. These systems don't read "Career Sites"—they read **structured data**.

Most companies are **"Invisible and Illegal"**:
1. **Invisible:** Their ATS outputs messy HTML that AI agents cannot read (40% traffic drop)
2. **Illegal:** New Pay Transparency laws (EU, NY/CA/CO) require salary disclosures that legacy systems fail to automate

## The Solution: The Smart Pixel & Sanitization Engine

OpenRole is the **employment data infrastructure layer for the AI age**. Our Smart Pixel overlays a company's existing site, intercepts messy data, sanitizes it, and injects a verified "Truth Layer" (JSON-LD) that ensures jobs rank higher and meet legal standards automatically.

Think of it like Stripe for payments—one integration, instant compliance, AI-ready data.

---

## The 4-Layer Platform

### Layer 1: Infrastructure (The Smart Pixel & Sanitization)
*The "Fix It" Wedge.*

- **Smart Pixel:** Single line of JavaScript via Google Tag Manager
- **Sanitization Engine:** Translates ATS codes to public titles (`L4-Eng-NY` → `Senior Software Engineer`)
- **CSP Fallback:** Hosted Truth Mirror for strict security environments
- Zero-IT deployment (HR/Marketing can install it)

### Layer 2: Compliance (Automated Guardrails)
*The "Moat" & Retention.*

- **Automated Guardrails:** Auto-flags jobs missing salary data for Pay Transparency compliance
- **Hallucination Radar:** Weekly scans of AI models to detect invented data
- Acts as "Reputation Insurance"

### Layer 3: Intelligence (Proof of Life Dashboard)
*The Churn Killer.*

- **Monday Morning Report:** Automated stakeholder email showing data points served, posts auto-corrected, ranking improvements
- Makes invisible infrastructure visible to CFOs

### Layer 4: Network (Live Benchmarking)
*The Upsell.*

- **Verified Benchmarking:** Real salary data from verified clients (not Glassdoor guesses)
- Network effect: Gets more valuable as more companies join

---

## Target Market

**Primary:** High-Volume Franchises & Retail (The "Desperate Middle")—companies with visibility pain

**Secondary:** Mid-market companies (50–1,000 employees) in "3-Star Purgatory" (Glassdoor 2.5-3.8)

**Channel:** Recruitment Marketing Agencies managing 50+ locations (wholesale strategy)

---

## Pricing

| Tier | Price | Target | Value Proposition |
|------|-------|--------|-------------------|
| **Visibility** | $299/mo | SMB / Franchise | "Get Found." Smart Pixel + Basic Schema |
| **Compliance** | $899/mo | Mid-Market | "Stay Safe." + Auto-Compliance + Monday Report |
| **Agency** | $150/mo per location | Agency Partners | Wholesale rate, min 10 locations |

---

## Tech Stack

- **Frontend:** Next.js (App Router) + Shadcn/ui + Tailwind CSS
- **Backend:** Supabase (PostgreSQL with RLS) + Edge Functions
- **Smart Pixel:** JavaScript SDK hosted on Cloudflare CDN
- **AI:** Claude API (analysis), Perplexity API (hallucination detection)
- **Scripts:** Python (Visibility Audit for lead generation)

---

## Project Structure

```
employer-openrole/
├── frontend/               # Next.js dashboard for clients
│   └── src/
│       ├── app/            # Pages (dashboard, API routes)
│       └── features/       # Feature modules (facts, sanitization, pixel)
├── scripts/                # Python audit scripts (lead generation)
│   ├── audit_brand*.py     # Visibility Audit scripts
│   └── companies.csv       # Target companies
├── supabase/               # Database migrations
├── database-schema.sql     # Complete schema reference
├── BUSINESS_PLAN.md        # 2026 Strategic Plan
├── CLAUDE.md               # AI Developer Rules
├── tech-stack.md           # Architecture Decisions
├── design-system.md        # Visual Identity
└── do_do_not.md            # Development Guardrails
```

---

## Quick Links

- [Business Plan](./BUSINESS_PLAN.md) - 2026 Strategic Roadmap
- [Tech Stack](./tech-stack.md) - Architecture Decisions
- [Design System](./design-system.md) - Visual Identity Guidelines
- [Frontend Setup](./frontend/README.md) - Local runbook, environment variables, release gate
- [Guardrails](./do_do_not.md) - Do's and Don'ts

---

## The Moat

1. **Sanitization Moat:** We're the indispensable translator between messy ATS data and AI-ready output
2. **Agency Lock-In:** Once deployed across 50 clients, agencies can't rip us out
3. **Active Retention:** Monday Morning Report constantly proves value
4. **Regulatory Tailwinds:** Pay Transparency laws force companies to structure data—we automate compliance
