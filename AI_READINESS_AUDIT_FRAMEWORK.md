# AI READINESS AUDIT FRAMEWORK FOR BRANDOS
**Purpose:** Lead generation tool that proves employer websites are invisible to AI agents  
**Target:** HR teams, talent acquisition leaders, marketing directors  
**Outcome:** Generate urgency for BrandOS implementation

---

## 🎯 AUDIT OVERVIEW

**The "AI Employment Visibility Audit"** tests how well a company's jobs appear in AI-powered search results, providing concrete evidence of visibility gaps and competitive disadvantages.

### **Audit Components:**
1. **Technical Infrastructure Analysis** (robots.txt, llms.txt, JSON-LD)
2. **LLM Response Testing** (query multiple AI agents)
3. **Competitive Comparison** (how competitors appear vs client)
4. **Compliance Assessment** (pay transparency, structured data)
5. **Visibility Score & Recommendations**

---

## 🔧 COMPONENT 1: TECHNICAL INFRASTRUCTURE AUDIT

### **Automated Technical Checks**

```python
# BrandOS Audit Engine (Python)
def technical_audit(domain):
    results = {
        'robots_txt': check_robots_txt(domain),
        'llms_txt': check_llms_txt(domain), 
        'career_pages': find_career_pages(domain),
        'json_ld': analyze_job_schema(domain),
        'sitemap': check_job_sitemap(domain)
    }
    return calculate_technical_score(results)

def check_robots_txt(domain):
    url = f"https://{domain}/robots.txt"
    response = fetch_url(url)
    if response.status_code == 404:
        return {'status': 'missing', 'score': 0, 'issues': ['No robots.txt found']}
    
    # Analyze robots.txt content
    content = response.text
    issues = []
    
    if '/careers' in content and 'Disallow' in content:
        issues.append('Career pages blocked from crawling')
    if 'GPTBot' not in content:
        issues.append('No AI-specific crawler permissions')
    if 'Sitemap:' not in content:
        issues.append('No sitemap declared')
        
    return {'status': 'present', 'score': calculate_score(issues), 'issues': issues}

def check_llms_txt(domain):
    url = f"https://{domain}/llms.txt" 
    response = fetch_url(url)
    if response.status_code == 404:
        return {'status': 'missing', 'score': 0, 'issues': ['No llms.txt found - AI agents have no guidance']}
    
    # Analyze llms.txt content for employment information
    content = response.text
    issues = []
    
    if 'career' not in content.lower() and 'job' not in content.lower():
        issues.append('No employment/career information in llms.txt')
    if 'salary' not in content.lower() and 'compensation' not in content.lower():
        issues.append('No salary/compensation guidance for AI')
        
    return {'status': 'present', 'score': calculate_score(issues), 'issues': issues}
```

### **Sample Technical Report Output:**

```
TECHNICAL INFRASTRUCTURE AUDIT: example-company.com

❌ robots.txt: BLOCKS CAREER PAGES
   - /careers disallowed for all crawlers
   - No AI-specific bot permissions (GPTBot, ChatGPT-User)
   - Missing job sitemap declaration

⚠️ llms.txt: MISSING EMPLOYMENT DATA  
   - File exists but no career/job information
   - No salary guidance for AI agents
   - General company info only

❌ JSON-LD Schema: NOT IMPLEMENTED
   - 0 job postings with structured data found
   - Career pages use basic HTML only
   - No salary range markup detected

TECHNICAL SCORE: 2/10 - Severe AI visibility issues detected
```

---

## 🤖 COMPONENT 2: LLM RESPONSE TESTING

### **Multi-LLM Query Framework**

**Test Queries for Each LLM:**
```python
test_queries = [
    f"Find software engineering jobs at {company_name}",
    f"What's the salary range for marketing roles at {company_name}?", 
    f"Tell me about remote work options at {company_name}",
    f"How do I apply for jobs at {company_name}?",
    f"What benefits does {company_name} offer employees?"
]

llm_endpoints = {
    'chatgpt': 'https://api.openai.com/v1/chat/completions',
    'claude': 'https://api.anthropic.com/v1/messages', 
    'perplexity': 'https://api.perplexity.ai/chat/completions',
    'gemini': 'https://generativelanguage.googleapis.com/v1beta/models'
}

def test_llm_visibility(company_name, company_domain):
    results = {}
    for llm_name, endpoint in llm_endpoints.items():
        llm_results = []
        for query in test_queries:
            response = query_llm(endpoint, query)
            analysis = analyze_response(response, company_domain)
            llm_results.append(analysis)
        results[llm_name] = aggregate_llm_results(llm_results)
    return results
```

### **Response Analysis Metrics**

```python
def analyze_response(response_text, company_domain):
    analysis = {
        'mentions_company': company_name.lower() in response_text.lower(),
        'has_job_info': any(term in response_text.lower() for term in 
                          ['position', 'role', 'job', 'hiring', 'opening']),
        'has_salary_info': any(term in response_text.lower() for term in 
                             ['salary', '$', 'compensation', 'pay', 'wage']),
        'cites_company_website': company_domain in response_text,
        'cites_job_boards': any(site in response_text for site in 
                              ['indeed.com', 'linkedin.com', 'glassdoor.com']),
        'cites_outdated_info': check_date_staleness(response_text),
        'response_quality': rate_response_quality(response_text),
        'citation_sources': extract_citations(response_text)
    }
    return analysis
```

### **Sample LLM Testing Report:**

```
LLM VISIBILITY AUDIT: Example Company

QUERY: "Find software engineering jobs at Example Company"

🤖 ChatGPT-4 Response:
❌ No current job listings found
⚠️ Cites 2023 Glassdoor data (outdated)
❌ No salary information provided
❌ Directs to Indeed instead of company website
VISIBILITY SCORE: 2/10

🤖 Claude Response: 
❌ "I don't have current job posting information for Example Company"
⚠️ Suggests checking LinkedIn (generic advice)
❌ No specific roles or salaries mentioned
VISIBILITY SCORE: 1/10

🤖 Perplexity Response:
⚠️ Found 1 generic job mention 
❌ Salary info from 2022 (severely outdated)
⚠️ Mixed company website + job board citations
VISIBILITY SCORE: 3/10

COMPETITIVE COMPARISON:
✅ Competitor A: All LLMs found 5+ current roles with salary ranges
✅ Competitor B: Direct citations to company career pages
❌ Example Company: Invisible to AI job search

CRITICAL FINDING: AI agents can't find your current jobs
```

---

## 📊 COMPONENT 3: COMPETITIVE BENCHMARKING

### **Automated Competitor Analysis**

```python
def competitive_audit(target_company, competitors):
    results = {}
    for competitor in competitors:
        competitor_score = {
            'technical_score': technical_audit(competitor['domain']),
            'llm_visibility': test_llm_visibility(competitor['name'], competitor['domain']),
            'job_count_visible': count_ai_visible_jobs(competitor),
            'salary_transparency': check_salary_disclosure(competitor),
            'response_quality': average_response_quality(competitor)
        }
        results[competitor['name']] = competitor_score
    
    # Generate comparative analysis
    return generate_competitive_report(target_company, results)
```

### **Sample Competitive Report:**

```
COMPETITIVE ANALYSIS: Example Company vs Market Leaders

AI VISIBILITY RANKINGS:
1. ✅ Competitor A: 8.5/10 (Strong JSON-LD, comprehensive llms.txt)
2. ✅ Competitor B: 7.2/10 (Good structured data, partial AI optimization) 
3. ⚠️ Competitor C: 4.1/10 (Basic setup, inconsistent visibility)
4. ❌ Example Company: 2.3/10 (Poor AI readiness across all metrics)

KEY GAPS IDENTIFIED:
- Competitors have 3x better AI visibility scores
- Competitor job postings appear first in AI search results  
- Example Company jobs buried under job board citations
- Salary information completely missing vs 80% competitor disclosure

BUSINESS IMPACT:
- Losing qualified candidates to better-optimized competitors
- AI-powered job seekers can't find your opportunities
- Missing out on 40%+ of modern job discovery traffic
```

---

## 💰 COMPONENT 4: COMPLIANCE & COST ANALYSIS

### **Pay Transparency Compliance Check**

```python
def compliance_audit(company_domain, company_locations):
    compliance_score = 0
    issues = []
    
    for location in company_locations:
        jurisdiction_laws = get_pay_transparency_laws(location)
        job_pages = find_job_pages(company_domain, location)
        
        for law in jurisdiction_laws:
            compliance_check = check_law_compliance(job_pages, law)
            if not compliance_check['compliant']:
                issues.append({
                    'location': location,
                    'law': law['name'], 
                    'violation': compliance_check['violation'],
                    'fine_range': law['penalty_range'],
                    'pages_affected': compliance_check['affected_pages']
                })
    
    return calculate_compliance_risk(issues)
```

### **Sample Compliance Report:**

```
PAY TRANSPARENCY COMPLIANCE AUDIT: Example Company

COMPLIANCE VIOLATIONS DETECTED:

🚨 New York (Local Law 144):
   - 23 job postings missing salary ranges
   - Potential fine: $1,000-$250,000 per violation 
   - Total exposure: $23,000-$5,750,000

🚨 California (SB 1162):
   - 31 job postings lack pay scale disclosure
   - Potential fine: $100-$10,000 per violation
   - Total exposure: $3,100-$310,000

🚨 Colorado (Equal Pay Act):
   - 18 remote-eligible roles missing compensation
   - Potential fine: $500-$10,000 per violation
   - Total exposure: $9,000-$180,000

TOTAL COMPLIANCE RISK: $35,100-$6,240,000

AUTOMATED BRANDOS SOLUTION VALUE:
✅ Eliminate compliance violations in 24 hours
✅ Ongoing monitoring and updates
✅ ROI: Prevent $35K+ in minimum fines
```

---

## 🎯 COMPONENT 5: OVERALL VISIBILITY SCORE

### **Scoring Algorithm**

```python
def calculate_overall_score(audit_results):
    weights = {
        'technical_infrastructure': 0.25,  # robots.txt, llms.txt, JSON-LD
        'llm_visibility': 0.35,           # Actual AI response quality
        'competitive_position': 0.20,     # vs competitors
        'compliance_status': 0.20         # Legal requirements
    }
    
    weighted_score = sum(
        audit_results[component] * weights[component] 
        for component in weights.keys()
    )
    
    return {
        'overall_score': weighted_score,
        'grade': assign_letter_grade(weighted_score),
        'priority_fixes': identify_critical_issues(audit_results),
        'estimated_roi': calculate_brandos_roi(audit_results)
    }
```

### **Sample Final Report Card:**

```
AI EMPLOYMENT VISIBILITY REPORT CARD

OVERALL SCORE: 2.8/10 (Grade: F)

COMPONENT BREAKDOWN:
❌ Technical Infrastructure: 1.5/10
   - Missing llms.txt employment data
   - No JSON-LD job schema  
   - Career pages blocked in robots.txt

❌ LLM Visibility: 2.1/10  
   - ChatGPT: Can't find current jobs
   - Claude: No salary information
   - Perplexity: Cites outdated data

❌ Competitive Position: 2.3/10
   - 3 major competitors significantly outrank you in AI search
   - Missing 40%+ of AI-driven job discovery traffic

🚨 Compliance Risk: 5.5/10
   - $35,100-$6,240,000 in potential fines
   - 72 job postings violate pay transparency laws

CRITICAL ACTIONS NEEDED:
1. Implement structured job data (JSON-LD)
2. Create employment-specific llms.txt 
3. Fix robots.txt to allow AI crawling
4. Add real-time salary compliance
5. Optimize for AI job search queries

ESTIMATED BRANDOS ROI:
💰 Compliance savings: $35,100+ (avoid minimum fines)
📈 Visibility improvement: 6.2x increase in AI job discovery
⚡ Implementation time: 24 hours vs 6-18 months internal development
```

---

## 🛠️ IMPLEMENTATION: AUDIT AUTOMATION TOOL

### **BrandOS Audit Platform Architecture**

```
Lead Generation Flow:
1. Prospect enters company domain on audit landing page
2. Automated audit runs (5-10 minutes)  
3. PDF report generated with findings + BrandOS solution
4. Email delivered with "Schedule consultation" CTA
5. Sales team follows up with detailed ROI discussion
```

### **Technical Stack:**

```python
# audit-engine/main.py
class BrandOSAudit:
    def __init__(self, domain, company_name):
        self.domain = domain
        self.company_name = company_name
        self.audit_id = generate_audit_id()
        
    def run_full_audit(self):
        # Technical infrastructure
        technical_results = self.technical_audit()
        
        # LLM visibility testing  
        llm_results = self.llm_visibility_test()
        
        # Competitive analysis
        competitive_results = self.competitive_analysis()
        
        # Compliance check
        compliance_results = self.compliance_audit()
        
        # Generate final score and recommendations
        final_report = self.compile_report(
            technical_results, llm_results, 
            competitive_results, compliance_results
        )
        
        # Create PDF and email
        pdf_path = self.generate_pdf_report(final_report)
        self.email_results(pdf_path)
        
        return final_report
```

### **Audit Landing Page Copy:**

```html
<h1>Is Your Company Invisible to AI Job Search?</h1>

<p>In 2026, 40% of job seekers use AI agents like ChatGPT and Perplexity 
to find opportunities. But most employer websites aren't optimized for 
AI discovery.</p>

<div class="audit-form">
  <h2>Free AI Employment Visibility Audit</h2>
  <p>See how your jobs appear (or don't appear) in AI search results</p>
  
  <input placeholder="Company website (e.g., example.com)">
  <input placeholder="Company name">
  <button>Analyze My AI Visibility</button>
  
  <p>✅ Instant report in 5 minutes<br>
     ✅ Compare vs competitors<br>
     ✅ Compliance risk assessment<br>
     ✅ ROI calculator included</p>
</div>
```

---

## 📈 SALES PROCESS INTEGRATION

### **Audit-to-Sale Workflow:**

**1. Lead Capture (Audit Request)**
- Prospect gets immediate value (free audit)
- BrandOS captures contact information
- Automated audit builds trust and authority

**2. Problem Validation (Audit Results)**
- Concrete evidence of poor AI visibility  
- Competitive disadvantage clearly shown
- Compliance risk quantified in dollars

**3. Solution Presentation (BrandOS Demo)**
- "Here's what your audit results would look like with BrandOS..."
- Before/after visibility comparison
- ROI calculation based on audit findings

**4. Urgency Creation (Competitive Analysis)**
- "Your competitors are already outranking you in AI search"
- "Each month of delay = more missed candidates"
- "Compliance fines increasing in Q2 2026"

### **Sample Sales Email (Post-Audit):**

```
Subject: [Company] AI Visibility Audit Results - Critical Issues Found

Hi [Name],

Your AI Employment Visibility Audit is complete, and I wanted to share 
the key findings immediately.

CRITICAL ISSUE: AI agents like ChatGPT can't find [Company]'s current job openings.

Key findings from your audit:
❌ Overall AI Visibility Score: 2.8/10 (Grade: F)
❌ 0 jobs visible in ChatGPT/Claude search results
❌ Competitors outrank you 3:1 in AI job discovery
🚨 $35,100+ compliance risk exposure detected

The full report is attached, but here's what this means:

1. You're missing 40%+ of modern job seekers (AI-powered search)
2. Qualified candidates find competitors first
3. Potential fines for pay transparency violations

GOOD NEWS: This is fixable in 24 hours with BrandOS.

I've included a "before/after" comparison showing how your visibility 
would improve with our Smart Pixel solution.

Are you available for a 15-minute call tomorrow to discuss the 
findings and solution?

Best regards,
[Sales Rep]

P.S. - The audit found that [Specific Competitor] has 8.5/10 AI visibility. 
They're capturing candidates who should be finding you.
```

---

## 🎯 COMPETITIVE ADVANTAGE OF AUDIT APPROACH

### **Why This Audit Beats Traditional Sales:**

1. **Immediate Value** - Prospect gets actionable insights for free
2. **Concrete Evidence** - Not theoretical - actual AI testing results
3. **Competitive Pressure** - Shows exactly how competitors are winning
4. **Quantified ROI** - Specific fine amounts and visibility improvements
5. **Urgency Creation** - "Your jobs are invisible right now"

### **Positioning vs Competitors:**

**Traditional SEO audits:** Generic website analysis  
**BrandOS audit:** Employment-specific AI visibility analysis

**HR consulting:** Theoretical best practices  
**BrandOS audit:** Real AI agent testing with concrete results

**ATS vendors:** Internal process optimization  
**BrandOS audit:** External visibility and compliance focus

---

## 🚀 IMPLEMENTATION TIMELINE

### **Phase 1 (Weeks 1-2): Audit Tool Development**
- Build technical infrastructure checking
- Integrate LLM APIs for response testing
- Create PDF report generation
- Design audit landing page

### **Phase 2 (Weeks 3-4): Lead Generation Launch**  
- Deploy audit tool publicly
- Begin content marketing (LinkedIn, HR communities)
- A/B test audit landing page copy
- Refine sales follow-up sequences

### **Phase 3 (Weeks 5-8): Scale and Optimize**
- Automate competitive analysis
- Add more LLM endpoints (new AI search engines)
- Expand compliance checking (international laws)
- Build audit API for partner integrations

**Target:** 100 audits/month → 20 qualified leads → 5 customers

This audit approach transforms BrandOS from "another HR tech tool" into **"the solution to a critical problem you didn't know you had."**

---

**The audit becomes both lead generation AND product validation - proving the BrandOS value proposition with every single prospect interaction.**