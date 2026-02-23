/**
 * @module lib/audit/shared
 * Shared audit utilities — scoring logic, check building, colour helpers.
 * Used by both the company page and the PDF briefing generator.
 */

import { untypedTable } from "@/lib/supabase/untyped-table";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface StoredAuditResult {
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

export type CheckStatus = "pass" | "partial" | "fail";

export interface CheckItem {
  name: string;
  status: CheckStatus;
  points: number;
  maxPoints: number;
  description: string;
}

/* ------------------------------------------------------------------ */
/* Data fetching                                                       */
/* ------------------------------------------------------------------ */

export async function getCompanyAudit(
  slug: string
): Promise<StoredAuditResult | null> {
  const { data, error } = await untypedTable("public_audits")
    .select("*")
    .eq("company_slug", slug)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as StoredAuditResult;
}

export async function getIndustryAvg(): Promise<number> {
  try {
    const { data } = await untypedTable("public_audits")
      .select("score")
      .gt("score", 0)
      .limit(500);
    if (data && data.length > 0) {
      const sum = data.reduce(
        (acc: number, r: { score: number }) => acc + r.score,
        0
      );
      return Math.round(sum / data.length);
    }
  } catch {
    // fallback
  }
  return 35;
}

export async function getPercentile(score: number): Promise<number> {
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

/* ------------------------------------------------------------------ */
/* Score helpers                                                        */
/* ------------------------------------------------------------------ */

export function scoreColor(score: number): string {
  if (score >= 70) return "#059669"; // teal-600
  if (score >= 40) return "#d97706"; // amber-600
  return "#dc2626"; // red-600
}

export function scoreLabel(score: number): string {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Needs Work";
  return "Critical";
}

export function scoreMessage(score: number, name: string): string {
  if (score >= 70) {
    return `${name} has strong AI visibility. Most AI models can accurately describe this employer to candidates.`;
  }
  if (score >= 40) {
    return `${name} has partial AI visibility. Some information is available to AI, but there are gaps that could lead to inaccurate or incomplete answers.`;
  }
  return `${name} has low AI visibility. AI models are likely guessing or hallucinating when candidates ask about this employer.`;
}

/* ------------------------------------------------------------------ */
/* Check building                                                      */
/* ------------------------------------------------------------------ */

export function buildChecks(audit: StoredAuditResult): CheckItem[] {
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
      maxPoints: 10,
      description: audit.has_salary_data
        ? "Salary information is visible and machine-readable on job listings."
        : "No machine-readable salary data found — AI will guess or refuse to answer salary questions.",
    },
    {
      name: "Careers Page",
      status:
        audit.careers_page_status === "full"
          ? "pass"
          : audit.careers_page_status === "partial"
            ? "partial"
            : "fail",
      points: audit.score_breakdown.careersPage ?? 0,
      maxPoints: 20,
      description:
        audit.careers_page_status === "full"
          ? "A comprehensive careers page was found with sufficient content for AI."
          : audit.careers_page_status === "partial"
            ? "A careers page exists but has limited content for AI to work with."
            : "No careers page found — AI has very little employer brand information.",
    },
    {
      name: "Structured Data (JSON-LD)",
      status: audit.has_jsonld ? "pass" : "fail",
      points: audit.score_breakdown.jsonld ?? 0,
      maxPoints: 20,
      description: audit.has_jsonld
        ? "Machine-readable organisation data is present on the website."
        : "No JSON-LD schema markup found — AI has to guess basic company details.",
    },
    {
      name: "Brand Reputation & Presence",
      status:
        (audit.score_breakdown.brandReputation ?? 0) > 0 ? "pass" : "fail",
      points: audit.score_breakdown.brandReputation ?? 0,
      maxPoints: 15,
      description:
        (audit.score_breakdown.brandReputation ?? 0) > 0
          ? "Employer review and reputation data is available for AI to reference."
          : "No employer review data found online — AI has nothing to reference about your workplace.",
    },
    {
      name: "AI Crawler Access",
      status:
        audit.robots_txt_status === "allows"
          ? "pass"
          : audit.robots_txt_status === "partial"
            ? "partial"
            : "fail",
      points: audit.score_breakdown.robotsTxt ?? 0,
      maxPoints: 20,
      description:
        audit.robots_txt_status === "allows"
          ? "AI crawlers are allowed to read this website."
          : audit.robots_txt_status === "partial"
            ? "Some AI crawlers are blocked — not all models can see this site."
            : "AI crawlers are blocked or no robots.txt found — most AI models can't read this site.",
    },
    {
      name: "Content Format",
      status:
        contentFormatScore >= 7
          ? "pass"
          : contentFormatScore > 0
            ? "partial"
            : "fail",
      points: contentFormatScore,
      maxPoints: 15,
      description:
        contentFormatScore >= 7
          ? "Content uses structured formats AI prefers — FAQ patterns, semantic headings, and answer-first structure."
          : contentFormatScore > 0
            ? "Some content structure detected, but adding FAQ schema, tables, and better heading hierarchy would improve AI citation."
            : "No structured content format found — adding FAQ schema, semantic headings, and tables would help AI cite your content.",
    },
  ];
}
