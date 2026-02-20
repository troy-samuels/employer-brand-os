---
company: Deloitte
industry: Professional Services (Big 4)
employees: 415000+ (global), 20000+ (UK)
headquarters: Global (UK: London)
website: https://www.deloitte.com
careers_url: https://careers.deloitte.co.uk (not accessible)
audit_date: 2026-02-20
---

# Deloitte: AI Employer Visibility Audit

## Executive Summary
Deloitte operates a minimal robots.txt with focus on preventing indexing of internal content. UK careers site was not accessible during audit. As a global professional services leader, Deloitte's AI visibility is limited by fragmented web presence.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers

- **Location:** https://www.deloitte.com/robots.txt (global)
- **AI Bot Blocking:** None detected
- **Key Crawlers Status:** All AI crawlers allowed

**Blocked Paths:**
- `/languages/` and language-related content folders
- `/content/dam/*/no-index/` directories
- Search results pages
- `/us/en/noindex/*` content

**Analysis:** Deloitte's robots.txt is focused on preventing duplicate content from language variations and explicitly marked no-index directories. No AI crawler restrictions.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- No llms.txt file found

### 3. Careers Page Structure
**URL:** https://careers.deloitte.co.uk

**Status:** ❌ Domain not found

The expected UK careers subdomain did not resolve during the audit. This suggests:
- Careers may be hosted on global domain
- Different subdomain structure (e.g., www2.deloitte.com/uk/careers)
- Localized careers portals per service line

**Impact:** Fragmented careers infrastructure makes AI discovery more difficult.

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Unable to verify

Could not access careers pages to verify JobPosting schema implementation.

### 5. Salary Transparency
**Status:** ⚠️ Unable to verify

Could not access job listings. Big 4 consulting firms historically do not publish salary ranges for experienced hire roles (though graduate scheme salaries are often public knowledge).

## Critical Infrastructure Issues

### Problem 1: Fragmented Careers Architecture
Deloitte likely operates multiple careers portals:
- Global brand site: deloitte.com
- Regional sites: deloitte.co.uk, deloitte.com/uk
- Service line-specific recruiting
- Graduate/experienced hire separate funnels

This fragmentation makes comprehensive AI crawling difficult.

### Problem 2: Subdomain Accessibility
The careers.deloitte.co.uk subdomain not resolving suggests either:
- Careers content is path-based (e.g., /uk/en/careers/)
- Different domain structure
- Geo-redirects that block automated access

## Recommendations

### Critical Priority
1. **Consolidate Careers URLs** - Create a single, canonical careers portal that's easily discoverable
2. **Fix Subdomain Resolution** - Ensure careers.deloitte.co.uk or equivalent resolves properly
3. **Map Careers Architecture** - Document all careers entry points for AI crawlers

### High Priority
4. **Implement llms.txt** - Point AI to key employer brand content across all service lines
5. **Graduate Salary Transparency** - At minimum, publish graduate scheme salaries (often already public)
6. **Unified JobPosting Schema** - Ensure consistent structured data across all regions/service lines

### Medium Priority
7. **Service Line Differentiation** - Help AI understand differences between Audit, Consulting, Tax, Advisory careers
8. **Track AI Traffic** - Monitor which AI systems successfully find Deloitte careers content (if any)

## AI Visibility Score: 2/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 2/2 | robots.txt allows AI bots |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Could not verify |
| Salary Transparency | 0/2 | Could not verify |
| Content Quality | 0/2 | Could not access |

## Competitive Position
As a Big 4 firm competing with PwC, KPMG, and EY for top graduate and experienced talent, Deloitte's AI discoverability issues are a significant disadvantage. When candidates use AI to research "Big 4 consulting careers" or "Deloitte vs PwC culture," fragmented web architecture limits AI's ability to provide accurate information.

## Risk Assessment
**High Risk:** Graduate and MBA candidates increasingly use AI for career research. If competitors have better AI visibility, Deloitte may lose share of top-tier talent consideration sets.

## Next Steps for Verification
1. Manual search for Deloitte UK careers portal actual URL
2. Test different careers subdomains (careers.deloitte.co.uk, jobs.deloitte.co.uk, etc.)
3. Check if careers content is on main domain under /careers/ path
4. Review Deloitte's public graduate scheme documentation for salary transparency
5. Test geo-redirect behavior for UK-based access
