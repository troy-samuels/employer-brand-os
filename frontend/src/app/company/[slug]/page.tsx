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
  ExternalLink,
  Search,
} from "lucide-react";

import { untypedTable } from "@/lib/supabase/untyped-table";

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

  const name = audit.company_name;
  const score = audit.score;

  return {
    title: `${name} AI Visibility Score: ${score}/100 | OpenRole`,
    description: `How well does AI represent ${name} to job seekers? ${name} scored ${score}/100 on the OpenRole AI Visibility audit. See the full breakdown.`,
    openGraph: {
      title: `${name} scores ${score}/100 on AI Visibility | OpenRole`,
      description: `When candidates ask AI about ${name}, how accurate are the answers? See the full report.`,
      type: "article",
    },
    alternates: {
      canonical: `https://openrole.co.uk/company/${slug}`,
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

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs work";
  if (score >= 20) return "Poor";
  return "Critical";
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

type CheckStatus = "pass" | "partial" | "fail";

interface CheckItem {
  name: string;
  status: CheckStatus;
  points: number;
  maxPoints: number;
  description: string;
}

function buildChecks(audit: StoredAuditResult): CheckItem[] {
  const contentFormatScore = audit.score_breakdown.contentFormat ?? 0;
  return [
    {
      name: "Structured Data (JSON-LD)",
      status: audit.has_jsonld ? "pass" : "fail",
      points: audit.score_breakdown.jsonld ?? 0,
      maxPoints: 28,
      description: audit.has_jsonld
        ? "Machine-readable organisation data is present on the website."
        : "No JSON-LD schema markup found — AI has to guess basic company details.",
    },
    {
      name: "AI Crawler Access (robots.txt)",
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
    },
    {
      name: "Brand Reputation & Presence",
      status: (audit.score_breakdown.brandReputation ?? 0) > 0 ? "pass" : "fail",
      points: audit.score_breakdown.brandReputation ?? 0,
      maxPoints: 17,
      description: (audit.score_breakdown.brandReputation ?? 0) > 0
        ? "Employer review and reputation data is available for AI to reference."
        : "No employer review data found online — AI has nothing to reference about your workplace.",
    },
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

  // Organization schema for the audited company
  const organization: Record<string, unknown> = {
    "@type": "Organization",
    name: audit.company_name,
    url: companyUrl,
    sameAs: [companyUrl],
  };

  // AggregateRating — maps our 0-100 audit score to a schema.org rating
  if (score > 0) {
    organization.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (score / 20).toFixed(1), // 0-100 → 0-5 scale
      bestRating: "5",
      worstRating: "0",
      ratingCount: 1,
      reviewCount: 1,
    };
  }

  // EmployerAggregateRating (schema.org extension for employer brand)
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

  // Article schema for the report page itself
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

  // ProfilePage wrapping the organization
  const profilePage: Record<string, unknown> = {
    "@type": "ProfilePage",
    "@id": `${pageUrl}#profile`,
    mainEntity: organization,
    dateModified: audit.updated_at,
  };

  // Compose the graph
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

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  const audit = await getCompanyAudit(slug);

  if (!audit) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Company not found
          </h1>
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
    );
  }

  const checks = buildChecks(audit);
  const passCount = checks.filter((c) => c.status === "pass").length;
  const auditDate = new Date(audit.updated_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ── Header bar ──────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-slate-900 tracking-tight">
            OpenRole
          </Link>
          <Link
            href="/#audit"
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            Audit your company
          </Link>
        </div>
      </div>

      {/* ── Score hero ──────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--neutral-200)_1px,_transparent_0)] [background-size:32px_32px] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
        <div className="relative max-w-3xl mx-auto px-6 py-14 lg:py-20">
          <p className="overline mb-3">AI Visibility Report</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-1">
            {audit.company_name}
          </h1>
          <p className="text-sm text-slate-400 mb-8">
            {audit.company_domain} · Last checked {auditDate}
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Score circle */}
            <div
              className={`flex items-center justify-center w-24 h-24 rounded-2xl border-2 ${scoreBg(audit.score)}`}
            >
              <div className="text-center">
                <span className={`text-3xl font-bold tabular-nums ${scoreColor(audit.score)}`}>
                  {audit.score}
                </span>
                <p className="text-xs text-slate-500">/100</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreBg(audit.score)} ${scoreColor(audit.score)}`}
                >
                  {scoreLabel(audit.score)}
                </span>
                <span className="text-xs text-slate-400">
                  {passCount}/{checks.length} checks passed
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed max-w-lg">
                {scoreMessage(audit.score, audit.company_name)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Checks breakdown ────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          What we checked
        </h2>

        <div className="space-y-4">
          {checks.map((check) => (
            <div
              key={check.name}
              className="rounded-xl bg-white border border-slate-200 p-5 hover:shadow-card transition-shadow duration-300"
            >
              <div className="flex items-start gap-3">
                <StatusIcon status={check.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3 className="text-[15px] font-semibold text-slate-900">
                      {check.name}
                    </h3>
                    <span className="text-sm font-semibold tabular-nums text-slate-400 shrink-0">
                      {check.points}/{check.maxPoints}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {check.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LLM teaser (locked) ─────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 pb-10">
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 lg:p-8">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-[15px] font-semibold text-white mb-1">
                What does AI actually say about {audit.company_name}?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We checked ChatGPT, Google AI, Perplexity, and 3 other models.
                Claim this profile to see what each one says — and fix what they get wrong.
              </p>
            </div>
          </div>

          {/* Blurred preview cards */}
          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            {[
              { name: "ChatGPT", logo: "/logos/chatgpt.svg" },
              { name: "Google AI", logo: "/logos/google-ai.svg" },
              { name: "Perplexity", logo: "/logos/perplexity.svg" },
            ].map((model) => (
              <div
                key={model.name}
                className="rounded-lg bg-slate-800 border border-slate-700 p-4 backdrop-blur"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src={model.logo}
                    alt={model.name}
                    width={16}
                    height={16}
                    className="brightness-0 invert opacity-70"
                  />
                  <p className="text-xs font-medium text-slate-300">{model.name}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full rounded bg-white/10" />
                  <div className="h-2.5 w-3/4 rounded bg-white/10" />
                  <div className="h-2.5 w-5/6 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/signup?ref=company-page"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Claim this profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Claim banner ────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 pb-10">
        <div className="rounded-xl bg-white border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-[15px] font-semibold text-slate-900 mb-1">
              Is this your company?
            </h3>
            <p className="text-sm text-slate-500">
              Claim your profile to update your information, install the OpenRole pixel,
              and control how AI represents your employer brand.
            </p>
          </div>
          <Link
            href={`/signup?ref=claim&company=${audit.company_slug}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shrink-0"
          >
            Claim profile
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Methodology link ────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 pb-10">
        <p className="text-xs text-slate-400 text-center">
          This report is based on publicly available data from {audit.company_domain}.
          Scores are calculated using the{" "}
          <Link href="/how-we-score" className="underline hover:text-slate-600">
            OpenRole AI Visibility methodology
          </Link>
          . Last updated {auditDate}.
        </p>
      </div>

      {/* ── Audit another company ───────────────────── */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
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
      </div>

      {/* ── JSON-LD structured data ──────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(audit, slug)),
        }}
      />
    </main>
  );
}
