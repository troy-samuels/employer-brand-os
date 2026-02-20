---
company: Sky
industry: Media & Entertainment
employees: 31000+ (global)
headquarters: UK (Osterley)
website: https://www.sky.com
careers_url: https://careers.sky.com
audit_date: 2026-02-20
---

# Sky: AI Employer Visibility Audit

## Executive Summary
Sky operates an extensive robots.txt with detailed URL parameter blocking and accessible careers site with strong employer brand messaging. One of Europe's leading media companies with good technical infrastructure but no AI-specific optimization.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers

- **Location:** https://www.sky.com/robots.txt
- **Size:** 4,263 characters (second-largest in audit after PwC)
- **AI Bot Blocking:** None detected
- **Special Treatment:** AdsBot-Google has different rules than standard crawlers

**Extensive URL Parameter Blocking:**
Over 35 query parameters blocked, including:
- `?_escaped_fragment`, `?adobe_mc`, `?awc`, `?fbclid`
- `?dcmp`, `?dclid`, `?utm_source`, `?utm_content`
- `?q`, `?ref`, `?product`, `?page`
- Various campaign and tracking parameters

**Historical Content Blocking:**
Interesting glimpses of past Sky services now blocked:
- `/sky+`, `/skybuy`, `/skyscape/`
- `/pokemon`, `/simpsons2000`, `/scandal`
- `/rocket`, `/journeyman`, `/vita.html`

**Analysis:** Sky focuses heavily on preventing duplicate content from tracking parameters and blocking legacy/deprecated pages. No AI crawler restrictions.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- No llms.txt file found

### 3. Careers Page Structure
**URL:** https://careers.sky.com

**Content Quality:** ✅ Strong brand and opportunity messaging

**Key Messaging:**
- **Scale:** "One of Europe's leading media and entertainment companies"
- **Impact:** "Want to see your work in the hands of millions?"
- **Values:** "Believe a better business creates a better world"
- **Innovation:** "Never stand still," "always striving"
- **Culture:** "Inclusive culture where we can learn from each other and innovate together"
- **Purpose:** "Better content and innovation to our customers"

**Career Programmes:**
- **Graduates:** "Learn fast. Spark change. Set your future up for success."
- **Internships:** Available opportunities
- **Apprenticeships:** Accessible entry points
- **All disciplines:** "Find your home at Sky"

**Locations:**
- **Sky Osterley:** Award-winning campus
- **Leeds:** Hub location
- **Livingston:** Hub location
- **UK-wide:** Multiple contact centres
- Specific callout: "Find your something, and your somewhere, at Sky"

**Content Features:**
- Team spotlights
- Blog content from employees
- Project showcases
- "What we do" behind the scenes

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Not verified

Could not verify JSON-LD implementation from text extraction.

### 5. Salary Transparency
**Status:** ❌ Not visible

No salary information on careers overview page.

## Recommendations

### High Priority
1. **Implement llms.txt** - Guide AI to key differentiators: scale ("millions of users"), innovation focus, campus culture
2. **Add JobPosting Schema** - Ensure tech, content, and media roles have proper structured data
3. **Location-Specific Content** - Structure "Sky Osterley campus" vs "Leeds hub" vs "Livingston" for geographic searches

### Medium Priority
4. **Salary Ranges** - Especially for tech roles competing with streaming giants (Netflix, Amazon, Disney+)
5. **Quantify Impact** - "Millions of users" should be structured for AI discovery
6. **Graduate Scheme Details** - Structure programme information for AI to extract
7. **Simplify robots.txt** - 4KB of rules with 35+ parameter blocks may be overengineered

### Low Priority
8. **Track AI Referrals** - Monitor which roles/teams get discovered via AI-powered search
9. **Content vs Tech Differentiation** - Help AI understand different career paths at Sky

## AI Visibility Score: 6/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 2/2 | Allows AI bots despite complex rules |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Not verified |
| Salary Transparency | 0/2 | No salary data |
| Content Quality | 4/2 | Excellent brand messaging |

## Competitive Position
Sky competes with:
- **Streaming:** Netflix, Amazon, Disney+ for content/tech talent
- **Traditional Media:** BBC, ITV for broadcast talent
- **Telecommunications:** BT, Virgin Media for tech infrastructure talent

Sky's "millions of users" scale and award-winning campus are differentiators that should be AI-discoverable.

When AI is asked:
- "Best media companies to work for UK"
- "Sky vs Netflix careers"
- "UK tech companies with campuses"

Sky should feature prominently but may not without structured content.

## Unique Differentiators

### Sky Osterley Campus
"Award-winning campus" is mentioned but not detailed. AI should know:
- Facilities available
- Commute access (proximity to London)
- Campus amenities
- Why it won awards

### Scale Impact
"Want to see your work in the hands of millions?" is compelling for product people. Should be structured:
- User base size
- Product reach
- Platform scale
- Content consumption stats

### Early Career Programmes
Graduate, internship, and apprenticeship programmes are mentioned but need structuring:
- Programme duration
- Rotation structure
- Success rate
- Alumni outcomes

## Technical Observation: Parameter Blocking

Sky blocks 35+ URL parameters to prevent duplicate content. While necessary for SEO, this creates complexity:
✅ Prevents duplicate content indexing
⚠️ May be overengineered (many parameters never indexed anyway)
⚠️ Maintenance burden when adding new tracking parameters

**Recommendation:** Consider using pattern-based blocking (e.g., `Disallow: *?utm_*`) rather than enumerating every parameter.

## Content Strength vs Technical Gap

**What Sky Does Well:**
- Compelling employer brand messaging
- Clear value proposition
- Multiple entry points (graduate, experienced)
- Location diversity
- Culture emphasis

**What Sky Misses:**
- Not structured for AI discovery
- No salary transparency
- JobPosting schema not verified
- No llms.txt guidance

Sky has great content - it just isn't machine-readable.

## Strategic Opportunity

Sky is in a unique position:
- Traditional media (broadcast)
- Modern streaming (NOW)
- Sports rights (Sky Sports)
- Technology infrastructure (satellite, streaming, broadband)

This diversity of career paths should be AI-discoverable. When someone asks "Can I work in sports media at Sky?", AI should know the answer is yes.

## Next Steps
1. Verify JobPosting schema on actual job listings
2. Map career paths (content, tech, sports, customer service) for AI structure
3. Quantify campus amenities and awards for structured data
4. Benchmark salary ranges against Netflix, Amazon for tech role competitiveness
5. Create llms.txt pointing to diversity of career opportunities
