/**
 * @module app/faq/[slug]/page
 * Individual FAQ deep-dive page.
 * Each FAQ gets a full content page with evidence, examples, and CTAs.
 * Placeholder content — will be filled with real copy.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { sanitizeHtml } from "@/lib/utils/sanitize-html";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

interface FaqContent {
  question: string;
  category: string;
  content: string;
  relatedSlugs: string[];
}

const faqContent: Record<string, FaqContent> = {
  "what-is-ai-visibility": {
    question: "What is AI visibility and why should employers care?",
    category: "Understanding AI Visibility",
    relatedSlugs: ["what-do-llms-say-about-employers", "which-ai-models-matter"],
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        AI visibility is a measure of how accurately and completely artificial intelligence
        models represent your company to the people asking about it — particularly job seekers.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">The shift in candidate behaviour</h2>
      <p class="mb-6">
        800 million people use ChatGPT every week. When a candidate considers applying to
        your company, they increasingly ask AI rather than opening Google. The response they
        get — accurate or not — shapes their decision in seconds.
      </p>
      <p class="mb-6">
        Research from the NBER shows that <strong>13.5% of all ChatGPT conversations are
        information-seeking queries</strong> — the type that used to go to search engines.
        That's hundreds of millions of questions per week about companies, salaries,
        benefits, and working conditions.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">Why should employers care?</h2>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-slate-100 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">1. AI hallucinates employer data</h3>
          <p class="text-sm text-slate-600">
            Our audits show 78% of salary estimates from AI are inaccurate — most underestimate
            by £15-25K. If candidates think you pay less than you do, they don't apply.
          </p>
        </div>
        <div class="rounded-xl bg-slate-100 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">2. Candidates don't click through</h3>
          <p class="text-sm text-slate-600">
            60% of Google searches are zero-click. When an AI Overview appears, only 8% of users
            click any link. Your careers page is increasingly irrelevant if AI gives the answer first.
          </p>
        </div>
        <div class="rounded-xl bg-slate-100 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">3. You can't control the sources</h3>
          <p class="text-sm text-slate-600">
            ChatGPT cites Wikipedia (7.8%) and Reddit (1.8%). Glassdoor — where most employers
            invest their reputation management — isn't in the top 10 cited sources for any major LLM.
          </p>
        </div>
        <div class="rounded-xl bg-slate-100 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">4. The problem is growing</h3>
          <p class="text-sm text-slate-600">
            Gartner predicts a 25% drop in traditional search by 2026. Semrush projects AI search
            will surpass organic by 2028. Meta AI has 1 billion monthly users in WhatsApp and
            Instagram. This isn't a future problem — it's happening now.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">What does a good AI visibility score look like?</h2>
      <div class="rounded-xl border border-slate-200 overflow-hidden mb-8">
        <table class="w-full text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="text-left px-5 py-3 font-semibold text-slate-900">Score</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-900">Rating</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-900">What it means</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            <tr>
              <td class="px-5 py-3 font-semibold text-teal-600">80-100</td>
              <td class="px-5 py-3">Excellent</td>
              <td class="px-5 py-3 text-slate-600">AI can accurately describe your company. You're ahead of 95% of employers.</td>
            </tr>
            <tr>
              <td class="px-5 py-3 font-semibold text-teal-600">60-79</td>
              <td class="px-5 py-3">Good</td>
              <td class="px-5 py-3 text-slate-600">AI has solid basics but gaps in specific areas. Minor fixes needed.</td>
            </tr>
            <tr>
              <td class="px-5 py-3 font-semibold text-amber-600">40-59</td>
              <td class="px-5 py-3">Needs work</td>
              <td class="px-5 py-3 text-slate-600">AI has partial information. Candidates get an incomplete or misleading picture.</td>
            </tr>
            <tr>
              <td class="px-5 py-3 font-semibold text-red-600">0-39</td>
              <td class="px-5 py-3">Poor / Critical</td>
              <td class="px-5 py-3 text-slate-600">AI is guessing. Candidates are likely being misinformed about your company.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mb-6">
        The average score across our audits is <strong>34/100</strong>. Most employers are
        invisible to AI — which means candidates are getting answers built from Reddit threads
        and Wikipedia stubs, not from anything the employer controls.
      </p>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">Check your AI visibility</h3>
        <p class="text-sm text-slate-400 mb-6">Free audit — 30 seconds, no signup.</p>
        <a href="/#audit" class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
          Run your free audit
        </a>
      </div>
    `,
  },

  "how-scoring-works": {
    question: "How does the AI Visibility Score work?",
    category: "How Rankwell Works",
    relatedSlugs: ["what-is-ai-visibility", "what-is-llms-txt"],
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        Your AI Visibility Score (0-100) measures how well-equipped your digital
        presence is for AI models to accurately represent your company. Higher
        scores mean AI has better data to work with.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">The 6 checks</h2>
      <p class="mb-6">
        We audit six dimensions that directly affect what AI models can learn about
        your company. Each check has a maximum score, totalling 100 points:
      </p>

      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="font-semibold text-slate-900">Structured Data (JSON-LD)</h3>
            <span class="text-sm font-semibold text-slate-400">28 points</span>
          </div>
          <p class="text-sm text-slate-600">
            JSON-LD is machine-readable metadata embedded in your website. It tells AI models
            your company name, industry, location, job postings, and salary data without ambiguity.
            Research shows structured data improves AI citation accuracy by 30–40%.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="font-semibold text-slate-900">AI Crawler Access (robots.txt)</h3>
            <span class="text-sm font-semibold text-slate-400">17 points</span>
          </div>
          <p class="text-sm text-slate-600">
            Does your robots.txt allow AI crawlers to read your website? 87% of ChatGPT
            citations correlate with Bing indexation. If AI crawlers can't reach your content,
            everything else becomes irrelevant.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="font-semibold text-slate-900">Careers Page Quality</h3>
            <span class="text-sm font-semibold text-slate-400">17 points</span>
          </div>
          <p class="text-sm text-slate-600">
            Does your website have a substantive careers page? We check for job listings,
            company culture content, and whether it's accessible to AI crawlers (not behind
            bot protection).
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="font-semibold text-slate-900">Brand Reputation & Presence</h3>
            <span class="text-sm font-semibold text-slate-400">17 points</span>
          </div>
          <p class="text-sm text-slate-600">
            We check for your presence on employer review platforms and the sentiment signals
            available to AI. Brands on 4+ platforms get 2.8x more AI citations.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="font-semibold text-slate-900">Salary Transparency</h3>
            <span class="text-sm font-semibold text-slate-400">12 points</span>
          </div>
          <p class="text-sm text-slate-600">
            Is salary information visible and machine-readable on your job listings? Without
            it, AI guesses — and our data shows those guesses are wrong 78% of the time.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <div class="flex items-baseline justify-between mb-2">
            <h3 class="font-semibold text-slate-900">Content Format & Structure</h3>
            <span class="text-sm font-semibold text-slate-400">9 points</span>
          </div>
          <p class="text-sm text-slate-600">
            Does your content use formats AI prefers to cite? FAQ schema, semantic heading
            hierarchy (h1→h2→h3), answer-first paragraphs, tables, and definition lists all
            improve AI citation rates by up to 39%.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">How we scan</h2>
      <p class="mb-6">
        When you enter a company name, we resolve it to a domain (using Companies House data
        for UK companies), then crawl the public website checking each dimension. The scan
        takes 30 seconds. We only access publicly available content — nothing behind
        authentication, nothing private.
      </p>
      <p class="mb-6">
        For paid plans, we also query 6 AI models directly to see what they say about your
        company — comparing their responses to your verified facts.
      </p>

      <div class="rounded-xl bg-slate-900 p-8 text-center mt-12">
        <h3 class="text-xl font-bold text-white mb-2">See your score</h3>
        <p class="text-sm text-slate-400 mb-6">Free, instant, no signup required.</p>
        <a href="/#audit" class="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors">
          Run your free audit
        </a>
      </div>
    `,
  },

  "pixel-security": {
    question: "Is the pixel safe to install? What data does it collect?",
    category: "Security & Privacy",
    relatedSlugs: ["what-is-the-pixel", "data-handling"],
    content: `
      <p class="text-lg text-slate-600 leading-relaxed mb-8">
        Yes. The Rankwell pixel is designed with security as the primary concern — because
        we're asking you to put code on your website, and that requires trust.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">What the pixel does</h2>
      <p class="mb-6">
        The pixel is a lightweight JavaScript snippet (~2KB) that serves structured employer
        data to AI crawlers visiting your careers page. It makes your company information
        (job listings, benefits, salary ranges, culture data) readable by AI models.
      </p>
      <p class="mb-6">
        Think of it as a translator: your ATS and careers page have rich data, but AI
        crawlers can't read it (especially through bot protection). The pixel exposes that
        data in a format AI understands.
      </p>

      <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">What it does NOT do</h2>
      <div class="rounded-xl bg-teal-50 border border-teal-200 p-6 mb-8">
        <ul class="space-y-2 text-sm text-teal-700">
          <li>✓ Does <strong>not</strong> collect personal data from visitors</li>
          <li>✓ Does <strong>not</strong> track individual users or set cookies</li>
          <li>✓ Does <strong>not</strong> send data to third parties</li>
          <li>✓ Does <strong>not</strong> modify your page content or appearance</li>
          <li>✓ Does <strong>not</strong> access anything behind authentication</li>
          <li>✓ Does <strong>not</strong> affect page load speed (async, deferred)</li>
        </ul>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">Security measures</h2>
      <div class="space-y-4 mb-8">
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">Subresource Integrity (SRI)</h3>
          <p class="text-sm text-slate-600">
            Every pixel script includes an SRI hash. Your browser verifies the script hasn't
            been tampered with before executing it. If the hash doesn't match, it won't run.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">Public integrity verification</h3>
          <p class="text-sm text-slate-600">
            You can verify the pixel's integrity at any time via our public endpoint.
            Compare the hash against what's on your site to confirm nothing has changed.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">HMAC request signing</h3>
          <p class="text-sm text-slate-600">
            All communication between the pixel and our API uses HMAC-SHA256 signed requests
            with timestamp and nonce to prevent replay attacks.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">SOC 2 aligned infrastructure</h3>
          <p class="text-sm text-slate-600">
            Built on SOC 2 Type II certified infrastructure (Vercel, Supabase). Full audit
            logging, row-level security, encrypted at rest and in transit. Own certification
            planned via Vanta.
          </p>
        </div>
        <div class="rounded-xl bg-white border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-1">Open source</h3>
          <p class="text-sm text-slate-600">
            The pixel source code is open for inspection. You (or your security team) can
            read every line before installing it.
          </p>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">GDPR & compliance</h2>
      <p class="mb-6">
        The pixel processes zero personal data, so it doesn't require cookie consent under
        GDPR. It's equivalent to serving a static file — no tracking, no profiling, no
        personal data processing. Full details in our
        <a href="/privacy" class="text-brand-accent hover:underline">Privacy Policy</a> and
        <a href="/dpa" class="text-brand-accent hover:underline">Data Processing Agreement</a>.
      </p>

      <div class="rounded-xl bg-slate-100 p-6 mt-8">
        <p class="text-sm text-slate-600">
          <strong>Need to get IT approval?</strong> We provide a security questionnaire
          pre-filled with all technical details, plus direct access to our Trust Centre at
          <a href="/security" class="text-brand-accent hover:underline ml-1">/security</a>.
          Your security team can verify everything independently.
        </p>
      </div>
    `,
  },
};

/* ------------------------------------------------------------------ */
/* Related FAQs helper                                                 */
/* ------------------------------------------------------------------ */

const allFaqTitles: Record<string, string> = {
  "what-is-ai-visibility": "What is AI visibility and why should employers care?",
  "what-do-llms-say-about-employers": "What do AI models actually say about employers?",
  "which-ai-models-matter": "Which AI models matter for employer brand?",
  "how-scoring-works": "How does the AI Visibility Score work?",
  "what-is-llms-txt": "Does llms.txt help with AI visibility?",
  "what-is-the-pixel": "What does the Rankwell pixel do?",
  "how-often-are-audits-updated": "How often is AI monitoring updated?",
  "pixel-security": "Is the pixel safe to install?",
  "data-handling": "How does Rankwell handle our company data?",
  "free-vs-paid": "What's included free vs paid?",
  "which-plan-do-i-need": "Which plan is right for my company?",
};

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const faq = faqContent[slug];
  if (!faq) return { title: "FAQ | Rankwell" };

  return {
    title: `${faq.question} | Rankwell FAQ`,
    description: faq.question,
    alternates: { canonical: `https://rankwell.io/faq/${slug}` },
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function FaqDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const faq = faqContent[slug];

  // For FAQ slugs that don't have full content yet, show a placeholder
  if (!faq) {
    // Check if it's a valid slug from the hub
    if (allFaqTitles[slug]) {
      return (
        <div className="min-h-screen bg-slate-50">
          <Header />
          <main className="py-16">
            <div className="mx-auto max-w-2xl px-6">
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-8"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All FAQs
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">
                {allFaqTitles[slug]}
              </h1>
              <div className="rounded-xl bg-white border border-slate-200 p-8 text-center">
                <p className="text-slate-500 mb-4">
                  This article is being written. Check back soon.
                </p>
                <Link
                  href="/faq"
                  className="text-sm text-brand-accent hover:underline"
                >
                  Browse other FAQs
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        <article className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-2xl px-6 py-16 lg:py-20">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All FAQs
            </Link>

            <p className="text-xs font-semibold text-brand-accent uppercase tracking-wide mb-3">
              {faq.category}
            </p>

            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-10">
              {faq.question}
            </h1>

            <div
              className="prose prose-neutral prose-p:text-slate-600 prose-p:leading-relaxed prose-headings:text-slate-900 prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.content) }}
            />
          </div>
        </article>

        {/* Related FAQs */}
        {faq.relatedSlugs.length > 0 && (
          <section className="py-10">
            <div className="mx-auto max-w-2xl px-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                Related questions
              </h2>
              <div className="space-y-3">
                {faq.relatedSlugs.map((rs) => (
                  <Link
                    key={rs}
                    href={`/faq/${rs}`}
                    className="group flex items-center justify-between rounded-xl bg-white border border-slate-200 p-4 hover:shadow-card-hover hover:border-neutral-300 transition-all duration-300"
                  >
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-brand-accent transition-colors">
                      {allFaqTitles[rs] ?? rs}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-accent transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
