# Hacker News Posts — OpenRole

> Created 12 Feb 2026 by Malcolm
> Rule: HN audience is technical, sceptical, and allergic to marketing. Lead with the interesting technical/societal problem. Show, don't sell.

---

## Post 1: Show HN

**Title:** Show HN: AI Employer Index – What ChatGPT, Perplexity and Gemini say about UK companies as employers

**URL:** [openrole.co.uk/index]

**Body (Show HN text):**

Hey HN,

I built a tool that queries multiple AI models (ChatGPT, Perplexity, Gemini, Claude) with the prompt "What's it like to work at [Company]?" and scores the response for accuracy, completeness, and consistency.

The motivation was simple: candidates increasingly use AI to research potential employers before applying. But the answers they get are often wrong — fabricated benefits, outdated culture descriptions, salary data from the wrong country, companies confused with similarly-named organisations.

The index ranks companies by their "AI Employer Visibility Score" based on:
- Factual accuracy of AI responses (verified against public company data)
- Consistency across models (does ChatGPT agree with Gemini?)
- Recency of information (is the AI stuck on 2023 Glassdoor reviews?)
- Completeness (does it cover salary, culture, benefits, growth?)

Some findings from auditing ~50 UK companies:
- 78% had at least one factually incorrect claim in AI responses
- Salary estimates were off by 15-30% for most
- Models disagreed with each other significantly on culture descriptions
- Companies with strong structured data (schema markup, consistent messaging) scored notably higher

The free audit tool lets you check any company. Interested in feedback on methodology and whether the scoring framework makes sense.

Stack: Next.js, Supabase, querying models via their APIs.

---

## Post 2: Regular Submission

**Title:** AI models are giving candidates wrong information about employers, and nobody is monitoring it

**URL:** [link to a blog post or the research summary page]

**Body:** (HN regular submissions are URL-only, no body text. Below is the article content that the URL should point to.)

---

### Article: The Employer Reputation Blind Spot in AI

**Subhead:** What happens when candidates skip Google and ask ChatGPT about your company instead?

Something interesting is happening in hiring. Candidates — especially in tech — are no longer starting their employer research on Google or Glassdoor. They're asking AI.

"What's it like to work at [Company]?" typed into ChatGPT returns a confident, detailed, single-paragraph answer. No links to check. No reviews to weigh. Just an authoritative-sounding summary synthesised from whatever the model can access.

The problem? These answers are frequently wrong.

**What we found**

We audited 50 UK companies across ChatGPT, Perplexity, Gemini, and Claude, asking each model basic employer questions: culture, salary, benefits, work-life balance.

The accuracy rate was surprisingly poor:

- **78% of companies** had at least one factually incorrect claim in the AI response
- **Salary estimates** were wrong by 15-30% for most companies. One UK company was quoted US market rates. Another had a range £20k below their actual offers.
- **Benefits fabrication** was common. Companies were described as offering four-day weeks, equity packages, and sabbaticals they don't actually have.
- **Culture descriptions** were heavily weighted by Glassdoor reviews from 2-3 years ago, presenting an outdated picture as current fact.
- **Company confusion** occurred in several cases — similarly-named companies having their details mixed together.

**Why this matters**

When AI gives a candidate a negative or inaccurate answer about an employer, that candidate doesn't apply. There's no abandoned application to track. No bounce rate to measure. No feedback to collect. It's invisible attrition.

For companies spending significant budget on employer branding — careers pages, EVPs, recruitment marketing — this is a blind spot. All that investment can be undermined by an AI response the company never sees.

**The technical angle**

This is fundamentally a data provenance and source attribution problem. AI models synthesise employer information from:

1. **Glassdoor reviews** — heavily weighted, often outdated, frequently gamed
2. **Reddit discussions** — including threads from rejected candidates, trolls, throwaway accounts
3. **LinkedIn pages** — official but often generic
4. **News articles** — including negative coverage that may be years old
5. **Careers pages** — if they're structured well enough for the model to parse

The models apply no recency weighting, no source credibility filtering, and no fact-checking against the company's own stated information. They also hallucinate — confidently stating facts that exist in no source at all.

**The llms.txt parallel**

There's an emerging standard called llms.txt (analogous to robots.txt) that lets site owners provide a machine-readable summary for AI models. It's early, and there's no guarantee models will respect it — but it represents the beginning of a negotiation between companies and AI about how their information is represented.

For employer brands specifically, this could mean providing canonical salary ranges, benefits lists, culture descriptors, and employee statistics in a format AI models can parse and trust over less authoritative sources.

**The market gap**

There are tools for monitoring what social media says about you (Brand24, Brandwatch). There are tools for monitoring your reviews (Glassdoor, Indeed). There are even emerging tools for monitoring your brand in AI responses (Otterly.ai, Profound).

But nobody has built this specifically for employer reputation. The $6-8B employer branding industry is optimising for a world where candidates Google you — while candidates are increasingly asking AI about you instead.

**What you can try**

Open ChatGPT, Perplexity, or Gemini and ask: "What's it like to work at [your company]?" Compare the answer to reality. If you're an employer, you might find it illuminating. If you're a candidate, you might think twice about trusting AI for company research.

---

### Suggested HN Comment (if discussion develops)

**If asked "How is this different from Glassdoor?":**

Glassdoor monitors what humans write about you. This monitors what AI tells candidates about you, which is synthesised from Glassdoor plus dozens of other sources — and frequently hallucinated. The AI answer is what candidates increasingly see first and often last.

**If asked "Can't you just prompt-engineer your way to better answers?":**

Not really. AI models pull from training data and retrieval sources. You can influence the sources (better structured data on your careers page, consistent messaging across properties) but you can't game the prompt. It's more like SEO fundamentals than keyword stuffing.

**If asked "Is this actually a problem or are you manufacturing one?":**

Fair question. The data suggests it's real — MIT found only 5% of companies getting ROI from GenAI investments, Air Canada was ordered to pay damages for chatbot misinformation, and courts in 15+ countries have sanctioned AI-generated false information. The employer-specific angle is newer, but we're seeing it in interviews: candidates quoting AI-generated information that doesn't match reality.

---

*HN posts designed for the technical, sceptical audience. Problem-first, data-backed, no marketing language. Show HN follows standard format. Regular submission article provides genuine insight without being a product pitch.*
