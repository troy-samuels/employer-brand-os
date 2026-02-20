---
company: Bupa
industry: Healthcare / Insurance
employees: 80000+ (global), 16000+ (UK)
headquarters: UK (London)
website: https://www.bupa.co.uk
careers_url: https://www.bupa.co.uk/careers (blocked during audit)
audit_date: 2026-02-20
---

# Bupa: AI Employer Visibility Audit

## Executive Summary
Bupa implements aggressive bot protection with crawl delays for SEO tools and explicit blocks for various crawlers. Careers site access was blocked by Cloudflare during audit, suggesting potential AI crawler accessibility issues.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ⚠️ Open to AI crawlers, but restrictive to other bots

- **Location:** https://www.bupa.co.uk/robots.txt
- **Size:** 2,471 characters
- **AI Bot Blocking:** None detected
- **Explicit Blocks:** UptimeRobot, Spinn3r, ezooms.bot, 008, FatBot 2.0
- **Crawl-Delay (5 seconds):** SemrushBot (all variants), lumar, deepcrawl, Screaming Frog

**Disallow Patterns:**
- Search pages
- Internal tools (vivisimo, jahia, bupaukcmshome)
- Specific PDF documents (20+ hardcoded paths)
- Test pages and Sitecore content
- Query parameters (cssId, lname, data-items, tab)
- Various care services and health assessment pages

**Analysis:** Bupa is suspicious of automated tools. While AI crawlers aren't explicitly blocked, the site uses Cloudflare protection that blocked our audit access.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- No llms.txt file found

### 3. Careers Page Structure
**URL:** https://www.bupa.co.uk/careers

**Status:** ❌ Blocked by Cloudflare (403 error)

The careers page returned a Cloudflare security block during the audit:
```
"Sorry, you have been blocked"
"You are unable to access bupa.co.uk"
```

**Impact:** AI crawlers may face similar blocks despite robots.txt allowing them. This creates a discoverability gap between policy (robots.txt says yes) and reality (WAF says no).

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Unable to verify

Could not access careers content due to security blocks.

### 5. Salary Transparency
**Status:** ⚠️ Unable to verify

Could not access job listings to assess salary disclosure.

## Critical Issue: WAF vs robots.txt Conflict

**Same problem as Revolut:** Bupa says "yes" in robots.txt but "no" at the application layer.

- robots.txt: Allows AI crawlers (no GPTBot, ClaudeBot, etc. blocks)
- Cloudflare WAF: Blocks automated access with security challenges

This means:
❌ AI systems may attempt to crawl and fail
❌ Bupa careers content may be invisible to AI
❌ Job seekers using AI-powered search won't find Bupa roles

## Recommendations

### Critical Priority
1. **Fix WAF Configuration** - Allowlist known AI crawler IPs/user agents (GPTBot, ClaudeBot, Google-Extended)
2. **Test AI Crawler Access** - Verify that major AI systems can successfully crawl careers pages
3. **Resolve robots.txt vs WAF Conflict** - Align security policy with stated crawling policy

### High Priority
4. **Implement llms.txt** - Once access is fixed, guide AI to employer brand content
5. **Healthcare Career Differentiation** - Structure content around "private healthcare vs NHS" comparison
6. **Add JobPosting Schema** - Ensure clinical and non-clinical roles are properly structured

### Medium Priority
7. **Salary Transparency** - Healthcare sector increasingly expected to publish pay ranges
8. **Monitor Failed Crawls** - Track which AI systems are being blocked by WAF
9. **Simplify robots.txt** - 20+ hardcoded PDF paths suggest maintenance burden

## AI Visibility Score: 1/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 0/2 | Blocked by WAF despite robots.txt |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Could not verify |
| Salary Transparency | 0/2 | Could not verify |
| Content Quality | 0/2 | Could not access |

**Note:** Score reflects reality (blocked access) not intent (robots.txt allows)

## Competitive Position
Bupa competes with NHS, Nuffield Health, HCA Healthcare, and other private healthcare providers. If AI crawlers can't access Bupa careers content but CAN access competitors', Bupa becomes invisible in AI-powered job search.

## Risk Assessment
**Critical Risk:** Healthcare talent shortage in UK means candidates have choices. If Bupa is invisible to AI while competitors are discoverable, this directly impacts talent pipeline.

## Healthcare Talent Context

Private healthcare employers like Bupa should differentiate on:
- Better work-life balance than NHS?
- Higher pay than NHS?
- Modern facilities and equipment?
- Specialization opportunities?
- Career progression paths?

**None of this can be AI-discoverable if the WAF blocks access.**

## Technical Observation: Bot Paranoia

Bupa's robots.txt reveals anxiety about crawlers:
- Blocks SEO tools (Semrush, Screaming Frog, deepcrawl)
- Blocks monitoring bots (UptimeRobot)
- Blocks unknown bots (FatBot, 008, ezooms.bot)
- Extensive crawl-delay requirements

This suggests a security-first mindset that may be inadvertently blocking legitimate AI systems.

**Recommendation:** Differentiate between:
- ✅ Legitimate AI assistants (ChatGPT, Claude, Perplexity)
- ⚠️ SEO crawlers (may need rate limiting)
- ❌ Malicious scrapers (should be blocked)

## Next Steps for Verification
1. Manual browser access to bupa.co.uk/careers to see actual content
2. Test with different AI crawler user agents
3. Review Cloudflare firewall rules for AI crawler treatment
4. Check if Bupa jobs are available via third-party aggregators (Indeed, LinkedIn)
5. Monitor whether AI systems have any Bupa careers data in their training
