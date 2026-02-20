---
company: Tesco
industry: Retail
employees: 300000+
headquarters: UK
website: https://www.tesco.com
careers_url: https://careers.tesco.com
audit_date: 2026-02-20
---

# Tesco: AI Employer Visibility Audit

## Executive Summary
Tesco, the UK's largest retailer, has basic technical infrastructure for web crawling but lacks advanced AI visibility optimisations. The company does not block AI crawlers but also has not implemented modern AI discovery standards.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers

- **Location:** https://www.tesco.com/robots.txt
- **AI Bot Blocking:** None detected
- **Key Crawlers Status:**
  - GPTBot: ✅ Allowed
  - ClaudeBot: ✅ Allowed
  - Google-Extended: ✅ Allowed
  - CCBot: ✅ Allowed
  - anthropic-ai: ✅ Allowed

**Analysis:** Tesco allows all AI crawlers to access their site. The robots.txt file is focused on preventing crawling of specific user account pages, product promotions, and dynamic URL parameters.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- `/llms.txt`: Not found (503 error)
- `/.well-known/llms.txt`: Not found (404 error)

**Impact:** Tesco has not adopted modern AI discovery standards like llms.txt, missing an opportunity to guide AI systems to their most important employer content.

### 3. Careers Page Structure
**URL:** https://careers.tesco.com

**Content Found:**
- Job listings visible (Change Manager, Project Accountant, Store Colleagues)
- Multiple locations (UK, Ireland, Hungary, India)
- Clear role types and availability windows
- Application deadlines specified

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Unknown

Unable to fully verify JSON-LD implementation due to access restrictions. The careers site returned job listings but full page structure analysis was blocked.

### 5. Salary Transparency
**Status:** ⚠️ Partial

- Some roles show "Tesco Colleague rate of pay starts..." indicating salary information exists
- Not consistently displayed across all roles
- Some roles don't show salary data in listings

## Recommendations

### High Priority
1. **Implement llms.txt** - Create `/llms.txt` to guide AI systems to key employer brand content
2. **Add JobPosting Schema** - Implement comprehensive JSON-LD structured data on all job listings
3. **Improve Salary Transparency** - Display salary ranges for all roles, not just store positions

### Medium Priority
4. **Optimize Careers Page** - Ensure careers site is accessible to web crawlers and AI tools
5. **Create AI-Friendly Content** - Add a dedicated employer brand page optimized for AI discovery

### Low Priority
6. **Monitor AI Bot Access** - Track which AI crawlers are accessing careers content
7. **A/B Test Salary Display** - Test impact of salary transparency on application rates

## AI Visibility Score: 4/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 2/2 | Allows all AI bots |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | JSON-LD not verified |
| Salary Transparency | 1/2 | Partial salary data |
| Content Quality | 1/2 | Basic careers content |

## Competitive Position
Tesco is behind modern employers in AI visibility optimization. While they don't block AI crawlers (a positive), they haven't implemented any proactive AI discovery strategies. For a company of Tesco's size and hiring volume, this represents a significant missed opportunity in the AI-powered job search era.
