---
company: Marks & Spencer
industry: Retail
employees: 65000+
headquarters: UK
website: https://www.marksandspencer.com
careers_url: https://jobs.marksandspencer.com
audit_date: 2026-02-20
---

# Marks & Spencer: AI Employer Visibility Audit

## Executive Summary
M&S operates a comprehensive careers portal with strong employer brand messaging but lacks modern AI visibility infrastructure. The company's robots.txt is extensive but doesn't block AI crawlers.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers

- **Location:** https://www.marksandspencer.com/robots.txt
- **Notable:** Whimsical header "## This is not just a robots.txt file"
- **AI Bot Blocking:** None detected
- **Key Crawlers Status:**
  - GPTBot: ✅ Allowed
  - ClaudeBot: ✅ Allowed
  - Google-Extended: ✅ Allowed
  - CCBot: ✅ Allowed

**Analysis:** M&S has a detailed robots.txt (4,293 characters) focused on blocking internal systems and duplicate content paths. Allows Twitterbot explicitly. No AI crawler restrictions.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- `/llms.txt`: Not found (404)
- `/.well-known/llms.txt`: Not found (404)

### 3. Careers Page Structure
**URL:** https://jobs.marksandspencer.com

**Content Quality:** ✅ Strong

Key elements found:
- Clear value proposition: "This isn't just about keeping up. It's about getting ahead."
- Team categorization (In Store, Food, Digital & Tech, Fashion/Home/Beauty, International, Support Functions, Supply Chain)
- Job counts and locations visible (270 jobs across 100 locations for In Store roles)
- Strong employer brand messaging about culture and values
- Diversity, Equity & Inclusion commitments
- Sustainability initiatives (Plan A)
- "Being an in person business" - transparency about office requirements

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Not verified

Could not access raw HTML to verify JSON-LD implementation. The careers site uses a modern design but structured data presence unknown.

### 5. Salary Transparency
**Status:** ❌ Not visible

- No salary information displayed in team overview pages
- Job counts and locations shown, but no compensation data
- Would need to access individual job listings to verify

## Recommendations

### High Priority
1. **Implement llms.txt** - Guide AI to employer brand content including DEI, sustainability, and culture pages
2. **Add Salary Data** - Display salary ranges on job listings to improve transparency and AI discoverability
3. **Verify JSON-LD** - Ensure all job postings have proper JobPosting schema markup

### Medium Priority
4. **Optimize for AI** - The strong employer brand content (culture, values, DEI) should be structured for AI consumption
5. **Track AI Traffic** - Monitor which AI tools are discovering M&S careers content

## AI Visibility Score: 5/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 2/2 | Allows all AI bots |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Not verified |
| Salary Transparency | 0/2 | No salary data visible |
| Content Quality | 3/2 | Excellent employer brand content |

## Competitive Position
M&S has invested heavily in employer brand content and messaging - far better than most retailers. However, this content may be invisible to AI systems without proper technical implementation. They're telling a great story but not in a language that LLMs can easily parse and reference.

## Notable Quote
*"We're not just one of Britain's best loved brands. We're also a global, trusted, retailer, and we take pride in raising standards and doing the right thing."*

This kind of positioning is perfect for AI-powered job search - if properly structured and discoverable.
