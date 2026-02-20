---
company: Rolls-Royce
industry: Aerospace & Defense
employees: 42000+ (global)
headquarters: UK (Derby)
website: https://www.rolls-royce.com
careers_url: https://careers.rolls-royce.com
audit_date: 2026-02-20
---

# Rolls-Royce: AI Employer Visibility Audit

## Executive Summary
Rolls-Royce presents a strong engineering-focused employer brand with emphasis on innovation and global impact. Careers site is accessible with quality content, but lacks AI-specific technical infrastructure.

## Findings

### 1. AI Crawler Policies (robots.txt)
**Status:** ✅ Open to AI crawlers

- **Location:** https://www.rolls-royce.com/robots.txt
- **Size:** 3,068 characters
- **AI Bot Blocking:** None detected
- **Explicit Blocks:** Various Java user agents (Java/1.6.0 variants), Insieve+Bot, BLP_bbot

**Disallow Patterns:**
- Technical file types: `/*.axd$`
- Media directory restrictions: Marine-specific documents
- Internal systems: `/staticresources/`, `/investis/`, `/tools/`
- Sitecore CMS paths
- Test cache pages
- Select country pages
- Specific product marketing pages
- Historical document PDFs (C-share information, heritage trust documents)

**Analysis:** Blocks outdated Java crawlers and specific legacy content. No modern AI crawler restrictions. Focused on preventing indexing of internal tools and specific sensitive documents.

### 2. LLM Discovery Files
**Status:** ❌ Not implemented

- No llms.txt file found

### 3. Careers Page Structure
**URL:** https://careers.rolls-royce.com

**Content Quality:** ✅ Strong engineering narrative

**Key Messaging:**
- **Brand Heritage:** "One of the most enduring and iconic brands in the world"
- **History:** "Over a century at the forefront of engineering excellence"
- **Purpose:** "Solving the world's toughest challenges with innovative propulsion and power solutions"
- **Pace:** "The world doesn't wait, and neither do we. We lead progress."
- **Mission:** "Creating technologies that move us forward"
- **Culture:** "Driven to grow, learn, and make a lasting difference"

**Programme Spotlights:**
- **India Careers:** Major facilities, year-round roles, skills development
- **Asia-Pacific:** Engineering team, breakthrough systems
- **Emerging Talent:** Student & graduate programmes
- **Procurement:** Global team, supply chain innovation
- **Engineering:** Aviation, maritime, energy sectors

**People Deal Framework:**
- Articulates relationship between Rolls-Royce and employees
- Covers: Working culture, office environment, technology access
- Clear expectations both ways (employer and employee)
- "Honest, open approach sets expectations clearly"

**Career Areas:**
Engineering, Supply Chain & Procurement, IT, Sales, Marketing, Finance

### 4. Structured Data (JSON-LD)
**Status:** ⚠️ Not verified

Could not verify JSON-LD implementation from text extraction.

### 5. Salary Transparency
**Status:** ❌ Not visible

No salary information on careers overview page.

## Recommendations

### High Priority
1. **Implement llms.txt** - Point AI to engineering differentiation: "solving world's toughest challenges," century of innovation
2. **Structure People Deal** - The People Deal framework is a differentiator that should be machine-readable
3. **Add JobPosting Schema** - Especially for engineering roles (aviation, maritime, energy)
4. **Sector-Specific Content** - Structure differences between Civil Aerospace, Defense, Power Systems careers

### Medium Priority
5. **Graduate Scheme Details** - Structure student & graduate programme information
6. **Innovation Metrics** - Quantify "toughest challenges" - R&D spend, patents, breakthrough projects
7. **Global Presence** - Make multi-country opportunities discoverable (India, APAC focus visible)
8. **Salary Ranges** - Engineering sector increasingly expected to show compensation bands

### Low Priority
9. **Heritage Story** - "Century of engineering excellence" should be discoverable for employer brand queries
10. **Track AI Discovery** - Monitor engineering talent discovery via AI search

## AI Visibility Score: 6/10

| Criterion | Score | Notes |
|-----------|-------|-------|
| AI Crawler Access | 2/2 | Allows AI bots |
| LLM Discovery | 0/2 | No llms.txt file |
| Structured Data | 0/2 | Not verified |
| Salary Transparency | 0/2 | No salary data |
| Content Quality | 4/2 | Excellent engineering narrative |

## Competitive Position
Rolls-Royce competes with:
- **Aerospace:** BAE Systems, Airbus, Boeing for aerospace engineering talent
- **Defense:** Lockheed Martin, Northrop Grumman for defense engineering
- **Energy:** Siemens, GE for power systems talent
- **Tech Giants:** For software engineering and AI/ML roles

The "solving world's toughest challenges" positioning is strong but needs to be AI-discoverable.

## Unique Differentiators

### Engineering Breadth
"Aviation, maritime, and energy" - Rolls-Royce engineers can work across multiple sectors. This breadth should be structured for AI:
- AI query: "Companies where I can work on both jet engines and nuclear power"
- AI query: "Aerospace companies with maritime divisions"

### Global Innovation Centers
India and Asia-Pacific spotlights suggest global engineering presence. Should be structured:
- India: "Major facilities," "year-round roles," "skills development"
- APAC: "Breakthrough systems," "pioneering innovations"
- UK: Derby headquarters, engineering heritage

### People Deal Framework
The "People Deal" is a unique employer value proposition structure. Should be AI-discoverable:
- What employees get
- What Rolls-Royce expects
- "Honest, open approach"
- Covers culture, environment, technology

## Strategic Insight: Engineering Talent Challenge

Aerospace/defense sector faces:
- Aging workforce (significant retirement wave)
- Competition from tech sector (software engineers)
- Security clearance requirements (limits candidate pool)
- Complex, long-cycle projects (may seem less agile than tech)

**Rolls-Royce Advantages:**
- Global impact ("technologies that move us forward")
- Technical complexity ("world's toughest challenges")
- Brand prestige ("iconic brand," "century of excellence")
- Mission-driven ("creating technologies that move us forward")

These need to be structured for AI to help candidates discover why Rolls-Royce engineering is compelling.

## Content Strength Analysis

**Excellent Messaging:**
✅ "The world doesn't wait, and neither do we" - urgency and pace
✅ "Driven to grow, learn, and make a lasting difference" - personal development focus
✅ "Over a century at the forefront of engineering excellence" - credibility
✅ "Solving the world's toughest challenges" - impact and complexity

**Needs Structuring:**
❌ What are the "toughest challenges"? (examples needed)
❌ What "innovative propulsion and power solutions"? (specific projects)
❌ What does "People Deal" specifically include? (benefits, culture, expectations)
❌ Career progression paths in engineering?

## Technical Heritage vs Modern Talent

Rolls-Royce has:
- **Heritage:** 100+ years, iconic brand
- **Modern Challenge:** Attracting software engineers, AI/ML talent, digital transformation

The employer brand leans heavily on engineering heritage. For modern tech talent, should also highlight:
- Digital transformation initiatives
- AI/ML applications in aerospace
- Modern tech stack
- Agile/innovative culture alongside precision engineering

## Next Steps
1. Verify JobPosting schema on actual engineering role listings
2. Quantify "toughest challenges" with specific project examples
3. Structure People Deal components for machine readability
4. Map engineering career paths (early career to senior) for AI discovery
5. Create content bridge between engineering heritage and modern tech capabilities
6. Benchmark salary transparency against BAE Systems, Airbus for competitiveness
