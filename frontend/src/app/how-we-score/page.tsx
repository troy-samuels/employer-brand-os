/**
 * @module app/how-we-score/page
 * How we measure AI employer visibility — 8 factual themes.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { generateHowToSchema, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How We Measure Your AI Employer Visibility",
  description:
    "Your AI Visibility Score measures how accurately AI represents your company to candidates — scored across 8 factual themes based on what candidates actually ask.",
  openGraph: {
    title: "How We Measure Your AI Employer Visibility | OpenRole",
    description:
      "Your AI Visibility Score measures how accurately AI represents your company to candidates — scored across 8 factual themes based on what candidates actually ask.",
    url: "https://openrole.co.uk/how-we-score",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How We Measure Your AI Employer Visibility | OpenRole",
    description:
      "Your AI Visibility Score measures how accurately AI represents your company to candidates — scored across 8 factual themes based on what candidates actually ask.",
  },
  alternates: {
    canonical: "https://openrole.co.uk/how-we-score",
  },
};

const CHECKS = [
  {
    name: "Salary Accuracy",
    weight: 20,
    what: "We compare what AI says you pay against published salary data on your careers page, job listings, and industry benchmarks.",
    why: "\"How much does [company] pay?\" is the #1 question candidates ask AI. When AI guesses wrong — and the average error is £18K — candidates either don't apply or negotiate based on fiction.",
  },
  {
    name: "Benefits Completeness",
    weight: 15,
    what: "We check whether AI can list your specific benefits — healthcare, pension, parental leave, L&D budget, equity — or defaults to generic phrases like \"standard UK package.\"",
    why: "Benefits are the second most-searched employer topic. Glassdoor rarely has specifics. If your careers page doesn't list them, AI can't either.",
  },
  {
    name: "Remote & Hybrid Policy",
    weight: 15,
    what: "We test whether AI can accurately describe your working model — fully remote, hybrid, office-based — including specifics like days in office and location requirements.",
    why: "Post-pandemic, remote policy is a dealbreaker for most candidates. When AI says \"unable to confirm\" or gets it wrong, you lose applicants before they even see the job.",
  },
  {
    name: "Interview Process Transparency",
    weight: 12,
    what: "We check whether AI can describe your interview stages, timeline, and what candidates should expect. Most companies have zero public content on this.",
    why: "\"Help me prepare for an interview at [company]\" is one of the fastest-growing AI prompts. Companies with published interview guides dominate these results.",
  },
  {
    name: "Career Growth Pathways",
    weight: 10,
    what: "We assess whether AI can describe progression, promotion frameworks, L&D programmes, and growth opportunities at your company.",
    why: "Career development is consistently a top-3 factor in employer choice. If AI can't describe your growth story, candidates assume there isn't one.",
  },
  {
    name: "Tech Stack & Tools",
    weight: 8,
    what: "For technical roles, we check whether AI can describe your engineering environment — languages, frameworks, infrastructure, development practices.",
    why: "Engineers choose employers based on tech stack. If this information isn't published, AI either guesses or says nothing — and the candidate applies somewhere else.",
  },
  {
    name: "Culture Specificity",
    weight: 10,
    what: "We measure whether AI describes your culture with specifics (\"transparent leadership, quarterly all-hands, 4-day work week trials\") or vague generics (\"good culture, nice people\").",
    why: "Vague culture descriptions come from Glassdoor reviews. Specific ones come from your own content. The more specific AI can be, the more trustworthy the answer feels to candidates.",
  },
  {
    name: "DEI & Inclusion",
    weight: 10,
    what: "We check whether AI can reference your diversity commitments, ERGs, inclusion initiatives, pay gap reporting, or accessibility policies.",
    why: "Increasingly important to candidates, especially under-30s. Published DEI data on your domain gives AI concrete facts instead of silence.",
  },
];

export default function HowWeScorePage() {
  const howToSchema = generateHowToSchema({
    name: "How We Measure Your AI Employer Visibility",
    description:
      "Learn how OpenRole calculates your AI Visibility Score using eight factual themes based on what candidates actually ask AI about employers.",
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
            Your AI Visibility Score measures how accurately AI represents your
            company to candidates — scored across 8 factual themes based on what
            candidates actually ask.
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
      </div>

      {/* CTA */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <div className="rounded-2xl bg-slate-900 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            See where your gaps are
          </h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            Run a free audit to see exactly what AI says about your company —
            and which questions it can&apos;t answer. Takes 30 seconds.
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
