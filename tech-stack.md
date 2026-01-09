# BrandOS: Technical Architecture (2026)

## Philosophy: Lean Infrastructure for Data Sovereignty

Built for a **Solo Founder + AI assistance**. Every technology choice optimizes for:
1. **Speed to Deploy:** No IT tickets required
2. **Low Maintenance:** Serverless where possible
3. **High Margins:** >90% gross margin on SaaS

---

## The Smart Pixel (BrandCore)

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

### Technical Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Pixel Host** | Cloudflare CDN | Global edge distribution, <50ms load time |
| **Pixel SDK** | Vanilla JavaScript (~5KB) | No dependencies, GTM-compatible |
| **Facts API** | Supabase Edge Functions | Serverless, auto-scaling |
| **Schema Format** | JSON-LD (schema.org) | Google Jobs + AI crawler compatible |

---

## Frontend & Dashboard

- **Framework:** Next.js (App Router)
- **UI Library:** Shadcn/ui + Tailwind CSS
- **Purpose:** Client dashboard for managing facts, viewing hallucinations, compliance status

### Key Pages (Phase 1)

| Page | Purpose |
|------|---------|
| `/dashboard` | Overview of Smart Pixel status, hallucination alerts |
| `/facts` | CRUD interface for company facts (salary, benefits, policy) |
| `/hallucinations` | View detected AI inaccuracies with remediation status |
| `/compliance` | Pay Transparency law compliance tracker |

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

## AI & Monitoring (BrandShield)

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

## Lead Generation Scripts (BrandOS Auditor)

Python scripts for the "Trojan Horse Audit" sales strategy.

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
| `auditor.py` | Main auditor - queries Perplexity for company reputation |
| `filter_leads.py` | Filter 460k contacts to "3-Star Purgatory" segment |
| `generate_outreach.py` | Create personalized cold emails based on audit findings |

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
