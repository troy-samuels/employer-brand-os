/**
 * @module app/how-we-score/page
 * Module implementation for page.tsx.
 */

import type { Metadata } from "next";
import Link from "next/link";

/**
 * Exposes exported value(s): metadata.
 */
export const metadata: Metadata = {
  title: "How We Score Your AI Visibility | Rankwell",
  description:
    "Understand the six checks behind your Rankwell AI Visibility Score — evidence-based scoring aligned with peer-reviewed research on what actually drives AI citations.",
};

const CHECKS = [
  {
    name: "Structured Data (JSON-LD)",
    weight: 28,
    what: "We scan your website for schema.org markup — machine-readable facts about your organisation, job listings, salary ranges, and employer ratings.",
    why: "Research shows structured data improves AI citation accuracy by 30–40% (Princeton GEO Study, 2024). It's the single most impactful technical signal for AI visibility. We look for Organization, JobPosting, EmployerAggregateRating, and FAQPage schemas.",
  },
  {
    name: "AI Crawler Access",
    weight: 17,
    what: "We check your robots.txt to see which AI crawlers (GPTBot, ClaudeBot, PerplexityBot) can access your site, plus sitemap availability.",
    why: "87% of ChatGPT citations correlate with Bing indexation. If AI crawlers can't reach your content, everything else becomes irrelevant.",
  },
  {
    name: "Careers Page Quality",
    weight: 17,
    what: "We look for a careers page and assess whether it has substantive content about roles, culture, and benefits that AI can reference.",
    why: "Your careers page is the primary employer content AI draws from — but only if it's structured, accessible, and rich enough to cite.",
  },
  {
    name: "Brand Reputation & Presence",
    weight: 17,
    what: "We measure your presence across employer review platforms and assess public sentiment. Brands on 4+ platforms get significantly more AI citations.",
    why: "Multi-platform presence is among the strongest predictors of AI citation. AI cross-references multiple sources — the more places you appear, the more likely you are to be mentioned.",
  },
  {
    name: "Salary Transparency",
    weight: 12,
    what: "We check whether salary information is visible on your careers or job pages in a machine-readable format (especially JSON-LD JobPosting with baseSalary).",
    why: '"How much does [company] pay?" is the #1 question candidates ask AI about employers. Published salary data reduces AI hallucination from £18K average error to £3K.',
  },
  {
    name: "Content Format & Structure",
    weight: 9,
    what: "We assess whether your content uses formats AI prefers to cite: FAQ schema, semantic heading hierarchy (h1→h2→h3), answer-first paragraph structure, structured tables, definition lists, and ARIA/role attributes.",
    why: "AI models disproportionately cite content in FAQ, comparative, and tabular formats. Answer-first structures increase AI citation by up to 39% (Princeton GEO study). Proper semantic HTML helps AI parse and extract your information accurately.",
  },
];

/**
 * Executes HowWeScorePage.
 * @returns The resulting value.
 */
export default function HowWeScorePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
        <div className="relative max-w-2xl mx-auto px-6 py-20 lg:py-24 text-center">
          <Link
            href="/"
            className="inline-block text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors duration-200 mb-8"
          >
            ← Back to audit
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            How we calculate your score
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Your AI Visibility Score is based on six evidence-based checks — each weighted
            according to peer-reviewed research on what actually drives AI
            citations across ChatGPT, Claude, Perplexity, and Google AI.
          </p>
        </div>
      </div>

      {/* Checks */}
      <div className="max-w-2xl mx-auto px-6 py-14 space-y-5">
        {CHECKS.map((check) => (
          <div
            key={check.name}
            className="rounded-2xl bg-white p-6 lg:p-7 border border-neutral-100 shadow-card hover:shadow-card-hover transition-shadow duration-300"
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-[15px] font-semibold text-slate-900">
                {check.name}
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-accent-light px-2.5 py-0.5 text-xs font-bold tabular-nums text-brand-accent shrink-0">
                {check.weight} pts
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-600 mb-2">
              <span className="font-medium text-slate-700">What we check: </span>
              {check.what}
            </p>
            <p className="text-[13px] leading-relaxed text-slate-500">
              <span className="font-medium text-neutral-700">Why it matters: </span>
              {check.why}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Ready to fix your score?
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Rankwell automatically optimises your employer brand for AI — so when
            candidates ask about you, the answers are yours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Run your free audit
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-neutral-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:border-neutral-500 transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
