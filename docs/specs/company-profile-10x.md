# Company Profile 10x — Editor + Public Page Redesign
**Product:** OpenRole
**Date:** 24 Feb 2026
**Status:** Draft
**Priority:** 🔴 Critical — this IS the minimum product for employers who can't install code

---

## Problem

Two connected problems:

### 1. The public company page is a report, not a profile
Currently `/company/[slug]` shows an AI visibility score with a breakdown grid. It tells you *about* the problem (score, gaps) but doesn't show the *solution* (verified employer data). If an employer fills in salary bands, interview process, benefits — there's nowhere compelling for that data to live publicly.

For OpenRole to be cited by LLMs, the company page needs to BE the canonical source of verified employer data. Not a score card — a comprehensive, structured, AI-readable employer profile that answers every question a candidate would ask.

### 2. The employer editing experience is a long form
The current "Employer Facts Questionnaire" is a multi-section form that feels like data entry, not profile management. For 10x UX, employers should feel like they're editing a live profile — see exactly how their data renders as they input it.

---

## Proposal

Redesign the company profile page and employer editor as two sides of the same coin:

- **Public page** (`/company/[slug]`): A rich, structured employer profile that looks better than Glassdoor. Shows verified data (salary, benefits, culture, interview process) alongside the AI visibility score. This is what LLMs cite.

- **Employer editor** (`/dashboard/facts`): Inline editing that mirrors the public page layout. Edit a salary band → see it update in real-time on the preview. Toggle sections on/off. Publish when ready.

---

## Public Company Profile Page — What It Should Show

### Above the fold
- Company name, logo, tagline
- AI Transparency Score (existing gauge)
- Verified badge (if employer has claimed and filled in data)
- Key stats: team size, founded, HQ, remote policy
- "Verified by [Company] on [date]" trust signal

### Section: Salary & Compensation
```
┌─────────────────────────────────────────────────┐
│  💰 Salary Bands (Verified Feb 2026)            │
│                                                 │
│  Senior Engineer     £85,000 – £115,000 + equity│
│  Product Manager     £75,000 – £100,000         │
│  Account Executive   £55,000 – £70,000 base     │
│                      OTE £110,000 – £140,000    │
│                                                 │
│  Pay review: Annual · Bonus: Performance-based  │
│  Currency: GBP                                  │
└─────────────────────────────────────────────────┘
```

### Section: Benefits
Visual grid/cards, not a text list:
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 🏥       │ │ 💰       │ │ 🏠       │ │ 📚       │
│ Private  │ │ 8%       │ │ 25 days  │ │ £1,500   │
│ Health   │ │ Pension  │ │ Holiday  │ │ Learning │
│ care     │ │ Match    │ │ + bank   │ │ Budget   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Section: Interview Process
Visual timeline/stepper:
```
Step 1          Step 2           Step 3          Step 4
Recruiter  →   Technical    →   Team Meet   →   Offer
Call            Assessment       (On-site)
30 min          2 hours          Half day        
───●────────────●────────────────●───────────────●───
   
   Total timeline: 2-3 weeks from first call
```

### Section: Work Policy
- Remote/hybrid/office with detail
- Office locations on a mini map or cards
- Flexible hours policy
- Equipment/home office budget

### Section: Tech Stack
Visual badges grouped by category:
```
Frontend:  [React] [TypeScript] [Next.js] [Tailwind]
Backend:   [Python] [Go] [PostgreSQL] [Redis]
Infra:     [AWS] [Kubernetes] [Terraform]
Data:      [Snowflake] [dbt] [Airflow]
```

### Section: Culture & Values
- Company values with descriptions
- Team size and growth
- Culture description
- DEI initiatives and metrics

### Section: What AI Says (existing)
- ChatGPT / Perplexity / Claude response previews
- Score breakdown
- Gaps identified

### Section: Claim CTA (for unclaimed profiles)
- "Is this your company? Claim your profile to verify this data."

---

## Employer Editor — 10x UX Principles

### 1. Live preview
Split-screen or tab toggle: editor on left, preview on right. Every edit reflects instantly on the preview. The employer sees exactly how their profile will look to candidates and AI.

### 2. Section-based editing
Not one massive form. Click on a section → expand inline editor. Fill in salary bands → see them render as the visual grid. Add a benefit → see the card appear.

### 3. Completion progress
Visual progress bar per section: "Your profile is 65% complete. Complete Salary & Benefits to improve your AI score."

Each incomplete section shows what's missing and why it matters:
"⚠️ Salary data missing — AI will guess or cite Glassdoor instead."

### 4. Publish controls
- Draft mode: save without publishing
- Preview: see the full public page before going live
- Publish: make data live on the public profile
- Section-level publishing: publish benefits without publishing salary (if they're not ready)

### 5. Quick-add patterns
- Benefits: checkboxes for common benefits + custom add
- Tech stack: type-ahead with common technologies
- Interview stages: drag-and-drop reorder
- Salary bands: role template library ("Senior Engineer", "Product Manager") with market benchmarks

### 6. Smart defaults
When employer claims profile, pre-populate what we can find from their website:
- Company name, logo (scrape)
- HQ location
- Team size (from LinkedIn)
- Any salary data already found during audit
- Tech stack (if detectable from job listings)

---

## How the Profile Serves AEO

Every section on the public page is structured for AI consumption:

### Schema markup (automatic)
When an employer publishes salary data, the page automatically includes:
```json
{
  "@type": "JobPosting",
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "GBP",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 85000,
      "maxValue": 115000,
      "unitText": "YEAR"
    }
  }
}
```

### FAQ schema
Each section generates FAQPage schema:
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the salary for a Senior Engineer at Deliveroo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "£85,000 – £115,000 base salary plus equity, verified by Deliveroo in February 2026."
      }
    }
  ]
}
```

### Answer-first content
Each section renders as a direct answer to the candidate's query:
- H2: "What is the salary at [Company]?"
- First sentence: direct answer with numbers
- Supporting detail follows

This structure is proven to increase AI citation by 39%.

### Freshness signals
Every section shows "Verified by [Company] on [date]" — this serves as both a trust signal for candidates AND a freshness signal for AI crawlers.

---

## Design References

The profile should feel closer to:
- **Linear's company page** — clean, modern, data-dense but not cluttered
- **Notion's team pages** — structured but warm
- **Stripe's documentation** — scannable, well-typeset, professional

NOT like:
- Glassdoor (cluttered, ad-heavy, anonymous review chaos)
- Indeed (generic, no personality)
- LinkedIn company pages (feature-bloated, corporate)

---

## Technical Notes

### Public page architecture
- Server-rendered (ISR) for SEO + AI crawlability
- Schema markup auto-generated from employer facts data
- OpenGraph + Twitter Card meta for social sharing
- Canonical URL for AI citation tracking
- `<meta name="last-modified">` for freshness signal

### Editor architecture
- Client-side React with optimistic updates
- Auto-save drafts (debounced)
- Real-time preview via shared component library (same components render in editor and public page)
- Image upload for company logo (Supabase Storage)

### Data flow
```
Employer edits in dashboard
        ↓
Saves to Supabase (employer_facts table — existing)
        ↓
Public page renders from same data (ISR, revalidates on save)
        ↓
Schema markup auto-generated per section
        ↓
AI crawlers find structured, verified, fresh data
        ↓
Citation tracking logs when AI cites the page
```

---

## Success Metric

Employer profile completion rate: 70%+ of claimed profiles complete at least 4 of 7 sections within 14 days of claiming.

Secondary: company pages with verified data get 2x+ more AI bot crawls than unclaimed pages.

---

## Effort

**Public page redesign:** L (1-2 weeks) — new layout, section components, schema generation
**Employer editor redesign:** L (1-2 weeks) — inline editing, live preview, publish flow
**Total:** XL (3-4 weeks) — but can ship incrementally (public page first, then editor)

---

## Phasing

### Phase A: Public page redesign (Week 1-2)
- New company profile layout with all sections
- Render employer-verified data where available
- Auto-generated schema markup per section
- Mobile responsive
- "Claim this profile" CTA for unclaimed companies

### Phase B: Employer editor redesign (Week 3-4)
- Split-screen editor with live preview
- Section-based editing with completion progress
- Publish controls (draft → preview → live)
- Quick-add patterns for common data
- Smart defaults from audit data
