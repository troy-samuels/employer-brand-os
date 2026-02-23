---
title: "How AI Models Really Decide What to Say About Your Company"
description: "A technical deep-dive into the architecture behind ChatGPT, Claude, and Perplexity's employer responses — and where you can intervene to control the narrative."
date: "2026-02-21"
author: "OpenRole Research Team"
category: "Technical"
readTime: "15 min"
tags: ["AI architecture", "RAG", "embeddings", "citations", "technical"]
featured: false
---

# How AI Models Really Decide What to Say About Your Company

When a candidate asks ChatGPT "What's it like to work at [your company]?", the answer appears in seconds. Confident. Specific. Often wrong.

How did the AI arrive at that answer? Where did it get the salary figure? Why did it cite Reddit but not your careers page? And most importantly: **where can you intervene to control what it says?**

This is a technical deep-dive into the architecture behind AI responses — from training data to inference to citation selection.

If you're an employer brand professional, TA leader, or developer implementing AI visibility, this is how the machine actually works.

---

## Table of Contents

1. [The Three-Layer Knowledge Stack](#three-layers)
2. [How Training Data Determines Base Knowledge](#training-data)
3. [Retrieval Augmented Generation (RAG)](#rag)
4. [Entity Recognition & Knowledge Graphs](#entities)
5. [Citation Selection Logic](#citations)
6. [Model-Specific Differences](#model-differences)
7. [Where You Can Intervene](#intervention)

---

<a name="three-layers"></a>
## 1. The Three-Layer Knowledge Stack

When an AI model answers a question about your company, it pulls from three distinct knowledge layers:

### Layer 1: Base Model (Pre-Training)
**What it is:** Facts learned during training on billions of web pages.

**Characteristics:**
- **Frozen** — doesn't update unless the model is retrained
- **Cutoff date** — typically 6-18 months old
- **Broad but shallow** — knows about major companies, weak on specifics
- **Biased toward popular content** — Wikipedia, news, Reddit get overrepresented

**Example:** If your company was mentioned in TechCrunch in 2023, that fact is "baked into" GPT-4's base knowledge.

**Implication:** For established brands, base knowledge provides a foundation. For newer companies (<5 years old), the base model likely knows very little.

---

### Layer 2: Retrieved Context (RAG)
**What it is:** Live search results or vector database lookups that the model performs **at query time**.

**Characteristics:**
- **Fresh** — can pull content from the last few hours
- **Selective** — model retrieves ~5-10 sources, not the entire web
- **Ranker-dependent** — search algorithm determines what gets retrieved
- **User-invisible** — most models don't show you the retrieved sources (Perplexity is the exception)

**Example:** You updated your careers page yesterday. If the AI retrieves it via RAG, today's response will include that new information.

**Implication:** This is your **highest-leverage intervention point**. If AI retrieves your content, you control the narrative. If it doesn't, you're at the mercy of whatever third-party content gets retrieved instead.

---

### Layer 3: Structured Knowledge (Entity Databases)
**What it is:** Verified facts from knowledge graphs and structured sources.

**Characteristics:**
- **High trust** — model treats these as authoritative
- **Specific schemas** — Organization, Person, Place, etc.
- **Cross-referenced** — multiple sources confirm the same fact
- **Machine-readable** — JSON-LD, Wikidata, schema.org

**Example:** If your company has a Wikipedia page with an infobox, that structured data is treated as "ground truth" by most AI models.

**Implication:** If you can get facts into this layer (via schema.org markup, Wikidata, or industry directories), AI trusts them more than any marketing copy.

---

## How the Layers Interact

When a user asks "What's the salary for a senior engineer at Acme Corp?", the AI:

1. **Checks base knowledge** — "Do I know what Acme Corp is?"
   - If yes → provides context (industry, size, location)
   - If no → relies entirely on retrieval

2. **Performs retrieval** — Searches for "Acme Corp senior engineer salary"
   - Retrieves 5-10 sources (job listings, forum posts, salary aggregators)
   - Ranks them by relevance and authority

3. **Cross-references structured data** — "Does Acme's schema.org markup include salary data?"
   - If yes → treats that as the most reliable figure
   - If no → synthesizes from retrieved sources

4. **Generates answer** — Combines all three layers, weighted by confidence

**The critical insight:** If you control Layer 2 (retrieval) and Layer 3 (structured data), you control the answer — even if the base model (Layer 1) knows nothing about you.

---

<a name="training-data"></a>
## 2. How Training Data Determines Base Knowledge

All AI models start with **pre-training** — learning patterns from massive text corpora.

### What Gets Included in Training Data

**For GPT-4, Claude, and similar models:**
- **Common Crawl** (billions of web pages)
- **Wikipedia** (all languages)
- **Books** (Project Gutenberg, public domain, licensed content)
- **Reddit** (via licensing deals)
- **GitHub** (code repositories)
- **News archives** (AP, Reuters, etc.)
- **Academic papers** (arXiv, PubMed)

**What's typically EXCLUDED:**
- Content behind paywalls
- Dynamically generated pages (JavaScript-heavy sites)
- Pages that block crawlers (robots.txt Disallow)
- Content from after the cutoff date

### Employer-Specific Implications

**High training data representation:**
- Large public companies (e.g., Google, Amazon)
- Companies with extensive Wikipedia coverage
- Companies frequently discussed on Reddit, Hacker News
- Companies with heavy media coverage

**Low training data representation:**
- Startups <5 years old
- B2B companies with minimal consumer presence
- Regional companies with limited online discussion
- Companies that block web crawlers

**Example:**  
- **Google**: 100,000+ mentions in training data → base model knows extensive details
- **Series A startup**: 50 mentions → base model knows almost nothing, relies on retrieval

---

### Training Data Decay

**Problem:** Training data becomes outdated.

If GPT-4's cutoff is April 2023, and you:
- Rebranded in June 2023 → base model uses the old name
- Raised a Series C in 2024 → base model thinks you're Series B
- Moved headquarters in 2025 → base model has the old location

**Solution:** This is why Layer 2 (RAG) exists. Fresh retrieval can override stale base knowledge — **if** the model retrieves your updated content.

---

<a name="rag"></a>
## 3. Retrieval Augmented Generation (RAG)

RAG is the key to understanding modern AI responses. Here's how it works:

### Step 1: Query Analysis

User asks: *"What's it like to work at Acme Corp?"*

The AI:
1. Identifies the query intent (information-seeking, employer research)
2. Extracts the entity ("Acme Corp")
3. Determines what type of information is needed (culture, benefits, environment)

### Step 2: Search Query Construction

The AI generates **multiple search queries** to retrieve relevant context:

- "Acme Corp company culture"
- "Acme Corp employee reviews"
- "Working at Acme Corp"
- "Acme Corp benefits"
- "Acme Corp careers"

These are sent to:
- A search engine API (often Bing or Google)
- A vector database of indexed content
- An internal knowledge graph

### Step 3: Document Retrieval & Ranking

The AI receives **hundreds of candidate documents** and ranks them by:

1. **Relevance** (semantic similarity to the query)
2. **Authority** (domain trust score, backlinks)
3. **Freshness** (publication/update date)
4. **Structure** (how easy it is to extract facts)

Top 5-10 documents are selected for the context window.

### Step 4: Context Injection

The AI's actual prompt becomes:

```
You are a helpful assistant. Answer the user's question using the provided context.

Context:
[Document 1: Acme Corp Wikipedia page]
[Document 2: Glassdoor reviews for Acme Corp]
[Document 3: Reddit thread about Acme Corp salaries]
[Document 4: Acme Corp careers page]
[Document 5: TechCrunch article about Acme's Series B]

User question: What's it like to work at Acme Corp?

Your answer:
```

The AI then generates a response **based primarily on these 5 documents**, not on the entirety of its training data.

### Step 5: Answer Synthesis

The AI:
- Extracts relevant facts from the top documents
- Cross-references them (e.g., "salary mentioned in both doc 3 and doc 4")
- Weights by source authority (Wikipedia > Reddit)
- Generates a natural language response

**Critical insight:** If your careers page isn't in those top 5-10 retrieved documents, it doesn't influence the answer — no matter how well-written it is.

---

## Why Your Careers Page Might Not Be Retrieved

Common reasons AI doesn't retrieve your official content:

### 1. Low Domain Authority
- Your website has few backlinks compared to competitors
- Google/Bing rank you low in search results
- AI's ranker mirrors this

**Fix:** Build backlinks through PR, guest posts, partnerships.

### 2. Poor Semantic Match
- Your careers page uses marketing jargon AI doesn't associate with candidate queries
- Example: Page says "dynamic ecosystem of innovation" instead of "fast-paced environment"

**Fix:** Use the exact language candidates use when searching. Check Google Search Console for actual query terms.

### 3. Rendering Issues
- Your careers page requires JavaScript to render
- AI crawlers see an empty page or loading spinner

**Fix:** Server-side rendering (SSR) or static site generation (SSG). Use Next.js, Gatsby, or similar.

### 4. Blocking AI Crawlers
- Your `robots.txt` disallows GPTBot, ClaudeBot, etc.
- AI can't index your content for retrieval

**Fix:** Allow AI crawlers unless legally required not to.

### 5. No Clear Answers
- Page is full of prose, no structured Q&A
- AI can't easily extract facts to quote

**Fix:** Reformat as FAQ. Make facts extractable.

---

<a name="entities"></a>
## 4. Entity Recognition & Knowledge Graphs

AI models don't just search for text — they **recognize entities** and query knowledge graphs.

### What is an Entity?

An **entity** is a uniquely identifiable thing: a person, company, place, product.

When you mention "Acme Corp", the AI:
1. Recognizes it as an entity (type: Organization)
2. Looks it up in knowledge graphs (Wikidata, Google Knowledge Graph, proprietary DBs)
3. Retrieves structured facts (founded, headquarters, CEO, industry)

### Knowledge Graph Structure

```
Entity: Acme Corp
Type: Organization
Properties:
  - foundedDate: 2015
  - headquarters: London, UK
  - industry: Financial Technology
  - numberOfEmployees: 250
  - website: acmecorp.com
  - sameAs: [Wikipedia URL, LinkedIn URL, Crunchbase URL]
```

### How Schema.org Markup Feeds Knowledge Graphs

When you add JSON-LD to your homepage:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "foundingDate": "2015",
  "numberOfEmployees": 250,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "London",
    "addressCountry": "GB"
  }
}
```

**What happens:**
1. Google crawls your page and extracts the schema
2. Google adds/updates your entity in the Knowledge Graph
3. AI models query the Knowledge Graph when answering questions
4. Your verified data gets priority over unstructured mentions

**Evidence:** Companies with complete schema.org markup had **40% higher factual accuracy** in AI responses.

---

<a name="citations"></a>
## 5. Citation Selection Logic

Different AI models handle citations differently. Here's how each decides what to cite:

### ChatGPT (GPT-4)
**Citation behavior:** Rarely cites sources explicitly. Synthesizes from multiple sources without attribution.

**When it does cite:**
- User asks "What are your sources?"
- Information is controversial or surprising
- Direct quotes

**What it prefers to cite:**
- High-authority domains (Wikipedia, major news)
- Recent content (last 12 months)
- Structured data (schema.org, Wikidata)

**Employer implication:** ChatGPT will use your data without citing you explicitly. That's fine — factual accuracy matters more than attribution.

---

### Google AI Overviews
**Citation behavior:** Always cites sources with clickable links.

**What it prefers to cite:**
- Pages already ranking in top 10 Google search results
- Reddit (weighted heavily in recent algorithm updates)
- YouTube (owned by Google)
- LinkedIn (high trust for employer info)
- Government/education domains (.gov, .edu)

**Selection logic:**
1. Runs a Google search for the query
2. Takes top 3-5 results
3. Extracts relevant facts
4. Generates answer with inline citations

**Employer implication:** If you want to be cited in AI Overviews, you first need to rank in traditional Google search. GEO depends on SEO.

---

### Perplexity
**Citation behavior:** Always cites, shows sources above the answer, allows users to click through.

**What it prefers to cite:**
- **Reddit** (heavily weighted — 6.6% of all citations)
- **YouTube** (2.0%)
- **Wikipedia** (1.8%)
- **LinkedIn** (1.4%)
- **Company websites** (1.1%)

**Selection logic:**
1. Searches multiple sources (web + Reddit + news)
2. Ranks by relevance + freshness
3. Prioritizes content with clear answers
4. Shows top 5-8 sources

**Employer implication:** To get cited by Perplexity, be present on **Reddit** (participate in relevant discussions) and **LinkedIn** (post company updates).

---

### Claude (Anthropic)
**Citation behavior:** Rarely cites unless asked. Relies heavily on training data.

**When retrieval is enabled (Claude with search):**
- Similar to ChatGPT — synthesizes without explicit citation
- Prefers authoritative sources
- Strong bias toward recent content

**Employer implication:** Claude is harder to influence post-training. Focus on getting into training data (PR, backlinks, Wikipedia) and using RAG-enabled versions (e.g., Claude on Perplexity).

---

<a name="model-differences"></a>
## 6. Model-Specific Differences

Each AI model has architectural quirks that affect what it says about you:

| Model | Training Cutoff | RAG Enabled | Citation Style | Preferred Sources |
|-------|----------------|-------------|----------------|-------------------|
| GPT-4 (ChatGPT) | Apr 2023 | Yes (browsing mode) | Rare | Wikipedia, Reddit, news |
| GPT-4o | Oct 2023 | Yes (always on) | Occasional | Same as GPT-4 |
| Claude 3.5 | Jul 2023 | Varies (plugin-dependent) | Rare | Training data-heavy |
| Google AI | Continuous | Yes (always on) | Always | Google search results, Reddit |
| Perplexity | Continuous | Yes (core feature) | Always | Reddit, YouTube, Wikipedia |
| Meta AI | Aug 2023 | Yes | Occasional | Instagram, Facebook, web |

### Practical Implications

**For maximum AI visibility:**
- **Wikipedia presence** → helps ALL models
- **Reddit activity** → critical for Perplexity, Google AI
- **Schema.org markup** → helps all retrieval-based models
- **Recent content updates** → affects GPT-4o, Google AI, Perplexity
- **Traditional SEO** → required for Google AI Overviews

---

<a name="intervention"></a>
## 7. Where You Can Intervene

Based on the architecture above, here are the **7 intervention points** where you can influence what AI says:

### Intervention Point 1: Training Data (Low Control)
**What it is:** Getting mentioned in sources that feed training data.

**How to do it:**
- **Wikipedia article** (if you meet notability guidelines)
- **News coverage** (TechCrunch, Reuters, industry press)
- **Reddit presence** (participate authentically in relevant subreddits)
- **GitHub** (open-source projects, engineering blog)

**Timeline:** 6-18 months (until next model retraining)

**Difficulty:** Hard (requires PR, media relations, community building)

**Impact:** High (becomes "ground truth" in base knowledge)

---

### Intervention Point 2: Schema.org Markup (High Control)
**What it is:** Adding JSON-LD structured data to your website.

**How to do it:**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme Corp",
  "description": "Fintech company building payment infrastructure",
  "foundingDate": "2015",
  "numberOfEmployees": 250,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "London",
    "addressCountry": "GB"
  },
  "sameAs": [
    "https://www.linkedin.com/company/acmecorp",
    "https://twitter.com/acmecorp"
  ]
}
</script>
```

**Timeline:** Immediate (takes effect once crawled)

**Difficulty:** Easy (one-time implementation)

**Impact:** Medium-High (30-40% improvement in factual accuracy)

---

### Intervention Point 3: Content Structure (High Control)
**What it is:** Formatting your careers page for extractability.

**How to do it:**
- FAQ format (H2 questions, paragraph answers)
- Tables (e.g., salary ranges by role)
- Bulleted lists (benefits, perks)
- Semantic HTML (proper heading hierarchy)

**Timeline:** Immediate (once reindexed)

**Difficulty:** Medium (requires content rewrite)

**Impact:** Medium (20-25% increase in citation rate)

---

### Intervention Point 4: Crawler Access (High Control)
**What it is:** Allowing AI bots to crawl your website.

**How to do it:**
Check `robots.txt`, ensure these are NOT blocked:
```
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: CCBot
```

**Timeline:** Immediate

**Difficulty:** Easy (one line of code)

**Impact:** Medium (15-20% increase in retrieval)

---

### Intervention Point 5: Multi-Platform Presence (Medium Control)
**What it is:** Maintaining verified profiles across platforms AI trusts.

**How to do it:**
- Complete LinkedIn Company Page
- Claim Glassdoor profile (even if you can't control reviews)
- Claim Indeed company page
- Wikipedia (if eligible)
- Crunchbase (for tech companies)

**Timeline:** Immediate (once profiles are populated)

**Difficulty:** Medium (requires ongoing maintenance)

**Impact:** Medium (15-18% increase in accurate citations)

---

### Intervention Point 6: Freshness (Medium Control)
**What it is:** Regularly updating your content.

**How to do it:**
- Add `dateModified` to schema markup
- Update careers page quarterly
- Publish blog posts, company news
- Refresh job listings regularly

**Timeline:** Ongoing

**Difficulty:** Medium (requires process)

**Impact:** Low-Medium (8-12% boost)

---

### Intervention Point 7: Domain Authority (Low Control)
**What it is:** Building backlinks and brand search volume.

**How to do it:**
- PR and media coverage
- Guest posts on industry blogs
- Partnerships and co-marketing
- Speaking at conferences

**Timeline:** Months to years

**Difficulty:** Hard (requires sustained effort)

**Impact:** High (14-18% correlation with citation frequency)

---

## The Priority Stack

If you can only do three things, do these:

### 1. Implement Schema.org Markup
**Why:** Highest ROI. One-time effort, immediate impact, works across all models.

**What to add:**
- Organization schema (homepage)
- FAQPage schema (careers page)
- JobPosting schema (job listings with salary data)

**Time:** 4-6 hours for a developer

**Impact:** 30-40% improvement in factual accuracy

---

### 2. Reformat Careers Page as FAQ
**Why:** Dramatically improves retrievability and extractability.

**What to change:**
- Replace prose with Q&A structure
- Add tables (salary ranges, benefits)
- Use bulleted lists
- Clear heading hierarchy

**Time:** 1-2 days for a content writer

**Impact:** 20-25% increase in citation rate

---

### 3. Allow AI Crawlers
**Why:** If AI can't see your site, you have zero control.

**What to check:**
- `robots.txt` doesn't block AI bots
- `sitemap.xml` includes careers pages
- Site doesn't require JavaScript to render

**Time:** 30 minutes

**Impact:** 15-20% increase in retrieval

---

## Conclusion: The Architecture is Your Advantage

Most employer brand teams treat AI visibility like SEO from 2005 — throw keywords at the wall and hope.

But AI isn't a search engine. It's a **knowledge synthesis machine** with a specific architecture: base knowledge + retrieval + structured data.

If you understand the architecture, you can intervene at each layer:
- **Training data:** Build presence on Wikipedia, Reddit, news
- **Retrieval:** Optimize for search, allow crawlers, structure content
- **Structured knowledge:** Implement schema.org, cross-platform presence

The employers who win in the AI era won't be those with the biggest budgets. They'll be those who understand the machine.

---

## FAQ

**Q: Can I pay AI companies to prioritize my content?**  
A: No. There's no "sponsored content" model for AI responses (yet). Visibility is earned through authority, structure, and relevance.

**Q: How often do AI models retrain?**  
A: Base models: every 6-18 months. RAG retrieval: real-time. Focus your effort on Layer 2 (retrieval) for fastest impact.

**Q: If I block AI crawlers, will I still be mentioned?**  
A: Possibly, if you're famous enough (like Glassdoor). But for most employers, blocking = invisibility.

**Q: Do AI models "learn" from user conversations?**  
A: Indirectly. User feedback influences future training data, but individual conversations don't immediately update the model.

**Q: What's the best way to monitor what AI says about me?**  
A: [Run a OpenRole audit](https://openrole.co.uk) monthly. Track changes over time. Alert on major inaccuracies.

---

## Further Reading

- [AI SEO Complete Guide](/blog/ai-seo-complete-guide) — Implementation roadmap
- [The llms.txt Myth](/blog/llms-txt-myth) — Why one popular approach doesn't work
- [Structured Data Guide](/blog/structured-data-guide) — JSON-LD for employers

---

**Want to see how AI retrieves information about your company?**  
[Run a free OpenRole audit](https://openrole.co.uk) — shows you which sources ChatGPT, Google AI, and Perplexity actually cite when asked about you.