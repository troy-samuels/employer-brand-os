# The Citation Paradox: Why Blocked Sites Still Dominate AI Answers

**Research date:** 2026-02-12
**Researcher:** Malcolm (OpenRole)

---

## The Core Contradiction

AI models consistently cite Glassdoor, Indeed, Reddit, and LinkedIn as sources when answering employer brand questions — yet every single one of these platforms actively blocks AI crawlers. This isn't a bug. It's the defining feature of the AI employer brand problem.

---

## Platform-by-Platform Analysis

### 🔴 Glassdoor — Full Fortress

**Status:** Cannot even serve robots.txt to automated requests
**Enforcement:** Cloudflare challenge page on ALL automated access (403)
**What this means:** Glassdoor doesn't just block AI bots via robots.txt — they block *everything* that isn't a human browser. The robots.txt file itself returns a Cloudflare "verify you're human" challenge.

**Yet AI models cite Glassdoor because:**
- Training data includes massive Glassdoor scrapes from 2019-2023 (pre-lockdown)
- Common Crawl archives contained billions of Glassdoor review pages
- Glassdoor reviews are heavily quoted in news articles, blog posts, and forums — all of which were crawled
- Models reconstruct plausible Glassdoor URLs from pattern memory (e.g., `glassdoor.com/Salary/CompanyName-Salaries-E12345.htm`)

**The employer impact:** Reviews from 2-4 years ago are permanently baked into AI knowledge. A company that had a toxic culture in 2021 but transformed in 2023 will still be described by the old reviews — because Glassdoor's lockdown prevents AI from seeing the improvement.

---

### 🔴 Indeed — Selective Blocking (Training Bots Blocked, Search Bots Allowed)

**Status:** robots.txt accessible via Wayback Machine (Dec 2025 snapshot)
**Key finding:** Indeed has a *nuanced* strategy — the most sophisticated of any job platform.

**Allowed (can crawl):**
- `Googlebot` ✅
- `OAI-SearchBot` ✅ (OpenAI's search bot — for ChatGPT web browsing)
- `ChatGPT-User` ✅ (real-time ChatGPT retrieval)
- `Bingbot` ✅
- `DuckDuckBot` ✅

**Blocked (cannot crawl):**
- `GPTBot` ❌ (OpenAI's *training* crawler)
- `Google-Extended` ❌ (Google's AI training crawler)
- `CCBot` ❌ (Common Crawl — the backbone of most training datasets)
- `anthropic-ai` ❌ (Claude's crawler)
- `FacebookBot` ❌ (Meta's crawler)
- `AmazonBot` ❌
- `Bytespider` ❌ (ByteDance/TikTok)
- `Baiduspider` ❌
- `cohere-training-data-crawler` ❌
- `img2dataset` ❌

**Critical detail:** Even for blocked training bots, Indeed selectively blocks the *valuable* pages — company reviews (`/cmp/`), career advice (`/career-advice/`), job listings (`/jobs`), salary data, and company profiles. They're protecting their monetisable content while allowing search visibility.

**The employer impact:** Indeed allows ChatGPT to browse in real-time but prevents new training. So ChatGPT can quote current Indeed data in conversations, but the base model's knowledge is frozen from whenever training data was cut off. This creates a two-tier information system: live browsing (current but ephemeral) vs embedded knowledge (stale but persistent).

---

### 🔴 Reddit — Total Lockout

**Status:** robots.txt is stark — 3 lines
```
User-agent: *
Disallow: /
```

**What this means:** Reddit blocks ALL automated crawling by ALL bots. Every bot, every page. This is the most aggressive stance of any major platform.

**Context:** Reddit signed a $60M/year deal with Google (Feb 2024) for AI training data access. They then blocked everyone else. This is pure data monetisation — Reddit sells its data to approved partners and walls off everyone else.

**Yet AI models cite Reddit constantly because:**
- Reddit was one of the most heavily represented sites in Common Crawl (pre-2024)
- The entire Pushshift dataset (2005-2023, billions of Reddit posts) was widely used for LLM training before Reddit revoked API access
- r/cscareerquestions, r/recruiting, r/jobs content is deeply embedded in model knowledge about employer brands
- Reddit discussions about companies are some of the most candid, detailed employer insights available

**The employer impact:** AI models reference "according to Reddit discussions" with data that's potentially 2+ years old. A Redditor's bad interview experience from 2022 can permanently shape how AI describes your hiring process. Reddit's lockout means no corrections flow back.

---

### 🟡 LinkedIn — Heavy Restrictions with Strategic Openings

**Status:** Detailed robots.txt with explicit threat language
**Opening statement:** *"The use of robots or other automated means to access LinkedIn without the express permission of LinkedIn is strictly prohibited."*

**Allowed for Googlebot:** Company pages, job listings, public profiles (selectively)
**Blocked for everyone:** Search, messaging, connections, groups, most user data
**No mention of:** GPTBot, ClaudeBot, or any AI-specific crawlers (blocked by default via restrictive `User-agent: *` rules and explicit permission language)

**The employer impact:** LinkedIn company pages are partially crawlable by Google, meaning AI can access them indirectly through Google's index. But the rich engagement data (employee posts, comments, pulse articles) is walled off. AI gets a thin view of your LinkedIn employer brand.

---

### 🟢 Levels.fyi — The Enlightened Approach

**Status:** The most sophisticated and AI-aware robots.txt of any employer data platform

**Key innovation:** Levels.fyi explicitly distinguishes between AI *search* bots and AI *training* bots:

**Allowed (search/retrieval):**
- `OAI-SearchBot` ✅
- `ChatGPT-User` ✅
- `PerplexityBot` ✅
- `Googlebot` ✅

**Blocked (training):**
- `GPTBot` ❌
- `Google-Extended` ❌
- `anthropic-ai` / `ClaudeBot` / `Claude-Web` ❌
- `CCBot` ❌
- `Bytespider` ❌
- `cohere-ai` ❌

**Remarkable extras:**
- Provides an `llms.txt` file at `https://levels.fyi/llms.txt`
- Offers `.md` (markdown) versions of salary pages for LLM-readable consumption
- Includes an attribution request in their robots.txt asking AI to cite and link back
- Explicitly offers API access and data licensing

**This is the model OpenRole should champion.** Levels.fyi treats AI as a distribution channel, not a threat. They control what AI sees, ensure it's accurate, and get attribution in return.

---

### 🟡 Kununu (Glassdoor equivalent for DACH region)

**Status:** Blocks ClaudeBot specifically
```
User-agent: ClaudeBot
Disallow: /
```
**No blocking of:** GPTBot, CCBot, or other AI crawlers (likely an oversight — they only added Claude)

**The employer impact:** European employer review data has inconsistent AI access — Claude can't see Kununu but ChatGPT potentially can.

---

### 🟡 Blind (TeamBlind) — Tech Industry Forum

**Status:** Blocks all major AI training and retrieval bots
```
User-agent: GPTBot — ❌
User-agent: CCBot — ❌
User-agent: ClaudeBot — ❌
User-agent: anthropic-ai — ❌
User-agent: FacebookBot — ❌
User-agent: meta-externalagent — ❌
User-agent: Google-Extended — ❌
User-agent: Applebot-Extended — ❌
User-agent: Bytespider — ❌
```

**The employer impact:** Blind contains some of the most detailed, anonymous employer insights (compensation, culture, management issues). All of this is now walled off from AI, but the historical training data remains embedded.

---

### 🟡 Trustpilot — No AI-Specific Blocking

**Status:** No GPTBot/ClaudeBot/CCBot mentions in robots.txt
**But:** Blocks individual review pages (`/reviews/`) for ALL crawlers including Googlebot — they only allow company profile pages, not individual review content.

**The employer impact:** AI can access Trustpilot company profiles but not the actual review content that shapes perception.

---

### 🟢 BuiltIn — Strategic AI Access

**Status:** Allows GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot with selective access
**Allowed pages:** Company profiles, jobs, salaries, awards, articles
**Blocked:** Everything else

**This is another model of intelligent AI engagement** — BuiltIn treats company profiles as marketing assets that *should* be visible to AI.

---

### 🟡 Comparably — No AI-Specific Rules

**Status:** Basic robots.txt with no mention of AI crawlers
**Default `User-agent: *`:** Generally permissive (only blocks `/report` and internal sitemaps)
**Blocks `omgilibot`:** Specific data harvester blocked

---

## The Five Layers of the Citation Paradox

### Layer 1: Historical Training Data (Permanent)
Models were trained on web scrapes from 2019-2024. Glassdoor, Indeed, and Reddit were some of the most heavily represented employer brand sources. **This data is permanently embedded** — no robots.txt change can remove it.

### Layer 2: Common Crawl Archives (Frozen)
The Common Crawl corpus, used to train most major LLMs, contains billions of pages from these platforms scraped before the lockdowns. CCBot is now blocked everywhere, but the archive remains a foundational training resource.

### Layer 3: Secondary Source Propagation
Glassdoor data appears in thousands of news articles, blog posts, salary guides, and career advice sites. Even if AI can't access Glassdoor directly, it can access sites that *quote* Glassdoor. The information propagates through the web graph.

### Layer 4: Real-Time Search (Inconsistent)
Some models (ChatGPT via OAI-SearchBot, Perplexity) can do real-time web retrieval. Indeed *allows* this. Glassdoor blocks it entirely. This creates inconsistency — the same question gets different-vintage data depending on which model answers it.

### Layer 5: URL Fabrication
Models sometimes generate plausible-looking URLs that don't actually resolve to real pages. A citation of `glassdoor.com/Reviews/CompanyName-Reviews-E12345.htm` may look authoritative but could be a pattern-matched hallucination.

---

## What This Means for Employers

### The Catch-22
1. **You can't update third-party sources** — Glassdoor and Indeed control their content, and both have now locked AI out
2. **You can't remove stale data from AI training** — it's permanently embedded in model weights
3. **You can't correct AI through these platforms** — the blocked crawlers ensure no new data flows in
4. **The only channel you control is your own website** — and most employers haven't optimised it for AI consumption

### The Vacuum Effect
When platforms block AI crawlers, they create an information vacuum. AI models still need to answer employer questions — they just answer with **increasingly stale data**. Every month that passes with these blocks in place, the gap between reality and AI's knowledge grows wider.

### The Differential Access Problem
Indeed allows ChatGPT-User but blocks Claude's crawler. Glassdoor blocks everything. LinkedIn partially allows Google. This means different AI models have different levels of access to employer data, creating inconsistent candidate experiences depending on which AI they use.

---

## The OpenRole Opportunity

This research validates the entire OpenRole thesis:

1. **First-party data is the only reliable channel** — everything else is blocked, stale, or inconsistent
2. **llms.txt is the Levels.fyi model** — the only platform getting AI right is the one providing machine-readable employer data directly
3. **The audit tool is now provably necessary** — employers need to see what each AI model says, because the answer literally depends on which crawlers each source allows
4. **The problem gets worse over time** — as more platforms lock down, the data decay accelerates
5. **Structured data (JSON-LD) bypasses the whole problem** — Google still crawls employer sites, and Google's Knowledge Graph feeds into AI models

---

## Sources

| Platform | robots.txt Status | AI Training Bots | AI Search Bots | Notes |
|----------|------------------|-----------------|----------------|-------|
| Glassdoor | 403 (Cloudflare) | ❌ Blocked (assumed) | ❌ Blocked | Can't even serve robots.txt |
| Indeed | Accessible (archived) | ❌ GPTBot, CCBot, anthropic-ai, etc. | ✅ OAI-SearchBot, ChatGPT-User | Most nuanced approach |
| Reddit | Accessible | ❌ All (`Disallow: /`) | ❌ All | $60M Google deal, everyone else blocked |
| LinkedIn | Accessible | ❌ Not mentioned (default block) | ⚠️ Googlebot only (selective) | Explicit legal threats |
| Levels.fyi | Accessible | ❌ GPTBot, ClaudeBot, CCBot, etc. | ✅ OAI-SearchBot, ChatGPT-User, PerplexityBot | Has llms.txt + markdown pages |
| Kununu | Accessible | ⚠️ Only ClaudeBot blocked | ✅ Others allowed | Incomplete blocking |
| Blind | Accessible | ❌ All major AI bots | ❌ All major AI bots | Comprehensive block |
| Trustpilot | Accessible | ⚠️ No AI-specific rules | ⚠️ No AI-specific rules | Blocks /reviews/ for everyone |
| BuiltIn | Accessible | ❌ Not explicitly (default) | ✅ GPTBot, ChatGPT-User, PerplexityBot (selective) | Strategic AI access |
| Comparably | Accessible | ⚠️ No AI-specific rules | ✅ Generally permissive | Basic robots.txt |

*All robots.txt data captured 2026-02-12. Glassdoor and Indeed primary domains verified via Cloudflare challenge (403) and Wayback Machine archive respectively.*
