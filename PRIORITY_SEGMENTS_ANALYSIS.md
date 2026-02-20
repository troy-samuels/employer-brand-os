# Rankwell Priority Segments — Targeting Analysis

**2.5M Contact Database Breakdown for GTM Strategy**

---

## 📊 Executive Summary

Based on analysis of 50,000 sampled contacts (extrapolated to full 2.5M database):

| Metric | Value |
|--------|-------|
| **Total Database** | 2,492,915 contacts |
| **Valid Emails** | 2,448,863 (98.23%) |
| **UK Contacts** | 196,791 (7.89%) |
| **Decision Makers** | 978,270 (39.24%) |
| **UK Decision Makers** | **77,225 (3.10%)** ⭐ **Primary target** |
| **HR/TA Department** | 585,340 (23.48%) |

---

## 🎯 Tier 1: UK Decision Makers (Primary Target)

### Segment Definition
```sql
WHERE 
  mailing_country IN ('UK', 'GB')
  AND seniority_level IN ('executive', 'director')
  AND department IN ('hr', 'recruiting', 'talent', 'people')
  AND email_bounced = FALSE
  AND unsubscribed = FALSE
```

### Projected Size
**18,000 contacts** (after filtering for HR/TA department within UK decision makers)

### Breakdown by Seniority
| Level | Titles | Count | % |
|-------|--------|-------|---|
| **Executive** | CEO, Chief People Officer, VP HR, SVP Talent | 5,100 | 28% |
| **Director** | Director of HR, Head of Talent, Head of People | 12,900 | 72% |

### Sample Titles (Actual from Data)
- Chief Executive Officer
- Chief People Officer  
- VP, Human Resources
- Vice President, Talent Acquisition
- Director, Human Resources
- Director of Talent Acquisition
- Head of People
- Head of HR
- HR Director
- Talent Director

### Geographic Distribution (Within UK)
| City (Top 10) | Estimated Contacts |
|---------------|-------------------|
| London | 4,500 |
| Manchester | 900 |
| Birmingham | 720 |
| Leeds | 540 |
| Glasgow | 450 |
| Edinburgh | 360 |
| Bristol | 360 |
| Liverpool | 270 |
| Sheffield | 180 |
| Other UK | 9,720 |

### Company Size Distribution
| Size | Employees | Contacts | Notes |
|------|-----------|----------|-------|
| Enterprise | 1000+ | 3,600 | Best fit for £497/mo tier |
| Mid-Market | 250-999 | 7,200 | Mix of Enterprise/Pro |
| SMB | 50-249 | 5,400 | Pro tier (£297/mo) |
| Small | <50 | 1,800 | Starter tier (£97/mo) |

### Industry Distribution (Top 10)
| Industry | Contacts | Priority |
|----------|----------|----------|
| Retail | 2,700 | ⭐⭐⭐ High (job site heavy) |
| Technology | 1,800 | ⭐⭐⭐ High (early AI adopters) |
| Healthcare | 1,620 | ⭐⭐ Medium (compliance concerns) |
| Financial Services | 1,440 | ⭐⭐⭐ High (budgets available) |
| Manufacturing | 1,260 | ⭐ Low (slower adoption) |
| Professional Services | 1,080 | ⭐⭐ Medium |
| Education | 900 | ⭐ Low (tight budgets) |
| Hospitality | 720 | ⭐⭐ Medium (high turnover) |
| Construction | 630 | ⭐ Low |
| Other | 5,850 | Mixed |

### Messaging Strategy for Tier 1

**Pain Points:**
1. High cost-per-hire (avg £3,000-£5,000 in UK)
2. Talent shortages (4.2% unemployment, candidate-driven market)
3. Job board saturation (Indeed/LinkedIn ads not converting)
4. Employer brand invisibility (not appearing in AI search)
5. Budget pressure (HR tech stack bloat)

**Value Proposition:**
> "Your company is invisible to 68% of job seekers. Here's proof — and a 48-hour fix."

**Call to Action:**
> "Run a free AI employer brand audit. Takes 60 seconds. See how ChatGPT, Perplexity, and Claude describe your company to candidates."

**Expected Conversion:**
- **Email Open Rate:** 30% (5,400 opens)
- **Audit Completions:** 635
- **Trial Signups:** 51
- **Paid Conversions:** 15
- **Month 1 Revenue:** £7,455 MRR

---

## 🎯 Tier 2A: UK Managers (Secondary Target)

### Segment Definition
```sql
WHERE 
  mailing_country IN ('UK', 'GB')
  AND seniority_level = 'manager'
  AND department IN ('hr', 'recruiting', 'talent', 'people')
```

### Projected Size
**32,000 contacts**

### Breakdown
| Level | Titles | Count |
|-------|--------|-------|
| Senior Manager | Senior HR Manager, Senior TA Manager | 9,600 |
| Manager | HR Manager, Talent Manager, Recruiting Manager | 16,000 |
| Team Lead | TA Lead, HR Team Lead | 6,400 |

### Sample Titles
- Human Resources Manager
- HR Manager
- Talent Acquisition Manager
- Recruiting Manager
- Senior HR Manager
- People Manager
- HR Team Lead

### Why Target Them?
1. **Influencers** — Don't control budgets but influence purchasing
2. **Day-to-day operators** — Feel pain points most acutely
3. **Champions** — Can advocate internally to decision makers
4. **Trial users** — More likely to test free tools
5. **Future decision makers** — Building relationship early

### Messaging Strategy
**Pain Points:**
1. Drowning in admin work (posting jobs, screening CVs)
2. Pressure to "do more with less"
3. Can't get budget for tools that would help
4. Blamed when hiring goals not met
5. Frustrated by lack of visibility/credit

**Value Proposition:**
> "Free your time from repetitive hiring tasks. Let AI handle employer brand visibility while you focus on closing candidates."

**Call to Action:**
> "Free audit: See where your employer brand ranks vs competitors. Share the results with your boss."

**Expected Conversion:**
- Lower intent than Tier 1 (not budget holders)
- But higher volume (32K vs 18K)
- Focus on self-service (Starter/Pro tiers)
- **Expected:** 9 conversions, £1,800 MRR

---

## 🎯 Tier 2B: US Decision Makers (Expansion Target)

### Segment Definition
```sql
WHERE 
  mailing_country IN ('US', 'United States')
  AND seniority_level IN ('executive', 'director')
  AND department IN ('hr', 'recruiting', 'talent', 'people')
  AND company_size_estimate >= 500 -- enterprise only
```

### Projected Size
**220,000 contacts** (before company size filter)
**88,000 contacts** (enterprise only, 40% of total)

### Why US?
1. **Market size:** 13x larger than UK
2. **Budgets:** US enterprise HR budgets 2-3x UK
3. **Early adopters:** US companies lead in HR tech adoption
4. **Remote work:** Location less relevant post-pandemic
5. **Pricing power:** Can command higher prices ($697/mo vs £497)

### US-Specific Challenges
1. **Time zones:** Email send times need localization
2. **Competition:** More saturated HR tech market
3. **Compliance:** CAN-SPAM (less strict than GDPR)
4. **Messaging:** Different pain points (EEOC, DE&I, ATS integration)

### US Messaging Adaptations
**Subject Line:**
> "{{companyName}} is invisible to AI hiring assistants"

**Body Hook:**
> "With 4.2M unfilled jobs in the US, the only moat left is employer brand visibility. Yet 73% of companies are invisible to AI."

**Social Proof:**
> "Sofology (UK furniture retailer) went from 0 to 180% applicant quality in 48 hours. Same playbook works in the US."

**Expected Conversion:**
- Lower engagement than UK (colder audience)
- But higher LTV (bigger budgets)
- **Expected:** 15 conversions, £7,500 MRR

---

## 🎯 Tier 3: Global Volume (Awareness Play)

### Segment Definition
```sql
WHERE 
  department IN ('hr', 'recruiting', 'talent', 'people')
  AND seniority_level IN ('manager', 'specialist')
  AND email_bounced = FALSE
  AND unsubscribed = FALSE
```

### Projected Size
**585,000 contacts** globally

### Geographic Breakdown
| Region | Contacts | Priority |
|--------|----------|----------|
| US | 390,000 | ⭐⭐⭐ |
| UK | 32,000 (managers) | ⭐⭐⭐ |
| Canada | 35,000 | ⭐⭐ |
| India | 45,000 | ⭐ (low buying power) |
| Germany | 12,000 | ⭐⭐ |
| France | 10,000 | ⭐⭐ |
| Australia | 8,000 | ⭐⭐ |
| Other | 53,000 | ⭐ |

### Seniority Breakdown
| Level | Count | Conversion Potential |
|-------|-------|---------------------|
| Manager | 220,000 | Medium |
| Specialist | 160,000 | Low-Medium |
| Coordinator | 120,000 | Low |
| Analyst | 85,000 | Low |

### Strategy
**Goal:** Brand awareness + self-service funnel

**Approach:**
1. Single-email campaign (not sequences)
2. Focus on free audit (no sales pressure)
3. Let product sell itself
4. Capture viral sharing (social proof)
5. Build remarketing audience

**Messaging:**
> "Free AI employer brand report. See how ChatGPT describes your company. Takes 60 seconds."

**Expected Conversion:**
- Very low conversion rate (0.008%)
- But massive volume (585K contacts)
- **Expected:** 46 conversions, £4,460 MRR
- **Bonus:** 10K+ audit completions = SEO/social data goldmine

---

## 🚫 Segments to AVOID

### Low-Value Segments

#### 1. Non-HR Departments
**Size:** 1,907,575 contacts (76.52%)

**Why Avoid:**
- Not relevant to employer brand tool
- High spam complaint risk
- Low conversion potential
- Damages sender reputation

**Sample Titles in This Bucket:**
- Marketing Manager
- Sales Director
- Operations Manager
- CFO (unless also responsible for People function)

**Action:** Exclude from all campaigns

---

#### 2. "Other" Seniority (No Clear Title)
**Size:** 308,265 contacts (12.37%)

**Why Avoid:**
- Can't segment messaging
- Unknown buying power
- Likely outdated data
- Higher bounce rates

**Sample Titles:**
- "Owner" (vague — owner of what?)
- "Partner" (law firm? consulting? unclear)
- "HR" (no context)
- Blank titles

**Action:** Exclude unless they have recognizable company + email domain

---

#### 3. Personal Email Addresses
**Size:** ~50,000 (estimated 2%)

**Why Avoid:**
- GDPR risk (not B2B)
- CAN-SPAM risk
- Low intent (not decision makers)
- Ethical concerns

**Sample Patterns:**
- @gmail.com
- @yahoo.com
- @hotmail.com
- @aol.com

**Action:** Filter out before sending

---

#### 4. Competitors
**Size:** Unknown (need to identify manually)

**Why Avoid:**
- Intelligence gathering risk
- Wasted send (they won't convert)
- Awkward positioning

**Sample Companies:**
- HiBob
- Personio
- BambooHR
- Workday (recruiting module)
- Any job board (Indeed, LinkedIn, etc.)

**Action:** Create suppression list

---

## 📈 Segment Performance Predictions

### Expected Campaign Performance by Tier

| Metric | Tier 1 (UK DM) | Tier 2A (UK Mgr) | Tier 2B (US DM) | Tier 3 (Volume) |
|--------|---------------|-----------------|-----------------|-----------------|
| **Contacts** | 18,000 | 32,000 | 88,000 | 585,000 |
| **Open Rate** | 30% | 20% | 25% | 10% |
| **Click Rate** | 6% | 4% | 5% | 2% |
| **Audit Completion** | 635 | 512 | 1,760 | 11,700 |
| **Trial Signups** | 51 | 41 | 141 | 234 |
| **Paid Conversions** | 15 | 9 | 15 | 46 |
| **Average Deal Size** | £497 | £200 | £497 | £97 |
| **MRR Generated** | £7,455 | £1,800 | £7,455 | £4,462 |
| **Cost per Customer** | £0 | £0 | £0 | £0 |
| **LTV (12 mo)** | £5,964 | £2,400 | £5,964 | £1,164 |

**Notes:**
- Tier 1 = Highest intent, best fit, lowest volume
- Tier 2A = Influence buyers, mid intent
- Tier 2B = High intent, but colder (US market)
- Tier 3 = Lowest intent, highest volume

---

## 🎯 Recommended Sequencing

### Month 1: Tier 1 Only
**Focus:** UK Decision Makers (18K)

**Rationale:**
- Highest conversion rate
- Fastest feedback loop
- Perfect product-market fit
- Build case studies for later tiers

**Goal:** 15 paying customers, £7.5K MRR

---

### Month 2: Tier 1 + Tier 2A
**Add:** UK Managers (32K)

**Rationale:**
- Same market, different buyer persona
- Test messaging variations
- Build volume for social proof
- Managers share results upward

**Goal:** +9 customers, £9.3K cumulative MRR

---

### Month 3: Add Tier 2B (US)
**Add:** US Decision Makers (88K, enterprise only)

**Rationale:**
- Proven model in UK first
- Ready to scale to larger market
- US case studies available (if any early adopters)
- Revenue acceleration

**Goal:** +15 customers, £16.8K cumulative MRR

---

### Month 4: Tier 3 (Volume)
**Add:** Global HR/TA (585K)

**Rationale:**
- Self-service funnel proven
- Audit tool is robust
- Brand awareness play
- Data collection at scale

**Goal:** +46 customers, £21.3K cumulative MRR

---

## 🧮 Segment Economics

### Cost per Segment (Resend Pricing)

Resend charges $1 per 1,000 emails (after free tier).

| Tier | Contacts | Cost | Customers | Revenue | ROI |
|------|----------|------|-----------|---------|-----|
| Tier 1 | 18,000 | £15 | 15 | £7,455 | 497x |
| Tier 2A | 32,000 | £26 | 9 | £1,800 | 69x |
| Tier 2B | 88,000 | £71 | 15 | £7,455 | 105x |
| Tier 3 | 585,000 | £473 | 46 | £4,462 | 9x |
| **Total** | **723,000** | **£585** | **85** | **£21,172** | **36x** |

**Note:** Free tier covers first 10K emails, so actual cost is lower.

---

## 🔬 Data Quality by Segment

### Email Validity
| Segment | Valid Emails | Invalid | Blank |
|---------|--------------|---------|-------|
| UK Decision Makers | 98.5% | 0.5% | 1.0% |
| UK Managers | 98.0% | 1.0% | 1.0% |
| US Decision Makers | 98.2% | 0.8% | 1.0% |
| Global Volume | 97.5% | 1.5% | 1.0% |

### Completeness Score
| Segment | Avg Score | Fields Filled |
|---------|-----------|---------------|
| UK Decision Makers | 0.72 | 8/11 fields |
| UK Managers | 0.68 | 7.5/11 fields |
| US Decision Makers | 0.70 | 7.7/11 fields |
| Global Volume | 0.62 | 6.8/11 fields |

**Key Insight:** Higher seniority = better data quality (executives have more complete profiles)

---

## 🎁 Bonus Segment: "AI Early Adopters"

### Segment Definition
Contacts whose **job titles** mention AI/automation:

**Example Titles:**
- Head of AI Talent Acquisition
- Director of People Analytics
- VP, HR Technology
- Chief People & Technology Officer

### Projected Size
**~5,000 contacts** (0.2% of database)

### Why Target Separately?
1. **Ultra-high intent** — Already investing in AI
2. **Budget allocated** — Have HR tech budgets
3. **Champions** — Will evangelize product
4. **Case study potential** — Great for PR

### Messaging
> "You're ahead of 99% of HR leaders on AI. But is your employer brand optimized for ChatGPT and Perplexity?"

**Expected Conversion:** 10%, £2,485 MRR

---

## 📋 Implementation Checklist

### Data Preparation
- [ ] Import full 2.5M contacts to Supabase
- [ ] Run segmentation query for Tier 1
- [ ] Export Tier 1 to CSV (for Resend upload)
- [ ] Validate email addresses (bounce check)
- [ ] Remove duplicates (across all segments)
- [ ] Suppress unsubscribes (if any existing)
- [ ] Suppress competitors (manual list)
- [ ] Remove personal email domains

### Segment Tagging
- [ ] Tag contacts with `segment` field (tier_1, tier_2a, tier_2b, tier_3)
- [ ] Tag with `seniority_level` (executive, director, manager, specialist)
- [ ] Tag with `department` (hr, recruiting, talent, people)
- [ ] Tag with `country_code` (UK, US, etc.)
- [ ] Tag with `is_decision_maker` (true/false)

### Campaign Setup
- [ ] Create Tier 1 campaign in Supabase
- [ ] Link to segment (UK Decision Makers)
- [ ] Set daily send limit (start with 500/day)
- [ ] Configure sequence (3 emails, days 0, 3, 7)
- [ ] Set up tracking (opens, clicks, audits)

---

## 🎯 Final Recommendation

**Start with Tier 1: 18,000 UK Decision Makers**

**Why:**
1. Highest ROI (497x)
2. Best product-market fit
3. Fastest validation
4. Lowest risk (small volume, high quality)
5. Builds case studies for US expansion

**Timeline:**
- Week 1: Import + segment data
- Week 2: Launch Tier 1 (18K contacts)
- Week 3: Analyze results, iterate
- Week 4: Scale to Tier 2 if Tier 1 successful

**Success Criteria for Tier 1:**
- Open rate >25%
- Audit completions >500
- Trial signups >40
- Paid conversions >10
- Spam complaints <5

**If successful, expand to Tier 2. If not, iterate on Tier 1 messaging.**

---

**Document Version:** 1.0  
**Created:** 2025-02-19  
**For:** Troy Goldman / Rankwell  
**Purpose:** Segment targeting strategy for 2.5M contact database
