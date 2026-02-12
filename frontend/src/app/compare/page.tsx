/**
 * @module app/compare/page
 * "What Does AI Say About You?" — the viral comparison tool.
 *
 * Shows side-by-side AI model responses about specific employers.
 * Pre-computed snapshots for seeded companies, audit CTA for others.
 * This is the "holy shit" page that converts visitors into leads.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Shield,
  Zap,
} from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { aiSnapshots, type AISnapshot } from "@/data/ai-snapshots";

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "What Does AI Say About You? | Rankwell",
  description:
    "See exactly what ChatGPT, Perplexity, and Gemini tell candidates about your company. Side-by-side AI responses — the truth about your AI employer reputation.",
  openGraph: {
    title: "What Does AI Say About You? | Rankwell",
    description:
      "See what AI tells candidates about your company. Side-by-side comparison across ChatGPT, Perplexity, and Gemini.",
    type: "website",
  },
  alternates: {
    canonical: "https://rankwell.io/compare",
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function sentimentBadge(sentiment: "positive" | "mixed" | "negative") {
  const map = {
    positive: {
      bg: "bg-teal-50 border-teal-200 text-teal-700",
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Positive",
    },
    mixed: {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      icon: <AlertTriangle className="h-3 w-3" />,
      label: "Mixed",
    },
    negative: {
      bg: "bg-red-50 border-red-200 text-red-700",
      icon: <XCircle className="h-3 w-3" />,
      label: "Negative",
    },
  };
  const s = map[sentiment];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${s.bg}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-teal-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function scoreBg(score: number): string {
  if (score >= 70) return "bg-teal-50 border-teal-200";
  if (score >= 40) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

/* ------------------------------------------------------------------ */
/* Company Comparison Card                                             */
/* ------------------------------------------------------------------ */

function CompanyComparison({ snapshot }: { snapshot: AISnapshot }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Company header */}
      <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {snapshot.company}
          </h3>
          <p className="text-sm text-slate-400">
            {snapshot.domain} · {snapshot.industry} · {snapshot.employees}
          </p>
        </div>
        <div className="text-right">
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 ${scoreBg(snapshot.overallScore)}`}
          >
            <span className="text-xs font-medium text-slate-500">
              AI Score
            </span>
            <span
              className={`text-lg font-bold tabular-nums ${scoreColor(snapshot.overallScore)}`}
            >
              {snapshot.overallScore}
            </span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
        </div>
      </div>

      {/* Side-by-side responses */}
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
        {snapshot.responses.map((r) => (
          <div key={r.model} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{r.modelIcon}</span>
                <span className="text-sm font-semibold text-slate-900">
                  {r.model}
                </span>
              </div>
              {sentimentBadge(r.sentiment)}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              &ldquo;{r.response}&rdquo;
            </p>

            {/* Issues found */}
            {r.issues.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Issues found
                </p>
                {r.issues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-red-600"
                  >
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-slate-400">
              {r.sourcesCount} sources cited · Snapshot: {snapshot.snapshotDate}
            </p>
          </div>
        ))}
      </div>

      {/* Key issues summary + CTA */}
      <div className="px-6 py-4 border-t border-neutral-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Key issues
          </p>
          <ul className="space-y-0.5">
            {snapshot.keyIssues.slice(0, 3).map((issue, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/#audit"
          className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shrink-0"
        >
          Fix these responses
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        {/* ── Hero ───────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12 py-20 lg:py-24">
            <div className="flex items-start gap-3 mb-5">
              <Eye className="h-6 w-6 text-brand-accent mt-0.5" />
              <p className="overline">
                AI Employer Reputation
              </p>
            </div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight max-w-3xl">
              What does AI tell candidates about your company?
            </h1>
            <p className="mt-5 text-lg text-slate-500 max-w-2xl leading-relaxed">
              We asked ChatGPT, Perplexity, and Gemini &ldquo;What&apos;s it
              like to work at [Company]?&rdquo; for real UK employers. The
              results are alarming — and most companies have no idea.
            </p>

            {/* Problem stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
                  stat: "78%",
                  label: "of salary estimates were wrong",
                },
                {
                  icon: <XCircle className="h-5 w-5 text-red-500" />,
                  stat: "0%",
                  label: "of companies had an llms.txt file",
                },
                {
                  icon: <Shield className="h-5 w-5 text-amber-500" />,
                  stat: "3/5",
                  label: "AI models cited outdated reviews",
                },
                {
                  icon: <Zap className="h-5 w-5 text-teal-500" />,
                  stat: "30s",
                  label: "to run your free audit",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  {item.icon}
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {item.stat}
                  </p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────── */}
        <section className="border-b border-slate-200 bg-slate-900">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {[
                {
                  step: "1",
                  title: "We query AI models",
                  desc: 'We ask ChatGPT, Perplexity, and Gemini "What\'s it like to work at [Company]?"',
                },
                {
                  step: "2",
                  title: "We analyse responses",
                  desc: "We check for accuracy, sentiment, hallucinations, missing data, and outdated information.",
                },
                {
                  step: "3",
                  title: "We show you the truth",
                  desc: "Side-by-side comparison so you can see exactly what candidates are being told.",
                },
              ].map((item) => (
                <div key={item.step}>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Company comparisons ────────────────────── */}
        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12 space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
                Real AI responses for real UK companies
              </h2>
              <p className="text-slate-500 max-w-lg mx-auto">
                These are actual responses from AI models when asked about these
                employers. No edits, no cherry-picking.
              </p>
            </div>

            {aiSnapshots.map((snapshot) => (
              <CompanyComparison key={snapshot.slug} snapshot={snapshot} />
            ))}
          </div>
        </section>

        {/* ── CTA: Check your company ────────────────── */}
        <section className="py-16 lg:py-20 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <Search className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">
              What does AI say about <em>your</em> company?
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Run a free audit in 30 seconds. See your AI visibility score, what
              each model says, and get specific recommendations to fix it.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-8 py-4 text-base font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Audit your company free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <p className="mt-3 text-xs text-slate-400">
              No signup required · Results in 30 seconds · Joins the AI Employer Index
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
