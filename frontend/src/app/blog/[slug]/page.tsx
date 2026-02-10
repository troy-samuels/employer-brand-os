/**
 * @module app/blog/[slug]/page
 * Individual blog post page — renders long-form content.
 * For now, content is inline. Will move to MDX or CMS later.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

interface PageProps {
  params: Promise<{ slug: string }>;
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
    ogTitle: "What AI tells candidates about your company | Rankwell",
    content: `
      <p class="text-lg text-neutral-600 leading-relaxed mb-8">
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

      <h2 class="text-2xl font-bold text-neutral-950 mt-12 mb-4">The headline numbers</h2>
      <div class="rounded-xl bg-neutral-100 p-6 mb-8 space-y-3">
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

      <h2 class="text-2xl font-bold text-neutral-950 mt-12 mb-4">Where AI gets its information</h2>
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

      <h2 class="text-2xl font-bold text-neutral-950 mt-12 mb-4">The zero-click problem</h2>
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
      <div class="rounded-xl bg-emerald-50 border border-emerald-200 p-6 mb-8">
        <p class="text-sm text-emerald-800">
          <strong>New:</strong> Ask AI → Get answer → Apply (or move on)
        </p>
      </div>
      <p class="mb-6">
        If the AI's answer is wrong — outdated salary, incorrect location, hallucinated
        benefits — the candidate moves on. You'll never know they were interested.
      </p>

      <h2 class="text-2xl font-bold text-neutral-950 mt-12 mb-4">What you can do about it</h2>
      <p class="mb-6">
        The good news: AI visibility is fixable. Unlike Glassdoor reviews (which you can't
        control) or Reddit threads (which you can't edit), the inputs to AI are technical
        and within your control.
      </p>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-neutral-200 p-5">
          <h3 class="font-semibold text-neutral-950 mb-1">1. Create an llms.txt file</h3>
          <p class="text-sm text-neutral-600">
            This is a structured file that tells AI models who you are, what you offer,
            and how to represent you. Think of it as robots.txt for your reputation.
            <a href="/blog/llms-txt-guide" class="text-brand-accent ml-1 hover:underline">Read our guide →</a>
          </p>
        </div>
        <div class="rounded-xl bg-white border border-neutral-200 p-5">
          <h3 class="font-semibold text-neutral-950 mb-1">2. Add structured data (JSON-LD)</h3>
          <p class="text-sm text-neutral-600">
            Machine-readable organisation data on your website. AI models use this to
            verify basic facts — name, location, industry, size. Without it, they guess.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-neutral-200 p-5">
          <h3 class="font-semibold text-neutral-950 mb-1">3. Publish salary data</h3>
          <p class="text-sm text-neutral-600">
            If AI is guessing your salaries (and getting them wrong), the fix is to publish
            real ranges on your job listings in a machine-readable format.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-neutral-200 p-5">
          <h3 class="font-semibold text-neutral-950 mb-1">4. Check your robots.txt</h3>
          <p class="text-sm text-neutral-600">
            43% of companies we audited block AI crawlers. If your site is invisible to
            ChatGPT's crawler, it relies entirely on third-party sources to describe you.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-neutral-200 p-5">
          <h3 class="font-semibold text-neutral-950 mb-1">5. Monitor continuously</h3>
          <p class="text-sm text-neutral-600">
            AI models retrain regularly. What they say about you today may change tomorrow.
            Weekly monitoring ensures you catch inaccuracies before candidates do.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-neutral-950 mt-12 mb-4">The window is now</h2>
      <p class="mb-6">
        Gartner predicts a <strong>25% drop in traditional search volume by 2026</strong>.
        Semrush projects AI search visitors will surpass traditional organic search by 2028.
        Meta AI already has 1 billion monthly users embedded in WhatsApp and Instagram.
      </p>
      <p class="mb-6">
        The shift isn't coming. It's here. The question is whether your employer brand
        is ready for it.
      </p>

      <div class="rounded-xl bg-neutral-950 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">See what AI says about your company</h3>
        <p class="text-sm text-neutral-400 mb-6">Free audit — 30 seconds, no signup required.</p>
        <a
          href="/#audit"
          class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-100 transition-colors"
        >
          Run your free audit
        </a>
      </div>

      <div class="mt-12 pt-8 border-t border-neutral-200">
        <h3 class="text-sm font-semibold text-neutral-950 mb-3">Sources</h3>
        <ul class="text-xs text-neutral-500 space-y-1">
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
};

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogContent[slug];
  if (!post) return { title: "Post Not Found | Rankwell" };

  return {
    title: post.ogTitle,
    description: post.description,
    openGraph: {
      title: post.ogTitle,
      description: post.description,
      type: "article",
    },
    alternates: { canonical: `https://rankwell.io/blog/${slug}` },
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = blogContent[slug];

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main>
        <article className="bg-white border-b border-neutral-200">
          <div className="mx-auto max-w-2xl px-6 py-12 lg:py-16">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All posts
            </Link>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-brand-accent">
                {post.category}
              </span>
              <span className="text-xs text-neutral-400">{post.date}</span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-400">{post.readTime}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-950 tracking-tight leading-tight mb-8">
              {post.title}
            </h1>

            {/* Body */}
            <div
              className="prose prose-neutral prose-p:text-neutral-600 prose-p:leading-relaxed prose-headings:text-neutral-950 prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
