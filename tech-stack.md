# BrandOS: Technical Architecture (2026)

## Philosophy: Lean Infrastructure for AI Visibility & Compliance

Built for a **Solo Founder + AI assistance**. Every technology choice optimizes for:
1. **Speed to Deploy:** No IT tickets required
2. **Low Maintenance:** Serverless where possible
3. **High Margins:** >90% gross margin on SaaS

---

## Layer 1: Infrastructure (The Smart Pixel & Sanitization Engine)

The heart of BrandOS is a lightweight JavaScript SDK that injects verified employer data as JSON-LD schema.

### How It Works

```
Client Website                    BrandOS Infrastructure
     │                                     │
     │  1. Load pixel via GTM              │
     ▼                                     │
┌─────────────┐                            │
│ Smart Pixel │ ──2. Fetch facts──────────►│
│   (JS SDK)  │                            │
│             │ ◄─3. Return JSON-LD────────│
└─────────────┘                            │
     │                                     │
     │  4. Inject <script type="application/ld+json">
     ▼
┌─────────────┐
│  Page DOM   │  ← AI crawlers see structured data
└─────────────┘
```

### Sanitization Engine

The Sanitization Engine translates internal ATS codes to public-friendly job titles.

```
Internal ATS                    BrandOS Sanitization               Public Output
     │                                     │                            │
L4-Eng-NY  ───────────────────────────────►│                            │
                          ┌────────────────┴────────────────┐           │
                          │ job_title_mappings table        │           │
                          │ L4-Eng-NY → Senior Software Eng │           │
                          └────────────────┬────────────────┘           │
                                           │                            ▼
                                           └──────────────► Senior Software Engineer
```

### Technical Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Pixel Host** | Cloudflare CDN | Global edge distribution, <50ms load time |
| **Pixel SDK** | Vanilla JavaScript (~5KB) | No dependencies, GTM-compatible |
| **Facts API** | Supabase Edge Functions | Serverless, auto-scaling |
| **Sanitize API** | Next.js API Route | ATS code translation |
| **Schema Format** | JSON-LD (schema.org) | Google Jobs + AI crawler compatible |

---

## Frontend & Dashboard

- **Framework:** Next.js (App Router)
- **UI Library:** Shadcn/ui + Tailwind CSS
- **Purpose:** Client dashboard for managing facts, sanitization rules, compliance status

### Key Pages (Phase 1)

| Page | Purpose |
|------|---------|
| `/dashboard` | Overview of Smart Pixel status, hallucination alerts |
| `/dashboard/facts` | CRUD interface for company facts (salary, benefits, policy) |
| `/dashboard/sanitization` | Manage ATS code → public title mappings |
| `/dashboard/analytics` | Visibility metrics and compliance tracking |

---

## Backend & Database

- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Supabase Auth (email/password, SSO for enterprise)
- **Edge Functions:** Supabase Edge (Deno runtime)

### Why Supabase?

| Feature | Business Benefit |
|---------|-----------------|
| Row Level Security (RLS) | Multi-tenant isolation without code changes |
| Real-time subscriptions | Live dashboard updates when facts change |
| Edge Functions | Serverless API, pay-per-use |
| Built-in Auth | No separate auth service needed |

---

## Layer 2: Compliance (Hallucination Radar & Pay Transparency)

### Hallucination Detection

| Tool | Purpose | Cost |
|------|---------|------|
| **Perplexity API** | Live web search + AI to detect what models say | ~$0.03/query |
| **Claude API** | Analyze sentiment and map to BrandOS products | ~$0.01/query |
| **OpenRouter** | Access multiple models (Gemini, Llama, Mistral) | Variable |

### Monitoring Flow

```
Weekly Cron Job
     │
     ▼
┌─────────────────────┐
│ Query Perplexity:   │
│ "What are downsides │
│  of working at X?"  │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ Compare to verified │
│ facts in database   │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ Flag hallucinations │
│ with severity level │
└─────────────────────┘
```

---

## Lead Generation Scripts (Visibility Audit)

Python scripts for the "Visibility Audit" sales strategy.

### Script Stack

| Tool | Purpose |
|------|---------|
| **Python 3.11+** | Script runtime |
| **OpenRouter API** | Multi-model access |
| **DuckDuckGo Search** | Free web search fallback |
| **Pandas** | Data processing |

### Scripts

| Script | Purpose |
|--------|---------|
| `audit_brand*.py` | Audit employer visibility and reputation via AI models |
| `import_leads.py` | Import 460k contacts to Supabase |
| `companies.csv` | Target companies for visibility audits |

---

## Hosting & Infrastructure

| Service | Purpose | Cost |
|---------|---------|------|
| **Vercel** | Frontend hosting (Next.js) | Free tier → $20/mo |
| **Supabase** | Database + Auth + Edge | Free tier → $25/mo |
| **Cloudflare** | CDN for Smart Pixel SDK | Free tier |
| **OpenRouter** | AI API aggregator | Pay-per-use |

### Estimated Monthly Costs (at 100 clients)

| Item | Cost |
|------|------|
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| OpenRouter (AI) | ~$50 |
| Cloudflare | $0 |
| **Total** | **~$95/mo** |

**Gross Margin at 100 clients:** ($299 × 100) - $95 = **$29,805/mo** (99.7% margin)

---

## What's Deferred (Phase 2+)

These technologies are **not** in Phase 1:

| Technology | Original Purpose | Why Deferred |
|------------|-----------------|--------------|
| Vapi.ai | Voice interviews with employees | Content creation is low-value |
| C2PA | Content authenticity signatures | Complexity without clear ROI |
| Twilio | SMS/WhatsApp for referrals | Focus on core pixel first |
| Merge.dev/Rutter | ATS/HRIS integrations | Enterprise feature for later |

---

## Architecture Decision Records

### ADR-001: Smart Pixel over Direct Integration

**Decision:** Use JavaScript injection (like Meta Pixel) instead of requiring API integration.

**Why:**
- HR/Marketing can deploy via GTM without IT tickets
- Works on any website (WordPress, Squarespace, custom)
- Creates "soft lock-in" (removing breaks their AI SEO)

### ADR-002: Supabase over Custom Backend

**Decision:** Use Supabase for everything (DB, Auth, Edge Functions).

**Why:**
- One bill, one vendor
- RLS handles multi-tenancy automatically
- Edge Functions avoid cold starts
- Real-time for dashboard updates

### ADR-003: Cloudflare CDN for Pixel

**Decision:** Host the Smart Pixel SDK on Cloudflare's free CDN.

**Why:**
- Global edge distribution (<50ms worldwide)
- Free tier handles millions of requests
- Easy cache invalidation when SDK updates

### ADR-004: Sanitization Engine for ATS Defense

**Decision:** Build a translation layer between internal ATS codes and public job titles.

**Why:**
- Companies use messy internal codes (L4-Eng-NY) that shouldn't be public
- AI agents need clean, standardized job titles
- Creates additional value and lock-in
- Supports Pay Transparency compliance
