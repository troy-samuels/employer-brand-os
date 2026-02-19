/**
 * @module lib/audit/audit-persistence
 * Persists audit results to Supabase after a successful audit.
 *
 * Two tables are written:
 *   1. `audit_website_checks` — raw historical record of every audit run.
 *   2. `public_audits` — deduplicated by company_slug for the /company/[slug] page.
 *
 * All writes are fire-and-forget: failures are logged but never surface
 * to the end user.
 */

import type { WebsiteCheckResult } from "@/lib/audit/website-checks";
import { upsertPublicAudit } from "@/lib/audit/public-audit-store";
import { untypedTable } from "@/lib/supabase/untyped-table";
import { createHash } from "node:crypto";

/**
 * Hash an IP address for privacy-safe storage.
 * Uses SHA-256 with a static salt — enough to detect repeat visitors
 * without storing raw IPs.
 */
function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`rankwell-audit:${ip}`)
    .digest("hex")
    .slice(0, 16);
}

/**
 * Insert a raw audit record into `audit_website_checks`.
 * @param result - The completed audit result.
 * @param clientIpHash - Hashed client IP for rate/abuse tracking.
 */
async function insertWebsiteCheck(
  result: WebsiteCheckResult,
  clientIpHash: string,
): Promise<void> {
  const { error } = await untypedTable("audit_website_checks").insert({
    company_name: result.companyName,
    company_slug: result.companySlug,
    website_url: result.domain ? `https://${result.domain}` : null,
    has_llms_txt: result.hasLlmsTxt,
    llms_txt_has_employment: result.llmsTxtHasEmployment,
    has_jsonld: result.hasJsonld,
    jsonld_schemas_found: result.jsonldSchemasFound,
    has_salary_data: result.hasSalaryData,
    careers_page_crawlable: result.careersPageStatus,
    careers_page_url: result.careersPageUrl,
    robots_txt_ai_policy: result.robotsTxtStatus,
    robots_txt_blocked_bots: result.robotsTxtBlockedBots,
    ai_readiness_score: result.score,
    source_ip_hash: clientIpHash,
  });

  if (error) {
    console.error("[audit-persistence] audit_website_checks insert failed:", error.message);
  }
}

/**
 * Persist a completed audit result to Supabase.
 *
 * This function is designed to be called with `void persistAuditResult(…)`
 * so it runs fire-and-forget without blocking the API response.
 *
 * @param result - The completed website check result.
 * @param clientIp - Raw client IP (will be hashed before storage).
 */
export async function persistAuditResult(
  result: WebsiteCheckResult,
  clientIp: string,
): Promise<void> {
  const ipHash = hashIp(clientIp);

  try {
    await Promise.all([
      insertWebsiteCheck(result, ipHash),
      upsertPublicAudit(result),
    ]);
  } catch (error) {
    // Catch-all so fire-and-forget never throws unhandled rejections
    console.error("[audit-persistence] Unexpected error:", error);
  }
}
