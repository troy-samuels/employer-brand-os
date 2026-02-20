---
company: KPMG
industry: Professional Services (Big 4)
employees: 273000+ (global), 16000+ (UK)
headquarters: Global (UK: London)
website: https://kpmg.com
careers_url: https://www.kpmgcareers.co.uk
audit_date: 2026-02-20
---

# KPMG: AI Employer Visibility Audit

## Executive Summary
KPMG has the simplest robots.txt of all Big 4 firms audited, with minimal restrictions and explicit allowance for all crawlers. Careers content emphasizes flexibility and inclusion but lacks technical AI discovery infrastructure.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers

- **Location:** https://kpmg.com/robots.txt
- **Size:** 159 characters (smallest robots.txt in audit)
- **AI Bot Blocking:** None
- **Blocked:** Only YouDaoBot (Chinese search engine)
- **Special Treatment:** Cludo (internal search bot) explicitly allowed

**Analysis:** KPMG's approach is refreshingly simple:
```
User-agent: cludo
Allow: /

User-agent: *
Allow: /

User-agent: YouDaoBot
Disallow: /
```

This "allow everything" policy makes KPMG the most technically open Big 4 firm to AI crawlers.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- No llms.txt file found

### 3. Careers Page Structure
**URL:** https://www.kpmgcareers.co.uk

**Content Quality:** ✅ Inclusion and flexibility focused

**Key Messaging:**
- **Recognition:** "We'll recognise your contribution is one of a kind"
- **Diversity:** "Our diverse workforce is one of our greatest strengths"
- **Parental Support:** "Empowering Parents" programme with coaching, resources, support
- **Flexibility:** "Intelligent Working" - "try hard to accommodate yours, creating a schedule that works for you"
- **Returners:** "Range of opportunities to returners to work alongside support to help you thrive"

**Programme Highlights:**
- Empowering Parents (dedicated programme)
- Intelligent Working (flexible scheduling)
- Returners to Work support

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Not verified

Could not verify JSON-LD implementation from minimal text extraction.

### 5. Salary Transparency
**Status:** ❌ Not visible

No salary information on careers overview page.

## Recommendations

### High Priority
1. **Implement llms.txt** - Guide AI to key differentiators: Empowering Parents, Intelligent Working, diversity focus
2. **Expand Careers Content** - Currently very minimal; add depth on culture, values, career paths
3. **Add JobPosting Schema** - Ensure job listings have proper structured data

### Medium Priority
4. **Quantify Flexibility** - "Intelligent Working" needs specific examples (e.g., "4-day weeks available," "core hours 10am-3pm")
5. **Detail Parental Support** - What specifically does "Empowering Parents" include? (coaching hours, return-to-work support, etc.)
6. **Returner Programme Specs** - How long? What support? What roles qualify?

### Low Priority
7. **Salary Ranges** - At least for graduate/entry-level roles
8. **Track AI Discovery** - Monitor how AI systems represent KPMG's flexibility focus

## AI Visibility Score: 4/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 2/2 | Most open robots.txt of Big 4 |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Not verified |
| Salary Transparency | 0/2 | No salary data |
| Content Quality | 2/2 | Good focus but sparse detail |

## Competitive Position
KPMG has strong differentiators (Empowering Parents, Intelligent Working, Returners support) but minimal content depth. When AI is asked:
- "Which Big 4 firm is best for working parents?"
- "Big 4 flexible working policies"
- "Professional services firms with career returner programs"

KPMG should be top-of-list but likely isn't due to sparse, unstructured content.

## Content Gap Analysis

### What KPMG Says:
- "Empowering Parents"
- "Intelligent Working"
- "We'll try hard to accommodate your circumstances"

### What AI Needs to Know:
- How many weeks maternity/paternity leave?
- Can you work 4-day weeks?
- Remote/hybrid split?
- Core hours requirements?
- Returner programme duration and structure?

**Gap:** Strong positioning, insufficient detail for AI to extract and compare.

## Strategic Opportunity

KPMG is positioned as the Big 4 firm for:
1. **Working parents** - "Empowering Parents" programme
2. **Flexible workers** - "Intelligent Working" 
3. **Career returners** - Dedicated support

These are growing talent segments (especially post-COVID). If KPMG structures this content for AI, they could dominate these search queries.

## Technical Excellence: robots.txt

KPMG's minimal robots.txt is a model of simplicity:
✅ Easy to maintain
✅ No fragile hardcoded paths
✅ Clear intent (allow everything except one Chinese bot)
✅ Fast for crawlers to parse

Compare to PwC's 13KB robots.txt - KPMG's approach is far superior from a technical perspective.

## Next Steps for Impact

1. **Quantify each programme** - Turn "Empowering Parents" into specific leave policies, support hours, coaching frequency
2. **Create comparison table** - KPMG vs Big 4 on flexibility, parental support, returner programmes
3. **Structure for AI** - Make this data machine-readable via JSON-LD and llms.txt
4. **Monitor queries** - Track "Big 4 flexibility" searches and KPMG's visibility
