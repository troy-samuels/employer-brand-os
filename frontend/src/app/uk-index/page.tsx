/**
 * @module app/index/page
 * The AI Employer Index — a live, public leaderboard ranking companies
 * by AI visibility score.
 *
 * SEO play: "UK AI Employer Visibility Rankings" — unique dataset nobody
 * else has. Every company listed is a backlink magnet and a conversion funnel.
 *
 * Data updates nightly from aggregated free audits.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Trophy,
  TrendingUp,
  Search,
  BarChart3,
  Building2,
} from "lucide-react";

import { untypedTable } from "@/lib/supabase/untyped-table";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

/* ------------------------------------------------------------------ */
/* Metadata                                                            */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  title: "AI Employer Visibility Index | OpenRole",
  description:
    "The definitive ranking of UK employer visibility in AI. Which companies control their narrative — and which are invisible to the candidates asking about them?",
  openGraph: {
    title: "AI Employer Visibility Index | OpenRole",
    description:
      "The definitive ranking of UK employer visibility in AI. Which companies control their narrative — and which are invisible to the candidates asking about them?",
    type: "website",
  },
  alternates: {
    canonical: "https://openrole.co.uk/uk-index",
  },
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface IndexCompany {
  company_name: string;
  company_slug: string;
  company_domain: string;
  score: number;
  has_llms_txt: boolean;
  has_jsonld: boolean;
  has_salary_data: boolean;
  careers_page_status: string;
  robots_txt_status: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

async function getIndexData(): Promise<{
  companies: IndexCompany[];
  stats: {
    total: number;
    avgScore: number;
    pctNoLlmsTxt: number;
    pctNoJsonld: number;
    pctNoSalary: number;
    topScore: number;
    bottomScore: number;
    pctInfoGaps: number;
  };
}> {
  // Get all public audits, deduplicated by company (latest only)
  const { data: companies, error } = await untypedTable("public_audits")
    .select(
      "company_name, company_slug, company_domain, score, has_llms_txt, has_jsonld, has_salary_data, careers_page_status, robots_txt_status, updated_at"
    )
    .order("score", { ascending: false })
    .limit(500);

  if (error || !companies || companies.length === 0) {
    return {
      companies: [],
      stats: {
        total: 0,
        avgScore: 0,
        pctNoLlmsTxt: 0,
        pctNoJsonld: 0,
        pctNoSalary: 0,
        topScore: 0,
        bottomScore: 0,
        pctInfoGaps: 0,
      },
    };
  }

  // Deduplicate by domain (keep highest score)
  const seen = new Set<string>();
  const deduped: IndexCompany[] = [];
  for (const c of companies as IndexCompany[]) {
    if (!seen.has(c.company_domain)) {
      seen.add(c.company_domain);
      deduped.push(c);
    }
  }

  const scores = deduped.map((c) => c.score);
  const total = deduped.length;
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);
  const pctNoLlmsTxt = Math.round(
    (deduped.filter((c) => !c.has_llms_txt).length / total) * 100
  );
  const pctNoJsonld = Math.round(
    (deduped.filter((c) => !c.has_jsonld).length / total) * 100
  );
  const pctNoSalary = Math.round(
    (deduped.filter((c) => !c.has_salary_data).length / total) * 100
  );
  // Companies with gaps in salary, benefits (proxy: jsonld), or remote (proxy: careers_page_status)
  const pctInfoGaps = Math.round(
    (deduped.filter(
      (c) => !c.has_salary_data || !c.has_jsonld || c.careers_page_status !== "full"
    ).length / total) * 100
  );

  return {
    companies: deduped,
    stats: {
      total,
      avgScore,
      pctNoLlmsTxt,
      pctNoJsonld,
      pctNoSalary,
      topScore: scores[0] ?? 0,
      bottomScore: scores[scores.length - 1] ?? 0,
      pctInfoGaps,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 70) return "text-teal-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function rankMedal(rank: number): string | null {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
}

function checkCount(c: IndexCompany): number {
  let count = 0;
  if (c.has_salary_data) count++;
  if (c.has_jsonld) count++;
  if (c.careers_page_status === "full") count++;
  if (c.robots_txt_status === "allows") count++;
  if (c.has_jsonld && c.careers_page_status === "full") count++;
  return count;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

export default async function IndexPage() {
  const { companies, stats } = await getIndexData();

  const hasData = companies.length > 0;

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
              <Trophy className="h-6 w-6 text-brand-accent mt-0.5" />
              <p className="overline">AI Employer Index</p>
            </div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 tracking-tight max-w-2xl">
              Which employers are visible to AI — and which are invisible?
            </h1>
            <p className="mt-5 text-lg text-slate-500 max-w-2xl leading-relaxed">
              The definitive ranking of UK employer visibility in AI. Which
              companies control their narrative — and which are invisible to the
              candidates asking about them?
            </p>

            {/* Stats bar */}
            {hasData && (
              <div className="mt-8 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    <strong className="text-slate-900">{stats.total}</strong>{" "}
                    companies ranked
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    Average score:{" "}
                    <strong className="text-slate-900">
                      {stats.avgScore}/100
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    <strong className="text-slate-900">
                      {stats.pctInfoGaps}%
                    </strong>{" "}
                    have information gaps
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Headline insight banner ────────────────── */}
        {hasData && (
          <section className="border-b border-slate-200 bg-slate-900">
            <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-300">
                <span className="text-white font-semibold">
                  {stats.pctInfoGaps}%
                </span>{" "}
                of audited UK companies have information gaps in salary,
                benefits, or remote policy. When candidates ask AI, they get
                guesses instead of facts.
              </p>
              <Link
                href="/#audit"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-slate-300 transition-colors shrink-0"
              >
                Check your company
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* ── Rankings table ─────────────────────────── */}
        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
            {!hasData ? (
              /* Empty state — pre-launch */
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  The Index is building
                </h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Every free audit adds a company to the ranking. Be one of the
                  first to see where you stand.
                </p>
                <Link
                  href="/#audit"
                  className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                >
                  Run the first audit
                </Link>
              </div>
            ) : (
              <>
                {/* Top 3 podium */}
                {companies.length >= 3 && (
                  <div className="grid gap-4 md:grid-cols-3 mb-10">
                    {companies.slice(0, 3).map((company, i) => (
                      <Link
                        key={company.company_slug}
                        href={`/company/${company.company_slug}`}
                        className="group rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-card-hover hover:border-neutral-300 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">
                            {rankMedal(i + 1)}
                          </span>
                          <span
                            className={`text-2xl font-bold tabular-nums ${scoreColor(company.score)}`}
                          >
                            {company.score}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-accent transition-colors">
                          {company.company_name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {company.company_domain} · {checkCount(company)}/5
                          themes
                        </p>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Full table */}
                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[3rem_1fr_4rem] gap-2 px-4 py-3 border-b border-neutral-100 bg-slate-50/80 text-xs font-semibold text-slate-500 sm:grid-cols-[3rem_1fr_5rem_5rem_5rem_5rem_5rem_4rem] sm:px-5">
                    <span>#</span>
                    <span>Company</span>
                    <span className="text-center hidden sm:block">Salary</span>
                    <span className="text-center hidden sm:block">
                      Benefits
                    </span>
                    <span className="text-center hidden sm:block">Remote</span>
                    <span className="text-center hidden sm:block">
                      Culture
                    </span>
                    <span className="text-center hidden sm:block">Growth</span>
                    <span className="text-right">Score</span>
                  </div>

                  {/* Rows */}
                  {companies.map((company, i) => (
                    <Link
                      key={company.company_slug}
                      href={`/company/${company.company_slug}`}
                      className="grid grid-cols-[3rem_1fr_4rem] gap-2 px-4 py-3.5 border-b border-neutral-50 transition-colors items-center group hover:bg-slate-50/50 sm:grid-cols-[3rem_1fr_5rem_5rem_5rem_5rem_5rem_4rem] sm:px-5"
                    >
                      <span className="text-sm font-medium text-slate-400 tabular-nums">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-accent transition-colors">
                          {company.company_name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {company.company_domain}
                        </p>
                      </div>
                      {/* Salary — uses has_salary_data */}
                      <span className="text-center hidden sm:block">
                        {company.has_salary_data ? (
                          <span className="text-teal-500 text-sm">✓</span>
                        ) : (
                          <span className="text-red-400 text-sm">✗</span>
                        )}
                      </span>
                      {/* Benefits — proxy: has_jsonld */}
                      <span className="text-center hidden sm:block">
                        {company.has_jsonld ? (
                          <span className="text-teal-500 text-sm">✓</span>
                        ) : (
                          <span className="text-red-400 text-sm">✗</span>
                        )}
                      </span>
                      {/* Remote — proxy: careers_page_status === "full" */}
                      <span className="text-center hidden sm:block">
                        {company.careers_page_status === "full" ? (
                          <span className="text-teal-500 text-sm">✓</span>
                        ) : (
                          <span className="text-red-400 text-sm">✗</span>
                        )}
                      </span>
                      {/* Culture — proxy: robots_txt_status */}
                      <span className="text-center hidden sm:block">
                        {company.robots_txt_status === "allows" ? (
                          <span className="text-teal-500 text-sm">✓</span>
                        ) : (
                          <span className="text-red-400 text-sm">✗</span>
                        )}
                      </span>
                      {/* Growth — proxy: has_jsonld && careers_page_status */}
                      <span className="text-center hidden sm:block">
                        {company.has_jsonld &&
                        company.careers_page_status === "full" ? (
                          <span className="text-teal-500 text-sm">✓</span>
                        ) : (
                          <span className="text-red-400 text-sm">✗</span>
                        )}
                      </span>
                      <span
                        className={`text-right text-sm font-bold tabular-nums ${scoreColor(company.score)}`}
                      >
                        {company.score}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Table footer */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-400">
                    Rankings update from the latest audit data. Scores calculated
                    using the{" "}
                    <Link
                      href="/how-we-score"
                      className="underline hover:text-slate-600"
                    >
                      OpenRole 8-theme methodology
                    </Link>
                    .
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── Not listed CTA ─────────────────────────── */}
        <section className="py-12 lg:py-16 border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">
              Don&apos;t see your company?
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Run a free audit and join the UK Visibility Index. See what AI
              tells candidates about you — 30 seconds, no signup.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Audit your company
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
