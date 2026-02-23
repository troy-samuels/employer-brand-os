/**
 * @module lib/audit/report-generator
 * PDF report generation for audit results.
 *
 * This is a compatibility wrapper — the actual PDF generation now uses
 * @react-pdf/renderer via lib/pdf/generate-briefing.ts for a properly
 * branded executive briefing.
 *
 * The legacy generateAuditPDF function is maintained for any callers
 * that still use the old AuditResult type.
 */

import type { AuditResult } from "@/types/audit";
import { generateBriefingPDF } from "@/lib/pdf/generate-briefing";

/**
 * Generate a PDF audit report.
 *
 * If a company slug can be derived, this uses the new branded briefing PDF.
 * Falls back to a basic buffer for edge cases.
 */
export async function generateAuditPDF(auditResult: AuditResult) {
  // Try to generate the new branded briefing
  const slug = auditResult.company_domain
    .replace(/^www\./, "")
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  try {
    const result = await generateBriefingPDF(slug);
    if (result) {
      const base64 = result.buffer.toString("base64");
      return `data:application/pdf;base64,${base64}`;
    }
  } catch (err) {
    console.error("[report-generator] Branded PDF failed, using fallback:", err);
  }

  // Fallback: return a minimal data URL indicating no PDF available
  // This shouldn't happen in practice — the new system handles all cases
  const fallbackText = `OpenRole AI Visibility Report\n\nCompany: ${auditResult.company_name}\nDomain: ${auditResult.company_domain}\nOverall Score: ${auditResult.overall_score.toFixed(1)}\n\nVisit openrole.co.uk for the full report.`;
  const base64 = Buffer.from(fallbackText, "utf8").toString("base64");
  return `data:text/plain;base64,${base64}`;
}
