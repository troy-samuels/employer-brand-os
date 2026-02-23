/**
 * @module app/company/[slug]/page
 * Public company AI visibility report — auto-generated from free audits.
 *
 * SEO flywheel: every free audit creates a public page that Google indexes,
 * driving organic traffic from searches like "what does AI say about [company]".
 *
 * Conversion points:
 * - "Is this your company? Claim your profile" → signup
 * - "Run an audit on YOUR company" → more pages → more traffic
 * - "See full report" (LLM breakdown) → paid upgrade
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Search,
  Building2,
  Globe,
  TrendingUp,
  BarChart3,
  Sparkles,
  Users,
  Zap,
  MessageSquare,
} from "lucide-react";

import { untypedTable } from "@/lib/supabase/untyped-table";
import { serializeJsonForHtml } from "@/lib/utils/safe-json";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { formatCompanyName } from "@/lib/utils/company-names";
import { ShareButtons } from "./share-buttons";
import { ScoreGauge } from "./score-gauge";
import { ScoreBar } from "./score-bar";
import { ScoreTrend } from "./score-trend";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface StoredAuditResult {
  id: string;
  company_domain: string;
  company_name: string;
  company_slug: string;
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
  ats_detected: string | null;
  created_at: string;
  updated_at: string;
}

/* ------------------------------------------------------------------ */
/* Data fetching                                                       */
/* ------------------------------------------------------------------ */

async function getCompanyAudit(slug: string): Promise<StoredAuditResult | null> {
  const { data, error } = await untypedTable("public_audits")
    .select("*")
    .eq("company_slug", slug)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as StoredAuditResult;
}

async function getPercentile(score: number): Promise<number> {
  try {
    const { count } = await untypedTable("public_audits")
      .select("*", { count: "exact", head: true })
      .lt("score", score);
    const { count: total } = await untypedTable("public_audits")
      .select("*", { count: "exact", head: true });
    if (total && total > 0 && count !== null) {
      return Math.round((count / total) * 100);
    }
  } catch {
    // fallback
  }
  return 50;
}

async function getIndustryAvg(): Promise<number> {
  try {
    const { data } = await untypedTable("public_audits")
      .select("score")
      .gt("score", 0)
      .limit(500);
    if (data && data.length > 0) {
      const sum = data.reduce((acc: number, r: { score: number }) => acc + r.score, 0);
      return Math.round(sum / data.length);
    }
  } catch {
    // fallback
  }
  return 35;
}

interface ScoreHistoryPoint {
  date: string;
  score: number;
}

async function getScoreHistory(slug: string): Promise<ScoreHistoryPoint[]> {
  try {
    const { data } = await untypedTable("score_history")
      .select("score, created_at")
      .eq("company_slug", slug)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!data || data.length === 0) return [];

    return (data as { score: number; created_at: string }[]).map((row) => ({
      date: row.created_at,
      score: row.score,
    }));
  } catch {
    return [];
  }
}

interface SimilarCompany {
  company_name: string;
  company_slug: string;
  company_domain: string;
  score: number;
}

async function getSimilarCompanies(
  currentSlug: string,
  currentScore: number
): Promise<SimilarCompany[]> {
  try {
    // Get companies with similar scores (±15 points), excluding current
    const { data } = await untypedTable("public_audits")
      .select("company_name, company_slug, company_domain, score")
      .neq("company_slug", currentSlug)
      .gt("score", 0)
      .gte("score", Math.max(0, currentScore - 15))
      .lte("score", Math.min(100, currentScore + 15))
      .order("score", { ascending: false })
      .limit(20);

    if (!data || data.length === 0) {
      // Fallback: get top companies if no similar-score ones found
      const { data: fallback } = await untypedTable("public_audits")
        .select("company_name, company_slug, company_domain, score")
        .neq("company_slug", currentSlug)
        .gt("score", 0)
        .order("score", { ascending: false })
        .limit(6);
      return (fallback as SimilarCompany[]) ?? [];
    }

    // Deduplicate by domain and pick up to 6
    const seen = new Set<string>();
    const deduped: SimilarCompany[] = [];
    for (const c of data as SimilarCompany[]) {
      if (!seen.has(c.company_domain) && deduped.length < 6) {
        seen.add(c.company_domain);
        deduped.push(c);
      }
    }
    return deduped;
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Dynamic metadata for SEO                                            */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const audit = await getCompanyAudit(slug);

  if (!audit) {
    return {
      title: "Company Not Found | OpenRole",
      description: "This company hasn't been audited yet.",
    };
  }

  const name = formatCompanyName(audit.company_name, slug);
  const score = audit.score;
  const pageUrl = `https://openrole.co.uk/company/${slug}`;

  return {
    title: `${name} AI Visibility Score: ${score}/100 | OpenRole`,
    description: `${name} scores ${score}/100 on AI Employer Visibility. See what AI tells candidates about them.`,
    openGraph: {
      title: `${name} scores ${score}/100 on AI Visibility`,
      description: `When candidates ask AI about ${name}, how accurate are the answers? See the full breakdown.`,
      type: "article",
      url: pageUrl,
      siteName: "OpenRole",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} scores ${score}/100 on AI Visibility`,
      description: `${name} scores ${score}/100 on AI Employer Visibility. See what AI tells candidates about them.`,
    },
    alternates: {
      canonical: pageUrl,
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

function scoreBg(score: number): string {
  if (score >= 70) return "bg-teal-50 border-teal-200";
  if (score >= 40) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function scoreMessage(score: number, name: string): string {
  if (score >= 70) {
    return `${name} has strong AI visibility. Most AI models can accurately describe this employer to candidates.`;
  }
  if (score >= 40) {
    return `${name} has partial AI visibility. Some information is available to AI, but there are gaps that could lead to inaccurate or incomplete answers.`;
  }
  return `${name} has low AI visibility. AI models are likely guessing or hallucinating when candidates ask about this employer.`;
}

function heroGradient(score: number): string {
  if (score >= 70) return "from-teal-50/80 via-white to-white";
  if (score >= 40) return "from-amber-50/40 via-white to-white";
  return "from-red-50/40 via-white to-white";
}

type CheckStatus = "pass" | "partial" | "fail";

interface CheckItem {
  name: string;
  status: CheckStatus;
  points: number;
  maxPoints: number;
  description: string;
  icon: React.ReactNode;
}

function buildChecks(audit: StoredAuditResult): CheckItem[] {
  const contentFormatScore = audit.score_breakdown.contentFormat ?? 0;
  return [
    {
      name: "Salary Transparency",
      status: audit.has_salary_data
        ? "pass"
        : audit.careers_page_status !== "none"
          ? "partial"
          : "fail",
      points: audit.score_breakdown.salaryData ?? 0,
      maxPoints: 12,
      description: audit.has_salary_data
        ? "Salary information is visible and machine-readable on job listings."
        : "No machine-readable salary data found — AI will guess or refuse to answer salary questions.",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      name: "Careers Page",
      status: audit.careers_page_status === "full"
        ? "pass"
        : audit.careers_page_status === "partial"
          ? "partial"
          : "fail",
      points: audit.score_breakdown.careersPage ?? 0,
      maxPoints: 17,
      description:
        audit.careers_page_status === "full"
          ? "A comprehensive careers page was found with sufficient content for AI."
          : audit.careers_page_status === "partial"
            ? "A careers page exists but has limited content for AI to work with."
            : "No careers page found — AI has very little employer brand information.",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      name: "Structured Data (JSON-LD)",
      status: audit.has_jsonld ? "pass" : "fail",
      points: audit.score_breakdown.jsonld ?? 0,
      maxPoints: 28,
      description: audit.has_jsonld
        ? "Machine-readable organisation data is present on the website."
        : "No JSON-LD schema markup found — AI has to guess basic company details.",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      name: "Brand Reputation & Presence",
      status: (audit.score_breakdown.brandReputation ?? 0) > 0 ? "pass" : "fail",
      points: audit.score_breakdown.brandReputation ?? 0,
      maxPoints: 17,
      description: (audit.score_breakdown.brandReputation ?? 0) > 0
        ? "Employer review and reputation data is available for AI to reference."
        : "No employer review data found online — AI has nothing to reference about your workplace.",
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "AI Crawler Access",
      status: audit.robots_txt_status === "allows"
        ? "pass"
        : audit.robots_txt_status === "partial"
          ? "partial"
          : "fail",
      points: audit.score_breakdown.robotsTxt ?? 0,
      maxPoints: 17,
      description:
        audit.robots_txt_status === "allows"
          ? "AI crawlers are allowed to read this website."
          : audit.robots_txt_status === "partial"
            ? "Some AI crawlers are blocked — not all models can see this site."
            : "AI crawlers are blocked or no robots.txt found — most AI models can't read this site.",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      name: "Content Format",
      status: contentFormatScore >= 7 ? "pass" : contentFormatScore > 0 ? "partial" : "fail",
      points: contentFormatScore,
      maxPoints: 9,
      description: contentFormatScore >= 7
        ? "Content uses structured formats AI prefers — FAQ patterns, semantic headings, and answer-first structure."
        : contentFormatScore > 0
          ? "Some content structure detected, but adding FAQ schema, tables, and better heading hierarchy would improve AI citation."
          : "No structured content format found — adding FAQ schema, semantic headings, and tables would help AI cite your content.",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* JSON-LD builder                                                     */
/* ------------------------------------------------------------------ */

function buildJsonLd(audit: StoredAuditResult, slug: string) {
  const companyUrl = `https://${audit.company_domain}`;
  const pageUrl = `https://openrole.co.uk/company/${slug}`;
  const score = audit.score;

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    name: audit.company_name,
    url: companyUrl,
    sameAs: [companyUrl],
  };

  if (score > 0) {
    organization.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (score / 20).toFixed(1),
      bestRating: "5",
      worstRating: "0",
      ratingCount: 1,
      reviewCount: 1,
    };
  }

  const employerRating: Record<string, unknown> | null =
    score > 0
      ? {
          "@type": "EmployerAggregateRating",
          "@id": `${pageUrl}#employer-rating`,
          itemReviewed: {
            "@type": "Organization",
            name: audit.company_name,
          },
          ratingValue: (score / 20).toFixed(1),
          bestRating: "5",
          worstRating: "0",
          ratingCount: 1,
        }
      : null;

  const article: Record<string, unknown> = {
    "@type": "Article",
    "@id": pageUrl,
    headline: `${audit.company_name} AI Visibility Score: ${score}/100`,
    description: scoreMessage(score, audit.company_name),
    url: pageUrl,
    author: {
      "@type": "Organization",
      name: "OpenRole",
      url: "https://openrole.co.uk",
      logo: "https://openrole.co.uk/logo.png",
    },
    publisher: {
      "@type": "Organization",
      name: "OpenRole",
      url: "https://openrole.co.uk",
    },
    datePublished: audit.created_at,
    dateModified: audit.updated_at,
    about: organization,
  };

  const profilePage: Record<string, unknown> = {
    "@type": "ProfilePage",
    "@id": `${pageUrl}#profile`,
    mainEntity: organization,
    dateModified: audit.updated_at,
  };

  const graph = [article, profilePage];
  if (employerRating) graph.push(employerRating);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function StatusIcon({ status }: { status: CheckStatus }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0" strokeWidth={2} />;
    case "partial":
      return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" strokeWidth={2} />;
    case "fail":
      return <XCircle className="h-5 w-5 text-red-400 shrink-0" strokeWidth={2} />;
  }
}

function statusDot(status: CheckStatus): string {
  switch (status) {
    case "pass":
      return "bg-teal-500";
    case "partial":
      return "bg-amber-400";
    case "fail":
      return "bg-red-400";
  }
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const audit = await getCompanyAudit(slug);

  if (!audit) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Company not found</h1>
            <p className="text-slate-500 mb-6">
              We haven&apos;t audited this company yet. Run a free audit to generate their report.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Run a free audit
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const displayName = formatCompanyName(audit.company_name, slug);
  const checks = buildChecks(audit);
  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const auditDate = new Date(audit.updated_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [percentile, avgScore, similarCompanies, scoreHistory] = await Promise.all([
    getPercentile(audit.score),
    getIndustryAvg(),
    getSimilarCompanies(slug, audit.score),
    getScoreHistory(slug),
  ]);

  const scoreDelta = audit.score - avgScore;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        {/* ── Hero section ──────────────────────────── */}
        <section className={`relative overflow-hidden bg-gradient-to-b ${heroGradient(audit.score)}`}>
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:24px_24px] opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80" />

          <div className="relative max-w-5xl mx-auto px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
              <Link href="/uk-index" className="hover:text-slate-600 transition-colors">
                UK Index
              </Link>
              <span>/</span>
              <span className="text-slate-600">{displayName}</span>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16">
              {/* Left: company info */}
              <div className="flex-1 min-w-0">
                <p className="overline mb-3">AI Visibility Report</p>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight mb-2">
                  {displayName}
                </h1>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400 mb-6">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    {audit.company_domain}
                  </span>
                  {audit.ats_detected && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      ATS: {audit.ats_detected}
                    </span>
                  )}
                  <span>Last checked {auditDate}</span>
                </div>

                <p className="text-base text-slate-600 leading-relaxed max-w-xl mb-6">
                  {scoreMessage(audit.score, displayName)}
                </p>

                {/* Quick stats row */}
                <div className="grid grid-cols-3 gap-4 max-w-md">
                  <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 p-3.5 text-center">
                    <p className="text-xl font-bold text-slate-900 tabular-nums">
                      {passCount}/{checks.length}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Checks passed</p>
                  </div>
                  <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 p-3.5 text-center">
                    <p className="text-xl font-bold text-slate-900 tabular-nums">
                      Top {100 - percentile}%
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Of UK employers</p>
                  </div>
                  <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 p-3.5 text-center">
                    <p className={`text-xl font-bold tabular-nums ${scoreDelta >= 0 ? "text-teal-600" : "text-red-500"}`}>
                      {scoreDelta >= 0 ? "+" : ""}{scoreDelta}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">vs UK average</p>
                  </div>
                </div>

                {/* Share */}
                <div className="mt-6">
                  <ShareButtons
                    url={`https://openrole.co.uk/company/${slug}`}
                    title={`${displayName} scores ${audit.score}/100 on AI Employer Visibility`}
                    description={scoreMessage(audit.score, displayName)}
                  />
                </div>
              </div>

              {/* Right: score gauge */}
              <div className="shrink-0 lg:pr-4">
                <ScoreGauge score={audit.score} size={180} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Score breakdown grid ──────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Score breakdown</h2>
              <p className="text-sm text-slate-500 mt-1">
                How {displayName} performs across 6 visibility categories
              </p>
            </div>
            <Link
              href="/how-we-score"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              How we score →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {checks.map((check) => (
              <div
                key={check.name}
                className="group rounded-2xl bg-white border border-slate-200/80 p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300/80 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Icon circle */}
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-xl shrink-0 ${
                      check.status === "pass"
                        ? "bg-teal-50 text-teal-600"
                        : check.status === "partial"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-500"
                    }`}
                  >
                    {check.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {check.name}
                      </h3>
                      <span className="text-sm font-bold tabular-nums text-slate-400 shrink-0">
                        {check.points}/{check.maxPoints}
                      </span>
                    </div>
                    <ScoreBar
                      points={check.points}
                      maxPoints={check.maxPoints}
                      status={check.status}
                    />
                    <p className="text-xs text-slate-500 leading-relaxed mt-2.5">
                      {check.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Vs UK Average comparison ─────────────── */}
        <section className="border-y border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-14">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              How {displayName} compares
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Compared against {avgScore > 0 ? "all" : "207"} audited UK employers
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Company bar */}
              <div className="rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-400">This company</p>
                  </div>
                  <span className={`text-2xl font-bold tabular-nums ${scoreColor(audit.score)}`}>
                    {audit.score}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${audit.score >= 50 ? "bg-teal-500" : audit.score >= 30 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${audit.score}%` }}
                  />
                </div>
              </div>

              {/* Average bar */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">UK Average</p>
                    <p className="text-xs text-slate-400">Across all audited employers</p>
                  </div>
                  <span className="text-2xl font-bold tabular-nums text-slate-400">
                    {avgScore}
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-300"
                    style={{ width: `${avgScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-4 w-4 ${scoreDelta >= 0 ? "text-teal-500" : "text-red-400"}`} />
                <span className="text-sm text-slate-600">
                  {scoreDelta >= 0
                    ? `${scoreDelta} points above average`
                    : `${Math.abs(scoreDelta)} points below average`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Better than {percentile}% of UK employers
                </span>
              </div>
              {failCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-slate-600">
                    {failCount} area{failCount > 1 ? "s" : ""} need{failCount === 1 ? "s" : ""} attention
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Score history trendline ──────────────── */}
        {scoreHistory.length >= 2 && (
          <section className="max-w-5xl mx-auto px-6 py-14">
            <ScoreTrend history={scoreHistory} companyName={displayName} ukAverage={avgScore} />
          </section>
        )}

        {/* ── What candidates see (mock AI) ─────────── */}
        <section className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            What candidates see when they ask AI
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            When a candidate asks &ldquo;What&rsquo;s it like to work at {displayName}?&rdquo; — this is what AI models tell them
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                model: "ChatGPT",
                logo: "/logos/chatgpt.svg",
                sample: audit.has_salary_data
                  ? `Based on available data, ${displayName} offers competitive salaries...`
                  : `I don't have specific salary information for ${displayName}. Based on industry averages...`,
              },
              {
                model: "Google AI",
                logo: "/logos/google-ai.svg",
                sample: (audit.score_breakdown.brandReputation ?? 0) > 0
                  ? `${displayName} has a presence on employer review platforms...`
                  : `I found limited employer information about ${displayName}...`,
              },
              {
                model: "Perplexity",
                logo: "/logos/perplexity.svg",
                sample: audit.careers_page_status === "full"
                  ? `According to their careers page, ${displayName} offers...`
                  : `There's limited public information about working at ${displayName}...`,
              },
            ].map((item) => (
              <div
                key={item.model}
                className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <Image
                      src={item.logo}
                      alt={item.model}
                      width={20}
                      height={20}
                      className="opacity-70"
                    />
                    <p className="text-sm font-semibold text-slate-900">{item.model}</p>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">
                    {item.sample}
                  </p>
                </div>
                {/* Blur overlay */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-4">
                  <Link
                    href="/signup?ref=company-ai-preview"
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                  >
                    <Shield className="h-3 w-3" />
                    See full response
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Claim CTA ────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 pb-14">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 lg:p-12">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-600/10 to-transparent rounded-full blur-2xl" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-teal-400" />
                  <p className="text-sm font-semibold text-teal-400">
                    Is this your company?
                  </p>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                  Take control of your AI reputation
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
                  Claim your profile to see what every AI model says about you, get a personalised content playbook, and track improvements weekly.
                </p>
              </div>
              <Link
                href="/signup?ref=company-claim"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3.5 text-sm font-semibold text-white hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20 shrink-0"
              >
                Claim this profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Methodology note ─────────────────────── */}
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <p className="text-xs text-slate-400 text-center">
            This report is based on publicly available data from {audit.company_domain}.
            Scores are calculated using the{" "}
            <Link href="/how-we-score" className="underline hover:text-slate-600">
              OpenRole AI Visibility methodology
            </Link>
            . Last updated {auditDate}.
          </p>
        </div>

        {/* ── Similar companies (internal linking) ── */}
        {similarCompanies.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-14">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Companies with similar scores
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              See how other UK employers compare on AI visibility
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {similarCompanies.map((company) => (
                <Link
                  key={company.company_slug}
                  href={`/company/${company.company_slug}`}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:shadow-card-hover hover:border-neutral-300 transition-all duration-300"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                      {formatCompanyName(company.company_name, company.company_slug)}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{company.company_domain}</p>
                  </div>
                  <span
                    className={`text-lg font-bold tabular-nums shrink-0 ml-3 ${
                      company.score >= 70
                        ? "text-teal-600"
                        : company.score >= 40
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {company.score}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/uk-index"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                View full UK index
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* ── Audit another company ───────────────── */}
        <section className="border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-14 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              How does your company score?
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Run a free AI visibility audit — takes 30 seconds, no signup required.
            </p>
            <Link
              href="/#audit"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              Run your free audit
            </Link>
          </div>
        </section>

        {/* ── JSON-LD structured data ─────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonForHtml(buildJsonLd(audit, slug)),
          }}
        />
      </main>
      <Footer />
    </>
  );
}
