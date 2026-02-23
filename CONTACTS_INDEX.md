# OpenRole — Contacts & Lead Pipeline

**Updated:** 23 February 2026

---

## Target Buyer

- **Title:** Head of TA, Employer Brand Manager, Head of People, HR Director
- **Company size:** 100–1,000 employees (Growth plan sweet spot)
- **Geography:** UK
- **Sector:** Any — fintech, healthcare, retail, tech, professional services

## Lead Sources

### 1. Free Audit (Inbound)
Anyone can run an audit at openrole.co.uk — no signup required. When they submit an email for the report, they enter the `audit_leads` table and the nurture sequence fires (Day 1, 3, 7).

### 2. Outreach (Founder-led)
See `COLD_OUTREACH_PLAYBOOK.md` for templates and cadence. Target 20 companies, book 10 calls, validate willingness to pay.

### 3. UK Visibility Index
Public rankings at `/uk-index` drive organic traffic. Companies seeing poor scores may self-serve.

### 4. Content & SEO
10 blog posts live, targeting "AI employer brand", "AI visibility score", "what AI tells candidates" keywords.

## Validation Targets

See `VALIDATION_TARGETS.md` for the full list of 20 companies with contacts, employee counts, and outreach status.

## Pipeline Tracking

Track in `COLD_OUTREACH_PLAYBOOK.md` tracking table:

| Company | Contact | Email Sent | Reply | Call Booked | Outcome |
|---------|---------|------------|-------|-------------|---------|
| | | | | | |

## Automated Nurture

Post-audit email sequence (via Resend + Vercel Cron):

| Day | Email | Purpose |
|-----|-------|---------|
| 0 | Audit report | Score + findings + CTA to full report |
| 1 | "What AI gets wrong" | Information gaps — shock value |
| 3 | "How you compare" | Industry average + competitor framing |
| 7 | PDF briefing + founding offer | CFO leave-behind + £99/mo locked rate |

Tracking: `nurture_sent` JSONB column on `audit_leads` table.
