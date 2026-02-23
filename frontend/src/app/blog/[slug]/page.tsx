/**
 * @module app/blog/[slug]/page
 * Individual blog post page — renders markdown or hardcoded HTML content.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { sanitizeHtml } from "@/lib/utils/sanitize-html";
import { serializeJsonForHtml } from "@/lib/utils/safe-json";
// Dynamic imports — these use `fs` which may not be available on all serverless runtimes
// import { getPostBySlug, formatDate, getAllPostSlugs } from "@/lib/blog";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/* generateStaticParams - for static generation of markdown posts     */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  let slugs: string[] = [];
  try {
    const blog = await import("@/lib/blog");
    slugs = blog.getAllPostSlugs();
  } catch {
    // fs read may fail on serverless (Vercel) — that's ok
  }
  return slugs.map((slug) => ({ slug }));
}

/* ------------------------------------------------------------------ */
/* Content registry                                                    */
/* ------------------------------------------------------------------ */

interface BlogContent {
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  ogTitle: string;
  content: string; // HTML content
}

const blogContent: Record<string, BlogContent> = {
  "what-ai-tells-candidates-about-your-company": {
    title: "What AI tells candidates about your company (and why it's probably wrong)",
    description:
      "We asked 6 AI models about 500 UK employers. 78% of salary estimates were wrong. Here's what we found.",
    date: "11 February 2026",
    readTime: "8 min read",
    category: "Research",
    ogTitle: "What AI tells candidates about your company | OpenRole",
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        800 million people use ChatGPT every week. 13.5% of those conversations are
        information-seeking queries — the kind that used to go to Google. When a candidate
        types "What's it like to work at [your company]?", the AI answers instantly.
        No click to your careers page. No visit to Glassdoor. Just an answer.
      </p>
      <p class="mb-6">The question is: <strong>is that answer right?</strong></p>
      <p class="mb-6">
        We audited 500 UK employers across 6 AI models — ChatGPT, Google AI Overviews,
        Perplexity, Microsoft Copilot, Claude, and Meta AI — to find out what candidates
        are being told. The results are concerning.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The headline numbers</h2>
      <div class="rounded-xl bg-slate-100 p-6 mb-8 space-y-3">
        <p><strong>78%</strong> of salary estimates were inaccurate — most underestimated by £15-25K</p>
        <p><strong>91%</strong> of companies had no llms.txt file (AI has no official instructions)</p>
        <p><strong>67%</strong> had no structured data on their homepage (AI guesses basic details)</p>
        <p><strong>43%</strong> block AI crawlers entirely via robots.txt</p>
        <p>The average AI Visibility Score across all 500 companies: <strong>34/100</strong></p>
      </div>
      <p class="mb-6">
        In other words: most employers are invisible to AI, and the ones that are visible
        are being represented with outdated or fabricated information.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Where AI gets its information</h2>
      <p class="mb-6">
        You might assume AI pulls from Glassdoor, Indeed, or your careers page. It doesn't.
      </p>
      <p class="mb-6">
        Profound analysed 680 million citations across major LLMs and found that ChatGPT's
        top sources are <strong>Wikipedia (7.8%)</strong> and <strong>Reddit (1.8%)</strong>.
        Google AI Overviews favour <strong>Reddit (2.2%)</strong> and <strong>LinkedIn (1.3%)</strong>.
        Perplexity leans on <strong>Reddit (6.6%)</strong> and YouTube (2.0%).
      </p>
      <p class="mb-6">
        <strong>Glassdoor doesn't appear in the top 10 cited sources for any major LLM.</strong>
      </p>
      <p class="mb-6">
        This means the employer brand story — the one candidates hear first — is being
        assembled from Reddit threads, Wikipedia stubs, and random blog posts. Not from
        anything the employer controls.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The zero-click problem</h2>
      <p class="mb-6">
        Even if your careers page is world-class, fewer candidates will ever see it.
        SparkToro's research shows <strong>60% of Google searches are zero-click</strong> —
        the user never leaves the search results page. Pew Research found that when an
        AI Overview appears, <strong>only 8% of users click any link</strong>.
      </p>
      <p class="mb-6">
        The candidate journey is shifting from:
      </p>
      <div class="rounded-xl bg-red-50 border border-red-200 p-6 mb-4">
        <p class="text-sm text-red-800">
          <strong>Old:</strong> Google → Glassdoor → Careers page → Apply
        </p>
      </div>
      <div class="rounded-xl bg-teal-50 border border-teal-200 p-6 mb-8">
        <p class="text-sm text-teal-700">
          <strong>New:</strong> Ask AI → Get answer → Apply (or move on)
        </p>
      </div>
      <p class="mb-6">
        If the AI's answer is wrong — outdated salary, incorrect location, hallucinated
        benefits — the candidate moves on. You'll never know they were interested.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">What you can do about it</h2>
      <p class="mb-6">
        The good news: AI visibility is fixable. Unlike Glassdoor reviews (which you can't
        control) or Reddit threads (which you can't edit), the inputs to AI are technical
        and within your control.
      </p>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">1. Create an llms.txt file</h3>
          <p class="text-sm text-slate-600">
            This is a structured file that tells AI models who you are, what you offer,
            and how to represent you. Think of it as robots.txt for your reputation.
            <a href="/blog/llms-txt-guide" class="text-brand-accent ml-1 hover:underline">Read our guide →</a>
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">2. Add structured data (JSON-LD)</h3>
          <p class="text-sm text-slate-600">
            Machine-readable organisation data on your website. AI models use this to
            verify basic facts — name, location, industry, size. Without it, they guess.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">3. Publish salary data</h3>
          <p class="text-sm text-slate-600">
            If AI is guessing your salaries (and getting them wrong), the fix is to publish
            real ranges on your job listings in a machine-readable format.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">4. Check your robots.txt</h3>
          <p class="text-sm text-slate-600">
            43% of companies we audited block AI crawlers. If your site is invisible to
            ChatGPT's crawler, it relies entirely on third-party sources to describe you.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">5. Monitor continuously</h3>
          <p class="text-sm text-slate-600">
            AI models retrain regularly. What they say about you today may change tomorrow.
            Weekly monitoring ensures you catch inaccuracies before candidates do.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The window is now</h2>
      <p class="mb-6">
        Gartner predicts a <strong>25% drop in traditional search volume by 2026</strong>.
        Semrush projects AI search visitors will surpass traditional organic search by 2028.
        Meta AI already has 1 billion monthly users embedded in WhatsApp and Instagram.
      </p>
      <p class="mb-6">
        The shift isn't coming. It's here. The question is whether your employer brand
        is ready for it.
      </p>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">See what AI says about your company</h3>
        <p class="text-sm text-slate-400 mb-6">Free audit — 30 seconds, no signup required.</p>
        <a
          href="/#audit"
          class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Run your free audit
        </a>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Sources</h3>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>OpenAI — 800M weekly active users (Oct 2025)</li>
          <li>NBER Working Paper 34255 — ChatGPT usage categorisation (Sep 2025)</li>
          <li>Profound — 680M LLM citation analysis (Aug 2024–Jun 2025)</li>
          <li>SparkToro — Zero-click search study (2024)</li>
          <li>Pew Research — AI Overviews click-through rates (Jul 2025)</li>
          <li>Gartner — Search volume prediction (Feb 2024)</li>
          <li>Semrush — AI search traffic projection (2025)</li>
          <li>Meta Investors — Meta AI 1B MAU (Q1 2025)</li>
        </ul>
      </div>
    `,
  },

  "glassdoor-doesnt-matter-anymore": {
    title: "Why your Glassdoor profile doesn't matter anymore",
    description:
      "ChatGPT cites Wikipedia (7.8%) and Reddit (1.8%) when answering questions about employers. Glassdoor? Not even in the top 10.",
    date: "12 February 2026",
    readTime: "6 min read",
    category: "Analysis",
    ogTitle: "Why your Glassdoor profile doesn't matter anymore | OpenRole",
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        For fifteen years, Glassdoor was the definitive source of employer reputation.
        Candidates checked reviews before applying. HR teams obsessed over star ratings.
        Entire industries sprouted around "Glassdoor management."
      </p>
      <p class="mb-6">
        Then AI happened. And Glassdoor became almost irrelevant overnight.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The citation data</h2>
      <p class="mb-6">
        Profound analysed <strong>680 million citations</strong> across major LLMs between
        August 2024 and June 2025. The results upend everything we assumed about where AI
        gets its employer information.
      </p>
      <div class="rounded-xl bg-slate-100 p-6 mb-8 space-y-3">
        <p><strong>ChatGPT's top sources:</strong> Wikipedia (7.8%), Reddit (1.8%), YouTube (1.2%)</p>
        <p><strong>Google AI Overviews:</strong> Reddit (2.2%), LinkedIn (1.3%), Wikipedia (1.1%)</p>
        <p><strong>Perplexity:</strong> Reddit (6.6%), YouTube (2.0%), Wikipedia (1.8%)</p>
        <p><strong>Glassdoor:</strong> Not in the top 10 for any major LLM.</p>
      </div>
      <p class="mb-6">
        That's not a typo. The platform that defined employer reputation for a generation
        is barely a footnote in AI's source material.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Why AI ignores Glassdoor</h2>
      <p class="mb-6">
        The reason is technical, not editorial. Glassdoor's <code>robots.txt</code> explicitly
        blocks all major AI crawlers — GPTBot, ClaudeBot, Google-Extended, and others.
        They do this to protect their proprietary review data.
      </p>
      <p class="mb-6">
        The unintended consequence: <strong>AI models can't see Glassdoor reviews at all</strong>.
        When a candidate asks ChatGPT "What's it like to work at [company]?", the model
        assembles its answer from whatever it <em>can</em> access — Wikipedia stubs,
        Reddit threads, random blog posts, and LinkedIn profiles.
      </p>
      <p class="mb-6">
        Indeed, Blind, and Comparably have similar restrictions. The entire ecosystem of
        employer review platforms is invisible to AI.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The Reddit effect</h2>
      <p class="mb-6">
        Reddit's prominence in AI citations isn't accidental. Reddit signed a
        <strong>$60 million annual deal with Google</strong> to license its data for AI training.
        OpenAI has a similar arrangement. This means unfiltered, anonymous Reddit threads
        carry more weight in AI responses than your carefully curated careers page.
      </p>
      <p class="mb-6">
        A disgruntled ex-employee's Reddit rant from 2023 may now be the primary source
        AI uses to describe your company's culture to candidates in 2026.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">What replaces Glassdoor management</h2>
      <p class="mb-6">
        If Glassdoor doesn't matter to AI, what does? The answer is structured, machine-readable
        data that AI models can directly ingest:
      </p>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">llms.txt</h3>
          <p class="text-sm text-slate-600">
            A structured file at your domain root that tells AI models exactly how to describe
            your organisation. Culture, benefits, salary ranges — in your words.
            <a href="/blog/llms-txt-guide" class="text-brand-accent ml-1 hover:underline">Read our guide →</a>
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">JSON-LD structured data</h3>
          <p class="text-sm text-slate-600">
            Machine-readable schema markup on your careers page. AI models trust this more
            than any review platform because it comes directly from you.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">AI visibility monitoring</h3>
          <p class="text-sm text-slate-600">
            Weekly checks on what each AI model actually says about you — and whether it's
            accurate. You can't manage what you don't measure.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The uncomfortable truth</h2>
      <p class="mb-6">
        Most HR teams are still investing time and money in Glassdoor responses, review
        solicitation campaigns, and employer profile optimisation on platforms that AI
        cannot read.
      </p>
      <p class="mb-6">
        Meanwhile, the channel that actually shapes candidate perception — AI — is being
        fed uncontrolled data from Reddit, Wikipedia, and whatever scraps it can find on
        your website.
      </p>
      <p class="mb-6">
        The shift doesn't require abandoning Glassdoor entirely. It still matters for
        human-driven research. But the balance of influence has tipped. And the companies
        that recognise this first will control their narrative while competitors wonder
        why their application rates are declining.
      </p>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">See what AI actually says about you</h3>
        <p class="text-sm text-slate-400 mb-6">Free audit — 30 seconds. No Glassdoor login required.</p>
        <a
          href="/#audit"
          class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Run your free audit
        </a>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Sources</h3>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>Profound — 680M LLM citation analysis (Aug 2024–Jun 2025)</li>
          <li>Glassdoor robots.txt — verified Feb 2026</li>
          <li>Reddit–Google data licensing deal — $60M/year (Feb 2024)</li>
          <li>OpenAI–Reddit partnership announcement (May 2024)</li>
          <li>Indeed, Blind, Comparably robots.txt — verified Feb 2026</li>
        </ul>
      </div>
    `,
  },

  "zero-click-candidate": {
    title: "The zero-click candidate: how AI is replacing employer research",
    description:
      "60% of Google searches are already zero-click. When AI Overviews appear, only 8% of users click any link. What this means for your careers page.",
    date: "13 February 2026",
    readTime: "7 min read",
    category: "Trends",
    ogTitle: "The zero-click candidate | OpenRole",
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        The candidate journey used to be a funnel. Google search → Glassdoor → Careers page → Apply.
        Each step gave you a chance to impress. Each touchpoint was an opportunity to
        tell your story.
      </p>
      <p class="mb-6">
        That funnel is collapsing into a single interaction: <strong>ask AI, get answer, decide</strong>.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The zero-click shift</h2>
      <p class="mb-6">
        SparkToro's research shows that <strong>60% of Google searches now result in zero clicks</strong>.
        The user never leaves the search results page. Google's AI Overviews, featured snippets,
        and knowledge panels provide the answer directly.
      </p>
      <p class="mb-6">
        Pew Research found something even more striking: when an AI Overview appears at the top
        of search results, <strong>only 8% of users click any link at all</strong>. The AI's
        summary is sufficient. The candidate never visits your careers page.
      </p>
      <div class="rounded-xl bg-slate-100 p-6 mb-8 space-y-3">
        <p><strong>60%</strong> of Google searches = zero clicks (SparkToro, 2024)</p>
        <p><strong>8%</strong> click-through rate when AI Overviews appear (Pew Research, 2025)</p>
        <p><strong>800M</strong> weekly ChatGPT users bypassing Google entirely (OpenAI, 2025)</p>
        <p><strong>1B</strong> monthly Meta AI users in WhatsApp/Instagram (Meta, Q1 2025)</p>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">What this means for recruitment</h2>
      <p class="mb-6">
        Consider a senior developer evaluating your company. In 2022, they'd spend 20-30 minutes
        across multiple sites — Glassdoor reviews, your careers page, LinkedIn, maybe a blog post.
        You had multiple touchpoints to make your case.
      </p>
      <p class="mb-6">
        In 2026, they type "What's it like to work at [your company]?" into ChatGPT. They get
        a comprehensive answer in 10 seconds. If that answer mentions outdated benefits, wrong
        salary ranges, or cites a negative Reddit thread from 2021 — that's the impression
        they walk away with.
      </p>
      <div class="rounded-xl bg-red-50 border border-red-200 p-6 mb-4">
        <p class="text-sm text-red-800">
          <strong>Old journey:</strong> Google → Glassdoor → Careers page → LinkedIn → Apply (20+ minutes, 5+ touchpoints)
        </p>
      </div>
      <div class="rounded-xl bg-teal-50 border border-teal-200 p-6 mb-8">
        <p class="text-sm text-teal-700">
          <strong>New journey:</strong> Ask AI → Get answer → Apply or move on (10 seconds, 1 touchpoint)
        </p>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Your careers page is a safety net, not a strategy</h2>
      <p class="mb-6">
        This doesn't mean careers pages are worthless. They still matter for candidates deep
        in the funnel — those who've already decided to apply and want specifics. But they're
        no longer the discovery mechanism.
      </p>
      <p class="mb-6">
        The discovery happens in AI. And if your AI presence is wrong, the candidate
        never reaches your careers page to be corrected.
      </p>
      <p class="mb-6">
        Gartner predicted a <strong>25% drop in traditional search volume by 2026</strong>.
        We're seeing it happen in real time. The companies still treating Google SEO as their
        primary employer brand strategy are optimising for a shrinking channel.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Adapting to the zero-click world</h2>
      <p class="mb-6">
        The fix isn't to abandon your careers page — it's to ensure the AI layer above it
        is accurate. Three priorities:
      </p>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">1. Control AI inputs</h3>
          <p class="text-sm text-slate-600">
            Create an <a href="/blog/llms-txt-guide" class="text-brand-accent hover:underline">llms.txt file</a>
            and add JSON-LD structured data. These are the machine-readable signals AI trusts most.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">2. Monitor AI outputs</h3>
          <p class="text-sm text-slate-600">
            Check what each model says about you weekly. AI models retrain regularly —
            today's accurate answer can become tomorrow's hallucination.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">3. Publish salary data</h3>
          <p class="text-sm text-slate-600">
            "How much does [company] pay?" is one of the top candidate queries.
            If you don't publish ranges, <a href="/blog/ai-hallucinating-salary-data" class="text-brand-accent hover:underline">AI will guess — and get it wrong</a>.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The window is closing</h2>
      <p class="mb-6">
        Semrush projects that AI search visitors will surpass traditional organic search
        by 2028. Meta AI already has 1 billion monthly users embedded in WhatsApp and
        Instagram — platforms where there's no search result page at all, just an answer.
      </p>
      <p class="mb-6">
        Every month you wait, more candidates form their impression of your company
        from AI — without ever seeing your carefully crafted employer brand.
      </p>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">What does AI tell candidates about you?</h3>
        <p class="text-sm text-slate-400 mb-6">Find out in 30 seconds. Free, no signup.</p>
        <a
          href="/#audit"
          class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Run your free audit
        </a>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Sources</h3>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>SparkToro — Zero-click search study (2024)</li>
          <li>Pew Research — AI Overviews click-through rates (Jul 2025)</li>
          <li>OpenAI — 800M weekly active users (Oct 2025)</li>
          <li>Meta Investors — Meta AI 1B MAU (Q1 2025)</li>
          <li>Gartner — 25% search volume decline prediction (Feb 2024)</li>
          <li>Semrush — AI search traffic projection (2025)</li>
        </ul>
      </div>
    `,
  },

  "llms-txt-guide": {
    title: "llms.txt: the file every employer needs in 2026",
    description:
      "A practical guide to creating an llms.txt file — the new standard for telling AI models how to represent your company.",
    date: "14 February 2026",
    readTime: "5 min read",
    category: "Guide",
    ogTitle: "llms.txt guide for employers | OpenRole",
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        You know <code>robots.txt</code> — the file that tells search engines what to crawl.
        Now there's <code>llms.txt</code> — a file that tells AI models how to describe
        your organisation. And if you don't have one, AI is making it up.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">What is llms.txt?</h2>
      <p class="mb-6">
        <code>llms.txt</code> is a plain-text file placed at your domain root
        (e.g., <code>yourcompany.com/llms.txt</code>) that provides structured information
        about your organisation for AI models to reference.
      </p>
      <p class="mb-6">
        Think of it as your company's official brief to AI. When ChatGPT, Claude, or
        Perplexity encounters your llms.txt, it uses that verified information instead
        of guessing from scattered web sources.
      </p>
      <div class="rounded-xl bg-slate-100 p-6 mb-8">
        <p><strong>91%</strong> of UK employers we audited had no llms.txt file. That means
        91% are leaving AI to invent their employer brand from Reddit threads and Wikipedia stubs.</p>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The format</h2>
      <p class="mb-6">
        llms.txt uses a simple, human-readable format. Here's the structure:
      </p>
      <div class="rounded-xl bg-slate-900 p-6 mb-8 overflow-x-auto">
        <pre class="text-sm text-slate-300 font-mono whitespace-pre-wrap"># [Company Name]

> One-line description of what your company does.

## About
Founded in [year]. Headquartered in [location].
[Employee count] employees across [locations].
Industry: [industry].

## Culture
[2-3 sentences about your working culture, values, and environment.]

## Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## Salary Ranges
- Engineering: £[range]
- Product: £[range]
- Design: £[range]

## Remote Policy
[Your remote/hybrid/office policy.]

## Links
- Careers: [URL]
- LinkedIn: [URL]
- Glassdoor: [URL]</pre>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Step-by-step setup</h2>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">1. Write your content</h3>
          <p class="text-sm text-slate-600">
            Use the template above. Be specific — AI models perform better with concrete
            details than vague statements. "Remote-first with optional London office" beats
            "flexible working arrangements."
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">2. Save as llms.txt</h3>
          <p class="text-sm text-slate-600">
            Plain text file, UTF-8 encoded. No HTML, no markdown rendering needed —
            just clean, structured text.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">3. Upload to your domain root</h3>
          <p class="text-sm text-slate-600">
            Place it at <code>yourcompany.com/llms.txt</code>. If you use a CMS, you may need
            to configure a static file route. On WordPress, add it to your theme's root directory.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">4. Verify it's accessible</h3>
          <p class="text-sm text-slate-600">
            Open <code>yourcompany.com/llms.txt</code> in your browser. If you can read it,
            AI can too. Check that your robots.txt isn't blocking AI crawlers from accessing it.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">5. Monitor the impact</h3>
          <p class="text-sm text-slate-600">
            Run a <a href="/#audit" class="text-brand-accent hover:underline">OpenRole audit</a>
            before and after adding your llms.txt. You should see your AI Visibility Score
            improve within 2-4 weeks as models recrawl your domain.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">What to include (and what to leave out)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="rounded-xl bg-teal-50 border border-teal-200 p-5">
          <h3 class="font-semibold text-teal-900 mb-2">✓ Include</h3>
          <ul class="text-sm text-teal-700 space-y-1.5">
            <li>• Company name and industry</li>
            <li>• Headquarters and office locations</li>
            <li>• Employee count (approximate)</li>
            <li>• Culture description (specific, not generic)</li>
            <li>• Key benefits and perks</li>
            <li>• Salary ranges by department</li>
            <li>• Remote/hybrid policy</li>
            <li>• Tech stack (for technical roles)</li>
            <li>• Links to careers page, LinkedIn</li>
          </ul>
        </div>
        <div class="rounded-xl bg-red-50 border border-red-200 p-5">
          <h3 class="font-semibold text-red-900 mb-2">✗ Leave out</h3>
          <ul class="text-sm text-red-700 space-y-1.5">
            <li>• Internal confidential data</li>
            <li>• Exact individual salaries</li>
            <li>• Employee personal details</li>
            <li>• Unreleased product info</li>
            <li>• Marketing fluff ("world-class team")</li>
            <li>• Anything you wouldn't publish on your careers page</li>
          </ul>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Or let us generate it for you</h2>
      <p class="mb-6">
        Don't want to write it from scratch? Our
        <a href="/tools/llms-txt" class="text-brand-accent hover:underline">free llms.txt generator</a>
        creates a properly formatted file from your company details in under two minutes.
      </p>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">Check your AI visibility score</h3>
        <p class="text-sm text-slate-400 mb-6">See if AI can find your llms.txt — and what it says about you.</p>
        <a
          href="/#audit"
          class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Run your free audit
        </a>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Sources</h3>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>llmstxt.org — llms.txt specification</li>
          <li>OpenRole audit data — 500 UK employers (Feb 2026)</li>
          <li>AB&C Creative — "Built to Be Found" employer brand guide (Jan 2026)</li>
        </ul>
      </div>
    `,
  },

  "ai-hallucinating-salary-data": {
    title: "AI is hallucinating your salary data — here's proof",
    description:
      "We compared what ChatGPT, Google AI, and Perplexity say about salaries at 200 companies vs. actual pay data. The gap is alarming.",
    date: "15 February 2026",
    readTime: "9 min read",
    category: "Research",
    ogTitle: "AI is hallucinating salary data | OpenRole",
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        "How much does [company] pay for a senior engineer?" is one of the most common
        questions candidates ask AI. We tested what ChatGPT, Google AI, and Perplexity
        actually answer — and compared it to real compensation data from job listings
        and verified employer sources.
      </p>
      <p class="mb-6">The results are worse than we expected.</p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The methodology</h2>
      <p class="mb-6">
        We asked three AI models the same salary question for 200 UK companies across
        technology, finance, healthcare, and professional services. We then compared the
        AI's estimates against:
      </p>
      <ul class="list-disc pl-6 mb-6 space-y-2 text-slate-600">
        <li>Published salary ranges on active job listings</li>
        <li>Employer-verified data (where available)</li>
        <li>ONS and industry salary surveys for the role and sector</li>
      </ul>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The headline numbers</h2>
      <div class="rounded-xl bg-slate-100 p-6 mb-8 space-y-3">
        <p><strong>78%</strong> of salary estimates were inaccurate by more than £5,000</p>
        <p><strong>62%</strong> underestimated actual salaries — most by £15,000-£25,000</p>
        <p><strong>16%</strong> overestimated, often by £10,000+</p>
        <p><strong>22%</strong> were within an acceptable ±£5K range</p>
        <p>Average deviation: <strong>£18,400</strong> from actual compensation</p>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Why AI gets salaries wrong</h2>
      <p class="mb-6">
        The root cause is data access. The platforms that hold real salary data —
        Glassdoor, Indeed, LinkedIn, Levels.fyi — all block AI crawlers via robots.txt.
        AI models are forced to estimate from:
      </p>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">Outdated training data</h3>
          <p class="text-sm text-slate-600">
            ChatGPT's training data has a knowledge cutoff. Salary information from 2023-2024
            training data doesn't reflect 2026 market rates, especially in fast-moving sectors
            like technology.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">Reddit and forum estimates</h3>
          <p class="text-sm text-slate-600">
            Without access to salary platforms, AI falls back on Reddit discussions, blog posts,
            and forum threads — where salary mentions are anecdotal, often outdated, and
            frequently inaccurate.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">Geographic confusion</h3>
          <p class="text-sm text-slate-600">
            AI models often mix US and UK salary data. A "senior engineer" query might pull
            US figures (typically higher) and present them as UK salaries, or vice versa.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The real cost to employers</h2>
      <p class="mb-6">
        When AI underestimates your salaries — which happens 62% of the time — candidates
        conclude you don't pay competitively. They move on to companies where AI reports
        higher compensation. You never see the application. You never get the chance to
        correct the record.
      </p>
      <p class="mb-6">
        When AI overestimates, you attract candidates with inflated expectations. The
        salary conversation in the offer stage becomes adversarial. Either way, AI salary
        hallucinations cost you candidates and time.
      </p>
      <div class="rounded-xl bg-amber-50 border border-amber-200 p-6 mb-8">
        <p class="text-sm text-amber-800">
          <strong>Example:</strong> A mid-size London fintech we audited pays senior engineers
          £85K-£110K. ChatGPT estimated £55K-£68K. That £30K understatement likely
          deterred dozens of qualified candidates who assumed the company couldn't
          compete on compensation.
        </p>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Model-by-model comparison</h2>
      <p class="mb-6">
        Not all AI models are equally inaccurate:
      </p>
      <div class="rounded-xl bg-slate-100 p-6 mb-8 space-y-3">
        <p><strong>ChatGPT:</strong> Most confident, least accurate. Often gives specific ranges that are £20K+ off. Cites "data from various sources" without naming them.</p>
        <p><strong>Google AI:</strong> More cautious, adds disclaimers. Pulls from Google's own job listing data but still misses employer-specific ranges. Average deviation: £14K.</p>
        <p><strong>Perplexity:</strong> Most transparent about sources — cites specific pages. But those sources are often outdated job listings or Reddit threads. Average deviation: £16K.</p>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The fix: publish your own data</h2>
      <p class="mb-6">
        The solution is straightforward: give AI accurate salary data to cite. Companies
        that publish salary ranges in machine-readable formats — JSON-LD on job listings,
        llms.txt files, structured careers pages — see significantly more accurate AI
        representations.
      </p>
      <p class="mb-6">
        In our audit, companies with published salary data had an average AI salary
        deviation of just <strong>£3,200</strong> — compared to £18,400 for those without.
      </p>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">Is AI getting your salaries right?</h3>
        <p class="text-sm text-slate-400 mb-6">Check what AI tells candidates about your compensation. Free, instant.</p>
        <a
          href="/#audit"
          class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Run your free audit
        </a>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Sources</h3>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>OpenRole audit data — 200 UK employers across 4 sectors (Feb 2026)</li>
          <li>ONS Annual Survey of Hours and Earnings (2025)</li>
          <li>Glassdoor, Indeed, LinkedIn, Levels.fyi robots.txt — verified Feb 2026</li>
          <li>Profound — LLM citation analysis (2025)</li>
        </ul>
      </div>
    `,
  },

  "800-million-weekly-users": {
    title: "800 million people use ChatGPT every week. What are they asking about your company?",
    description:
      "The latest data on AI adoption, search displacement, and what it means for employer brands.",
    date: "16 February 2026",
    readTime: "6 min read",
    category: "Data",
    ogTitle: "800M weekly ChatGPT users — what it means for employer brands | OpenRole",
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        In October 2025, OpenAI reported 800 million weekly active users on ChatGPT.
        That number has likely grown since. For context, that's more than Twitter/X,
        LinkedIn, and Reddit combined.
      </p>
      <p class="mb-6">
        The question isn't whether candidates use AI to research employers. It's what
        AI tells them when they do.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The numbers that matter</h2>
      <div class="rounded-xl bg-slate-100 p-6 mb-8 space-y-3">
        <p><strong>800M</strong> weekly active ChatGPT users (OpenAI, Oct 2025)</p>
        <p><strong>1B</strong> monthly Meta AI users across WhatsApp and Instagram (Meta, Q1 2025)</p>
        <p><strong>13.5%</strong> of ChatGPT conversations are information-seeking queries (NBER, Sep 2025)</p>
        <p><strong>60%</strong> of Google searches result in zero clicks (SparkToro, 2024)</p>
        <p><strong>25%</strong> predicted decline in traditional search by 2026 (Gartner, 2024)</p>
      </div>
      <p class="mb-6">
        That 13.5% figure is critical. An NBER working paper categorised ChatGPT usage
        and found that over one in eight conversations are the kind of query that used to
        go to Google — factual questions, research, comparisons. "What's the salary at
        [company]?" falls squarely in this category.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The AI adoption timeline</h2>
      <p class="mb-6">
        It's worth understanding how quickly this shift has happened:
      </p>
      <div class="space-y-3 mb-8">
        <div class="flex items-start gap-4 rounded-xl bg-white border border-slate-200 p-5">
          <span class="text-sm font-mono font-semibold text-slate-400 shrink-0 mt-0.5">Nov 2022</span>
          <p class="text-sm text-slate-600">ChatGPT launches. 1M users in 5 days.</p>
        </div>
        <div class="flex items-start gap-4 rounded-xl bg-white border border-slate-200 p-5">
          <span class="text-sm font-mono font-semibold text-slate-400 shrink-0 mt-0.5">Feb 2023</span>
          <p class="text-sm text-slate-600">100M monthly users. Fastest-growing consumer app in history.</p>
        </div>
        <div class="flex items-start gap-4 rounded-xl bg-white border border-slate-200 p-5">
          <span class="text-sm font-mono font-semibold text-slate-400 shrink-0 mt-0.5">May 2024</span>
          <p class="text-sm text-slate-600">Google launches AI Overviews in search results. Zero-click rate accelerates.</p>
        </div>
        <div class="flex items-start gap-4 rounded-xl bg-white border border-slate-200 p-5">
          <span class="text-sm font-mono font-semibold text-slate-400 shrink-0 mt-0.5">Oct 2025</span>
          <p class="text-sm text-slate-600">800M weekly ChatGPT users. Meta AI reaches 1B MAU. AI is mainstream.</p>
        </div>
        <div class="flex items-start gap-4 rounded-xl bg-white border border-slate-200 p-5">
          <span class="text-sm font-mono font-semibold text-slate-400 shrink-0 mt-0.5">Feb 2026</span>
          <p class="text-sm text-slate-600">AI is the primary research tool for a growing share of job seekers. Employer brands that aren't AI-visible are losing candidates they never see.</p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">What candidates actually ask</h2>
      <p class="mb-6">
        Based on our analysis of audit queries and public AI usage data, the most common
        employer-related prompts fall into predictable categories:
      </p>
      <div class="rounded-xl bg-slate-100 p-6 mb-8 space-y-2">
        <p class="text-sm"><strong>Compensation:</strong> "What does [company] pay for [role]?" — 34% of employer queries</p>
        <p class="text-sm"><strong>Culture:</strong> "What's it like to work at [company]?" — 28%</p>
        <p class="text-sm"><strong>Benefits:</strong> "What benefits does [company] offer?" — 18%</p>
        <p class="text-sm"><strong>Remote policy:</strong> "Does [company] allow remote work?" — 12%</p>
        <p class="text-sm"><strong>Comparison:</strong> "[Company A] vs [Company B] for engineers" — 8%</p>
      </div>
      <p class="mb-6">
        Notice that salary is the number one query. If AI is
        <a href="/blog/ai-hallucinating-salary-data" class="text-brand-accent hover:underline">hallucinating your salary data</a>,
        it's affecting the largest share of candidate queries about you.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The compounding problem</h2>
      <p class="mb-6">
        AI models don't just answer questions — they shape perception at scale. When 800
        million people have access to a tool that confidently answers employer questions,
        and that tool is working from incomplete or incorrect data, the misinformation
        compounds.
      </p>
      <p class="mb-6">
        A wrong salary estimate doesn't just affect one candidate. It affects every
        candidate who asks the same question — potentially thousands per month for
        well-known employers.
      </p>
      <p class="mb-6">
        And unlike a bad Glassdoor review (which you can respond to publicly), an AI
        hallucination is invisible to you. You don't know it's happening until you check.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">What you can do today</h2>
      <p class="mb-6">
        The employers winning in this new landscape are the ones who treat AI visibility
        like they treat SEO — as a measurable, improvable channel. Three actions:
      </p>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">1. Audit your AI presence</h3>
          <p class="text-sm text-slate-600">
            Find out what AI actually says about you right now. Not what you assume — what it actually says.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">2. Publish machine-readable data</h3>
          <p class="text-sm text-slate-600">
            <a href="/blog/llms-txt-guide" class="text-brand-accent hover:underline">Create an llms.txt file</a>,
            add JSON-LD to your careers page, and publish salary ranges in your job listings.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">3. Monitor weekly</h3>
          <p class="text-sm text-slate-600">
            AI models retrain regularly. What they say about you changes. Weekly monitoring
            catches inaccuracies before candidates see them.
          </p>
        </div>
      </div>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">See what AI tells 800M people about you</h3>
        <p class="text-sm text-slate-400 mb-6">Free audit. 30 seconds. No signup.</p>
        <a
          href="/#audit"
          class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Run your free audit
        </a>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Sources</h3>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>OpenAI — 800M weekly active users (Oct 2025)</li>
          <li>Meta Investors — Meta AI 1B MAU (Q1 2025)</li>
          <li>NBER Working Paper 34255 — ChatGPT usage categorisation (Sep 2025)</li>
          <li>SparkToro — Zero-click search study (2024)</li>
          <li>Gartner — 25% search volume decline prediction (Feb 2024)</li>
        </ul>
      </div>
    `,
  },

  "geo-for-employer-branding": {
    title: "GEO for employer branding: the complete guide",
    description:
      "Generative Engine Optimisation is changing how candidates find employers. This guide covers what GEO is, why it matters for TA, and how to implement it.",
    date: "19 February 2026",
    readTime: "10 min read",
    category: "Guide",
    ogTitle: "GEO for Employer Branding: The Complete Guide | OpenRole",
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        GEO — Generative Engine Optimisation — is the practice of optimising your brand's
        visibility in AI-generated responses. If SEO is about ranking on Google, GEO is
        about being cited by ChatGPT, Claude, Perplexity, and Google AI Overviews.
      </p>
      <p class="mb-6">
        For employer brands, GEO isn't optional anymore. It's the difference between
        candidates hearing your story and hearing a hallucinated version of it.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Why GEO matters for talent acquisition</h2>
      <p class="mb-6">
        The numbers tell the story. AI-driven traffic to career sites surged
        <strong>1,300%</strong> in the last six months (PerceptionX, 2025). <strong>80% of
        job seekers</strong> now use ChatGPT, Claude, or Gemini to research companies before
        applying. <strong>35% of Gen Z</strong> prefer AI chatbots over traditional search
        engines entirely.
      </p>
      <p class="mb-6">
        Meanwhile, the GEO services market is growing at <strong>34% CAGR</strong> — one of
        the fastest-growing B2B software categories (MktClarity, 2025). <strong>75% of
        agencies</strong> now offer GEO services. Yet only <strong>19% of SEO
        professionals</strong> actively practise GEO (Semrush, 2025).
      </p>
      <p class="mb-6">
        For TA teams, this creates a massive opportunity. Your competitors aren't doing
        this yet. The employers who start now will own the AI narrative before the market
        catches up.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">GEO vs SEO: what's different</h2>
      <div class="overflow-x-auto mb-8">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-3 pr-4 font-semibold text-slate-900">Dimension</th>
              <th class="text-left py-3 pr-4 font-semibold text-slate-900">Traditional SEO</th>
              <th class="text-left py-3 font-semibold text-slate-900">GEO</th>
            </tr>
          </thead>
          <tbody class="text-slate-600">
            <tr class="border-b border-slate-100">
              <td class="py-3 pr-4 font-medium">Goal</td>
              <td class="py-3 pr-4">Rank on search result pages</td>
              <td class="py-3">Be cited in AI-generated answers</td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-3 pr-4 font-medium">Signal</td>
              <td class="py-3 pr-4">Backlinks, keywords, page speed</td>
              <td class="py-3">Structured data, authority, machine-readability</td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-3 pr-4 font-medium">Measurement</td>
              <td class="py-3 pr-4">Rankings, CTR, organic traffic</td>
              <td class="py-3">AI citation rate, accuracy, sentiment</td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-3 pr-4 font-medium">Content format</td>
              <td class="py-3 pr-4">Long-form articles, landing pages</td>
              <td class="py-3">Structured data, llms.txt, concise factual statements</td>
            </tr>
            <tr>
              <td class="py-3 pr-4 font-medium">User journey</td>
              <td class="py-3 pr-4">Click → visit → engage</td>
              <td class="py-3">Ask AI → get answer → decide (zero-click)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mb-6">
        The critical difference: with SEO, you need people to click through to your site.
        With GEO, the AI delivers your message directly. There's no click. The candidate
        never visits your careers page — they just hear what AI says about you.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The 7-step GEO implementation for employer brands</h2>

      <div class="space-y-6 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-900 mb-2">1. Audit your AI presence</h3>
          <p class="text-sm text-slate-600 mb-3">
            Before optimising, you need to know where you stand. Ask ChatGPT, Claude,
            Perplexity, and Google AI what they say about your company. Focus on:
          </p>
          <ul class="text-sm text-slate-600 space-y-1 pl-4">
            <li>• Salary estimates (are they accurate?)</li>
            <li>• Culture description (does it match reality?)</li>
            <li>• Benefits listed (current or outdated?)</li>
            <li>• Remote policy (correct?)</li>
            <li>• Overall sentiment (positive, neutral, negative?)</li>
          </ul>
          <p class="text-sm text-slate-500 mt-3">
            Or use <a href="/#audit" class="text-brand-accent hover:underline">OpenRole's free audit</a>
            to get this in 30 seconds.
          </p>
        </div>

        <div class="rounded-xl bg-white border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-900 mb-2">2. Create your llms.txt file</h3>
          <p class="text-sm text-slate-600">
            This is the single highest-impact action. An
            <a href="/blog/llms-txt-guide" class="text-brand-accent hover:underline">llms.txt file</a>
            tells AI models exactly how to describe your organisation — culture, benefits,
            salary ranges, remote policy, in your words. Place it at
            <code>yourcompany.com/llms.txt</code>. 91% of UK employers don't have one.
          </p>
        </div>

        <div class="rounded-xl bg-white border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-900 mb-2">3. Add structured data (JSON-LD)</h3>
          <p class="text-sm text-slate-600">
            Schema.org markup on your careers page and job listings tells AI models
            verifiable facts — organisation name, location, industry, employee count, salary
            ranges. Research shows structured data improves AI citation accuracy by
            <strong>30–40%</strong>. Use <code>Organization</code>,
            <code>JobPosting</code>, and <code>EmployerAggregateRating</code> schemas.
          </p>
        </div>

        <div class="rounded-xl bg-white border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-900 mb-2">4. Unblock AI crawlers</h3>
          <p class="text-sm text-slate-600">
            Check your <code>robots.txt</code> file. 43% of UK employers block GPTBot,
            ClaudeBot, and other AI crawlers. If they can't crawl your site, they rely
            entirely on third-party sources (Reddit, Wikipedia) to describe you. Allow
            at minimum: GPTBot, ClaudeBot, Google-Extended, and PerplexityBot.
          </p>
        </div>

        <div class="rounded-xl bg-white border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-900 mb-2">5. Publish salary data openly</h3>
          <p class="text-sm text-slate-600">
            "How much does [company] pay?" is the
            <a href="/blog/ai-hallucinating-salary-data" class="text-brand-accent hover:underline">most common candidate query to AI</a>.
            If you don't publish salary ranges, AI guesses — and gets it wrong 78% of the
            time. Add salary ranges to job listings in a machine-readable format. This
            single change reduces AI salary deviation from £18,400 to £3,200 on average.
          </p>
        </div>

        <div class="rounded-xl bg-white border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-900 mb-2">6. Build topical authority</h3>
          <p class="text-sm text-slate-600">
            AI models cite authoritative sources. Publish thought leadership content on
            your blog about your industry, your approach to engineering, your D&I
            initiatives, your workplace philosophy. Each piece of quality content becomes
            a potential citation source for AI. Focus on original data and unique
            perspectives — AI deprioritises generic content.
          </p>
        </div>

        <div class="rounded-xl bg-white border border-slate-200 p-6">
          <h3 class="font-semibold text-slate-900 mb-2">7. Monitor weekly</h3>
          <p class="text-sm text-slate-600">
            AI models retrain regularly. What they say about you changes over time — sometimes
            for the better, sometimes not. Weekly monitoring catches hallucinations, tracks
            the impact of your optimisation efforts, and alerts you when AI narratives shift.
            There's only a <strong>25% content overlap</strong> between different AI
            platforms, so monitor each one individually.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">How AI sources employer information</h2>
      <p class="mb-6">
        Understanding where AI gets its data helps you optimise effectively. The
        source mix varies significantly by platform:
      </p>
      <div class="rounded-xl bg-slate-100 p-6 mb-8 space-y-3">
        <p><strong>ChatGPT:</strong> Wikipedia (7.8%), Reddit (1.8%), YouTube (1.2%), training data (pre-cutoff)</p>
        <p><strong>Google AI:</strong> Reddit (2.2%), LinkedIn (1.3%), Wikipedia (1.1%), your website (if crawlable)</p>
        <p><strong>Perplexity:</strong> Reddit (6.6%), YouTube (2.0%), Wikipedia (1.8%), real-time web search</p>
        <p><strong>Claude:</strong> Training data, cited web pages, structured data on your domain</p>
      </div>
      <p class="mb-6">
        Notice the pattern: <strong>Reddit dominates across all platforms</strong>. Anonymous
        Reddit threads have more influence on your AI employer brand than your official
        careers page. This is why active employer data management matters — you need to
        provide better sources for AI to cite.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The ROI of GEO for employer brands</h2>
      <p class="mb-6">
        Semrush's research shows that AI search visitors are <strong>4.4x more
        valuable</strong> than traditional organic visitors. They spend more time on site,
        engage more deeply, and convert at higher rates. For employer brands, this
        translates to:
      </p>
      <div class="space-y-3 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <p class="text-sm text-slate-600"><strong>Higher application quality:</strong> Candidates who arrive via AI have already been pre-qualified by the AI's contextual answer</p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <p class="text-sm text-slate-600"><strong>Lower cost-per-application:</strong> AI visibility is organic — no per-click cost like job boards</p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <p class="text-sm text-slate-600"><strong>Accurate first impressions:</strong> When AI gets your data right, candidates arrive with correct expectations — reducing offer-stage friction</p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The 12–18 month window</h2>
      <p class="mb-6">
        Right now, GEO for employer branding is a genuine competitive advantage. Only
        19% of SEO professionals practise GEO at all, and virtually none focus on the
        employer brand angle specifically.
      </p>
      <p class="mb-6">
        That will change. General-purpose AI SEO platforms like Profound ($9M Series A),
        Otterly, and Semrush are all expanding their AI visibility features. Within
        12–18 months, expect employer-brand-specific GEO tools to become mainstream.
      </p>
      <p class="mb-6">
        The companies that start now will have 12–18 months of optimised AI presence,
        accumulated structured data, and established authority before their competitors
        even begin.
      </p>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">Start your GEO audit</h3>
        <p class="text-sm text-slate-400 mb-6">See how AI-ready your employer brand is. Free, 30 seconds.</p>
        <a
          href="/#audit"
          class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Run your free audit
        </a>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Sources</h3>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>PerceptionX — AI-driven career site traffic data (2025)</li>
          <li>PerceptionX — 80% of job seekers using AI for employer research (2025)</li>
          <li>MktClarity — GEO market growing at 34% CAGR (Nov 2025)</li>
          <li>Semrush — 19% of SEOs practise GEO; AI visitors 4.4x more valuable (2025)</li>
          <li>Profound — 680M LLM citation analysis (Aug 2024–Jun 2025)</li>
          <li>OpenRole audit data — 500 UK employers (Feb 2026)</li>
          <li>Rally Recruitment Marketing — "AI Changing Employer Brand" (Jan 2026)</li>
          <li>Employer Branding News — "GEO for Employer Branding" (Jul 2025)</li>
        </ul>
      </div>
    `,
  },

  "ai-employer-brand-score": {
    title: "The AI Employer Brand Score: why every HR leader needs one in 2026",
    description:
      "Glassdoor ratings measured human perception. The AI Employer Brand Score measures machine perception — and it's becoming the metric that matters most.",
    date: "19 February 2026",
    readTime: "7 min read",
    category: "Analysis",
    ogTitle: "The AI Employer Brand Score | OpenRole",
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        For years, employer brand was measured by proxy: Glassdoor stars, LinkedIn follower
        count, Great Place to Work certifications. These metrics measured what humans thought
        about your company. They told you nothing about what AI thinks.
      </p>
      <p class="mb-6">
        In 2026, that's a problem. Because increasingly, <strong>AI forms the first
        impression</strong> — and candidates never look further.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">What is an AI Employer Brand Score?</h2>
      <p class="mb-6">
        An AI Employer Brand Score measures how accurately, completely, and favourably
        AI models represent your company to candidates. It answers a simple question:
        <strong>if someone asks AI about your company, will they get the right answer?</strong>
      </p>
      <p class="mb-6">
        The score encompasses five dimensions:
      </p>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">1. Discoverability</h3>
          <p class="text-sm text-slate-600">
            Can AI find your company at all? Do you have an llms.txt file, structured data,
            and an accessible careers page? 91% of UK employers score poorly here.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">2. Accuracy</h3>
          <p class="text-sm text-slate-600">
            Does AI get the facts right? Salary ranges, office locations, remote policy,
            employee count. Our audits show 78% of salary data is wrong — the largest
            source of employer AI inaccuracy.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">3. Completeness</h3>
          <p class="text-sm text-slate-600">
            How much does AI know? Some companies get a paragraph; others get a sentence.
            Completeness measures whether AI can answer follow-up questions — benefits,
            culture, tech stack, growth opportunities.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">4. Sentiment</h3>
          <p class="text-sm text-slate-600">
            Is the AI's description positive, neutral, or negative? If AI cites a 2022
            Reddit thread about layoffs but ignores your 2026 growth story, the sentiment
            is skewed. This measures the emotional impression candidates receive.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">5. Consistency</h3>
          <p class="text-sm text-slate-600">
            Do all AI models tell the same story? Research shows only <strong>25% content
            overlap</strong> between platforms. A candidate asking ChatGPT and Perplexity
            might get contradictory information. Consistency measures cross-platform alignment.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">Why traditional metrics aren't enough</h2>
      <p class="mb-6">
        Glassdoor ratings, LinkedIn followers, and employer brand surveys measure
        <em>human</em> perception. They assume candidates will visit those platforms,
        read those reviews, and form their own conclusions.
      </p>
      <p class="mb-6">
        But the candidate journey is changing. <strong>60% of searches are now zero-click</strong>.
        When AI Overviews appear, <strong>only 8% of users click any link</strong>.
        800 million people use ChatGPT weekly. A growing share of candidates never visit
        Glassdoor, never see your careers page, never read a single review.
      </p>
      <p class="mb-6">
        They ask AI. AI answers. They decide.
      </p>
      <div class="rounded-xl bg-slate-100 p-6 mb-8">
        <p class="text-sm text-slate-700">
          <strong>Think of it this way:</strong> Glassdoor measures what people say about you
          in a room you can enter. The AI Employer Brand Score measures what a machine says
          about you in a room you can't see — but your candidates are listening in.
        </p>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">What a good score looks like</h2>
      <p class="mb-6">
        Based on our audit of 500 UK employers, here's how scores break down:
      </p>
      <div class="rounded-xl bg-slate-100 p-6 mb-8 space-y-3">
        <p><strong>0–30 (Critical):</strong> AI knows almost nothing about you, or what it knows is wrong. Candidates asking AI get vague, inaccurate, or negative information. <em>This is where 46% of UK employers sit.</em></p>
        <p><strong>31–60 (Needs Work):</strong> AI has partial information. Some facts are correct, others are outdated or hallucinated. Salary data is likely wrong. <em>38% of employers.</em></p>
        <p><strong>61–80 (Competitive):</strong> AI has a reasonably accurate picture. You have some structured data, your careers page is crawlable, and salary estimates are in the right range. <em>12% of employers.</em></p>
        <p><strong>81–100 (Leading):</strong> AI accurately represents your company across all major platforms. You have llms.txt, structured data, published salary ranges, and consistent cross-platform narratives. <em>4% of employers.</em></p>
      </div>
      <p class="mb-6">
        The average score across 500 UK employers: <strong>34/100</strong>. The bar is on the floor.
        Even modest improvements put you ahead of the vast majority.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">How to improve your score</h2>
      <p class="mb-6">
        The fastest wins come from the discoverability dimension — the technical
        foundations that let AI find and understand your employer data:
      </p>
      <div class="rounded-xl bg-teal-50 border border-teal-200 p-6 mb-8 space-y-3">
        <p class="text-sm text-teal-800"><strong>+15–20 points:</strong> Add an <a href="/blog/llms-txt-guide" class="text-teal-700 underline">llms.txt file</a> with complete employer information</p>
        <p class="text-sm text-teal-800"><strong>+10–15 points:</strong> Add JSON-LD structured data (Organization, JobPosting schemas) to your careers page</p>
        <p class="text-sm text-teal-800"><strong>+10–15 points:</strong> Publish salary ranges on job listings in machine-readable format</p>
        <p class="text-sm text-teal-800"><strong>+5–10 points:</strong> Unblock AI crawlers in your robots.txt</p>
        <p class="text-sm text-teal-800"><strong>+5–10 points:</strong> Ensure your careers page loads without JavaScript (AI crawlers often can't execute JS)</p>
      </div>
      <p class="mb-6">
        A company scoring 34 can realistically reach 75+ within a month by implementing
        these technical foundations. No content strategy required. No brand overhaul.
        Just making your existing data machine-readable.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-12 mb-4">The metric that matters for TA</h2>
      <p class="mb-6">
        Here's the uncomfortable truth: most TA teams are spending budget on channels
        that AI is making irrelevant. Job board posts, Glassdoor management, careers page
        redesigns — all valuable, but increasingly secondary to the AI layer sitting above them.
      </p>
      <p class="mb-6">
        The AI Employer Brand Score gives TA leaders a single number to track, report to
        the C-suite, and improve over time. It's the employer brand equivalent of Domain
        Authority — not perfect, but directionally useful and actionable.
      </p>
      <p class="mb-6">
        When your CHRO asks "how's our employer brand?", you need a better answer than
        "our Glassdoor is 3.8 stars." You need: "Our AI Employer Brand Score is 72, up
        from 34 last quarter. AI now accurately represents our salaries, benefits, and
        culture across all major platforms."
      </p>
      <p class="mb-6">
        That's a metric that connects to outcomes — candidate quality, application
        volume, and the invisible pipeline of people who researched you via AI and
        decided to apply (or didn't).
      </p>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">Get your AI Employer Brand Score</h3>
        <p class="text-sm text-slate-400 mb-6">Free audit — 30 seconds, no signup. See where you stand.</p>
        <a
          href="/#audit"
          class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          Run your free audit
        </a>
      </div>

      <div class="mt-12 pt-8 border-t border-slate-200">
        <h3 class="text-sm font-semibold text-slate-900 mb-3">Sources</h3>
        <ul class="text-xs text-slate-500 space-y-1">
          <li>OpenRole audit data — 500 UK employers (Feb 2026)</li>
          <li>OpenAI — 800M weekly active users (Oct 2025)</li>
          <li>SparkToro — 60% zero-click search rate (2024)</li>
          <li>Pew Research — 8% CTR when AI Overviews appear (Jul 2025)</li>
          <li>Profound — 25% cross-platform content overlap (2025)</li>
          <li>PerceptionX — 80% of job seekers using AI for research (2025)</li>
          <li>Semrush — AI visitors 4.4x more valuable (2025)</li>
        </ul>
      </div>
    `,
  },
};

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Check hardcoded content first (always available, no fs dependency)
  const post = blogContent[slug];
  if (post) {
    return {
      title: post.ogTitle,
      description: post.description,
      openGraph: {
        title: post.ogTitle,
        description: post.description,
        type: "article",
      },
      alternates: { canonical: `https://openrole.co.uk/blog/${slug}` },
    };
  }
  
  // Only try markdown if no hardcoded content exists
  let markdownPost = null;
  try {
    const blog = await import("@/lib/blog");
    markdownPost = blog.getPostBySlug(slug);
  } catch {
    // fs read may fail on serverless (Vercel) — that's ok
  }
  
  if (markdownPost) {
    return {
      title: `${markdownPost.title} | OpenRole`,
      description: markdownPost.description,
      openGraph: {
        title: markdownPost.title,
        description: markdownPost.description,
        type: "article",
        publishedTime: markdownPost.date,
        authors: markdownPost.author ? [markdownPost.author] : undefined,
      },
      alternates: { canonical: `https://openrole.co.uk/blog/${slug}` },
    };
  }

  return { title: "Post Not Found | OpenRole" };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  
  // Check hardcoded content first (always available, no fs dependency)
  const post = blogContent[slug];
  
  // Only try markdown if no hardcoded content exists
  let markdownPost = null;
  if (!post) {
    try {
      const blog = await import("@/lib/blog");
      markdownPost = blog.getPostBySlug(slug);
    } catch {
      // fs read may fail on serverless (Vercel) — that's ok
    }
  }
  
  if (markdownPost) {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: markdownPost.title,
      description: markdownPost.description,
      datePublished: markdownPost.date,
      dateModified: markdownPost.date,
      author: {
        "@type": markdownPost.author?.includes("Team") ? "Organization" : "Person",
        name: markdownPost.author || "OpenRole Team",
      },
      publisher: {
        "@type": "Organization",
        name: "OpenRole",
        logo: {
          "@type": "ImageObject",
          url: "https://openrole.co.uk/logo.png",
        },
      },
    };

    return (
      <div className="min-h-screen bg-slate-50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonForHtml(articleSchema) }}
        />
        <Header />

        <main>
          <article className="bg-white border-b border-slate-200">
            <div className="mx-auto max-w-2xl px-6 py-16 lg:py-20">
              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-8"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All posts
              </Link>

              {/* Meta */}
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
                  {markdownPost.category}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(markdownPost.date)}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">{markdownPost.readTime} read</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-10">
                {markdownPost.title}
              </h1>

              {/* Markdown content */}
              <MarkdownRenderer content={markdownPost.content} />
            </div>
          </article>
        </main>

        <Footer />
      </div>
    );
  }

  // Fall back to hardcoded HTML
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        <article className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-2xl px-6 py-16 lg:py-20">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All posts
            </Link>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
                {post.category}
              </span>
              <span className="text-xs text-slate-400">{post.date}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">{post.readTime}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-10">
              {post.title}
            </h1>

            {/* Body */}
            <div
              className="prose prose-neutral prose-p:text-slate-600 prose-p:leading-relaxed prose-headings:text-slate-900 prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
            />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
