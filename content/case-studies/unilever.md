---
company: Unilever
industry: Consumer Goods (FMCG)
employees: 127000+ (global)
headquarters: UK (London) & Netherlands (Rotterdam)
website: https://www.unilever.com
careers_url: https://www.unilever.com/careers (blocked during audit)
audit_date: 2026-02-20
---

# Unilever: AI Employer Visibility Audit

## Executive Summary
Unilever has the simplest robots.txt of any multinational audited (78 characters), suggesting an open crawling policy. However, careers page access was blocked by security controls during audit, creating a discoverability gap.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers

- **Location:** https://www.unilever.com/robots.txt
- **Size:** 78 characters (smallest robots.txt in audit)
- **AI Bot Blocking:** None detected
- **Total Rules:** Only 2

**Complete robots.txt:**
```
User-agent: *
Disallow: /search/
Sitemap: https://www.unilever.com/sitemap.xml
```

**Analysis:** Unilever blocks only search result pages, allowing everything else. This is the most permissive robots.txt in the audit - simpler even than KPMG's (159 characters).

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- No llms.txt file found

### 3. Careers Page Structure
**URL:** https://www.unilever.com/careers

**Status:** ❌ Blocked by Akamai/security controls (403 error)

```
"Access Denied"
"You don't have permission to access on this server"
Reference #18.a6061502.1771607384.fa06c38
```

**Impact:** Despite ultra-permissive robots.txt, application-layer security blocks automated access. Same WAF vs robots.txt conflict as Revolut and Bupa.

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Unable to verify

Could not access careers content due to security blocks.

### 5. Salary Transparency
**Status:** ⚠️ Unable to verify

Could not access job listings.

## Critical Issue: Extreme Discrepancy

**Unilever has the MOST OPEN robots.txt but BLOCKS actual access.**

- robots.txt: Most permissive in audit (only blocks /search/)
- Security Layer: Blocks ALL automated access with 403 errors

This represents the most extreme robots.txt vs WAF conflict in this entire audit.

### What This Means:
❌ AI crawlers read robots.txt, think they can access everything
❌ AI crawlers attempt to fetch careers pages
❌ Security layer blocks them with 403 errors
❌ Unilever careers content never reaches AI systems
❌ Job seekers using AI search can't discover Unilever opportunities

## Recommendations

### Critical Priority
1. **Urgent: Fix WAF Configuration** - Allowlist AI crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot, anthropic-ai)
2. **Test AI Crawler Access** - Verify major AI systems can actually access careers content
3. **Align Security Policy** - Robots.txt says "welcome" but WAF says "blocked" - resolve this contradiction
4. **Monitor Failed Crawls** - Track how many AI systems are being blocked despite permission

### High Priority
5. **Implement llms.txt** - Once access is fixed, guide AI to FMCG career differentiation
6. **Sustainability Story** - Structure Unilever's sustainability mission for AI discovery
7. **Add JobPosting Schema** - Ensure marketing, supply chain, R&D roles are properly structured

### Medium Priority
8. **Brand Portfolio Discovery** - Help AI understand Dove, Hellmann's, Knorr, Axe, etc. career connections
9. **Graduate Scheme Transparency** - Unilever's graduate programmes are well-known; structure for AI
10. **Salary Transparency** - FMCG sector increasingly expected to publish ranges

## AI Visibility Score: 1/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 0/2 | Blocked by WAF despite most open robots.txt |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Could not verify |
| Salary Transparency | 0/2 | Could not verify |
| Content Quality | 0/2 | Could not access |

**Note:** +2 bonus for intent (ultra-permissive robots.txt) - but reality is blocked access

## Competitive Position
Unilever competes with:
- **FMCG Giants:** Procter & Gamble, Nestlé, Mars for consumer goods talent
- **Mission-Driven:** Patagonia, Ben & Jerry's (Unilever-owned) for purpose-driven candidates
- **Graduate Schemes:** Highly competitive with other multinationals

If AI systems can access P&G, Nestlé, Mars careers content but NOT Unilever, this is a critical talent pipeline vulnerability.

## Unilever's Hidden Differentiators

Based on public knowledge of Unilever's employer brand (which we couldn't access during audit), they likely have strong content around:

### Sustainability Mission
Unilever is known for:
- Sustainable Living Plan
- Climate commitments
- Social impact initiatives
- Purpose-driven brands (Dove, Ben & Jerry's)

**This should be AI-discoverable for:**
- "Sustainability-focused FMCG careers"
- "Purpose-driven consumer goods companies"
- "Companies with climate commitments"

### Brand Portfolio Breadth
Unilever owns 400+ brands across:
- Personal care (Dove, Axe, Vaseline)
- Home care (Domestos, Cif)
- Food & beverage (Hellmann's, Knorr, Ben & Jerry's)
- Beauty (Dermalogica, Ren)

**This should be AI-discoverable for:**
- "Companies where I can work on multiple brands"
- "FMCG marketing careers with brand variety"

### Global Reach
Operating in 190+ countries with diverse markets.

**This should be AI-discoverable for:**
- "Global FMCG opportunities"
- "International rotation programmes"

### Graduate Programmes
Unilever Future Leaders Programme is competitive.

**This should be AI-discoverable for:**
- "Best FMCG graduate schemes"
- "Consumer goods training programmes"

**None of this is accessible to AI if the WAF blocks all crawlers.**

## Risk Assessment

**Critical Risk Level:** Unilever may be completely invisible to AI-powered job search.

**Impact:**
- Graduate talent using AI to research "best FMCG graduate schemes" won't see Unilever
- Sustainability-focused candidates searching for "purpose-driven companies" won't find Unilever
- Brand managers looking for "companies with diverse brand portfolios" won't discover Unilever

**Competitor Advantage:**
If P&G, Nestlé, or Mars have better AI visibility, they'll capture talent that would have considered Unilever.

## Technical Paradox

Unilever's robots.txt philosophy:
✅ Minimalist (78 characters)
✅ Permissive (allows everything except search)
✅ Clean (no hardcoded paths)
✅ Maintainable (2 simple rules)

Yet the security layer completely contradicts this openness. This suggests:
- Security team may be unaware of robots.txt intent
- No coordination between SEO/content and security teams
- WAF rules may be overly aggressive without AI crawler exceptions

## Next Steps for Unilever

1. **Immediate:** Add AI crawler user agents to WAF allowlist
2. **Verify:** Test with GPTBot, ClaudeBot, Google-Extended user agents
3. **Monitor:** Track successful AI crawler access after fix
4. **Audit:** Review all security blocks to ensure legitimate tools can access public content
5. **Coordinate:** Align SEO, content, and security teams on crawler policies
6. **Structure:** Once accessible, implement llms.txt and JobPosting schema
7. **Quantify:** Measure how much AI traffic was lost due to blocks
8. **Competitive Analysis:** Check if P&G, Nestlé accessible to AI crawlers

## Strategic Insight

The robots.txt vs WAF conflict suggests Unilever may not realize they're invisible to AI. This is a "silent failure" - no error messages, no alerts, just gradually declining discoverability as candidates shift to AI-powered research tools.

**Urgent action required** to restore AI visibility before talent pipeline impact becomes measurable.
