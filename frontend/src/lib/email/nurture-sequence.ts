/**
 * @module lib/email/nurture-sequence
 * Post-audit email nurture sequence.
 *
 * Sequence:
 * - Day 0: Audit report (handled by send-audit-report.ts)
 * - Day 1: "What AI gets wrong about {company}" — information gaps
 * - Day 3: "How {company} compares" — social proof + competitor framing
 * - Day 7: PDF briefing + founding member offer — last touch
 *
 * Called by a cron job or edge function that queries audit_leads
 * and determines which nurture email to send based on created_at.
 */

import { sendEmail } from "@/lib/email/resend";
import { renderNurtureDay1Email } from "@/lib/email/templates/nurture-day1";
import { renderNurtureDay3Email } from "@/lib/email/templates/nurture-day3";
import { renderNurtureDay7Email } from "@/lib/email/templates/nurture-day7";
import { getCompanyAudit, getIndustryAvg, buildChecks } from "@/lib/audit/shared";

type NurtureStep = "day1" | "day3" | "day7";

interface NurtureTarget {
  email: string;
  companySlug: string;
  recipientName?: string;
  step: NurtureStep;
}

interface NurtureResult {
  email: string;
  step: NurtureStep;
  success: boolean;
  error?: string;
}

/**
 * Determine which gaps to highlight from audit data.
 */
function extractTopGaps(
  checks: Array<{ name: string; status: string; description: string }>
): string[] {
  return checks
    .filter((c) => c.status === "fail" || c.status === "partial")
    .slice(0, 3)
    .map((c) => `<strong>${c.name}:</strong> ${c.description}`);
}

/**
 * Send a single nurture email based on the step.
 */
export async function sendNurtureEmail(
  target: NurtureTarget
): Promise<NurtureResult> {
  try {
    const audit = await getCompanyAudit(target.companySlug);
    if (!audit) {
      return {
        email: target.email,
        step: target.step,
        success: false,
        error: "Company audit not found",
      };
    }

    const companyName = audit.company_name
      .split("-")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const score = audit.score ?? 0;

    let html: string;
    let subject: string;

    switch (target.step) {
      case "day1": {
        const checks = buildChecks(audit);
        const topGaps = extractTopGaps(checks);
        if (topGaps.length === 0) {
          topGaps.push(
            "<strong>Salary transparency:</strong> AI can't find verified salary ranges and is guessing.",
            "<strong>Remote work policy:</strong> No structured data about your flexible working arrangements.",
            "<strong>Interview process:</strong> Candidates get outdated or incorrect information about your hiring process."
          );
        }
        html = renderNurtureDay1Email({
          companyName,
          companySlug: target.companySlug,
          score,
          topGaps,
          recipientName: target.recipientName,
        });
        subject = `What AI actually gets wrong about ${companyName}`;
        break;
      }

      case "day3": {
        const industryAvg = await getIndustryAvg();
        html = renderNurtureDay3Email({
          companyName,
          companySlug: target.companySlug,
          score,
          industryAvg,
          recipientName: target.recipientName,
        });
        subject = `How ${companyName} compares to your industry`;
        break;
      }

      case "day7": {
        html = renderNurtureDay7Email({
          companyName,
          companySlug: target.companySlug,
          score,
          recipientName: target.recipientName,
        });
        subject = `Your ${companyName} AI briefing is ready — take it to leadership`;
        break;
      }
    }

    const result = await sendEmail({
      to: target.email,
      subject,
      html,
      tags: [
        { name: "type", value: `nurture-${target.step}` },
        { name: "company", value: target.companySlug },
      ],
    });

    return {
      email: target.email,
      step: target.step,
      success: result.success,
      error: result.error,
    };
  } catch (err) {
    return {
      email: target.email,
      step: target.step,
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Determine the nurture step based on days since audit.
 * Returns null if no email should be sent (already past sequence or wrong day).
 */
export function getNurtureStep(daysSinceAudit: number): NurtureStep | null {
  if (daysSinceAudit === 1) return "day1";
  if (daysSinceAudit === 3) return "day3";
  if (daysSinceAudit === 7) return "day7";
  return null;
}
