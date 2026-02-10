/**
 * @module lib/audit/audit-storage
 * Module implementation for audit-storage.ts.
 */

import type { AuditResult } from "@/types/audit";

/**
 * Executes saveAuditResult.
 * @param result - result input.
 * @returns The resulting value.
 */
export async function saveAuditResult(result: AuditResult) {
  return { ...result };
}
