---
company: NHS (National Health Service)
industry: Healthcare / Public Sector
employees: 1400000+ (largest UK employer)
headquarters: UK (England)
website: https://www.nhs.uk
careers_url: https://www.jobs.nhs.uk
audit_date: 2026-02-20
---

# NHS: AI Employer Visibility Audit

## Executive Summary
The NHS, as the UK's largest employer with 1.4 million staff, operates a dedicated jobs portal (jobs.nhs.uk) with specific crawler policies. Despite scale, AI visibility infrastructure is minimal and focused on preventing duplicate content indexing.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers (with service-specific blocks)

- **Location:** https://www.nhs.uk/robots.txt
- **AI Bot Blocking:** None detected
- **Blocked Bots:** Ultraseek (explicitly blocked), AhrefsBot (crawl-delay: 5)
- **Algolia Crawler:** Allowed with specific path restrictions

**Notable Blocks:**
- Psychological therapy service search pages (multiple patterns)
- Dentist patient verification pages
- Coronavirus-related contact/testing pages (historical)
- Service search export functions
- Mind plan quiz application pages
- Review submission pages

**Analysis:** NHS blocks indexing of transactional pages and personalized health service search results. No AI crawler restrictions, but extensive blocking of user-journey pages suggests privacy/UX focus over discoverability.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- No llms.txt file found on nhs.uk or jobs.nhs.uk

### 3. Careers Page Structure
**URL:** https://www.jobs.nhs.uk

**Content Quality:** ⚠️ Functional but minimal

**Key Elements:**
- **Search:** "Search and apply for jobs in the NHS"
- **Application Management:** View and manage submitted applications (requires sign-in)
- **Help & Guidance:** User guides and videos
- **Social Channels:** Facebook updates, YouTube guidance
- **Contact:** Email (nhsbsa.nhsjobs@nhsbsa.nhs.uk), Phone (0300 330 1013)
- **Hours:** Monday-Friday, 8am-6pm GMT/BST

**Missing:**
- No employer brand content visible
- No information about working for NHS
- No benefits overview
- No career paths or development information
- Purely transactional job search interface

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Not verified

Could not verify JobPosting schema implementation. The portal appears to be a job board/ATS rather than a rich careers site.

### 5. Salary Transparency
**Status:** ✅ Likely present (NHS pay bands are public)

While not visible on the overview page, NHS roles traditionally display "Band 5," "Band 6," etc. which map to published pay scales. This is a structural advantage over private sector employers.

## Critical Gap: Employer Brand Content

The NHS jobs portal is purely functional - no "why work for NHS" content was accessible during the audit. For the UK's largest and most recognizable employer, this is a missed opportunity.

## Recommendations

### Critical Priority
1. **Create Employer Brand Hub** - "Why work for the NHS" content separate from job search
2. **Structure NHS Benefits** - Pension (NHS Pension Scheme), leave entitlements, training budgets
3. **Explain Career Frameworks** - AFC (Agenda for Change) bands, career progression paths
4. **Implement llms.txt** - Point AI to key NHS employer content (if it exists elsewhere)

### High Priority
5. **Add JobPosting Schema** - Ensure all job listings have proper structured data with organizational context
6. **Band Salary Transparency** - Link pay bands to specific salary ranges in job listings
7. **Create "Working for NHS" FAQ** - Address common questions AI might be asked

### Medium Priority
8. **Highlight Unique Benefits** - NHS-specific perks (e.g., Blue Light Card, NHS discounts)
9. **Diversity Data** - NHS workforce diversity statistics should be AI-discoverable
10. **Regional Variation** - Help AI understand NHS England vs Scotland vs Wales vs Northern Ireland differences

## AI Visibility Score: 3/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 2/2 | Allows AI bots |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Not verified |
| Salary Transparency | 1/2 | Band system exists but not linked |
| Content Quality | 0/2 | No employer brand content |

## Competitive Position
The NHS competes with private healthcare (Bupa, Nuffield, etc.) and international healthcare systems for clinical talent. Despite being the UK's largest employer with unique benefits (pension scheme, job security, public service mission), this story isn't told on the careers portal.

When AI is asked:
- "NHS vs private healthcare jobs"
- "NHS pension vs private sector"
- "Benefits of working for NHS"

There's minimal structured content for AI to reference.

## Unique Structural Advantages

The NHS has several differentiators that should be AI-discoverable:

1. **Pay Transparency:** AFC bands with published salary scales
2. **Pension:** NHS Pension Scheme (one of UK's best)
3. **Job Security:** Public sector stability
4. **Scale:** Largest UK employer - massive career mobility
5. **Mission:** Public service / "save lives" purpose
6. **Training:** Extensive CPD budgets and study leave
7. **Diversity:** Likely the UK's most diverse employer

**None of this is structured for AI discovery.**

## Public Sector Complexity

NHS careers are fragmented:
- NHS England, NHS Scotland, NHS Wales, Northern Ireland
- Individual Trust recruitment
- Different portals (jobs.nhs.uk, HealthJobsUK, TrustJobsUK, etc.)
- Bank/agency staff vs permanent
- Different systems (England AFC, Scotland different bands)

This fragmentation makes comprehensive AI crawling extremely difficult.

## Strategic Insight

The NHS has the strongest "why work here" story of any UK employer:
- Life-saving mission
- Unmatched scale and variety
- Best-in-class pension
- Public service ethos

But when a medical graduate asks an AI "Should I work for NHS or go private?", the AI likely can't give a data-driven answer because NHS employer content isn't discoverable or structured.

## Next Steps
1. Audit other NHS domains (healthcareers.nhs.uk, etc.) for employer content
2. Check if NHS England/Scotland/Wales have separate employer brand sites
3. Verify JobPosting schema on actual job listings
4. Map NHS careers content fragmentation
5. Recommend centralized employer brand content strategy
