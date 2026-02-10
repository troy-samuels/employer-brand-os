/**
 * @module lib/audit/public-audit-store
 * Stores audit results for public /company/[slug] pages.
 *
 * Every free audit upserts a row in `public_audits`. If the company
 * has been audited before, the row is updated with the latest results
 * and the audit_count is incremented.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { WebsiteCheckResult } from "@/lib/audit/website-checks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- table not in generated types until migration runs
const db = supabaseAdmin as any;

/**
 * Create or update the public audit page for a company.
 * Called after every successful free audit.
 */
export async function upsertPublicAudit(result: WebsiteCheckResult): Promise<void> {
  const { error } = await db
    .from("public_audits")
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
      }
    )
    .select()
    .single();

  if (error) {
    console.error("[public-audit-store] Upsert failed:", error.message);
    return;
  }

  // Increment audit count separately (upsert doesn't support incrementing)
  await db.rpc("increment_audit_count", {
    slug: result.companySlug,
  }).then(({ error: rpcError }: { error: { message: string } | null }) => {
    if (rpcError) {
      // Not critical — the page still works without an accurate count
      console.warn("[public-audit-store] Could not increment audit_count:", rpcError.message);
    }
  });
}

/**
 * Get the public page URL for a company slug.
 */
export function getPublicAuditUrl(slug: string): string {
  return `/company/${slug}`;
}
