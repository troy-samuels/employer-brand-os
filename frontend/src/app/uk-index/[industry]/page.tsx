/**
 * @module app/index/[industry]/page
 * Industry-specific AI Employer Visibility Index page.
 *
 * SEO play: each industry page targets "best [industry] employers UK AI"
 * and related long-tail queries. Unique content per page via seoIntro.
 * Internal links to company profiles, parent index, and related industries.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Trophy,
  TrendingUp,
  BarChart3,
  Building2,
  ArrowLeft,
  Search,
} from "lucide-react";

import { industries, getIndustry, getRelatedIndustries } from "@/data/industries";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/* ------------------------------------------------------------------ */
/* Static generation                                                    */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  return industries.map((industry) => ({
    industry: industry.slug,
  }));
}

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

interface PageProps {
  params: Promise<{ industry: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { industry: slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};

  const title = `Best ${industry.name} Employers UK — AI Visibility Index`;
  const description = industry.description + ". Monthly rankings based on what AI tells candidates about salary, benefits, culture, and more.";

  return {
    title,
    description,
    openGraph: {
      title: `${title} | OpenRole`,
      description,
      url: `https://openrole.co.uk/uk-index/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | OpenRole`,
      description,
    },
    alternates: {
      canonical: `https://openrole.co.uk/uk-index/${slug}`,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default async function IndustryIndexPage({ params }: PageProps) {
  const { industry: slug } = await params;
  const industry = getIndustry(slug);

  if (!industry) {
    notFound();
  }

  const relatedIndustries = getRelatedIndustries(industry);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main>
        {/* ── Hero ───────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-[1200px] px-6 lg:px-12 py-20 lg:py-24">
            {/* Breadcrumb */}
            <Link
              href="/uk-index"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              UK Visibility Index
            </Link>

            <div className="flex items-start gap-3 mb-5">
              <Trophy className="h-6 w-6 text-brand-accent mt-0.5" />
              <p className="overline">{industry.name} Employers</p>
            </div>

            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight max-w-2xl">
              Best {industry.name} employers in the UK — according to AI
            </h1>

            <p className="mt-5 text-lg text-slate-500 max-w-2xl leading-relaxed">
              {industry.seoIntro}
            </p>

            {/* Stats placeholder */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Updated monthly
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Scored across 8 employer themes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Based on real AI responses
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Rankings ───────────────────────────────── */}
        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            {/* Empty state — pre-data */}
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Building the {industry.name} index
              </h2>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                We&apos;re collecting audit data for UK {industry.name.toLowerCase()} employers.
                Run a free audit on a {industry.name.toLowerCase()} company to add it to the rankings.
              </p>
              <Link
                href="/#audit"
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                Audit a {industry.name.toLowerCase()} employer
              </Link>
            </div>
          </div>
        </section>

        {/* ── What we measure ────────────────────────── */}
        <section className="py-14 lg:py-20 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
              What we measure for {industry.name.toLowerCase()} employers
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Every company is scored across 8 themes that candidates actually ask AI about.
              For {industry.name.toLowerCase()}, the most impactful themes tend to be salary accuracy,
              culture specificity, and career growth pathways.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { name: "Salary Accuracy", desc: "Does AI know what you actually pay?" },
                { name: "Benefits Completeness", desc: "Can AI list your specific benefits?" },
                { name: "Remote & Hybrid Policy", desc: "Does AI know your working model?" },
                { name: "Interview Process", desc: "Can candidates prep using AI?" },
                { name: "Career Growth", desc: "Does AI describe your progression paths?" },
                { name: "Tech Stack & Tools", desc: "Can AI describe your environment?" },
                { name: "Culture Specificity", desc: "Specific details, not vague generics?" },
                { name: "DEI & Inclusion", desc: "Are your commitments visible to AI?" },
              ].map((theme) => (
                <div
                  key={theme.name}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="text-sm font-semibold text-slate-900">{theme.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{theme.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/how-we-score"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Full scoring methodology
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Related industries ─────────────────────── */}
        {relatedIndustries.length > 0 && (
          <section className="py-14 lg:py-20 border-t border-slate-200">
            <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Related industries
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedIndustries.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/index/${related.slug}`}
                    className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-card-hover hover:border-neutral-300 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-accent transition-colors">
                        {related.name}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-brand-accent transition-colors" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {related.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── All industries ─────────────────────────── */}
        <section className="py-14 lg:py-20 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              All industries
            </h2>
            <div className="flex flex-wrap gap-2">
              {industries.map((ind) => (
                <Link
                  key={ind.slug}
                  href={`/index/${ind.slug}`}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    ind.slug === slug
                      ? "bg-brand-accent text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {ind.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────── */}
        <section className="py-12 lg:py-16 border-t border-slate-200">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">
              Is your company visible to AI?
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Run a free audit to see what ChatGPT, Claude, Perplexity and Gemini
              say about you — and where the information gaps are.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Free AI employer audit
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
