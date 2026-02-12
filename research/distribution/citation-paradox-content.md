# Citation Paradox — Marketing Content Pack

**Based on:** research/citation-paradox-robots-txt.md
**Created:** 2026-02-12
**Theme:** The sites AI cites most have all locked AI out — and your employer brand is stuck in the middle

---

## 1. LinkedIn Post — HR Directors / Talent Leaders

**Target:** HR Directors, Heads of TA, Employer Brand Managers
**Tone:** Authoritative, data-backed, slightly provocative
**Best time:** Tue-Thu, 07:30-08:30 GMT

---

I spent yesterday morning reading the robots.txt files of every major employer review platform.

What I found should worry every Head of Talent Acquisition.

**Every platform candidates rely on has locked AI out:**

→ Glassdoor: Full Cloudflare fortress. Even automated requests get a "prove you're human" wall. Can't access *anything*.

→ Reddit: Three lines. "User-agent: * / Disallow: /" — blocks every bot, every page. Then sold exclusive data access to Google for $60M/year.

→ Indeed: The most sophisticated approach. They *allow* ChatGPT to browse in real-time but *block* all AI training crawlers. Your Indeed profile exists in two versions — the live one, and the stale one baked into AI's memory.

→ LinkedIn: Explicit legal threats against any automated access. Selective crawling only for Google.

**Here's the problem:**

AI models still cite all of these platforms when candidates ask about your company. They just cite data from 2022-2023 — before the lockdowns.

That Glassdoor review about your old CEO? Still in ChatGPT's training data.
That Reddit thread about your interview process from three years ago? Permanently embedded.
That outdated salary range on Indeed? Frozen in model weights.

And every month these platforms keep AI locked out, the gap between reality and what AI tells candidates gets wider.

**The only data channel you actually control is your own website.**

When I audited 10 UK tech companies, I found only one (Levels.fyi — not even an employer, an *aggregator*) providing machine-readable employer data to AI.

They offer:
• An llms.txt file for structured AI access
• Markdown-formatted salary pages specifically for LLM consumption
• Explicit AI attribution requests in their robots.txt

Meanwhile, the companies those candidates actually want to work at? Their careers pages are thin, their structured data is missing, and AI fills the gap with stale third-party data.

The fix isn't complicated. It starts with knowing what AI currently says about you.

Ask ChatGPT: "What's it like to work at [your company]?"

Then ask yourself: did we write that answer, or did a platform that locked its doors two years ago?

#EmployerBrand #TalentAcquisition #AI #Recruiting

---

## 2. LinkedIn Post — Startup Founders / CEOs

**Target:** Series A-C founders, especially those hiring aggressively
**Tone:** Founder-to-founder, direct, slightly alarming
**Best time:** Mon-Wed, 08:00-09:00 GMT

---

Your biggest competitor for talent isn't another startup.

It's a Glassdoor review from 2022 that AI keeps quoting to every candidate who asks about you.

I pulled the robots.txt files from every major employer review platform this week.

Every single one blocks AI crawlers.

Glassdoor? Full Cloudflare lockdown — even the robots.txt page returns a "prove you're human" challenge.

Reddit? `Disallow: /` for everything. They sold exclusive AI access to Google for $60M and blocked everyone else.

Indeed? Lets ChatGPT *browse* but blocks all *training* — so the AI's base knowledge is frozen from 2023.

What this means for your startup:

1. AI models answer candidate questions about you using data that's 2-3 years old
2. The platforms that host that data have locked AI out, so no corrections flow through
3. Every month, the gap between your actual culture and what AI says gets wider
4. The ONLY data you control is your own website — and most startups treat their careers page as an afterthought

I've seen Series B companies with incredible cultures get described by ChatGPT using a bitter ex-employee's Glassdoor review from before the pivot.

The fix: make your careers page the authoritative source. Structured data, salary transparency, llms.txt.

Or keep letting a 3-year-old Glassdoor review do your recruiting for you.

---

## 3. Twitter/X Thread — Research Findings

**Tone:** Research-driven, specific data points, slightly incredulous
**Hook:** Lead with the most surprising finding

---

**Tweet 1 (hook):**
I just read the robots.txt files of every major employer review platform.

Every single one has locked AI out.

But AI still cites them constantly.

Here's what's actually happening 🧵

**Tweet 2:**
Glassdoor has gone full fortress.

They don't just block AI crawlers — they block EVERYTHING automated. Even requesting their robots.txt returns a Cloudflare "prove you're human" challenge.

No bot of any kind can access any Glassdoor page.

**Tweet 3:**
Reddit's robots.txt is three lines:

User-agent: *
Disallow: /

Total lockout. Every bot, every page.

They then sold exclusive AI data access to Google for $60M/year.

Everyone else? Blocked.

**Tweet 4:**
Indeed is the most interesting.

They ALLOW:
• ChatGPT-User (real-time browsing)
• OAI-SearchBot

They BLOCK:
• GPTBot (training)
• anthropic-ai (Claude)
• CCBot (Common Crawl)
• Google-Extended

Same company, two different versions in AI.

**Tweet 5:**
Levels.fyi is doing something nobody else is.

Their robots.txt:
- Allows AI search bots ✅
- Blocks AI training bots ❌
- Provides an llms.txt file
- Serves markdown versions of pages for AI readability
- Includes attribution requests

This is the model.

**Tweet 6:**
So why do AI models still cite Glassdoor, Indeed, and Reddit constantly?

5 reasons:

1. Training data from 2019-2023 (pre-lockdown) is permanently embedded
2. Common Crawl archives contain billions of pages from these sites
3. News articles and blogs quote their data — AI reads those instead

**Tweet 7:**
4. Some models (ChatGPT) can browse Indeed in real-time, but the BASE model knowledge is frozen

5. Models sometimes fabricate plausible URLs — that Glassdoor link in the citation might not even exist

**Tweet 8:**
What this means for employers:

AI answers candidate questions about your company using data from platforms that:
- You don't control
- Have locked AI out
- Won't show improvements you've made since 2023

And the gap gets wider every month.

**Tweet 9:**
The fix:

Make your own website the authoritative source.
- Structured data (JSON-LD)
- Transparent salary information
- llms.txt file (like Levels.fyi)
- Rich careers page content

This is the only channel AI can actually read and update from.

**Tweet 10:**
Quick test: ask ChatGPT "What's it like to work at [your company]?"

Then compare the answer to reality.

If there's a gap — and there almost always is — the only way to close it is through your own site.

The platforms that used to shape your reputation have left the building.

---

## 4. Reddit Comments — Targeted Engagement

### r/humanresources

**Thread type:** Drop into any thread about employer branding, Glassdoor reputation, or recruiting challenges

**Comment:**
> glassdoor literally blocks all automated access now, even their robots.txt returns a cloudflare challenge page. same with reddit (disallow everything). so all the AI stuff candidates are using? running on 2-3 year old data from these sites that got scraped before the lockdowns. kinda wild that nobody's talking about this

### r/recruiting

**Thread type:** Any discussion about candidate experience, AI in hiring, or employer reputation

**Comment:**
> the thing that gets me is indeed actually lets chatgpt browse their site in real time but blocks all the training crawlers. so there's literally two different versions of your company in AI depending on whether someone uses chatgpt (current-ish) or claude (frozen 2023 data)

### r/startups

**Thread type:** Hiring threads, employer brand discussions, or AI impact threads

**Comment:**
> pulled the robots.txt from glassdoor, indeed, reddit, linkedin the other day. every single one blocks AI training crawlers now. but AI still cites all of them because the old data is permanently in the training set. so your careers page is basically the only thing you control that AI can actually read and update from

### r/cscareerquestions

**Thread type:** "What's it like to work at X" threads, salary discussion, AI tools for job search

**Comment:**
> fwiw i checked and chatgpt is literally running on glassdoor data from like 2022-2023. glassdoor has completely locked out all automated access since then so nothing new gets through. the salary numbers and reviews AI quotes are frozen in time basically

### r/SEO or r/TechSEO

**Thread type:** AI search, LLM optimization, robots.txt discussions

**Comment:**
> levels.fyi has the most interesting robots.txt i've ever seen. allows search bots (chatgpt-user, perplexitybot) but blocks training bots (gptbot, claudebot). they also serve .md versions of their pages for llm consumption and have an llms.txt file. meanwhile glassdoor can't even serve their robots.txt without a cloudflare challenge

---

## 5. Hacker News — Show HN or Comment

**Thread type:** Any AI/LLM thread, robots.txt discussion, or web crawling topic

**Title option (if posting):**
"I audited the robots.txt of every major employer review platform. They've all locked AI out."

**Comment (for relevant threads):**

Interesting finding from auditing employer data platforms:

- Glassdoor: full Cloudflare fortress, returns 403 on robots.txt itself
- Reddit: `User-agent: * / Disallow: /` (total block, $60M Google exclusivity)
- Indeed: allows ChatGPT-User + OAI-SearchBot, blocks GPTBot + anthropic-ai + CCBot (nuanced)
- Levels.fyi: allows search bots, blocks training, provides llms.txt + markdown pages
- LinkedIn: selective Googlebot access, legal threats for everyone else

The result: AI models cite all of these platforms constantly using pre-lockdown training data. The gap between what AI says and reality grows wider every month.

Only Levels.fyi has figured out the right approach — treat AI as a distribution channel, control what it sees, get attribution.

---

## 6. Blog Article Outline — "The Citation Paradox"

**Target:** Long-form SEO content for rankwell.io/blog
**Length:** ~2,500 words
**Keywords:** AI employer brand, robots.txt AI blocking, Glassdoor AI, employer reputation AI

### Outline:

1. **The Prompt Test** (open with the hook)
   - Ask ChatGPT about any company → it cites Glassdoor, Indeed, Reddit
   - But all three have locked AI out

2. **The Evidence** (platform-by-platform breakdown)
   - Glassdoor: Cloudflare fortress
   - Indeed: selective blocking (the most interesting case)
   - Reddit: nuclear option + Google deal
   - LinkedIn: legal threats
   - Table comparing all platforms

3. **Why Citations Persist** (the five layers)
   - Historical training data
   - Common Crawl archives
   - Secondary source propagation
   - Real-time search inconsistency
   - URL fabrication

4. **The Model That Works** (Levels.fyi case study)
   - How they structure AI access
   - llms.txt as the solution
   - Attribution in robots.txt

5. **What This Means For Your Company**
   - The data decay problem
   - The differential access problem (different AI = different answer)
   - The vacancy in first-party data

6. **The Fix** (actionable steps)
   - The Prompt Test (free, do it now)
   - Structured data on your careers page
   - llms.txt file
   - Salary transparency
   - Link to free audit tool

---

## Posting Schedule

| Day | Platform | Content | Priority |
|-----|----------|---------|----------|
| Day 1 | LinkedIn (HR post) | Post #1 | 🔴 High |
| Day 1 | Twitter thread | Post #3 | 🔴 High |
| Day 2 | LinkedIn (founders) | Post #2 | 🟡 Medium |
| Day 2 | r/recruiting comment | Post #4 | 🟡 Medium |
| Day 3 | Hacker News | Post #5 | 🟡 Medium |
| Day 3 | r/cscareerquestions | Post #4 | 🟡 Medium |
| Day 4 | r/SEO | Post #4 | 🟢 Low |
| Day 5 | Blog article | Post #6 | 🔴 High (SEO) |
| Day 5 | r/humanresources | Post #4 | 🟢 Low |
| Day 7 | r/startups | Post #4 | 🟢 Low |

---

## Key Stats for All Content

- Glassdoor: 403 on ALL automated requests (including robots.txt)
- Reddit: $60M/year exclusive Google AI deal, everyone else blocked
- Indeed: allows ChatGPT-User, blocks 11 AI training crawlers by name
- Levels.fyi: only platform with llms.txt + markdown for AI
- LinkedIn: "strictly prohibited" language in robots.txt header
- Blind: blocks GPTBot, ClaudeBot, anthropic-ai, Meta, Google-Extended, Bytespider
- Kununu: only blocks ClaudeBot (incomplete, likely oversight)
