/**
 * @module lib/audit/public-audit-store
 * Stores audit results for public /company/[slug] pages.
 *
 * Every free audit upserts a row in `public_audits`. If the company
 * has been audited before, the row is updated with the latest results
 * and the audit_count is incremented.
 */

import type { WebsiteCheckResult } from "@/lib/audit/website-checks";
import { untypedTable, untypedRpc } from "@/lib/supabase/untyped-table";

/**
 * Create or update the public audit page for a company.
 * Called after every successful free audit.
 */
export async function upsertPublicAudit(result: WebsiteCheckResult): Promise<void> {
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
}

/**
 * Get the public page URL for a company slug.
 */
export function getPublicAuditUrl(slug: string): string {
  return `/company/${slug}`;
}
