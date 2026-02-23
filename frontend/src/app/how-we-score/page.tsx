/**
 * @module app/how-we-score/page
 * How we measure AI employer visibility — v2 evidence-based scoring model.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { generateHowToSchema, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How We Measure Your AI Employer Visibility",
  description:
    "Your AI Visibility Score is built on 6 evidence-based categories totalling 100 points — every weight traced to published research from Princeton, Microsoft, Semrush, and Moz.",
  openGraph: {
    title: "How We Measure Your AI Employer Visibility | OpenRole",
    description:
      "Your AI Visibility Score is built on 6 evidence-based categories totalling 100 points — every weight traced to published research from Princeton, Microsoft, Semrush, and Moz.",
    url: "https://openrole.co.uk/how-we-score",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How We Measure Your AI Employer Visibility | OpenRole",
    description:
      "Your AI Visibility Score is built on 6 evidence-based categories totalling 100 points — every weight traced to published research from Princeton, Microsoft, Semrush, and Moz.",
  },
  alternates: {
    canonical: "https://openrole.co.uk/how-we-score",
  },
};

const CHECKS = [
  {
    name: "Content Accessibility",
    weight: 20,
    what: "We check your robots.txt to see whether AI crawlers (GPTBot, ClaudeBot, etc.) can reach your content, and whether you publish a sitemap so they can find it efficiently.",
    why: "This is the foundational gate. If AI bots can't crawl your site, nothing else matters — your careers content, structured data, and brand story all become invisible to the models candidates are asking.",
  },
  {
    name: "Structured Data",
    weight: 20,
    what: "We scan your pages for JSON-LD schemas — Organization, JobPosting, FAQPage, and others. These are the machine-readable annotations that tell AI models exactly what your company does, where you're based, and what roles you're hiring for.",
    why: "JSON-LD is the language AI models use to understand your company. The Princeton GEO study (KDD 2024) and Microsoft's AEO guidelines both identify structured data as a primary driver of AI citation accuracy.",
  },
  {
    name: "Careers Content",
    weight: 20,
    what: "We check whether a careers or jobs page exists, is reachable by crawlers, and contains rich, specific content — not just a list of links to an ATS.",
    why: "Content quality is the #1 driver of AI citations according to the Princeton GEO study. A thin careers page with nothing but iframe links gives AI nothing to work with. Detailed content about roles, teams, and culture gives it everything.",
  },
  {
    name: "Content Format",
    weight: 15,
    what: "We look for FAQ sections, semantic HTML, answer-first structure, and content organised for easy AI extraction — the kind of formatting that makes it simple for models to pull accurate answers.",
    why: "Both the GEO study and Microsoft's AEO guidelines show that answer-optimised content — clear headings, direct answers, structured FAQs — dramatically increases the chance AI will cite you accurately rather than guess.",
  },
  {
    name: "Brand Presence",
    weight: 15,
    what: "We check for mentions across platforms candidates and AI models reference — Glassdoor, LinkedIn, Indeed, and others. We cap scoring at 3 platforms so startups aren't penalised for not being everywhere.",
    why: "Authority signals from multiple independent sources reinforce what AI models say about you. Research from Semrush and Moz shows that multi-platform presence correlates strongly with AI citation confidence.",
  },
  {
    name: "Salary Transparency",
    weight: 10,
    what: "We check whether salary data is published — pay ranges in job listings, pay transparency pages, or compensation frameworks. This is scored as a bonus: if no salary data exists, you start at 0 rather than being penalised.",
    why: "Pay is the most-searched employer topic. Publishing salary data gives AI concrete figures instead of guesses. We weight this lower than other categories because transparency norms vary by region — but companies that publish it are rewarded.",
  },
  {
    name: "llms.txt",
    weight: 0,
    what: "We check for an llms.txt file — a proposed standard for giving AI models a human-readable site summary. Currently weighted at 0 because research shows zero measurable impact on AI responses.",
    why: "We include this for transparency. The Senthor study (10M+ requests) and SE Ranking analysis (300K domains) both found no evidence that llms.txt improves AI visibility. If the evidence changes, we'll update the weight.",
  },
];

export default function HowWeScorePage() {
  const howToSchema = generateHowToSchema({
    name: "How We Measure Your AI Employer Visibility",
    description:
      "Learn how OpenRole calculates your AI Visibility Score using six evidence-based categories totalling 100 points, with every weight traced to published research.",
    steps: CHECKS.map((check) => ({
      name: check.name,
      text: `${check.what} ${check.why}`,
    })),
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={howToSchema} />
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
            How we measure your AI employer visibility
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Your AI Visibility Score is built on 6 evidence-based categories
            totalling 100 points. Every weight is traced to published research —
            from the Princeton GEO study and Microsoft&apos;s AEO guidelines to
            Semrush and Moz authority research.
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
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums shrink-0 ${
                  check.weight > 0
                    ? "bg-brand-accent-light text-brand-accent"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {check.weight} pts
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-600 mb-2">
              <span className="font-medium text-slate-700">
                What we check:{" "}
              </span>
              {check.what}
            </p>
            <p className="text-[13px] leading-relaxed text-slate-500">
              <span className="font-medium text-neutral-700">
                Why it matters:{" "}
              </span>
              {check.why}
            </p>
          </div>
        ))}

        {/* Fairness note */}
        <div className="rounded-2xl bg-slate-900 p-6 lg:p-7 text-sm leading-relaxed text-slate-400">
          <h2 className="text-[15px] font-semibold text-white mb-3">
            Built to be fair
          </h2>
          <ul className="space-y-2">
            <li>
              <span className="text-slate-300">Brand presence is capped</span>{" "}
              — a startup on Glassdoor, LinkedIn, and their own site scores the
              same as an enterprise on 10 platforms.
            </li>
            <li>
              <span className="text-slate-300">
                Salary is a bonus, not a penalty
              </span>{" "}
              — no data means 0, not a deduction. Regional norms differ too much
              to punish silence.
            </li>
            <li>
              <span className="text-slate-300">No company size proxies</span> —
              we don&apos;t use headcount, revenue, or funding as signals.
              A 10-person startup and a 10,000-person enterprise are scored on
              the same criteria.
            </li>
            <li>
              <span className="text-slate-300">Every weight is evidence-based</span>{" "}
              — traced to published research. When the research changes, we
              update the model.
            </li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            See where your gaps are
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Run a free audit to see exactly what AI can and can&apos;t find
            about your company — and where you&apos;re losing visibility.
            Takes 30 seconds.
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
