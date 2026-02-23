/**
 * @module lib/email/send-audit-report
 * Sends the audit report email and logs the attempt.
 * Designed to be called fire-and-forget from the leads API route.
 */

import { sendEmail } from "@/lib/email/resend";
import { renderAuditReportEmail } from "@/lib/email/templates/audit-report";
import { untypedTable } from "@/lib/supabase/untyped-table";

interface SendAuditReportEmailOptions {
  email: string;
  companySlug: string;
  score: number;
  companyName?: string;
}

/**
 * Sends an audit report email and logs the result.
 * Safe to call with `void` — all errors are caught internally.
 */
export async function sendAuditReportEmail({
  email,
  companySlug,
  score,
  companyName,
}: SendAuditReportEmailOptions): Promise<void> {
  try {
    // Derive company name from slug if not provided
    const name =
      companyName ??
      companySlug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const html = renderAuditReportEmail({
      companyName: name,
      companySlug,
      score,
    });

    const result = await sendEmail({
      to: email,
      subject: `Your AI Employer Brand Audit — ${name} (Score: ${score}/100)`,
      html,
      tags: [
        { name: "type", value: "audit-report" },
        { name: "company", value: companySlug },
      ],
    });

    // Log the send attempt — don't throw if table doesn't exist
    try {
      await untypedTable("email_sends").insert({
        email,
        template: "audit-report",
        company_slug: companySlug,
        resend_id: result.id ?? null,
        success: result.success,
        error: result.error ?? null,
      });
    } catch (logError) {
      console.error(
        "[email/audit-report] Failed to log email send:",
        logError
      );
    }

    if (!result.success) {
      console.error(
        `[email/audit-report] Failed to send to ${email}:`,
        result.error
      );
    }
  } catch (err) {
    console.error("[email/audit-report] Unexpected error:", err);
  }
}
