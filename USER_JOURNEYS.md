# Rankwell — User Journeys
*Last updated: 2026-02-11*

---

## Journey 1: "The Curious TA Leader"
**Persona:** Sarah, Head of Talent Acquisition at a 400-person fintech
**Entry:** Sees a LinkedIn post: "We checked what ChatGPT says about our company. It was wrong about everything."
**Emotional arc:** Curiosity → Shock → Urgency → Relief → Loyalty

### Step 1: Landing Page (30 seconds)
Sarah lands on rankwell.io. She sees the hero: a simulated ChatGPT response about a company — wrong salary, stale reviews, entity confusion. Underneath: "What does AI say about YOUR company?"

**She feels:** "I've never even thought about this."

A single input field: just her company name. No signup. No email. No friction.

### Step 2: Company Input (10 seconds)
She types "Currencycloud" and selects from the autocomplete dropdown (fuzzy-matched against the 460K company database). One button: "Run Free Audit."

**She feels:** "This is easy. Let me just see."

### Step 3: Loading State (15-30 seconds)
A beautiful progress screen. Not a spinner — a live feed showing what's happening:

```
✓ Querying ChatGPT about Currencycloud...
✓ Querying Claude about Currencycloud...
✓ Querying Perplexity about Currencycloud...
● Mapping Google citation chain...
● Detecting entity accuracy...
● Calculating Citation Score...
```

Each line animates in as it completes. She watches the AI models being queried in real time. This isn't a wait — it's theatre. She's already hooked.

**She feels:** "This is actually checking real AI models. This is real."

### Step 4: The Audit Report (The "Oh Shit" Moment)
The report loads. Top of page:

```
┌─────────────────────────────────────────────┐
│  CURRENCYCLOUD                              │
│  AI Citation Score: 8/100                   │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                             │
│  92% of what AI tells candidates about you  │
│  comes from sources you don't control.      │
└─────────────────────────────────────────────┘
```

**She feels:** "Oh shit."

Below that, three panels unfold:

#### Panel A: What AI Actually Says
Side-by-side responses from ChatGPT, Claude, Perplexity. Real quotes. She can read exactly what a candidate would see if they asked "What's it like to work at Currencycloud?"

She sees wrong salary ranges, outdated remote policy info, and a benefits section that says "no data available."

#### Panel B: The Citation Chain
A visual showing: Google results (left) → AI citations (right), connected by lines. Glassdoor, Glassdoor, Indeed, Reddit. Her company's domain appears nowhere.

Below it: "Currencycloud.com does not appear in the top 50 Google results for any of the 8 employer query categories."

#### Panel C: The Trust Delta
A table:

| Category | AI Says | Reality | Delta |
|----------|---------|---------|-------|
| Senior Engineer Salary | £55-68K | ? | Unknown — you haven't published this |
| Remote Policy | "Office-based" | ? | Unknown — no policy page found |
| Benefits | "No data" | ? | Invisible to candidates |

The "Reality" column is mostly "?" — because the company hasn't published this data. The gaps ARE the problem.

**She feels:** "I need to fix this. But I don't even know where to start."

### Step 5: The Soft Gate
Below the free report, a prompt:

> "Want to see exactly how to fix each gap? Enter your work email to unlock your full Citation Playbook — including the content you need to publish and the structured data to add."

Just email. No credit card. No demo booking. She's already seen the problem — now she wants the fix.

**She feels:** "They've already shown me the problem for free. The fix is probably worth my email."

### Step 6: The Full Report (Email-Gated)
She enters her email. Instantly (no "we'll send you a link" — it loads right there), she gets:

#### The Source Gap Matrix
8 rows. Each prompt category. Red/amber/green. For each:
- What Google ranks
- What AI cites
- Whether her domain appears
- What content she needs to create
- Priority (high/medium/low impact)

#### Entity Confusion Alert
"⚠️ AI models are conflating Currencycloud with Currency Cloud Ltd (dissolved 2019) and CloudCurrency Exchange. 3 of 5 AI responses reference the wrong entity."

#### The Fix Roadmap
A prioritised checklist:
1. **Publish salary bands** on careers page (Impact: High — fixes the #1 candidate query)
2. **Add remote/hybrid policy page** (Impact: High — currently showing "office-based")
3. **Add JSON-LD Organization markup** (Impact: High — fixes entity confusion)
4. **Create benefits overview page** (Impact: Medium — currently invisible to AI)
5. **Add FAQ schema** answering top candidate questions (Impact: Medium)

Each item has a "Generate This" button.

**She feels:** "This is a roadmap. I can actually do something with this."

### Step 7: The Content Generator (The "Just Hit Publish" Moment)
She clicks "Generate This" on item 1 (salary bands). A modal opens:

> "To generate your Salary Transparency page, we need a few inputs:"
> - Role title: [Senior Software Engineer]
> - Salary range: [£75,000 - £95,000]
> - Location: [London / Remote]
> - Additional comp: [Equity, bonus, etc.]

She fills in 4 fields. Clicks "Generate."

Out comes:
- A fully written page draft (heading, intro paragraph, salary band table, benefits summary)
- JSON-LD structured data (JobPosting schema, ready to paste)
- A "predicted impact" bar: "Publishing this is estimated to improve your Citation Score from 8 → 22"

**She feels:** "They literally wrote the page for me. I just need to get this on our site."

### Step 8: The Monitor Hook
After she's seen the playbook:

> "Your AI reputation changes every week as models re-crawl the web. Want to know when your score moves?"
>
> **Free for 30 days:** Monday morning email with your updated Citation Score, what changed, and what to fix next.
>
> [Start Monitoring →]

No credit card. 30-day free monitor. She's already invested — she's seen the problem, she has the playbook, now she wants to track progress.

**She feels:** "I'm already going to publish that salary page. I want to see if it works."

### Step 9: Monday Morning (Week 2)
She published the salary page with JSON-LD on Wednesday. The following Monday, her inbox:

```
Subject: Your AI Reputation Report — Week of 17 Feb

Currencycloud — Citation Score: 19 (+11)

What changed:
✅ ChatGPT now cites your salary range correctly (£75-95K)
✅ Perplexity citing currencycloud.com for the first time
⚠️ Claude still using 2023 Glassdoor data
❌ Benefits page still missing — #1 recommendation

Next fix: Create a benefits overview page.
[Generate Benefits Page →]
```

**She feels:** "It worked. I want to fix the next one."

### Step 10: The Upgrade Moment (Week 4-5)
She's manually published 3 pages. Her score went from 8 → 34. But she has 47 open roles, each needing structured data. The Monday email shows:

> "You've improved 3 of 8 categories. To optimise all 47 active roles with always-fresh structured data, upgrade to the Smart Pixel."
>
> **Rankwell Pro — £299/month**
> ✓ Smart Pixel (auto-generates JSON-LD for all roles)
> ✓ Weekly monitoring across 6 AI models
> ✓ Competitor benchmarking
> ✓ Content playbooks for every gap
> ✓ Pre-crawl simulator
>
> [Upgrade →]

**She feels:** "I've already proven it works manually. Automating it is a no-brainer."

---

## Journey 2: "The Paranoid General Counsel"
**Persona:** David, General Counsel at a 2,000-person company called "Liberty Financial"
**Entry:** The Head of TA forwards David the Rankwell audit. One line highlighted: "AI models are conflating Liberty Financial with Liberty Mutual, Liberty Tax, and Liberty University."
**Emotional arc:** Alarm → Investigation → Budget justification → Procurement

### Step 1: The Forward
David gets an email from TA: "David, look at this. AI is telling candidates about the wrong company. This seems like a brand/trademark issue."

He clicks the link to the audit report. The Entity Confusion section is front and centre.

### Step 2: The Entity Confusion Deep-Dive
He sees:

```
⚠️ ENTITY CONFUSION DETECTED

AI models returned information about the following entities
when asked about "Liberty Financial":

• Liberty Mutual (insurance) — cited in 4/6 models
• Liberty Tax (tax prep) — cited in 2/6 models  
• Liberty University (education) — cited in 1/6 models
• Liberty Financial Group (dissolved 2018) — cited in 3/6 models

Only 2 of 6 AI models correctly identified your company.
```

Below that: specific quotes from AI responses where the wrong company's data was used. A ChatGPT response saying "Liberty Financial offers tuition reimbursement" — that's Liberty University's benefit, not theirs.

**He feels:** "This is a brand integrity issue. This could cause real legal exposure."

### Step 3: The Legal Angle
The report includes a section he hasn't seen before (triggered by entity confusion severity):

> **Brand Safety Risk Assessment**
>
> When AI models attribute another company's employee reviews, salary data, or workplace incidents to your brand, candidates make decisions based on false information. This creates:
>
> - **Defamation risk** — negative reviews from other entities attributed to you
> - **Regulatory risk** — incorrect salary/benefits data could violate pay transparency regulations
> - **Discrimination risk** — if AI attributes discriminatory practices from a confused entity to your brand
>
> **The fix:** Organization schema markup with explicit disambiguation signals.

**He feels:** "I need to present this to the board. This is a risk we didn't know we had."

### Step 4: The Budget Path
David doesn't care about the Citation Score or the Monday email. He cares about one thing: making AI stop confusing his company with others.

The report offers:

> **Entity Protection Package**
> - Organization schema with explicit sameAs/name/legalName disambiguation
> - Weekly entity confusion monitoring across all major AI models
> - Alert if any new conflation events detected
> - Quarterly entity accuracy report for board/compliance review
>
> [Talk to Sales →]

This is the enterprise door. No self-serve. No freemium. Direct to sales because Legal procurement works differently.

**He feels:** "This is risk mitigation. Budget exists for this."

---

## Journey 3: "The Data-Driven CFO"
**Persona:** Maria, CFO at a Series B startup burning £180K/month on hiring
**Entry:** VP Engineering shares the Rankwell audit in a leadership Slack channel, highlighting the Trust Delta: "AI is underquoting our engineers by £25K."
**Emotional arc:** Scepticism → Calculation → Conviction → Approval

### Step 1: The Number That Catches Her Eye
In Slack, she sees the Trust Delta table:

| Role | AI Says | Actual | Delta |
|------|---------|--------|-------|
| Senior Engineer | £55-68K | £80-95K | -£25K |
| Product Manager | £50-60K | £70-85K | -£20K |
| Data Scientist | £45-55K | £65-80K | -£20K |

Below it, the VP's comment: "We're losing candidates before they even apply because AI tells them we pay 30% less than we do."

**She feels:** "That's a quantifiable problem. Let me see the numbers."

### Step 2: The Cost Calculator
She clicks through to the audit. The Cost of Misinformation Calculator is at the bottom:

```
YOUR ESTIMATED COST OF AI MISINFORMATION

Active roles: 12
Avg monthly job views (AI-assisted): ~2,400
Hallucination rate: 78% (salary, benefits, or policy data is wrong)
Estimated candidate drop-off from misinformation: 15-25%

Conservative estimate:
→ 360-600 qualified candidates per month see wrong info
→ At your avg cost-per-hire of £8,500
→ Even a 5% reduction in qualified applicants costs:

£ 51,000 / month in wasted recruiting spend

Rankwell Pro: £299/month
ROI: 170x
```

**She feels:** "The maths works. This is obviously worth doing."

### Step 3: The Approval
She doesn't need a demo. She doesn't need a sales call. She needs:
1. The calculation verified with their actual numbers
2. A clean invoice
3. Annual billing option

The checkout flow lets her adjust the inputs (actual roles, actual salary ranges, actual cost-per-hire) and see the ROI recalculate in real time. She picks annual billing (2 months free), enters a card, and they're live.

**She feels:** "This was the easiest procurement decision I've made this quarter."

---

## Journey 4: "The Employer Brand Builder"
**Persona:** James, newly hired Employer Brand Manager at a 600-person company
**Entry:** Googles "how to improve employer brand AI" — finds a Rankwell blog post
**Emotional arc:** Discovery → Education → Empowerment → Advocacy

### Step 1: The Blog Post
James is 3 weeks into his new role. He's been asked to "improve employer branding" but the company has no strategy. He searches for modern approaches and finds a Rankwell article: "The New Employer Brand Battleground: What AI Says About You When You're Not in the Room."

The article explains the citation chain, shows real examples, and ends with: "Check what AI says about your company — free, 30 seconds."

**He feels:** "I didn't even know this was a thing. I need to check us."

### Step 2: The Audit as Ammunition
He runs the audit. Score: 14/100. The Source Gap Matrix shows red across 6 of 8 categories.

But here's the key — for James, this audit is his BUSINESS CASE. He's 3 weeks in and needs to show leadership why his role matters.

He downloads the PDF report and brings it to his next leadership meeting:

> "I ran an AI reputation audit. When candidates ask ChatGPT about us, 92% of the information comes from 3-year-old Glassdoor reviews. Our own website isn't cited at all. Here's what AI is getting wrong, and here's the 8-step fix."

**He feels:** "Rankwell just gave me my first 90-day plan and the data to back it up."

### Step 3: The Workflow
James doesn't need convincing. He needs tools. He signs up for the Monitor (free 30 days) and starts using the Content Generator to build the missing pages:

Week 1: Salary transparency page + JSON-LD
Week 2: Benefits overview page
Week 3: Remote/hybrid policy page  
Week 4: Engineering culture page

Each Monday he checks his score: 14 → 23 → 31 → 42.

He screenshots each Monday email and posts it in the leadership Slack: "Week 4 update: AI Citation Score up 28 points. ChatGPT now cites us directly for salary data."

**He feels:** "I'm the person who fixed a problem nobody knew existed. I look like a genius."

### Step 4: The Internal Champion
James becomes the internal advocate. He brings Rankwell into the annual budget. He requests the Smart Pixel because manually updating 30+ roles is unsustainable. He refers two other Employer Brand Managers in his network.

**He feels:** "This is MY tool. It makes me indispensable."

---

## Journey 5: "The Enterprise CHRO"
**Persona:** Rachel, Chief Human Resources Officer at a 10,000-person company
**Entry:** Receives a cold email with her company's Citation Score attached
**Emotional arc:** Intrigue → Delegation → Executive review → Enterprise deal

### Step 1: The Cold Email

> Subject: Barclays' AI Citation Score is 11/100
>
> Rachel,
>
> When candidates ask ChatGPT "What's it like to work at Barclays?", 89% of the response comes from Glassdoor reviews — most from 2022 or earlier. Your careers site isn't cited at all.
>
> I've attached your Citation Chain Audit (free, no strings).
>
> The fix takes about 4 weeks. Happy to walk you through it if useful.
>
> — Troy, Rankwell

Attached: 2-page PDF with Citation Score, top-level Source Gap Matrix, and Trust Delta for 3 key roles.

**She feels:** "This is specific to us. And that number is embarrassing."

### Step 2: The Delegation
Rachel forwards to her Employer Brand team and TA Ops lead: "Has anyone seen this? Look into it and report back."

The team runs the full audit on rankwell.io. They confirm the findings independently. They present back to Rachel with the full report + competitor comparison showing two competitors scoring 30+.

### Step 3: The Enterprise Conversation
Rachel's team requests a call. This isn't self-serve anymore — it's enterprise sales:

- Custom audit across all business units
- Integration with their ATS (structured data auto-generated from live job postings)
- Dedicated account manager
- Quarterly board-ready reports
- SLA on entity confusion detection
- SSO, invoicing, procurement flow

### Step 4: The Enterprise Deal
Annual contract. Custom pricing. Likely £2-5K/month depending on company size and number of roles. The ROI calculation at their scale (500+ roles, £15K avg cost-per-hire) shows 7-figure savings potential.

**She feels:** "This is infrastructure, not a tool."

---

## The Seamless Thread

Across all five journeys, the experience follows the same emotional pattern:

```
See the problem (free, instant, no friction)
    ↓
Feel the urgency (Trust Delta, entity confusion, cost calculator)
    ↓
Get the roadmap (Source Gap Matrix, prioritised fixes)
    ↓
Take first action (Content Generator, JSON-LD)
    ↓
See it work (Monday email, score improvement)
    ↓
Scale it (Smart Pixel, enterprise)
```

**Every step earns the right to ask for the next.**

- The landing page earns the right to ask for a company name
- The free audit earns the right to ask for an email
- The email report earns the right to offer a monitor
- The monitor earns the right to offer the fix
- The fix earns the right to offer the pixel
- The results earn the right to ask for the upgrade

Nothing is gated before its value is proven. Nothing is sold before the need is felt.

---

## Build Implications

### What must exist for Journey 1 to work end-to-end:
1. **Landing page** with company name input + autocomplete (460K database)
2. **Audit engine** — queries 3+ AI models + Google, maps citations
3. **Citation Score** calculation
4. **Source Gap Matrix** visualisation
5. **Entity Confusion** detection
6. **Trust Delta** table (with "?" for unpublished data — the gaps ARE the message)
7. **Email gate** (soft, after free results shown)
8. **Content Generator** (LLM-powered page drafts + JSON-LD)
9. **Monday email** digest (automated weekly re-audit)
10. **Stripe checkout** for Pro upgrade

### Build order (what blocks what):
```
Phase 1 — The Hook (2-3 weeks)
├── Company autocomplete (needs 460K database in Supabase)
├── AI model querying (ChatGPT, Claude, Perplexity APIs)
├── Google citation chain mapping
├── Citation Score algorithm
├── Source Gap Matrix
├── Entity Confusion detection
└── Audit report page (beautiful, shareable, PDF-exportable)

Phase 2 — The Gate (1 week)
├── Email capture (post-audit)
├── Full report unlock
├── Content Generator (LLM writes page drafts)
└── JSON-LD generator

Phase 3 — The Retention Loop (1-2 weeks)
├── Weekly automated re-audit (cron)
├── Score change detection
├── Monday email (Resend)
├── Dashboard with historical scores
└── Pre-crawl simulator

Phase 4 — The Monetisation (1 week)
├── Stripe integration
├── Pro tier checkout
├── Smart Pixel (auto JSON-LD from job feed)
└── Competitor benchmarking
```

### Total: ~5-7 weeks from today to full self-serve product

The audit page we already have becomes the free tier. Everything else layers on top.
