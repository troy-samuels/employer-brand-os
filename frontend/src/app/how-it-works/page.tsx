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
  BarChart3,
  Repeat,
  CheckCircle2,
  XCircle,
  Brain,
  Globe,
  MessageSquare,
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
  title: "How It Works — AI Employer Brand Audit | OpenRole",
  description:
    "Understand how OpenRole audits your employer brand across ChatGPT, Claude, Perplexity and Gemini. See the methodology, the scoring, and how to improve.",
  openGraph: {
    title: "How OpenRole Works — AI Employer Brand Audit",
    description:
      "We query 4 AI models with the same questions candidates ask. Then we show you what they say, what's wrong, and exactly what to publish to fix it.",
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
              We ask AI the same questions your candidates do.
              <br />
              Then we show you the answers.
            </h1>
            <p className="text-lg text-slate-500 max-w-xl leading-relaxed">
              No black box. No vague scores. Just the actual AI responses candidates receive — word for word — with specific recommendations to improve each one.
            </p>
          </div>
        </section>

        {/* ── The Problem ──────────────────────────── */}
        <section className="py-16 lg:py-20 border-b border-slate-200">
          <div className="mx-auto max-w-[900px] px-6 lg:px-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              The problem we solve
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8 max-w-2xl">
              When a candidate considers your company, they no longer just Google you.
              They ask ChatGPT. They ask Perplexity. They ask Claude. And these AI tools
              answer — whether or not the information is accurate.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl bg-red-50 border border-red-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <h3 className="text-sm font-semibold text-slate-900">Without OpenRole</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• AI guesses your salary based on Glassdoor averages</li>
                  <li>• Interview prep comes from 2-year-old Reddit threads</li>
                  <li>• Benefits description is generic industry defaults</li>
                  <li>• Candidates make decisions based on wrong information</li>
                  <li>• You never know what they saw or why they didn't apply</li>
                </ul>
              </div>

              <div className="rounded-xl bg-teal-50 border border-teal-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-500" />
                  <h3 className="text-sm font-semibold text-slate-900">With OpenRole</h3>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• See exactly what AI tells candidates about you</li>
                  <li>• Identify the specific questions AI gets wrong</li>
                  <li>• Get a content playbook — what to publish, where</li>
                  <li>• Track improvements weekly as AI cites your content</li>
                  <li>• Benchmark against competitors in your industry</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── The 4 Steps ──────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-[900px] px-6 lg:px-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-12">
              Four steps. From blind to in control.
            </h2>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
                  <Search className="h-6 w-6 text-brand-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    1. We query AI like a candidate would
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    We ask ChatGPT, Claude, Perplexity, and Gemini the 8 questions
                    candidates ask most: salary, benefits, interview process, culture,
                    remote policy, tech stack, career growth, and employer reviews.
                  </p>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                    <p className="text-sm text-slate-500 italic mb-2">Example queries we run:</p>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>→ &quot;What is the salary for a Senior Engineer at [Your Company]?&quot;</li>
                      <li>→ &quot;What benefits does [Your Company] offer?&quot;</li>
                      <li>→ &quot;Help me prepare for an interview at [Your Company]&quot;</li>
                      <li>→ &quot;What is the remote work policy at [Your Company]?&quot;</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
                  <FileSearch className="h-6 w-6 text-brand-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    2. We identify the information gaps
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    For each question, we compare what AI says against reality. We flag
                    inaccuracies, missing data, and outdated information. We also check
                    which sources AI is citing — your own content, or third-party guesses.
                  </p>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Common finding:</strong> AI says your salary is £55K when you actually
                      pay £75K. Why? Because you haven&apos;t published salary bands anywhere AI can
                      find them, so it defaults to Glassdoor averages from 2 years ago.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
                  <Lightbulb className="h-6 w-6 text-brand-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    3. We give you a Content Playbook
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Not vague advice — specific content recommendations. For each gap,
                    we tell you exactly what to publish, where to publish it, and how to
                    format it so AI picks it up. Templates included.
                  </p>
                  <div className="rounded-lg bg-teal-50 border border-teal-200 p-4">
                    <p className="text-sm text-teal-800">
                      <strong>Example recommendation:</strong> &quot;Add a salary range to your Senior
                      Engineer listing on your careers page. Format: &apos;Senior Engineer: £75,000–£90,000
                      base + equity.&apos; AI picks up structured salary data within 2-4 weeks.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10">
                  <Repeat className="h-6 w-6 text-brand-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    4. We track the impact weekly
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Every Monday, you get a report: what AI said this week, which gaps
                    you&apos;ve closed, which remain, and what to work on next. Watch your
                    score improve as AI starts citing your content instead of guessing.
                  </p>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <TrendingUp className="h-4 w-4 text-teal-500" />
                      <span>Average improvement: +15 points in the first month for employers who follow the playbook.</span>
                    </div>
                  </div>
                </div>
              </div>
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
              AI models like ChatGPT use Retrieval-Augmented Generation (RAG) — they
              search the web for current information before answering. This means the
              content on your careers page directly influences what AI tells candidates.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white border border-slate-200 p-6">
                <Brain className="h-6 w-6 text-brand-accent mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  AI follows authority
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  When your own domain ranks for employer queries, AI prefers your
                  content over third-party guesses. Domain authority matters.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-slate-200 p-6">
                <Zap className="h-6 w-6 text-brand-accent mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Changes happen fast
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  RAG-based AI (Perplexity, ChatGPT search) picks up new content
                  in days. One company went from 0% to 11% AI visibility in 2 weeks
                  from a single blog post.
                </p>
              </div>

              <div className="rounded-xl bg-white border border-slate-200 p-6">
                <Globe className="h-6 w-6 text-brand-accent mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  You already have the answers
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  You know your salary bands, benefits, and interview process.
                  The only problem is that it&apos;s not published where AI can find it.
                  We show you exactly where the gaps are.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────── */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              See it in action
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Run a free audit on your company — or check out a sample report to see
              exactly what you get.
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
