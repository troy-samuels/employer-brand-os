# Rankwell Email Sequences — Enterprise GTM
*Ready for Resend integration*

---

## Segmentation Strategy

### Tier 1: UK Decision Makers (First Wave)
- VP/Director/Head of People, Talent, HR, Recruitment
- UK-based companies
- Companies with 500+ employees
- **Expected volume:** ~15,000-25,000 contacts
- **Priority:** HIGHEST — these are buying decision makers in our core market

### Tier 2: UK Senior Practitioners
- Senior/Lead roles in TA, Employer Brand, People Ops
- UK-based
- **Expected volume:** ~50,000-80,000
- **Priority:** HIGH — they influence buying decisions and use the tool daily

### Tier 3: US/EU Decision Makers
- Same title filters as Tier 1, US + Western Europe
- **Expected volume:** ~100,000-150,000
- **Priority:** MEDIUM — expansion market

### Tier 4: Broad HR Community
- All remaining HR/TA titles
- **Expected volume:** ~2M+
- **Priority:** LOW — awareness + list building only

---

## Sequence 1: "The Wake-Up" (Cold Audit Outreach)

**Target:** Tier 1 — UK Decision Makers
**Goal:** Get them to run a free audit
**Personalisation:** Company name, industry, one specific finding

### Email 1: "What AI says about {company_name}" (Day 0)

**Subject lines (A/B test):**
- A: "What ChatGPT tells candidates about {company_name}"
- B: "{first_name}, AI is answering questions about your company"
- C: "The salary AI quotes for {company_name} jobs"

**Body:**
```
Hi {first_name},

I ran an AI audit on {company_name} — asking ChatGPT, Perplexity, and Gemini the same questions your candidates are asking.

The results were interesting. {company_name}'s own careers page wasn't cited once. The AI pulled everything from Glassdoor reviews and Indeed listings — some of which are over 3 years old.

We built a free tool that shows you exactly what AI tells candidates about your company, and where it's getting its information from. Takes 30 seconds.

→ Run your free audit: https://rankwell.io/audit?company={company_slug}

800 million people use ChatGPT every week. If you're spending money on employer branding, it's worth knowing what the AI is actually saying.

Best,
Troy Samuels
Rankwell
```

### Email 2: "The data gap" (Day 3)

**Subject:** "£{trust_delta} — the gap between what AI says and reality"

**Body:**
```
Hi {first_name},

Quick follow-up on the AI audit for {company_name}.

One thing we see consistently across {industry} employers: AI salary estimates are typically 15-25% off from actual compensation. For a company your size, that translates to roughly £{calculated_cost}/year in lost candidates who never apply because they think you pay less than you do.

The fix is surprisingly straightforward — it's a structured data problem, not a marketing problem. Most employers just haven't optimised for how AI retrieves information.

If you're curious what specifically needs fixing for {company_name}:

→ See your full audit results: https://rankwell.io/audit?company={company_slug}

Troy
```

### Email 3: "Social proof" (Day 7)

**Subject:** "{competitor_name} scored 67. You scored {score}."

**Body:**
```
{first_name},

We've now audited over 500 UK employers. The average AI visibility score is 23 out of 100.

Companies in {industry} that have optimised their structured data and careers content are scoring 60+. That means when candidates ask AI about them, the AI actually cites their own website — with accurate salary data, real culture information, and current benefits.

{company_name} currently scores {score}. Your top competitor, {competitor_name}, scores {competitor_score}.

The gap is fixable in under a week with the right approach.

→ See the full comparison: https://rankwell.io/compare?companies={company_slug},{competitor_slug}

Troy
```

### Email 4: "The breakup" (Day 14)

**Subject:** "Should I stop reaching out?"

**Body:**
```
Hi {first_name},

I've sent a few emails about what AI is telling candidates about {company_name}. If this isn't relevant right now, no worries — I'll stop here.

But if the timing is just off, here's what's worth bookmarking: we recently published research showing that 85% of job seekers now use AI to research employers before applying. The employers who show up accurately in AI responses are seeing 30-40% better application rates.

The free audit is always there if you want to check:
→ https://rankwell.io

Either way, all the best with hiring this year.

Troy
```

---

## Sequence 2: "The Educator" (Content-Led Nurture)

**Target:** Tier 2 — Senior Practitioners
**Goal:** Establish thought leadership, drive to blog → audit
**Personalisation:** Industry, role type

### Email 1: "The research" (Day 0)

**Subject:** "85% of candidates now use AI to research employers"

**Body:**
```
Hi {first_name},

We just published new research on how AI models describe UK employers to job candidates.

Key findings:
• 78% of salary estimates AI gives are inaccurate
• Company careers pages are cited in only 12% of AI responses
• Glassdoor and Indeed dominate 80%+ of what AI says about employers
• The average employer's own content doesn't appear in AI results at all

Full report: https://rankwell.io/blog/what-ai-tells-candidates-about-your-company

If you're working on employer brand at {company_name}, this data might be useful for making the case internally for AI visibility optimisation.

Troy Samuels
Rankwell — AI Reputation Intelligence
```

### Email 2: "The myth" (Day 5)

**Subject:** "The llms.txt file that's wasting everyone's time"

**Body:**
```
{first_name},

You might have seen advice about creating an "llms.txt" file — a file that supposedly tells AI about your company.

We analysed 300,000 domains and 10 million bot requests. The result: zero AI crawlers read llms.txt files. Not one.

Every consultant and blog recommending this is wrong. Here's what actually works:
→ https://rankwell.io/blog/llms-txt-myth

The short version: structured data (JSON-LD), FAQ-formatted content, and multi-platform presence are what drive AI citations. Not a text file that nobody reads.

Troy
```

---

## Sequence 3: "The Enterprise Opener" (High-Touch, Low Volume)

**Target:** Fortune 500 / FTSE 250 heads of employer brand
**Goal:** Demo booking
**Volume:** Manual send, 10-20 per day max
**Personalisation:** Heavily researched — specific to their company

### Email 1: (Day 0)

**Subject:** "I audited {company_name}'s AI presence — one thing stood out"

**Body:**
```
{first_name},

I run Rankwell — we map how AI models describe employers to candidates.

I audited {company_name} this morning. Most of the results were typical for {industry}: AI pulls heavily from Glassdoor and LinkedIn data, your careers site barely gets cited.

But one thing was unusual: {specific_finding — e.g., "AI is confusing {company_name} with {similar_company}, giving candidates the wrong salary data and review scores"}.

This kind of entity confusion affects about 15% of large employers and it's a real problem for brand accuracy and potentially compliance.

I'd be happy to share the full audit report — no strings attached. Would a 15-minute walkthrough be useful?

Troy
```

---

## Technical Implementation Notes

### Resend Integration
```typescript
// Pseudocode for Resend + Supabase integration
const sendSequenceEmail = async (contact: Contact, sequence: string, step: number) => {
  const template = getTemplate(sequence, step);
  const personalised = personaliseEmail(template, contact);
  
  const result = await resend.emails.send({
    from: 'Troy <troy@rankwell.io>',
    to: contact.email,
    subject: personalised.subject,
    html: personalised.body,
    tags: [
      { name: 'sequence', value: sequence },
      { name: 'step', value: String(step) },
      { name: 'segment', value: contact.segment },
    ],
  });
  
  await supabase.from('outreach_events').insert({
    contact_id: contact.id,
    campaign_id: sequence,
    event_type: 'sent',
    step: step,
    resend_id: result.id,
  });
};
```

### Sending Schedule
- **Week 1:** 50/day (domain warming)
- **Week 2:** 200/day
- **Week 3:** 500/day
- **Week 4:** 1,000/day
- **Week 5+:** 2,000-5,000/day (based on deliverability metrics)

### Key Metrics to Track
- Open rate (target: 25-35%)
- Click rate (target: 3-5%)
- Audit completion rate (target: 15-20% of clicks)
- Reply rate (target: 2-5%)
- Unsubscribe rate (must stay below 0.5%)
- Bounce rate (must stay below 2%)
- Spam complaint rate (must stay below 0.1%)

### Compliance Checklist
- [ ] Unsubscribe link in every email
- [ ] Physical address in footer
- [ ] Clear sender identification
- [ ] Legitimate interest basis documented (GDPR)
- [ ] Data processing record created
- [ ] Suppression list maintained
- [ ] Bounce handling automated
- [ ] Reply handling set up (monitor inbox)
