# BrandOS: Strategy Document
**February 2026**

---

## 1. One-Line Pitch

**BrandOS is the verified employer data layer for AI.** When candidates ask ChatGPT, Claude, or Perplexity about a company, BrandOS ensures they get the truth — not a hallucination stitched together from stale Glassdoor reviews and blocked job boards.

---

## 2. The Problem

### AI is now the first stop for candidates.

In 2026, candidates don't Google a company and read ten links. They ask AI. And AI gives them one confident answer — assembled from whatever it can find. The problem: it can't find much.

### The data sources AI relies on are either blocked or broken.

We audited every major employment platform on 6-7 February 2026. The results:

| Platform | Blocks AI crawlers? | Has llms.txt? | What AI can access |
|---|---|---|---|
| **Glassdoor** | Yes — explicitly blocks GPTBot, Claude, Perplexity, Cohere | No | Only blog and about pages. Zero salary, review, or company data. |
| **Indeed** | Yes — explicitly blocks GPTBot, anthropic-ai, Cohere | No | Blocks all job listings, company pages, salary data across every language. |
| **LinkedIn** | Yes — blanket blocks all crawlers | No | Only blog posts and help pages. Jobs, salaries, profiles all walled off. |
| **Totaljobs** | No AI-specific rules (config from 2022) | No | Mostly blocked under restrictive defaults. |
| **Monster** | No AI-specific rules | No | Partial access under generic rules. No structured data. |
| **Workday** (ATS) | No AI-specific rules | No | Generic access. Zero AI-readiness provisions. |
| **Reed.co.uk** | No — explicitly welcomes AI crawlers | **Yes** | Full access. The only major UK job site with llms.txt. |
| **ZipRecruiter** | No — explicitly allows GPTBot, ClaudeBot | No | Open to crawling but no structured data format. |

**The three largest employment data sources on the planet — Glassdoor, Indeed, LinkedIn — have deliberately blocked every major AI agent from their data.**

This isn't accidental. Glassdoor categorises bots into "High-Quality AI" and "Low-Quality AI" tiers, then blocks both from all salary and review data. Indeed names each AI crawler individually and walls off every job listing. LinkedIn's robots.txt opens with: *"The use of robots or other automated means to access LinkedIn without express permission is strictly prohibited."*

### The result: AI is making things up.

When a candidate asks "What does Acme Corp pay a Senior Developer?", the AI has no access to current data from any major platform. So it guesses — using stale training data, fragments from old job postings, and unverified Glassdoor submissions from years ago.

We call this the **Shadow Salary** — the number AI thinks you pay, which may bear no resemblance to reality. And candidates are making career decisions based on it.

### AI referral traffic is already flowing despite the blocks.

| Platform | Monthly visits from ChatGPT |
|---|---|
| Indeed (global) | 882,000 |
| Glassdoor | 21,000 |
| Totaljobs | 16,000 |
| Reed | 14,000 |

*Source: SEMrush, December 2025*

Candidates are asking AI about employers. The demand is real. The question is whether AI responses contain verified data or hallucinated guesses.

### No employer controls their own narrative.

We tested employer websites separately. The findings:
- 0% of tested companies have employment-specific llms.txt files
- Almost no careers pages have proper JSON-LD structured data
- ATS-generated pages output code soup that AI cannot parse
- Even companies building AI (Google, Anthropic) don't optimise their own employer brand for AI discovery

---

## 3. The Solution

### BrandOS fills the gap between employers and AI.

Employers enter their verified data once. BrandOS makes it available to every AI platform — automatically, continuously, in every format AI understands.

### What BrandOS creates from one onboarding form:

| Output | What it does | Who reads it |
|---|---|---|
| **Hosted Profile** (`brandos.ai/company/[slug]`) | AI-optimised employer page with JSON-LD structured data | Perplexity, ChatGPT (browsing), Gemini, candidates |
| **Public API Endpoint** (`brandos.ai/api/v1/employers/[slug]`) | Structured JSON, public read | AI agents with tool-use, recruitment platforms, aggregators |
| **llms.txt** | Structured guidance for AI about the employer | All AI crawlers |
| **Embed Snippet** | Injects JSON-LD into employer's existing careers page | Google, all search-connected AI |
| **Knowledge Graph Push** | Submits verified data to Wikidata + Google Business Profile | Future AI training data, Google Knowledge Panel |

### The employer does five things:

1. Fill in a form — company, roles, salary ranges, benefits, culture (5 minutes)
2. Drop a script tag on their careers page (optional, 2 minutes)
3. Connect their ATS (optional, one OAuth click)
4. Check their dashboard on Monday morning
5. Confirm salary ranges once a quarter

Everything else happens invisibly.

---

## 4. Three Customer Types

BrandOS serves three distinct employers with one product:

### A. Small employer with no website
**Who:** 1-200 employees. HR manager posts directly to Indeed or LinkedIn. No careers page.

**Problem:** Their entire employer presence is locked inside platforms that block AI. They don't exist in the AI layer.

**Solution:** BrandOS IS their AI-visible careers page. The hosted profile at `brandos.ai/company/[slug]` is their employer brand in AI.

**Pitch:** *"You spend money posting to Indeed. Indeed blocks AI from reading those posts. Post on BrandOS too — takes 5 minutes, now AI can find you."*

### B. Mid-size employer with a careers page
**Who:** 200-2,000 employees. Has an HR team and a careers section on their website.

**Problem:** Their careers page exists but AI can't read it. ATS-generated pages have no structured data. They're invisible despite having a web presence.

**Solution:** Audit their site, inject structured data via the embed snippet, create the hosted profile as a secondary source, monitor what AI says.

**Pitch:** *"Your careers page is invisible to AI. We make it readable in 5 minutes — then monitor what AI says about you every week."*

### C. Brand-focused employer
**Who:** Any size, but typically 500+. Employer branding team. May not be actively hiring.

**Problem:** They care about what AI tells candidates about their culture, reputation, and compensation. Not necessarily about job listings.

**Solution:** Company profile focused on brand data — culture, benefits, compensation philosophy, values. Monitoring focused on sentiment and accuracy, not job visibility.

**Pitch:** *"You spend six figures on employer branding. Then AI tells a different story. BrandOS makes sure AI tells yours."*

---

## 5. Product: The Free Audit Tool

The audit is the entire top of funnel. It proves the problem and creates the sale.

### How it works:

1. Employer enters their company name
2. BrandOS queries ChatGPT, Claude, and Perplexity with standardised prompts about that employer
3. Simultaneously crawls the employer's own website for structured data
4. Displays headline results on screen:
   - Shadow Salary Gap score
   - AI Accuracy Score
   - 2-3 example AI responses with inaccuracies highlighted
5. "Enter your email for the full report"
6. Full report sent via email within 2 minutes
7. **In the background:** BrandOS pre-builds a draft hosted profile using data scraped from the employer's own site
8. Email includes: "We've started building your AI employer profile → Verify your data and go live"
9. Employer clicks through to a pre-filled onboarding form — confirms details, adds salary ranges, publishes

### Why this converts:

The employer isn't signing up for a product. They're claiming something that already exists for them. They see the problem (the audit), see the solution (the draft profile), and just need to verify and publish. The gap between "interested" and "customer" is one click.

### 4-6 weeks later:

BrandOS re-runs the audit automatically. When AI responses improve (because structured data has been crawled), the employer gets a second email: "Your Shadow Salary Gap dropped from 28% to 9%." That's the conversion from free to paid.

---

## 6. Product: LLM Visibility Monitoring

The monitoring engine is why employers keep paying. It answers: *"What does AI say about us this week?"*

### How it works:

- Standardised prompt bank per employer — salary, culture, benefits, comparison queries
- Weekly automated runs against ChatGPT, Claude, Perplexity, Gemini APIs
- Response parsing extracts salary figures, sentiment, factual claims
- Comparison engine scores responses against verified data

### Three core metrics:

| Metric | What it measures | Example |
|---|---|---|
| **Shadow Salary Gap** | Difference between AI's salary claim and verified data | AI says £65K, verified £85K = 23% gap |
| **Accuracy Score** | % of AI claims matching verified data | 40% = AI is wrong more than right |
| **Mention Rate** | How often employer appears in relevant AI queries | Competitors show up, you don't |

### Weekly Monday Morning email:

One-page digest: scores, trends, what AI got wrong, what improved. Designed for executives, not analysts.

### Cost to run:

~£0.02/week per employer. At 10,000 employers = £200/week. Negligible.

---

## 7. Pricing

Two tiers. No decision paralysis.

| Tier | Price | What you get |
|---|---|---|
| **Free** | £0 | Hosted profile + API endpoint + up to 3 roles + one-time AI audit |
| **Pro** | £199/month | Everything unlimited — roles, weekly monitoring, brand tracking, embed snippet, email digests, alerts |

**Agency pricing:** £99/month per client managed. Minimum 10 clients. Multi-client dashboard.

### Why this works:

- **Free tier seeds the network effect.** Every free employer makes the API more valuable. More data = more useful for AI agents = more reason to be on BrandOS.
- **Single paid tier removes friction.** Low enough for any HR budget to approve without procurement. High enough to build a real business.
- **The maths:** 1,000 paying customers = £199K MRR = £2.4M ARR.

---

## 8. Competitive Positioning

### Against Glassdoor:
*"They block AI from seeing your data. We make sure AI gets your verified data."*

Glassdoor's business model depends on owning employee-submitted data. They will never give AI free access to it — that's their moat. BrandOS doesn't compete with Glassdoor for data. We give employers a channel that Glassdoor structurally can't provide.

### Against Indeed:
*"Indeed won't let AI read your job listings. We make your employer brand the first thing AI sees."*

Indeed blocks AI crawlers from all job listings. A company posting exclusively to Indeed is invisible in the AI layer. BrandOS is the complementary channel — not replacing Indeed, but making the employer visible where Indeed refuses to.

### Against LinkedIn:
*"LinkedIn walls off your company page from AI agents. We give AI your real story."*

LinkedIn blocks everything — jobs, salary explorer, profiles, company data. BrandOS fills the gap LinkedIn leaves.

### Against ATS providers (Workday, Greenhouse, Lever):
*"Your ATS makes your careers page invisible to AI. BrandOS makes it readable."*

No ATS has AI-readiness provisions. Every company using Workday's careers portal is invisible to AI by default. BrandOS can partner with or sell through ATS providers as the AI-optimisation layer.

### Against Reed.co.uk:
Reed is the only job site that gets it — they have llms.txt, welcome AI crawlers, and built reed.ai. But Reed serves job seekers and recruiters. BrandOS serves employers directly. Reed validates our thesis; they're not the competition.

---

## 9. Defensibility & Network Effects

### The moat compounds:

1. **Data network effect.** More employers on BrandOS = more valuable the API for AI agents. At 10,000 employers, one API query returns verified data on all of them. AI agents will default to BrandOS as a source.

2. **Monitoring data compounds.** Every week of monitoring data makes trend analysis, accuracy tracking, and competitive benchmarking more valuable. Can't be replicated overnight.

3. **Standard-setting.** If BrandOS defines how employer data is structured for AI, we become the standard. First mover in a category that doesn't exist yet.

4. **Switching costs.** Once an employer's AI visibility depends on BrandOS (hosted profile, API, monitoring), switching means going invisible again.

### What's NOT defensible (and that's fine):

- robots.txt changes — anyone can do this
- llms.txt files — easy to generate
- JSON-LD on a single page — a developer can add this

These are features. The platform — verified data network + monitoring + API — is the product.

---

## 10. Go-to-Market

### Phase 1: Prove it works (Month 1-2)

- Launch free audit tool
- Target 100 audits in first 2 weeks
- Convert 10 paying customers
- Focus on UK mid-market (200-2,000 employees)
- Content: publish the robots.txt research as blog articles
  - "We Checked: Glassdoor Blocks ChatGPT From Seeing Your Salary Data"
  - "The AI Recruitment Blackout: Why Indeed, Glassdoor, and LinkedIn Are Invisible to ChatGPT"
  - "Your Career Page Is Invisible to AI — Here's the Proof"
  
### Phase 2: Build the network (Month 3-6)

- Agency partnerships (recruitment marketing agencies)
- ATS integrations (Greenhouse, Lever first)
- Expand free tier to accelerate network growth
- Target: 100 paying customers, 500 free profiles

### Phase 3: Become the standard (Month 6-12)

- Enterprise sales (multi-location, compliance-driven)
- International expansion (EU Pay Transparency Directive, June 2026)
- AI platform partnerships (OpenAI, Anthropic, Perplexity)
- Target: 500 paying customers, 5,000 free profiles

---

## 11. Regulatory Tailwinds

Pay transparency legislation is accelerating globally:

- **New York City** — Salary ranges required on all job postings (active)
- **California** — Mandatory for 15+ employees (active)
- **Colorado** — Statewide mandatory salary posting (active)
- **EU Pay Transparency Directive** — Takes effect June 2026, all member states
- **UK** — Proposed legislation in progress, expected 2026-2027

Companies will be forced to publish compensation data. Right now they have no structured way to make that data AI-readable. BrandOS becomes the compliance tool, not just a marketing one.

---

## 12. Revenue Model

| Revenue stream | Price | Notes |
|---|---|---|
| Pro subscriptions | £199/month per employer | Core revenue |
| Agency partnerships | £99/month per client | Volume play, lower touch |
| Enterprise | Custom (£500-2,000/month) | Multi-location, SLA, white-label |
| Audit-to-paid conversion | Target 5-10% | Free audit → paid Pro |

### Unit economics:

- **CAC:** Free audit tool = near-zero for organic. Content marketing (blog articles from research) drives awareness.
- **LTV:** £199/month × 90% retention × 24 months = £4,294
- **Monitoring costs:** £0.02/week per employer = £1/year. Gross margin >99%.
- **Infrastructure:** Vercel (hosting) + Supabase (database) + AI APIs (monitoring). Minimal fixed costs.

---

## 13. What's Next

### Immediate (this month):
- Build MVP: free audit + onboarding + hosted profiles + monitoring dashboard
- Deploy to brandos.ai
- Publish 3 blog articles from robots.txt research
- Onboard 3 test companies internally
- Soft launch to HR/recruitment communities

### Near-term (Q2 2026):
- 100 paying customers
- ATS integrations
- Agency partner programme
- EU compliance features ahead of June directive

### Medium-term (Q3-Q4 2026):
- AI platform partnerships
- Salary intelligence from aggregated verified data
- Enterprise tier with competitive benchmarking
- Define the industry standard for AI-readable employer data

---

## 14. Why Now

Three forces are converging in 2026:

1. **AI adoption is accelerating.** 83% of companies view AI as a top strategic priority. Candidates use AI daily. The old model of job boards and Google searches is being replaced by AI-mediated discovery.

2. **Pay transparency laws are forcing disclosure.** The EU directive, US state laws, and UK proposals mean companies must publish compensation data. They need a tool to manage this across jurisdictions.

3. **The incumbents are blocking AI.** Glassdoor, Indeed, and LinkedIn have chosen to wall off their data. This creates a structural vacuum that only a new platform can fill.

The window is 12-18 months before ATS vendors and job boards adapt. BrandOS needs to be the established standard by then.

---

*BrandOS — Verified employer data for the AI age.*
