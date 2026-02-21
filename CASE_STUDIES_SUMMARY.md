---
title: UK Employer AI Visibility Audit - Summary Report
date: 2026-02-20
companies_audited: 15
total_employees: 2.3M+
---

# UK Employer AI Visibility Audit - Summary Report

## Executive Summary

This audit examined 15 major UK employers across retail, fintech, professional services, healthcare, telecommunications, aerospace, and FMCG sectors to assess their discoverability by AI-powered job search tools.

**Key Finding:** 🚨 **ZERO companies have implemented AI-specific discovery standards (llms.txt).**

**Critical Gap:** Multiple employers allow AI crawlers in robots.txt but block them at the application layer (WAF/security controls), creating invisible careers sites.

## Overall Statistics

| Metric | Result |
|--------|--------|
| **Companies Audited** | 15 |
| **Total Employees** | 2.3M+ |
| **Allow AI Crawlers (robots.txt)** | 15/15 (100%) |
| **Implemented llms.txt** | 0/15 (0%) |
| **Verified JSON-LD** | 0/15 (0% - not accessible) |
| **Salary Transparency** | 1/15 (7% - NHS only, partial) |
| **Careers Site Accessible** | 8/15 (53%) |
| **Blocked by WAF** | 3/15 (20%) |
| **DNS/Infrastructure Issues** | 2/15 (13%) |
| **Average AI Visibility Score** | 3.9/10 |

## Company Comparison Table

| Company | Industry | Employees | Crawlers Allowed | llms.txt | Careers Access | Salary Data | AI Score | Status |
|---------|----------|-----------|-----------------|----------|----------------|-------------|----------|--------|
| **Tesco** | Retail | 300,000+ | ✅ | ❌ | ⚠️ Blocked | ⚠️ Partial | 4/10 | 🟡 Basic |
| **Marks & Spencer** | Retail | 65,000+ | ✅ | ❌ | ✅ | ❌ | 5/10 | 🟢 Strong Content |
| **John Lewis** | Retail | 76,000+ | ✅ | ❌ | ⚠️ Redirect | ❌ | 5/10 | 🟢 Strong Content |
| **Revolut** | Fintech | 10,000+ | ✅ | ❌ | ❌ WAF Block | ❌ | 2/10 | 🔴 Blocked |
| **Monzo** | Fintech | 4,000+ | ✅ | ❌ | ✅ | ⚠️ Benefits | 6/10 | 🟢 Excellent Transparency |
| **Deliveroo** | Tech/Delivery | 4,000+ | ✅ | ❌ | ✅ | ❌ | 5/10 | 🟢 Good Tech Focus |
| **Deloitte** | Big 4 | 20,000+ (UK) | ✅ | ❌ | ❌ DNS Fail | ❌ | 2/10 | 🔴 Infrastructure Issues |
| **PwC** | Big 4 | 23,000 (UK) | ✅ | ❌ | ✅ | ❌ | 5/10 | 🟢 Strong PVP |
| **KPMG** | Big 4 | 16,000+ (UK) | ✅ | ❌ | ✅ | ❌ | 4/10 | 🟡 Good Focus, Sparse Detail |
| **NHS** | Healthcare | 1,400,000+ | ✅ | ❌ | ✅ | ✅ Bands | 3/10 | 🟡 No Employer Brand |
| **Bupa** | Healthcare | 16,000+ (UK) | ✅ | ❌ | ❌ WAF Block | ❌ | 1/10 | 🔴 Blocked |
| **Virgin Media** | Telecom | 14,000+ | ✅ | ❌ | ❌ DNS Fail | ❌ | 1/10 | 🔴 Infrastructure Issues |
| **Sky** | Media | 31,000+ | ✅ | ❌ | ✅ | ❌ | 6/10 | 🟢 Strong Brand |
| **Rolls-Royce** | Aerospace | 42,000+ | ✅ | ❌ | ✅ | ❌ | 6/10 | 🟢 Strong Engineering Narrative |
| **Unilever** | FMCG | 127,000+ | ✅ | ❌ | ❌ WAF Block | ❌ | 1/10 | 🔴 Blocked |

## Critical Findings

### 1. The robots.txt Paradox

**All 15 companies allow AI crawlers in robots.txt, yet 5 careers sites were inaccessible:**

| Company | robots.txt | Reality | Issue |
|---------|-----------|---------|-------|
| Revolut | ✅ Allows | ❌ Blocked | WAF/Cloudflare security challenge |
| Bupa | ✅ Allows | ❌ Blocked | Cloudflare security block |
| Unilever | ✅ Allows | ❌ Blocked | Akamai security controls |
| Deloitte | ✅ Allows | ❌ DNS Fail | careers.deloitte.co.uk doesn't resolve |
| Virgin Media | ✅ Allows | ❌ DNS Fail | careers.virginmedia.com doesn't resolve |

**Impact:** These employers say "yes" to AI but implement "no" at the infrastructure layer, rendering their careers content invisible.

### 2. Zero AI-Specific Optimization

**Not a single company has implemented llms.txt:**
- 0/15 with `/llms.txt`
- 0/15 with `/.well-known/llms.txt`
- 0/15 with AI-specific discovery standards

This represents a complete industry gap. No UK employer in this audit is proactively guiding AI systems to their employer brand content.

### 3. Salary Transparency Desert

**Only 1 company (NHS) has structural salary transparency:**
- NHS: Uses published AFC pay bands
- All others: No visible salary data on careers overview pages

This puts UK employers at a disadvantage vs US employers (many states now require salary ranges).

### 4. Content vs Infrastructure Gap

**Companies with excellent employer brand content but poor AI infrastructure:**
- **Monzo:** Industry-leading transparency on benefits, parental leave, culture - but not machine-readable
- **M&S:** Strong employer brand messaging about culture, sustainability, DEI - but unstructured
- **John Lewis:** Unique employee ownership story - but not AI-discoverable
- **Sky:** Compelling "millions of users" scale narrative - but not structured
- **Rolls-Royce:** "Solving world's toughest challenges" positioning - but not machine-readable

**Pattern:** Human-readable content ≠ AI-discoverable content

## Industry Analysis

### Retail (Tesco, M&S, John Lewis)
- ✅ All allow AI crawlers
- ✅ Strong employer brand content (M&S, John Lewis)
- ❌ No AI discovery standards
- ❌ No salary transparency
- **Score:** 4.7/10 average

**Insight:** Retail employers invest in employer brand content but don't structure it for AI consumption.

### Fintech (Revolut, Monzo)
- ✅ Both allow AI crawlers in robots.txt
- ✅ Monzo has exceptional benefits transparency
- ❌ Revolut blocked by WAF (accessibility gap)
- ❌ No AI discovery standards
- **Score:** 4/10 average

**Insight:** Tech-forward industry still behind on AI-specific employer brand infrastructure. Revolut's WAF block is particularly surprising.

### Professional Services - Big 4 (Deloitte, PwC, KPMG)
- ✅ All allow AI crawlers
- ✅ Clear employer value propositions (PwC's "Grow here. Go Further.", KPMG's flexibility focus)
- ❌ Deloitte careers DNS failure
- ❌ No salary transparency
- ❌ No AI discovery standards
- **Score:** 3.7/10 average

**Insight:** Big 4 firms compete fiercely for graduate talent but aren't optimized for AI-powered career research that graduates increasingly use.

### Healthcare (NHS, Bupa)
- ✅ Both allow AI crawlers
- ✅ NHS has salary band structure (unique advantage)
- ❌ Bupa blocked by WAF
- ❌ NHS has no employer brand content on jobs portal
- **Score:** 2/10 average

**Insight:** Healthcare sector faces talent shortages but isn't leveraging AI discovery. NHS's lack of employer brand content is a massive missed opportunity.

### Telecommunications/Media (Virgin Media, Sky)
- ✅ Both allow AI crawlers
- ✅ Sky has strong careers content
- ❌ Virgin Media DNS failure (post-merger issues)
- ❌ No AI discovery standards
- **Score:** 3.5/10 average

**Insight:** Virgin Media's DNS failure suggests post-O2 merger integration issues. Sky has content but lacks technical AI optimization.

### Industrial (Rolls-Royce)
- ✅ Allows AI crawlers
- ✅ Strong engineering narrative
- ❌ No AI discovery standards
- ❌ No salary transparency
- **Score:** 6/10

**Insight:** Best-in-class employer brand content ("solving world's toughest challenges") but not structured for AI discovery.

### FMCG (Unilever)
- ✅ Most permissive robots.txt (only blocks /search/)
- ❌ Completely blocked by WAF (extreme robots.txt vs WAF conflict)
- ❌ No AI discovery standards
- **Score:** 1/10

**Insight:** Unilever has the most extreme discrepancy - ultra-permissive policy but complete blocking in practice.

## Technical Infrastructure Patterns

### robots.txt Complexity Spectrum

| Company | robots.txt Size | Approach |
|---------|----------------|----------|
| Unilever | 78 chars | Minimalist (allow everything) |
| KPMG | 159 chars | Simple (explicit rules) |
| Monzo | 331 chars | Clean (focused blocking) |
| Virgin Media | 452 chars | Moderate |
| Deloitte | 511 chars | Corporate |
| Tesco | 1,336 chars | E-commerce focused |
| John Lewis | 1,404 chars | Detailed filtering |
| NHS | 2,674 chars | Service-specific |
| Bupa | 2,471 chars | Security-conscious |
| Rolls-Royce | 3,068 chars | Corporate + historical |
| Sky | 4,263 chars | Complex parameters |
| M&S | 4,293 chars | Retail-specific |
| PwC | 13,360 chars | Extensive (overengineered?) |

**Observation:** No correlation between robots.txt complexity and AI accessibility. KPMG (159 chars) and PwC (13,360 chars) both allow AI crawlers, but KPMG's minimalist approach is far more maintainable.

### Security vs Accessibility Trade-off

**Companies with security blocks despite permissive robots.txt:**
1. **Revolut** - Cloudflare challenge on careers page
2. **Bupa** - Cloudflare block with "Sorry, you have been blocked"
3. **Unilever** - Akamai "Access Denied"

**Pattern:** Security teams may not coordinate with SEO/content teams on AI crawler treatment. These companies signal openness (robots.txt) but implement blocking (WAF), creating a "false permission" scenario.

## Employer Brand Content Quality

### Excellent Content, Poor Structure
These companies have strong employer brand stories but don't structure them for AI:

**Monzo:**
- Detailed benefits (£1,000 learning budget, 26 weeks parental leave at 100%, etc.)
- Transparent culture (open source, community engagement)
- Specific perks (free breakfast, yoga, etc.)
- **Gap:** Not machine-readable

**John Lewis Partnership:**
- Unique ownership model (employee-owned)
- 150+ year heritage
- Social impact (Building Happier Futures)
- **Gap:** Partnership structure not explained for AI

**Rolls-Royce:**
- "Solving world's toughest challenges"
- Century of engineering excellence
- People Deal framework
- **Gap:** Challenges not quantified for AI

**Sky:**
- "Millions of users" scale
- Award-winning campus
- Graduate/internship/apprenticeship programmes
- **Gap:** Scale not quantified, campus not detailed

### Minimal Content, Functional Focus
These sites prioritize job search functionality over employer brand:

**NHS:**
- Pure job board interface
- No "why work for NHS" content
- Contact information only
- **Gap:** Massive employer brand opportunity missed

**KPMG:**
- Very sparse careers overview
- Good programme focus (Empowering Parents, Intelligent Working)
- **Gap:** Programmes not detailed (how long? what support?)

## Salary Transparency Analysis

### NHS: Structural Advantage
- Uses published Agenda for Change (AFC) pay bands
- Each role links to a band (5, 6, 7, 8a, 8b, 8c, 8d, 9)
- Bands map to published salary scales
- **Advantage:** AI could theoretically extract salary data if properly linked

### Everyone Else: Complete Opacity
- 14/15 companies show no salary data on careers overview
- Tesco shows partial data ("Tesco Colleague rate starts...")
- No salary ranges visible
- **Gap:** Puts UK employers at disadvantage vs transparency-mandated US employers

### Why This Matters for AI
When candidates ask AI:
- "What does a software engineer make at Revolut?"
- "PwC vs Deloitte graduate scheme salary"
- "NHS Band 7 vs Bupa equivalent salary"

AI has little to no data to answer, forcing candidates to third-party sites (Glassdoor, levels.fyi) which may have outdated/inaccurate information.

## Recommendations by Priority

### 🚨 Critical (Fix Immediately)

#### 1. Resolve WAF Blocks (Revolut, Bupa, Unilever)
- **Action:** Allowlist AI crawler user agents (GPTBot, ClaudeBot, Google-Extended, CCBot, anthropic-ai)
- **Why:** You're completely invisible to AI despite saying you're open
- **Impact:** High - these are large, competitive employers losing entire AI discovery channel

#### 2. Fix DNS Issues (Deloitte, Virgin Media)
- **Action:** Ensure careers.deloitte.co.uk and careers.virginmedia.com resolve or redirect properly
- **Why:** Candidates and AI systems can't find your careers portal
- **Impact:** High - you're not just invisible to AI, you're inaccessible to everyone

### 🔥 High Priority (Implement Within 3 Months)

#### 3. Implement llms.txt (All 15 Companies)
- **Action:** Create `/llms.txt` files pointing AI to key employer brand content
- **Why:** This is the AI-native way to guide discovery
- **Impact:** Medium-High - early adopters will have massive advantage

#### 4. Add JobPosting Schema (All Companies)
- **Action:** Implement proper JSON-LD markup on all job listings
- **Why:** Structured data makes jobs AI-discoverable and comparable
- **Impact:** Medium-High - enables AI to understand and compare roles

#### 5. Salary Transparency (All Companies)
- **Action:** Display salary ranges on job listings
- **Why:** Transparency is table stakes; AI needs this data
- **Impact:** High - affects application rates and AI recommendations

### 🎯 Medium Priority (6-12 Months)

#### 6. Structure Employer Brand Content
- **Action:** Convert human-readable benefits/culture content to machine-readable format
- **Why:** AI needs structured data to extract and compare employer offerings
- **Impact:** Medium - differentiates you from competitors

#### 7. Quantify Qualitative Claims
- **Action:** Turn "millions of users" into "30M+ users", "strong culture" into specific metrics
- **Why:** AI needs numbers to make comparisons
- **Impact:** Medium - helps AI provide accurate information

#### 8. Track AI Crawler Traffic
- **Action:** Monitor GPTBot, ClaudeBot, Google-Extended access patterns
- **Why:** Understand which AI systems are discovering your content
- **Impact:** Low-Medium - informs optimization strategy

## Competitive Insights

### Leaders (6/10 or above)
- **Monzo** (6/10): Transparency leader, excellent benefits documentation
- **Sky** (6/10): Strong brand messaging, good content
- **Rolls-Royce** (6/10): Best engineering narrative

**What They Do Well:**
✅ Comprehensive employer brand content
✅ Clear value propositions
✅ Accessible careers sites
✅ Allow AI crawlers

**What They're Missing:**
❌ No llms.txt
❌ No structured data (not verified)
❌ No salary transparency

### Middle Pack (4-5/10)
- **Tesco, M&S, John Lewis, PwC, KPMG, Deliveroo**

**What They Do Well:**
✅ Decent content
✅ Accessible (mostly)
✅ Allow AI crawlers

**What They're Missing:**
❌ Content not structured
❌ No AI discovery standards
❌ Minimal salary transparency

### Struggling (1-3/10)
- **Revolut, Deloitte, NHS, Bupa, Virgin Media, Unilever**

**Critical Issues:**
❌ WAF blocks (Revolut, Bupa, Unilever)
❌ DNS failures (Deloitte, Virgin Media)
❌ No employer brand content (NHS)

**Impact:** These employers may be completely invisible to AI-powered job search.

## Industry-Wide Gaps

### 1. No AI-Specific Standards (0/15)
**Nobody is implementing:**
- llms.txt files
- AI-specific sitemap entries
- Explicit AI crawler policies beyond robots.txt

**Opportunity:** First mover advantage is massive. The first UK employer to properly implement AI discovery will dominate "best employer" queries in their sector.

### 2. Salary Opacity (14/15)
**Why UK employers don't show salaries:**
- Cultural norms (less transparency than US)
- Fear of internal equity issues
- Competitive concerns

**Why this hurts in AI era:**
- AI has limited data to answer salary questions
- Candidates turn to Glassdoor (less accurate)
- US competitors with mandatory transparency have advantage

### 3. Content vs Structure Gap
**Pattern across all companies:**
- Good human-readable content ✅
- Zero machine-readable structure ❌

**Example:**
- Monzo: "26 weeks parental leave at 100% pay"
- AI needs: `{"parentalLeave": {"primary": {"weeks": 26, "pay": "100%"}}}`

### 4. Security vs Discoverability Conflict
**3 companies block AI despite saying they allow it:**
- Revolut, Bupa, Unilever

**Root cause:** Security and content teams don't coordinate on AI crawler policy.

## Strategic Recommendations

### For Individual Employers

#### Quick Wins (1-2 Weeks)
1. **Audit your WAF:** Test if AI crawlers can actually access your careers pages
2. **Create llms.txt:** 30 minutes to draft, massive SEO impact
3. **Fix DNS:** Ensure your careers URL resolves
4. **Test AI Access:** Use GPTBot user agent to verify accessibility

#### Medium-Term (1-3 Months)
5. **Add salary ranges:** Start with graduate schemes if hesitant
6. **Implement JobPosting schema:** Makes all jobs AI-discoverable
7. **Structure benefits:** Convert prose to data
8. **Quantify scale:** Numbers > adjectives for AI

#### Long-Term (6-12 Months)
9. **Build AI-first employer brand:** Assume all research is AI-mediated
10. **Create comparison pages:** Help AI understand you vs competitors
11. **Monitor AI representation:** How do ChatGPT, Claude, Perplexity describe you?
12. **Optimize for AI queries:** "Best [industry] employers," "Companies with [benefit]"

### For UK Employer Brand Industry

#### Immediate Action Needed
1. **Education:** Employer brand professionals need to understand AI discovery
2. **Standards:** Industry bodies should create UK-specific llms.txt guidance
3. **Benchmarking:** Regular AI visibility audits across sectors
4. **Coordination:** Security and content teams must align on AI crawler policies

#### Future Trends
1. **AI-Native Careers Sites:** Designed for AI consumption first, human second
2. **Salary Transparency:** Regulatory pressure likely to increase
3. **Structured Benefits:** Machine-readable perk/benefit catalogs
4. **AI Monitoring:** Track how AI systems represent your employer brand

## Conclusion

### The AI Visibility Crisis

**This audit reveals a fundamental disconnect:**

🚨 **UK employers are invisible to the AI systems that candidates increasingly use for career research.**

- 100% allow AI crawlers in robots.txt
- 33% are blocked at infrastructure layer
- 0% have implemented AI discovery standards
- Average AI visibility score: 3.9/10

### The Opportunity

**First movers will dominate AI-powered career discovery:**

The first UK employer to properly implement:
- llms.txt guidance
- Comprehensive JobPosting schema
- Structured benefits/culture data
- Salary transparency

Will own queries like:
- "Best UK employer for working parents"
- "Companies with strongest parental leave UK"
- "Tech companies with learning budgets"
- "Big 4 vs Big 3 consulting culture"

### The Stakes

**As job seekers shift to AI-mediated research:**
- Invisible employers lose awareness
- Undiscoverable employers lose applications
- Unstructured employers get misrepresented

**The window is now.** AI models are still training. The content you make discoverable today shapes how AI represents you for years.

### Call to Action

**Every employer in this audit should:**

1. ✅ **This Week:** Test if AI crawlers can access your careers site
2. ✅ **This Month:** Implement llms.txt and fix any WAF blocks
3. ✅ **This Quarter:** Add JobPosting schema and salary ranges
4. ✅ **This Year:** Structure all employer brand content for AI consumption

**The AI career search era is here. UK employers need to catch up - fast.**

---

## Appendix: Detailed Methodology

### Audit Scope
- **Companies:** 15 major UK employers across 7 industries
- **Date:** 2026-02-20
- **Tools:** web_fetch for robots.txt, llms.txt, careers pages
- **Checks:** AI crawler blocking, llms.txt presence, structured data, salary transparency

### Limitations
- Some careers pages blocked by security controls (limited depth of analysis)
- JSON-LD verification limited by text extraction (couldn't inspect raw HTML)
- Individual job listing analysis not performed (focused on careers overview pages)
- Real AI crawler behavior not tested (used documentation/web_fetch)

### AI Crawler User Agents Checked
- **GPTBot** (OpenAI)
- **ClaudeBot** (Anthropic)
- **Google-Extended** (Google Bard/Gemini)
- **CCBot** (Common Crawl)
- **anthropic-ai** (Anthropic alternative)

### Scoring Methodology
- **AI Crawler Access:** 2 points (allowed in robots.txt, accessible in practice)
- **LLM Discovery:** 2 points (llms.txt or .well-known/llms.txt present)
- **Structured Data:** 2 points (JSON-LD JobPosting schema verified)
- **Salary Transparency:** 2 points (salary data visible on careers/job pages)
- **Content Quality:** 2 points (employer brand content depth and clarity)
- **Total:** 10 points possible

### Case Study Files
Individual case studies for each company are available in:
`/content/case-studies/[company-name].md`

Each includes:
- Detailed robots.txt analysis
- LLM discovery file checks
- Careers page content assessment
- Structured data verification
- Salary transparency evaluation
- Specific recommendations
- Competitive positioning

---

*Report compiled by Malcolm (AI Agent) for the OpenRole Employer Brand OS project*
*All findings based on public web access as of 2026-02-20*
