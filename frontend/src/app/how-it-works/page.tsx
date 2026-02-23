/**
 * @module app/how-it-works/page
 * Deep-dive "How It Works" page — explains the mechanism, builds trust,
 * and addresses the "can this really work?" objection.
 *
 * SEO target: "how does AI employer branding work", "AI employer brand audit"
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  FileSearch,
  Repeat,
  CheckCircle2,
  XCircle,
  Brain,
  Globe,
  Lightbulb,
  Zap,
  TrendingUp,
} from "lucide-react";

import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "How It Works — RAG-Native Employer Data | OpenRole",
  description:
    "OpenRole publishes verified employer facts that AI models cite. Understand how RAG works, why careers pages fail AI, and how OpenRole fixes it (llms.txt, snippet, OpenRole profile).",
  openGraph: {
    title: "How OpenRole Works — RAG-Native Employer Data",
    description:
      "We inject machine-readable employer data into your website. When ChatGPT, Perplexity or Google AI researches your company, it finds your verified facts — not third-party rumours.",
    type: "website",
    url: "https://openrole.co.uk/how-it-works",
  },
  alternates: { canonical: "https://openrole.co.uk/how-it-works" },
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* ── Hero ─────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-[900px] px-6 lg:px-12 py-20 lg:py-28">
            <p className="text-sm font-medium text-brand-accent uppercase tracking-wider mb-4">
              How It Works
            </p>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight mb-6 max-w-2xl">
              We inject machine-readable data into your website
              <br />
              so AI cites your facts, not rumours.
            </h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              When ChatGPT, Perplexity or Google AI researches your company, it searches the web first. Publishing structured data on your own domain maximises the probability AI cites your verified content instead of third-party guesses.
            </p>
          </div>
        </section>

        {/* ── How RAG Works ──────────────────────────── */}
        <section className="py-16 lg:py-20 border-b border-slate-200">
          <div className="mx-auto max-w-[900px] px-6 lg:px-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              How RAG works (the short version)
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8 max-w-2xl">
              Modern AI models like ChatGPT and Perplexity use Retrieval-Augmented Generation (RAG) — they search the web for current information before answering. This means they're not just regurgitating training data; they're actively looking for your content right now.
            </p>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 mb-8">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                When a candidate asks "What's the salary at [Your Company]?":
              </h3>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="font-semibold text-brand-accent">1.</span>
                  <span>AI searches the web for pages about your company and salaries</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-brand-accent">2.</span>
                  <span>It ranks results by domain authority and relevance</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-brand-accent">3.</span>
                  <span>It reads the top results and synthesises an answer</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-brand-accent">4.</span>
                  <span>It cites the sources it used (Perplexity does this explicitly)</span>
                </li>
              </ol>
            </div>

            <p className="text-slate-600 leading-relaxed max-w-2xl">
              <strong className="text-slate-900">The problem:</strong> Most company careers pages fail this process. They're JavaScript-heavy, lack structured data, and bury key facts in PDFs or behind login walls. So AI defaults to third-party sources — Glassdoor, Indeed, old Reddit threads — even when those sources are wrong.
            </p>
          </div>
        </section>

        {/* ── What OpenRole Does ──────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-[900px] px-6 lg:px-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              What OpenRole does (3 levels)
            </h2>
            <p className="text-slate-600 leading-relaxed mb-12 max-w-2xl">
              We inject machine-readable employer data into your existing website. Three levels of implementation — you pick what works for your team. All use your domain authority to increase the likelihood AI cites your verified content.
            </p>

            <div className="space-y-8">
              {/* Level 1: llms.txt */}
              <div className="rounded-xl bg-white border border-slate-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
                    <FileSearch className="h-6 w-6 text-brand-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Level 1: llms.txt
                      </h3>
                      <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
                        No IT required
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      A structured text file at <code className="text-sm bg-slate-50 px-1.5 py-0.5 rounded">yourcompany.com/llms.txt</code> that tells AI models how to describe your company. Think robots.txt for your reputation. Paste one code block into your site footer.
                    </p>
                    <p className="text-sm text-slate-500">
                      <strong>What it covers:</strong> Company overview, salary ranges, benefits, remote policy, interview process, tech stack.
                    </p>
                  </div>
                </div>
              </div>

              {/* Level 2: Snippet */}
              <div className="rounded-xl bg-white border border-slate-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
                    <Zap className="h-6 w-6 text-brand-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Level 2: JavaScript snippet
                      </h3>
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        Paste 1 script tag
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      A lightweight script (~2KB) that serves structured employer data to AI crawlers visiting your careers page. Makes your company information machine-readable — AI can parse it instantly. Updates propagate without redeploying your site.
                    </p>
                    <p className="text-sm text-slate-500">
                      <strong>What it adds:</strong> JSON-LD structured data, dynamic content updates, tracking which AI models visit your site.
                    </p>
                  </div>
                </div>
              </div>

              {/* Level 3: OpenRole profile */}
              <div className="rounded-xl bg-white border border-slate-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
                    <Globe className="h-6 w-6 text-brand-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Level 3: Your OpenRole profile
                      </h3>
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                        Automatic
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-3">
                      Your verified employer facts live on your OpenRole profile — a designed, SEO-optimised page that both candidates and AI crawlers read. We control the quality, freshness, and structure. You just keep your data up to date.
                    </p>
                    <p className="text-sm text-slate-500">
                      <strong>What it provides:</strong> Canonical source of truth for AI, comprehensive employer facts page, weekly freshness updates, no IT work required.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-xl bg-teal-50 border border-teal-200 p-6">
              <h3 className="text-sm font-semibold text-teal-900 mb-2">
                All levels share the same principle:
              </h3>
              <p className="text-sm text-teal-800 leading-relaxed">
                Your llms.txt and snippet point AI to your OpenRole profile. When candidates ask about your company, AI finds <em>your verified facts</em> — not third-party guesses. That's what increases the probability of accurate AI answers.
              </p>
            </div>
          </div>
        </section>

        {/* ── Why This Works ──────────────────────── */}
        <section className="py-16 lg:py-20 bg-slate-50 border-t border-b border-slate-200">
          <div className="mx-auto max-w-[900px] px-6 lg:px-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Why this works
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8 max-w-2xl">
              RAG-based AI (ChatGPT, Perplexity, Google AI Overviews) searches the web before answering. Publishing structured, machine-readable content on your own domain maximises the probability that AI models cite your verified data instead of third-party sources. Three reasons:
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white border border-slate-200 p-6">
                <Brain className="h-6 w-6 text-brand-accent mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Domain authority matters
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  When your own domain ranks for employer queries, AI prefers your content over third-party guesses. Publishing on yourcompany.com beats publishing on Medium or LinkedIn.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-slate-200 p-6">
                <Zap className="h-6 w-6 text-brand-accent mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Changes happen fast
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  RAG updates in days, not months. One company went from 0% to 11% AI visibility in 2 weeks from publishing structured data. Another went 3.2% → 22.2% with a careers page rewrite.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-slate-200 p-6">
                <Globe className="h-6 w-6 text-brand-accent mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  You already have the data
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  You know your salary bands, benefits, and interview process. The only problem is it's not published in a machine-readable format on your domain. OpenRole fixes that.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              See what AI says about you right now
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Run a free audit to see what ChatGPT, Perplexity, Claude and Gemini tell candidates about your company — word for word. Then we show you how to fix it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#audit"
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                Run your free audit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/sample-report"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                View sample report
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
