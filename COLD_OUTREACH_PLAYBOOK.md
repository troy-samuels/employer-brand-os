# OpenRole Cold Outreach Playbook

**Last updated:** 23 February 2026
**Purpose:** Founder-led validation outreach to 20 UK employers
**Goal:** Book 10 calls, validate willingness to pay

---

## The Strategy

We're not selling. We're running audits for free, sharing the results, and asking if the findings are valuable enough to pay for.

The audit results ARE the pitch. No decks, no generic "let me tell you about our product." Just: "Here's what AI says about you. Here's what's wrong. Here's what we'd recommend."

---

## Email Templates

### Template A: The Audit Drop
**Use for:** Companies with clear information gaps (salary, benefits, interview prep missing from AI)
**When to send:** After running their audit

---

**Subject:** What ChatGPT tells candidates about {{company_name}}

Hi {{first_name}},

I ran {{company_name}} through our AI employer audit — just wanted to share the results.

When candidates ask ChatGPT about working at {{company_name}}, here's what they get:

**Salary for {{top_role}}:** "{{ai_salary_response}}"
**Interview process:** "{{ai_interview_response}}"
**Benefits:** "{{ai_benefits_response}}"

{{specific_issue — e.g., "The salary estimate is off by about £15K. AI is citing Glassdoor averages because you haven't published salary bands anywhere it can find them."}}

Full results here if you're interested: {{audit_link}}

No agenda — I'm building a tool that helps employers control this and wanted to test it with real companies. If you have 15 minutes to look at the results together, I'd genuinely value the feedback.

Troy Samuels
OpenRole — openrole.co.uk

---

### Template B: The Interview Angle
**Use for:** Companies that are actively hiring at volume (10+ roles)
**When to send:** After running their audit

---

**Subject:** How candidates prepare for interviews at {{company_name}}

Hi {{first_name}},

I tried something — asked ChatGPT to "help me prepare for an interview at {{company_name}}."

Here's what a candidate sees:

> "{{ai_interview_response_verbatim}}"

{{#if interview_inaccurate}}
That process description is outdated — it's based on a 2024 Glassdoor review. {{specific_detail — e.g., "You moved to a pair programming format last year, but AI is still telling candidates to expect a take-home."}}
{{/if}}

{{#if interview_missing}}
There's almost nothing specific to {{company_name}}. AI is giving generic advice because your interview process isn't documented anywhere it can find.
{{/if}}

For a company hiring {{num_roles}} roles right now, every candidate is getting this briefing before they walk in.

I built a tool that audits this across ChatGPT, Claude, Perplexity, and Gemini. Happy to share {{company_name}}'s full results — no pitch, just the data.

Troy Samuels
OpenRole

---

### Template C: The Competitor Angle
**Use for:** Companies where a direct competitor scores significantly better
**When to send:** After running both audits

---

**Subject:** {{competitor_name}} vs {{company_name}} in AI search

Hi {{first_name}},

Quick one — I've been researching how AI represents {{industry}} employers in the UK.

{{competitor_name}} scores {{competitor_score}}/100 on our AI visibility index. {{company_name}} scores {{company_score}}/100.

The difference isn't brand spend or Glassdoor reviews. {{competitor_name}} published a salary framework and interview guide on their careers site. AI now cites that content directly. {{company_name}} doesn't have equivalent content, so AI defaults to guessing.

I have the full breakdown if you'd like to see it — takes 2 minutes to review.

Troy Samuels
OpenRole

---

### Template D: The LinkedIn Warm Touch
**Use for:** Any target company contact, before or after the email
**Format:** LinkedIn connection request (300 char limit) or DM

---

**Connection request:**
Hi {{first_name}} — I've been researching how AI represents UK {{industry}} employers. Ran an audit on {{company_name}} and found some interesting gaps. Happy to share the results if useful. Troy

**Follow-up DM (if connected):**
Thanks for connecting, {{first_name}}. Here's the audit I mentioned — shows what ChatGPT, Claude, and Perplexity say when candidates ask about {{company_name}}: {{audit_link}}

A few things stood out:
- {{gap_1}}
- {{gap_2}}

Happy to walk through it if useful. No pitch — just finding this data fascinating and wanted to share.

---

## Follow-Up Cadence

| Day | Action | Content |
|-----|--------|---------|
| 0 | Send initial email (Template A/B/C) | Audit results + 1 specific finding |
| 0 | Connect on LinkedIn (Template D) | Connection request with context |
| 3 | Follow-up email (if no reply) | "Two things that stood out..." + competitor data |
| 3 | LinkedIn DM (if connected) | Share audit link |
| 7 | Breakup email | "Last note — audit is here whenever. One quick win: {{easiest_fix}}" |
| 14 | Re-audit + new email | "Your score changed since I last checked..." (only if genuine change) |

---

## Before Each Outreach

### Preparation Checklist:
1. [ ] Run audit on company at openrole.co.uk
2. [ ] Screenshot the results
3. [ ] Run "help me prepare for interview at {{company}}" in ChatGPT — screenshot the response
4. [ ] Run salary query in Perplexity — screenshot
5. [ ] Check their Glassdoor page — note the score and any patterns in recent reviews
6. [ ] Check their careers page — note what content exists (or doesn't)
7. [ ] Find the right contact on LinkedIn
8. [ ] Customise the email template with real data
9. [ ] Save all screenshots in `/outreach/{{company_slug}}/`

### Personalisation Fields:
- `{{company_name}}` — The company
- `{{first_name}}` — Contact's first name
- `{{top_role}}` — Their most-hired role (check careers page)
- `{{ai_salary_response}}` — Actual ChatGPT salary answer
- `{{ai_interview_response}}` — Actual ChatGPT interview answer
- `{{ai_benefits_response}}` — Actual ChatGPT benefits answer
- `{{specific_issue}}` — The most compelling gap we found
- `{{num_roles}}` — Number of live roles on their careers page
- `{{competitor_name}}` — A direct competitor
- `{{competitor_score}}` — That competitor's OpenRole score
- `{{audit_link}}` — Link to their public company page on openrole.co.uk

---

## Objection Responses

**"We already manage our employer brand on Glassdoor/LinkedIn."**
> Good — you should keep doing that. What we've found is that Glassdoor handles opinions well, but when candidates ask AI specific questions — salary, benefits, interview process — Glassdoor's data is thin. Those are the gaps we identify. We're complementary to what you're already doing.

**"We don't think many candidates use AI to research us."**
> The latest data shows 38% of under-30 candidates use AI as a primary research tool. ChatGPT has 800 million weekly users. Run the query yourself — "what is it like working at {{company_name}}" — and see what comes up. That's what your candidates see.

**"Can you actually change what AI says?"**
> We can't directly control AI outputs — no one can. But we've seen companies publish targeted content and have AI start citing it within 2-4 weeks. One company published a single blog post and went from 0% to 11% AI visibility. We give you the playbook and track whether it works.

**"This feels like a nice-to-have."**
> Run the free audit. If AI is getting everything right about you — salary, benefits, interview process — then you're ahead of 90% of UK employers and you don't need us. If it's guessing or citing 2-year-old reviews, that's the first impression for 38% of your candidates.

**"We don't have budget for another tool."**
> Understood. The audit is free and yours to keep. If the data is useful, you can act on the recommendations yourself — publish the content we suggest, update your careers page. You don't need us for that. We're useful for ongoing monitoring and competitor benchmarking, but the insights are yours regardless.

**"What makes you different from [competitor]?"**
> We're the only tool focused on UK mid-market employers with published pricing and an instant self-serve audit. PerceptionX and Profound target enterprise with "Book a Demo" gates. Built In is US-only and tech-only. We believe this should be accessible to every employer, not just those with a £50K employer brand budget.

---

## Tracking

Keep a log of all outreach in a simple table:

| Company | Contact | Email Sent | LinkedIn | Reply | Call Booked | Call Done | Outcome |
|---------|---------|------------|----------|-------|-------------|-----------|---------|
| | | | | | | | |

Update daily. Aim for:
- 20 companies contacted in Week 1
- 10 replies by Week 2
- 5-7 calls booked by Week 2
- 3+ calls with clear "would pay" signal by Week 3

---

## Key Message

The pitch isn't "buy our tool." The pitch is:

**"We ran this analysis. The results surprised us. Thought you should see them."**

Let the data do the work. If the audit results are compelling, the sale follows naturally. If they're not, we need to make the product better — and that's equally valuable feedback.
