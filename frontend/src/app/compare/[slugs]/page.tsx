/**
 * @module app/compare/[slugs]/page
 * Head-to-head AI Visibility comparison — /compare/monzo-vs-revolut
 *
 * SEO play: captures high-intent queries like "Monzo vs Revolut employer brand"
 * and creates shareable, data-rich comparison pages.
 *
 * Each comparison page is a potential viral asset when shared on LinkedIn/Twitter.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Building2,
  BarChart3,
  Scale,
} from "lucide-react";

import { untypedTable } from "@/lib/supabase/untyped-table";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { formatCompanyName } from "@/lib/utils/company-names";
import { generateDisplacementReport } from "@/lib/compare/displacement";
import { DisplacementPlaybook } from "@/components/compare/displacement-playbook";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface PageProps {
  params: Promise<{ slugs: string }>;
}

interface CompanyAudit {
  company_name: string;
  company_slug: string;
  company_domain: string;
  score: number;
  score_breakdown: {
    jsonld: number;
    robotsTxt: number;
    careersPage: number;
    brandReputation: number;
    salaryData: number;
    contentFormat: number;
    llmsTxt: number;
  };
  has_llms_txt: boolean;
  has_jsonld: boolean;
  has_salary_data: boolean;
  careers_page_status: string;
  robots_txt_status: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/* Data fetching                                                       */
/* ------------------------------------------------------------------ */

async function getCompany(slug: string): Promise<CompanyAudit | null> {
  const { data, error } = await untypedTable("public_audits")
    .select(
      "company_name, company_slug, company_domain, score, score_breakdown, has_llms_txt, has_jsonld, has_salary_data, careers_page_status, robots_txt_status, updated_at"
    )
    .eq("company_slug", slug)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as CompanyAudit;
}

function parseSlugs(slugs: string): [string, string] | null {
  const parts = slugs.split("-vs-");
  if (parts.length !== 2) return null;
  const [a, b] = parts;
  if (!a || !b || a === b) return null;
  return [a, b];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 70) return "text-teal-600";
  if (score >= 40) return "text-amber-600";
  return "text-red-600";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  if (score >= 20) return "Poor";
  return "Critical";
}

interface CheckItem {
  label: string;
  a: boolean;
  b: boolean;
}

function getChecks(a: CompanyAudit, b: CompanyAudit): CheckItem[] {
  return [
    { label: "Structured Data (JSON-LD)", a: !!a.has_jsonld, b: !!b.has_jsonld },
    { label: "Bot Access (robots.txt)", a: a.robots_txt_status === "allows", b: b.robots_txt_status === "allows" },
    { label: "Careers Page", a: a.careers_page_status === "full", b: b.careers_page_status === "full" },
    { label: "Salary Transparency", a: !!a.has_salary_data, b: !!b.has_salary_data },
    { label: "llms.txt File", a: !!a.has_llms_txt, b: !!b.has_llms_txt },
  ];
}

interface BreakdownItem {
  label: string;
  key: keyof CompanyAudit["score_breakdown"];
  maxScore: number;
}

const breakdownItems: BreakdownItem[] = [
  { label: "Structured Data", key: "jsonld", maxScore: 20 },
  { label: "Bot Access", key: "robotsTxt", maxScore: 15 },
  { label: "Careers Page", key: "careersPage", maxScore: 20 },
  { label: "Brand Reputation", key: "brandReputation", maxScore: 15 },
  { label: "Salary Data", key: "salaryData", maxScore: 15 },
  { label: "Content Format", key: "contentFormat", maxScore: 10 },
  { label: "llms.txt", key: "llmsTxt", maxScore: 5 },
];

/* ------------------------------------------------------------------ */
/* Dynamic metadata                                                    */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return { title: "Compare Companies | OpenRole" };

  const [slugA, slugB] = parsed;
  const [companyA, companyB] = await Promise.all([getCompany(slugA), getCompany(slugB)]);

  if (!companyA || !companyB) return { title: "Compare Companies | OpenRole" };

  const nameA = formatCompanyName(companyA.company_name, slugA);
  const nameB = formatCompanyName(companyB.company_name, slugB);

  const title = `${nameA} vs ${nameB} — AI Visibility Comparison`;
  const description = `${nameA} scores ${companyA.score}/100 vs ${nameB} at ${companyB.score}/100. Head-to-head AI employer visibility comparison.`;
  const pageUrl = `https://openrole.co.uk/compare/${slugs}`;

  return {
    title: `${title} | OpenRole`,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      siteName: "OpenRole",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

export default async function ComparisonPage({ params }: PageProps) {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) notFound();

  const [slugA, slugB] = parsed;
  const [companyA, companyB] = await Promise.all([getCompany(slugA), getCompany(slugB)]);

  if (!companyA || !companyB) notFound();

  const nameA = formatCompanyName(companyA.company_name, slugA);
  const nameB = formatCompanyName(companyB.company_name, slugB);
  const checks = getChecks(companyA, companyB);
  const winner = companyA.score > companyB.score ? "a" : companyA.score < companyB.score ? "b" : "tie";

  // Generate displacement report for both directions (A trying to beat B, and B trying to beat A)
  // Show the report for the losing company (how to catch up to the winner)
  let displacementReport = null;
  try {
    if (winner === "a") {
      // Company B is behind, show them how to beat A
      displacementReport = await generateDisplacementReport(slugB, slugA);
    } else if (winner === "b") {
      // Company A is behind, show them how to beat B
      displacementReport = await generateDisplacementReport(slugA, slugB);
    }
    // If tie, don't show displacement report (both are equal)
  } catch (error) {
    console.error("Failed to generate displacement report:", error);
    // Continue without displacement report if generation fails
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        {/* ── Hero ────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          <div className="relative mx-auto max-w-5xl px-6 py-16 lg:py-20">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="h-5 w-5 text-brand-accent" />
              <p className="text-sm font-semibold text-brand-accent uppercase tracking-wider">
                Head-to-Head Comparison
              </p>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              {nameA} vs {nameB}
            </h1>
            <p className="mt-3 text-lg text-slate-500 max-w-2xl">
              Which employer is more visible to AI? Side-by-side breakdown of
              AI visibility scores, checks, and areas for improvement.
            </p>
          </div>
        </section>

        {/* ── Score cards ─────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { company: companyA, name: nameA, slug: slugA, side: "a" as const },
              { company: companyB, name: nameB, slug: slugB, side: "b" as const },
            ].map(({ company, name, slug, side }) => (
              <Link
                key={slug}
                href={`/company/${slug}`}
                className={`group relative rounded-2xl border bg-white p-6 hover:shadow-card-hover transition-all duration-300 ${
                  winner === side
                    ? "border-teal-200 ring-2 ring-teal-100"
                    : "border-slate-200"
                }`}
              >
                {winner === side && (
                  <div className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-white">
                    <Trophy className="h-3 w-3" />
                    Higher score
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {name}
                    </h2>
                    <p className="text-sm text-slate-400">{company.company_domain}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-4xl font-bold tabular-nums ${scoreColor(company.score)}`}
                    >
                      {company.score}
                    </span>
                    <span className="text-lg text-slate-400">/100</span>
                    <p className={`text-sm font-medium ${scoreColor(company.score)}`}>
                      {scoreLabel(company.score)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Score breakdown comparison ──────────── */}
        <section className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Score Breakdown
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_5rem_5rem] sm:grid-cols-[1fr_6rem_auto_6rem] gap-2 px-5 py-3 border-b border-neutral-100 bg-slate-50/80 text-xs font-semibold text-slate-500">
              <span>Category</span>
              <span className="text-center">{nameA.split(" ")[0]}</span>
              <span className="hidden sm:block text-center" />
              <span className="text-center">{nameB.split(" ")[0]}</span>
            </div>

            {/* Rows */}
            {breakdownItems.map((item) => {
              const aScore = (companyA.score_breakdown?.[item.key] as number) ?? 0;
              const bScore = (companyB.score_breakdown?.[item.key] as number) ?? 0;
              const aWins = aScore > bScore;
              const bWins = bScore > aScore;
              const tie = aScore === bScore;

              return (
                <div
                  key={item.key}
                  className="grid grid-cols-[1fr_5rem_5rem] sm:grid-cols-[1fr_6rem_auto_6rem] gap-2 px-5 py-3 border-b border-neutral-50 items-center"
                >
                  <div>
                    <span className="text-sm font-medium text-slate-900">{item.label}</span>
                    <span className="text-xs text-slate-400 ml-2">/{item.maxScore}</span>
                  </div>
                  <span
                    className={`text-center text-sm font-bold tabular-nums ${
                      aWins ? "text-teal-600" : tie ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    {aScore}
                  </span>
                  {/* Visual bar comparison (desktop) */}
                  <div className="hidden sm:flex items-center gap-1">
                    <div className="flex-1 flex justify-end">
                      <div
                        className={`h-2 rounded-full transition-all ${aWins ? "bg-teal-400" : "bg-slate-200"}`}
                        style={{ width: `${(aScore / item.maxScore) * 100}%` }}
                      />
                    </div>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <div className="flex-1">
                      <div
                        className={`h-2 rounded-full transition-all ${bWins ? "bg-teal-400" : "bg-slate-200"}`}
                        style={{ width: `${(bScore / item.maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-center text-sm font-bold tabular-nums ${
                      bWins ? "text-teal-600" : tie ? "text-slate-600" : "text-slate-400"
                    }`}
                  >
                    {bScore}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Checks comparison ──────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-14">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            AI Readiness Checks
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="grid grid-cols-[1fr_5rem_5rem] gap-2 px-5 py-3 border-b border-neutral-100 bg-slate-50/80 text-xs font-semibold text-slate-500">
              <span>Check</span>
              <span className="text-center">{nameA.split(" ")[0]}</span>
              <span className="text-center">{nameB.split(" ")[0]}</span>
            </div>
            {checks.map((check) => (
              <div
                key={check.label}
                className="grid grid-cols-[1fr_5rem_5rem] gap-2 px-5 py-3 border-b border-neutral-50 items-center"
              >
                <span className="text-sm font-medium text-slate-700">
                  {check.label}
                </span>
                <span className="text-center">
                  {check.a ? (
                    <CheckCircle2 className="h-5 w-5 text-teal-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                  )}
                </span>
                <span className="text-center">
                  {check.b ? (
                    <CheckCircle2 className="h-5 w-5 text-teal-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Verdict ────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-14">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-brand-accent" />
              <h2 className="text-xl font-bold text-slate-900">The Verdict</h2>
            </div>
            {winner === "tie" ? (
              <p className="text-slate-600">
                <strong className="text-slate-900">{nameA}</strong> and{" "}
                <strong className="text-slate-900">{nameB}</strong> are tied at{" "}
                <strong>{companyA.score}/100</strong>. Both companies have similar
                AI visibility — the question is who improves first.
              </p>
            ) : (
              <p className="text-slate-600">
                <strong className="text-slate-900">
                  {winner === "a" ? nameA : nameB}
                </strong>{" "}
                leads with{" "}
                <strong>
                  {winner === "a" ? companyA.score : companyB.score}/100
                </strong>{" "}
                vs{" "}
                <strong>
                  {winner === "a" ? companyB.score : companyA.score}/100
                </strong>
                . That&apos;s a{" "}
                <strong>
                  {Math.abs(companyA.score - companyB.score)} point
                </strong>{" "}
                advantage in AI visibility. When candidates ask AI about both
                companies, {winner === "a" ? nameA : nameB} gets more accurate, more complete
                answers — giving them an edge in talent attraction.
              </p>
            )}
          </div>
        </section>

        {/* ── Displacement Playbook ──────────────── */}
        {displacementReport && displacementReport.opportunities.length > 0 && (
          <DisplacementPlaybook
            opportunities={displacementReport.opportunities}
            quickWins={displacementReport.quickWins}
            isFreeTier={true}
            companyName={displacementReport.company.name}
            competitorName={displacementReport.competitor.name}
          />
        )}

        {/* ── CTAs ───────────────────────────────── */}
        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Compare other companies */}
              <div className="rounded-2xl border border-slate-200 p-6 text-center">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Compare other companies
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  See how any two UK employers stack up on AI visibility
                </p>
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  Browse comparisons
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Audit your company */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-teal-400" />
                  <h3 className="text-lg font-bold text-white">
                    Audit your company
                  </h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Free AI visibility score — 30 seconds, no signup
                </p>
                <Link
                  href="/#audit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-400 transition-colors"
                >
                  Run your audit
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── View individual reports ────────────── */}
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <div className="flex items-center justify-center gap-4 text-sm">
            <Link
              href={`/company/${slugA}`}
              className="text-slate-500 hover:text-slate-700 underline transition-colors"
            >
              View {nameA} full report →
            </Link>
            <span className="text-slate-300">·</span>
            <Link
              href={`/company/${slugB}`}
              className="text-slate-500 hover:text-slate-700 underline transition-colors"
            >
              View {nameB} full report →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
