/**
 * @module lib/audit/public-audit-store
 * Stores audit results for public /company/[slug] pages.
 *
 * Every free audit upserts a row in `public_audits`. If the company
 * has been audited before, the row is updated with the latest results
 * and the audit_count is incremented.
 *
 * Also records a score snapshot in `score_history` for trendline tracking.
 */

import type { WebsiteCheckResult } from "@/lib/audit/website-checks";
import { untypedTable, untypedRpc } from "@/lib/supabase/untyped-table";

/**
 * Record a score snapshot in score_history for trendline tracking.
 * Uses upsert with the unique (company_slug, date) index to avoid
 * duplicate entries on the same day.
 */
async function recordScoreHistory(
  result: WebsiteCheckResult,
  previousScore: number | null,
): Promise<void> {
  // Insert score snapshot. The unique index on (company_slug, date) prevents
  // duplicates if the same company is audited multiple times on the same day.
  const { error } = await untypedTable("score_history")
    .insert({
      company_slug: result.companySlug,
      company_domain: result.domain,
      score: result.score,
      score_breakdown: result.scoreBreakdown,
      has_llms_txt: result.hasLlmsTxt,
      has_jsonld: result.hasJsonld,
      has_salary_data: result.hasSalaryData,
      careers_page_status: result.careersPageStatus,
      robots_txt_status: result.robotsTxtStatus,
      previous_score: previousScore,
      source: "audit",
      created_at: new Date().toISOString(),
    });

  if (error) {
    // Not critical — trendlines still work with existing data
    console.warn("[public-audit-store] score_history upsert failed:", error.message);
  }
}

/**
 * Create or update the public audit page for a company.
 * Called after every successful free audit.
 */
export async function upsertPublicAudit(result: WebsiteCheckResult): Promise<void> {
  // First, get the current score for change tracking
  let previousScore: number | null = null;
  try {
    const { data: existing } = await untypedTable("public_audits")
      .select("score")
      .eq("company_slug", result.companySlug)
      .single();
    if (existing) {
      previousScore = (existing as { score: number }).score;
    }
  } catch {
    // No existing record — this is a first audit
  }

  const { error } = await untypedTable("public_audits")
    .upsert(
      {
        company_domain: result.domain,
        company_name: result.companyName,
        company_slug: result.companySlug,
        score: result.score,
        score_breakdown: result.scoreBreakdown,
        has_llms_txt: result.hasLlmsTxt,
        has_jsonld: result.hasJsonld,
        has_salary_data: result.hasSalaryData,
        careers_page_status: result.careersPageStatus,
        robots_txt_status: result.robotsTxtStatus,
        ats_detected: result.atsDetected || null,
        ats_provider: result.atsProvider,
        ats_board_token: result.atsBoardToken,
        ats_job_count: result.atsJobCount,
        ats_analysis: result.atsAnalysis,
        ats_facts: result.atsGeneratedFacts,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "company_slug",
      },
    );

  if (error) {
    console.error("[public-audit-store] Upsert failed:", error.message);
    return;
  }

  // Increment audit count separately (upsert doesn't support incrementing)
  const { error: rpcError } = await untypedRpc("increment_audit_count", {
    slug: result.companySlug,
  });
  if (rpcError) {
    // Not critical — the page still works without an accurate count
    console.warn("[public-audit-store] Could not increment audit_count:", rpcError.message);
  }

  // Record score history for trendline tracking
  void recordScoreHistory(result, previousScore);
}

/**
 * Get the public page URL for a company slug.
 */
export function getPublicAuditUrl(slug: string): string {
  return `/company/${slug}`;
}
