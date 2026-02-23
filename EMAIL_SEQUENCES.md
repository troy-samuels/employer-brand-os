# OpenRole Email Sequences

**Last updated:** 23 February 2026
**Voice:** Professional, direct, human. Written like a sharp colleague who's done the research — not a marketing automation bot. Short sentences. Real numbers. No fluff.

**Principles:**
- Every email earns the next open
- Subject lines are promises — deliver on them immediately
- One clear CTA per email
- Never say "I hope this email finds you well"
- Use the company's actual data whenever possible (AI audit results, gap scores, industry rankings)
- UK English throughout

---

## 1. Post-Audit Nurture Sequence

**Trigger:** User runs a free audit (no signup required, but we capture email if provided)
**Goal:** Convert free audit → paid plan (£149 Growth target)

---

### Email 1: Your Audit Results
**Send:** Immediately after audit
**Subject:** What AI tells candidates about {{company_name}}
**From:** OpenRole <hello@openrole.co.uk>

---

Hi {{first_name}},

You just ran an AI audit on {{company_name}}. Here's the short version:

**Your AI Visibility Score: {{score}}/100**

{{#if score_below_40}}
That puts you in the bottom third of UK employers we've tracked. Candidates asking ChatGPT or Perplexity about you are getting thin, outdated, or outright wrong information.
{{/if}}

{{#if score_40_to_65}}
Not bad — but there are gaps. AI can answer the broad questions about {{company_name}}, but it's guessing on the specifics that actually influence whether someone accepts your offer.
{{/if}}

{{#if score_above_65}}
Better than most. But even at {{score}}/100, there are specific questions where AI is either guessing or citing outdated sources. Worth knowing which ones.
{{/if}}

**The 3 biggest gaps we found:**

1. {{gap_1}} — AI {{gap_1_detail}}
2. {{gap_2}} — AI {{gap_2_detail}}
3. {{gap_3}} — AI {{gap_3_detail}}

These are the questions candidates ask before they apply. Right now, they're getting the wrong answers — or no answers at all.

[See your full audit results →]({{audit_url}})

Want to know exactly what to publish to fix these gaps? That's what the Information Gap Report does.

Troy Samuels
OpenRole

---

### Email 2: The Salary Problem
**Send:** Day 2
**Subject:** AI thinks you pay {{ai_salary_estimate}} — is that right?
**Preheader:** 68% of UK employers have wrong salary data in AI search.

---

Hi {{first_name}},

When a candidate asks ChatGPT "what's the salary for a {{top_role}} at {{company_name}}?", here's what it says:

> *"{{ai_salary_quote}}"*

{{#if salary_inaccurate}}
That number is {{salary_direction}} by roughly {{salary_delta}}. Every candidate who reads that either walks away thinking you underpay — or walks into negotiations with the wrong anchor.
{{/if}}

{{#if salary_missing}}
Actually, it doesn't have an answer. It guesses based on Glassdoor averages and industry data. For a candidate researching you specifically, that's not helpful.
{{/if}}

This isn't a Glassdoor problem. Glassdoor handles opinions. But when candidates ask AI for facts — salary, benefits, remote policy — Glassdoor's data is thin. If you haven't published those facts somewhere AI can find them, it makes them up.

One thing you can do today: publish a salary range on your careers page for your highest-volume role. Just a paragraph. AI picks it up within 2-4 weeks.

Or let us show you all the gaps at once.

[View your Information Gap Report →]({{gap_report_url}})

Troy
OpenRole

---

### Email 3: Your Competitors Are Ahead
**Send:** Day 5
**Subject:** {{competitor_name}} scores {{competitor_score}}/100. You scored {{score}}.
**Preheader:** Here's what they're doing differently.

---

Hi {{first_name}},

We benchmark {{company_name}} against others in {{industry}}.

Here's how you compare:

| Company | AI Score | Salary Data | Benefits | Interview Prep |
|---------|----------|-------------|----------|----------------|
| **{{competitor_1}}** | {{c1_score}}/100 | {{c1_salary}} | {{c1_benefits}} | {{c1_interview}} |
| **{{competitor_2}}** | {{c2_score}}/100 | {{c2_salary}} | {{c2_benefits}} | {{c2_interview}} |
| **{{company_name}}** | {{score}}/100 | {{company_salary}} | {{company_benefits}} | {{company_interview}} |

{{competitor_1}} isn't doing anything fancy. They published a benefits page and an interview process FAQ on their careers site. That's it. AI cites those pages now instead of guessing.

The gap between you and your competitors isn't brand spend or Glassdoor reviews. It's published content — specifically, answers to the factual questions candidates ask AI.

[See the full competitive breakdown →]({{benchmark_url}})

Troy
OpenRole

---

### Email 4: The Interview Problem
**Send:** Day 8
**Subject:** What candidates see before your interviews
**Preheader:** We asked AI to help a candidate prepare for an interview at {{company_name}}.

---

Hi {{first_name}},

Try this: open ChatGPT and type "help me prepare for an interview at {{company_name}}."

We did. Here's what candidates get:

{{#if interview_prep_poor}}
> *"{{interview_ai_quote}}"*

That's generic advice cobbled together from Glassdoor fragments and Reddit threads. Nothing about your actual process, your values, or what you're looking for. Every candidate walks in underprepared — and you waste the first 15 minutes of every interview on basics.
{{/if}}

{{#if interview_prep_ok}}
> *"{{interview_ai_quote}}"*

Not terrible — but notice the sources. Glassdoor reviews from 2023. A Reddit thread. Nothing from you. Candidates are preparing using other people's second-hand accounts of your process.
{{/if}}

Companies like Monzo have their own interview prep content on their careers page. When candidates ask AI about Monzo interviews, AI cites Monzo directly. Their candidates show up prepared. Interviews are better. Offers get accepted.

This is one of the highest-impact gaps to fill. A single "What to expect in our interview process" page can shift how every candidate prepares.

[Get your content playbook →]({{playbook_url}})

Troy
OpenRole

---

### Email 5: The Close
**Send:** Day 12
**Subject:** Quick question about {{company_name}}
**Preheader:** Are these gaps worth fixing?

---

Hi {{first_name}},

I'll keep this brief.

Over the past week, I've shown you what AI tells candidates about {{company_name}} — the salary gaps, the missing benefits data, the interview prep problem, and how you compare to {{competitor_1}}.

Two paths from here:

**1. Fix it yourself (free)**
Take the gaps we've found and publish the content. Careers page updates, a benefits section, an interview FAQ. It works — we've seen companies shift their AI visibility in 2-4 weeks with targeted content.

**2. Let us track and guide it (£149/month)**
The Growth plan gives you a weekly report every Monday: what AI said this week, which gaps you've closed, which ones remain, and exactly what to publish next. Plus competitor benchmarking so you always know where you stand.

Either way, the gaps exist. Candidates are asking AI about you right now. The question is whether they get your version or Glassdoor's best guess.

[Start your Growth plan →]({{pricing_url}})

No pressure. The free audit is always there.

Troy
OpenRole

---

## 2. Cold Outreach Sequence

**Trigger:** Manual — targeting specific companies identified through validation plan
**Goal:** Book a 15-minute call to walk through their audit
**Target:** TA Leads, HR Directors, Employer Brand Managers, People Ops at UK companies (100-500 employees)

---

### Cold Email 1: The Hook
**Subject:** What ChatGPT tells candidates about {{company_name}}
**Alt subjects:**
- AI is answering questions about {{company_name}} — are the answers right?
- {{first_name}}, candidates are asking AI about you

---

Hi {{first_name}},

I ran your company through our AI employer audit. Not trying to sell you anything — just thought the results were worth seeing.

When candidates ask ChatGPT about working at {{company_name}}, here's what they get:

**Salary for {{top_role}}:** {{ai_salary_quote}}
**Benefits:** {{ai_benefits_quote}}
**Interview process:** {{ai_interview_quote}}

{{#if has_errors}}
Some of that is wrong. {{specific_error}}.
{{/if}}

{{#if has_gaps}}
And there are {{gap_count}} questions AI can't answer at all — it just guesses.
{{/if}}

I've put together the full results if you want to see them: [{{company_name}} AI Audit →]({{audit_url}})

No signup, no paywall. Just the data.

Troy Samuels
OpenRole — AI Employer Intelligence
openrole.co.uk

---

### Cold Email 2: The Follow-Up
**Send:** Day 3 (if no reply)
**Subject:** Re: What ChatGPT tells candidates about {{company_name}}

---

Hi {{first_name}},

Quick follow-up on the audit I sent over. Two things stood out that I think are worth flagging:

1. **{{biggest_gap}}** — This is the most-asked candidate question in {{industry}}, and AI has no good answer for {{company_name}}. It's guessing based on industry averages.

2. **{{competitor_comparison}}** — {{competitor_name}} in your space scores {{competitor_score}}/100 vs your {{score}}/100. The difference isn't brand spend — they've published a careers page FAQ that AI now cites directly.

Happy to walk you through it in 15 minutes if useful. No pitch — just showing you what we found.

[Pick a time →]({{calendly_url}})

Troy

---

### Cold Email 3: The Breakup
**Send:** Day 7 (if no reply)
**Subject:** Closing the loop on {{company_name}}

---

Hi {{first_name}},

Last note from me. I know inboxes are chaos.

The audit results for {{company_name}} are here whenever you want them: [{{audit_url}}]({{audit_url}})

One thing I'd suggest regardless: search "interview at {{company_name}}" in ChatGPT. See what candidates see before they sit down with you. If you're happy with it, great. If not, a single page on your careers site fixes it.

All the best with the hiring.

Troy
OpenRole

---

## 3. Post-Signup Onboarding Sequence

**Trigger:** User signs up for a paid plan
**Goal:** Drive activation (connect company, review first report, publish first content piece)

---

### Onboarding Email 1: Welcome + First Steps
**Send:** Immediately after signup
**Subject:** You're in. Here's what happens next.

---

Hi {{first_name}},

Welcome to OpenRole. Here's what's happening right now:

**We're running your first full audit.** This goes deeper than the free version — {{plan_models}} AI models, real candidate questions across salary, benefits, culture, interview prep, tech stack, and remote policy. You'll have results within the hour.

**Three things to do this week:**

1. **Check your first report** — it'll land in your dashboard (and your inbox) within 60 minutes. Look at the Information Gap section first — that's where the quick wins are.

2. **Pick one gap to fill** — don't try to fix everything at once. Start with the gap that has the highest candidate impact. We'll tell you which one.

3. **Reply to this email** — tell me what role you're hiring for most urgently. I'll personally check what AI says about that specific role at {{company_name}} and send you the results.

Your first Monday Report arrives {{next_monday}}. Every week after that, same time: what changed, what's improving, and what to work on next.

Troy Samuels
Founder, OpenRole

P.S. — Every Monday Report includes a "This Week's Priority" section. One content suggestion, with a template. Start there.

---

### Onboarding Email 2: Your First Report
**Send:** When first full audit completes (~1 hour after signup)
**Subject:** Your first report is ready — {{gap_count}} gaps found

---

Hi {{first_name}},

Your full AI audit is done. Here's the headline:

**AI Visibility Score: {{score}}/100**
**Information Gaps: {{gap_count}}**
**Factual Errors: {{error_count}}**
**AI Models Checked: {{model_count}}**

The gaps aren't surprising — most companies have them. What matters is that each one comes with a specific content recommendation. We're not just diagnosing; we're telling you exactly what to publish.

**Your #1 priority gap:**

{{priority_gap_name}} — {{priority_gap_description}}

**What to publish:** {{priority_gap_template_summary}}

We've included a template in your dashboard. It's a starting point — adapt it to your voice and data.

[View your full report →]({{dashboard_url}})

Troy

---

### Onboarding Email 3: The Monday Report Explained
**Send:** First Monday after signup
**Subject:** Your first Monday Report — here's how to read it

---

Hi {{first_name}},

Your Monday Report just landed. Here's a quick guide to what you're looking at:

**📊 Score Trend** — Your AI visibility over time. It takes 2-4 weeks for content changes to show up in AI responses. Don't expect movement yet.

**🔍 What AI Said This Week** — Actual quotes from AI models when asked about {{company_name}}. Scan for anything that makes you wince.

**⚠️ Gaps & Errors** — What's still missing or wrong. Sorted by candidate impact.

**✅ What's Working** — Content you've published that AI is now citing. This is where you'll see progress.

**📝 This Week's Priority** — One specific content recommendation. If you do nothing else, do this one.

{{#if competitor_benchmarking}}
**🏆 Competitor Watch** — How {{competitor_1}} and {{competitor_2}} moved this week.
{{/if}}

The first few weeks are about establishing your baseline. Publish content, and we'll track whether AI picks it up. Most companies see their first citation shift within 2-3 weeks.

[Open your Monday Report →]({{report_url}})

Troy

---

### Onboarding Email 4: First Win Check-In
**Send:** Day 14
**Subject:** Have you published your first piece yet?

---

Hi {{first_name}},

Two weeks in. Quick check-in.

{{#if content_published}}
We've noticed new content on {{published_url}}. Nice work — we're tracking whether AI picks it up. You should see changes reflected in next Monday's report.
{{/if}}

{{#if no_content_published}}
We haven't detected any new content on your careers site yet. No judgement — I know publishing takes internal approval and copywriting time.

Here's the fastest path to your first win:

**Publish your interview process.** One page. 300 words. Here's the template:

> **How to prepare for an interview at {{company_name}}**
>
> Our interview process has [X] stages: [list them].
>
> In the first round, expect [describe]. We're looking for [what you value].
>
> To prepare, we'd recommend [honest advice].
>
> The process typically takes [timeline] from first conversation to offer.

That's it. Put it on your careers page. AI picks this up faster than almost anything else because candidates ask about interviews constantly.

Need help? Just reply — happy to draft something specific for {{company_name}}.
{{/if}}

Troy

---

## 4. Win-Back / Re-Engagement Sequence

**Trigger:** Ran an audit 30+ days ago, never signed up
**Goal:** Re-engage with fresh data

---

### Win-Back Email 1: Things Have Changed
**Send:** 30 days after last audit
**Subject:** {{company_name}}'s AI score changed since you last checked

---

Hi {{first_name}},

A month ago you ran an AI audit on {{company_name}}. A few things have shifted:

{{#if score_changed}}
**Your score moved from {{old_score}} to {{new_score}}/100.** {{score_change_context}}
{{/if}}

{{#if competitor_changed}}
**{{competitor_name}} in your space went from {{c_old_score}} to {{c_new_score}}.** They published new careers content — and AI noticed.
{{/if}}

{{#if new_gap}}
**New gap detected:** {{new_gap_description}}. This question wasn't showing up in AI a month ago. It is now — and there's no good answer about {{company_name}}.
{{/if}}

AI search updates constantly. What candidates saw a month ago isn't what they see today.

[Re-run your audit (free) →]({{audit_url}})

Troy
OpenRole

---

### Win-Back Email 2: Industry Report
**Send:** Day 37 (7 days after Email 1)
**Subject:** {{industry}} AI Employer Visibility — February 2026

---

Hi {{first_name}},

We just published the February UK Visibility Index for {{industry}}.

**Top 5 most AI-visible employers in {{industry}}:**

1. {{rank_1}} — {{r1_score}}/100
2. {{rank_2}} — {{r2_score}}/100
3. {{rank_3}} — {{r3_score}}/100
4. {{rank_4}} — {{r4_score}}/100
5. {{rank_5}} — {{r5_score}}/100

{{#if company_in_top_20}}
**{{company_name}} ranked #{{rank}}.** Not bad — but there's room to move up.
{{/if}}

{{#if company_not_ranked}}
**{{company_name}} didn't make the top 20.** That means when candidates ask AI "who are the best {{industry}} employers in the UK?", you're not in the answer.
{{/if}}

[See the full {{industry}} rankings →]({{index_url}})

Troy
OpenRole

---

## 5. Churn Prevention / Cancellation Sequence

**Trigger:** User cancels or doesn't renew
**Goal:** Save the account or learn why they left

---

### Cancellation Email 1: Your Account
**Send:** Immediately on cancellation
**Subject:** Your OpenRole account

---

Hi {{first_name}},

Your plan's been cancelled. No hard feelings.

Your audit history and reports are still available for 30 days if you need to reference anything.

Before you go, one question — what didn't work? I'm not going to try to talk you out of it, but I genuinely want to know:

- [ ] Didn't see results fast enough
- [ ] Too expensive for what we deliver
- [ ] Not a priority right now
- [ ] Handling it internally
- [ ] Something else

[Quick 30-second feedback →]({{feedback_url}})

Alternatively, just reply to this email. I read every one.

Troy Samuels
Founder, OpenRole

---

### Cancellation Email 2: Your Score Since
**Send:** 30 days after cancellation
**Subject:** {{company_name}}'s AI score since you left

---

Hi {{first_name}},

Quick update — we're still tracking {{company_name}} as part of the UK Visibility Index.

**Your score when you cancelled:** {{cancel_score}}/100
**Your score today:** {{current_score}}/100

{{#if score_dropped}}
It's dropped. Without fresh content and monitoring, AI answers tend to drift back toward Glassdoor defaults. The content you published is still helping, but competitors are publishing too.
{{/if}}

{{#if score_stable}}
Holding steady — the content you published while you were with us is still being cited. That's good. But your competitors are actively publishing, and the gap is narrowing.
{{/if}}

No pressure. Just thought you'd want to know.

[Re-activate your plan →]({{reactivate_url}})

Troy

---

## 6. Referral / Expansion Emails

**Trigger:** Customer has been active 60+ days with improving scores
**Goal:** Get referrals or upsell to higher tier

---

### Referral Email
**Subject:** Know anyone else who'd want this?
**Send:** 60 days in, if score improved by 15+

---

Hi {{first_name}},

{{company_name}} has gone from {{start_score}} to {{current_score}}/100 since you started. AI is citing your content on {{citations_count}} topics now. That's real progress.

If you know another HR or TA leader who'd find this useful, I'd appreciate the introduction. No referral scheme or gimmicks — I'd just like to help more companies see what you've seen.

Just reply with their name and email and I'll send them a personalised audit. Or forward this — I'll take it from there.

Troy

---

## 7. Transactional Emails

### Monday Report Delivery
**Subject:** Your Monday Report — {{date}}
**Body:** Summary stats + link to full report. Keep it scannable.

### Score Alert (Significant Change)
**Subject:** ⚠️ AI changed what it says about {{company_name}}
**Body:** What changed, which model, what the new answer is, whether it's better or worse.

### Gap Closed Celebration
**Subject:** ✅ AI is now citing your {{topic}} content
**Body:** Which gap was closed, which AI model is citing their content, before/after comparison.

### Hallucination Alert
**Subject:** ⚠️ AI is stating something wrong about {{company_name}}
**Body:** What's being said, which model, what the truth is, recommended action.

---

## Email Design Notes

- **Plain text first.** These should feel like emails from a person, not a marketing platform. Minimal HTML. No hero images. No gradient buttons.
- **Sender:** Troy Samuels (founder — personal trust). Switch to team sender only at scale.
- **Reply-to:** A real inbox that gets read.
- **Unsubscribe:** Always present, one click. Legal requirement, but also respect.
- **Mobile-first:** Most HR people check email on phones. Short paragraphs, clear CTAs.
- **Personalisation:** Company name, industry, actual audit data, competitor names. Never generic.
- **Frequency cap:** No more than 3 emails per week. Ever. Respect inboxes.

---

## Sending Infrastructure

### Recommended Stack
- **Resend** (transactional + marketing) — clean API, good deliverability
- **Custom domain:** `mail.openrole.co.uk` (SPF, DKIM, DMARC configured)
- **Templates:** React Email (matches the Next.js stack)
- **Tracking:** Open rates + click rates only. No invasive pixel tracking.

### Deliverability Checklist
- [ ] SPF record on openrole.co.uk
- [ ] DKIM signing via Resend
- [ ] DMARC policy published
- [ ] Warm up sending domain (start with 50/day, scale over 2 weeks)
- [ ] Monitor bounce rates — remove hard bounces immediately
- [ ] Suppression list for unsubscribes (legal requirement)
