---
company: Revolut
industry: Fintech
employees: 10000+
headquarters: UK (London)
website: https://www.revolut.com
careers_url: https://www.revolut.com/careers
audit_date: 2026-02-20
---

# Revolut: AI Employer Visibility Audit

## Executive Summary
Revolut, one of Europe's leading fintech unicorns, implements selective web access controls but does not specifically block AI crawlers. Careers page blocked during audit, limiting analysis depth.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers (with caveats)

- **Location:** https://www.revolut.com/robots.txt
- **AI Bot Blocking:** None detected
- **Key Crawlers Status:** All AI crawlers allowed
- **Notable Blocks:** 
  - Extensive query parameter blocking
  - API endpoints blocked
  - Embedded content blocked
  - Email verification pages blocked

**Analysis:** Revolut's robots.txt is focused on preventing crawling of dynamic content, localized send money pages, and currency converter pages. The extensive query parameter blocking suggests a focus on preventing duplicate content indexing rather than restricting access.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- No llms.txt file found

### 3. Careers Page Structure
**URL:** https://www.revolut.com/careers

**Status:** ❌ Access blocked (403 error)

The careers page returned a security check/CAPTCHA challenge during the audit, preventing automated analysis. This is likely Cloudflare or similar WAF protection.

**Impact:** AI crawlers may face similar blocks when trying to access Revolut careers content, despite robots.txt allowing them.

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Unable to verify

Could not access careers page to check for JobPosting schema implementation.

### 5. Salary Transparency
**Status:** ⚠️ Unable to verify

Could not access job listings to assess salary disclosure practices.

## Critical Issue: WAF vs Robots.txt Conflict

**Problem:** Revolut says "yes" in robots.txt but "no" at the application layer.

- robots.txt: Allows AI crawlers
- WAF/Security: Blocks automated access with security challenges

This creates a **discoverability gap** where AI systems may be technically allowed but practically blocked from accessing employer content.

## Recommendations

### Critical Priority
1. **Resolve Access Conflict** - Ensure legitimate AI crawlers (GPTBot, ClaudeBot) can access careers pages without triggering security blocks
2. **Implement WAF Allowlist** - Add known AI crawler IPs/user agents to security allowlist
3. **Test AI Access** - Verify that major AI systems can actually crawl careers content

### High Priority
4. **Implement llms.txt** - Once access is resolved, guide AI to key employer content
5. **Add JSON-LD** - Ensure job postings are structured for AI consumption

### Medium Priority
6. **Monitor AI Bot Traffic** - Track which AI systems are attempting (and failing) to access careers content
7. **Salary Transparency** - Given fintech's competitive talent market, display salary ranges

## AI Visibility Score: 2/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 0/2 | Blocked by WAF despite robots.txt |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Could not verify |
| Salary Transparency | 0/2 | Could not verify |
| Content Quality | 0/2 | Could not access |

**Bonus Points:** +2 for allowing AI bots in robots.txt (intent matters)

## Competitive Position
Revolut is likely **invisible to AI** despite potentially strong employer brand content. In the competitive fintech talent market, this is a significant disadvantage. Candidates using AI-powered job search tools may never see Revolut opportunities.

## Risk Assessment
**High Risk:** If competitors like Monzo, Wise, or Starling have better AI discoverability, Revolut may lose top-of-funnel talent awareness.

## Next Steps for Verification
1. Manual browser check of careers page structure
2. Review Revolut's actual WAF rules for AI crawler treatment
3. Test with different AI crawler user agents
4. Check if jobs are discoverable via third-party platforms (LinkedIn, Indeed) instead
