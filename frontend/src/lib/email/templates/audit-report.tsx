/**
 * @module lib/email/templates/audit-report
 * HTML email template for the AI employer brand audit report.
 */

interface AuditFinding {
  label: string;
  status: "pass" | "warn" | "fail";
  detail?: string;
}

interface AuditReportEmailProps {
  companyName: string;
  companySlug: string;
  score: number;
  findings?: AuditFinding[];
  recommendations?: string[];
  baseUrl?: string;
}

function getScoreColor(score: number): string {
  if (score > 60) return "#059669"; // green
  if (score > 30) return "#d97706"; // amber
  return "#dc2626"; // red
}

function getScoreLabel(score: number): string {
  if (score > 60) return "Strong";
  if (score > 30) return "Needs Work";
  return "Critical";
}

function getFindingIcon(status: "pass" | "warn" | "fail"): string {
  if (status === "pass") return "✅";
  if (status === "warn") return "⚠️";
  return "❌";
}

const DEFAULT_FINDINGS: AuditFinding[] = [
  { label: "Structured Data", status: "warn", detail: "Partial schema markup detected" },
  { label: "Content Accessibility", status: "pass", detail: "AI crawlers can access key pages" },
  { label: "Careers Page", status: "warn", detail: "Limited salary transparency" },
  { label: "Brand Reputation", status: "fail", detail: "Inconsistent data across AI models" },
  { label: "Salary Transparency", status: "fail", detail: "No verified salary ranges found" },
];

const DEFAULT_RECOMMENDATIONS = [
  "Add structured employer data (JSON-LD) to your careers page",
  "Publish verified salary ranges to maximize accuracy",
  "Claim your OpenRole profile to provide AI with your verified data",
];

/**
 * Generates the HTML string for the audit report email.
 */
export function renderAuditReportEmail({
  companyName,
  companySlug,
  score,
  findings = DEFAULT_FINDINGS,
  recommendations = DEFAULT_RECOMMENDATIONS,
  baseUrl = "https://openrole.co.uk",
}: AuditReportEmailProps): string {
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const reportUrl = `${baseUrl}/company/${companySlug}`;
  const fixUrl = `${baseUrl}/fix/${companySlug}`;

  const findingsHtml = findings
    .map(
      (f) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px;">
            ${getFindingIcon(f.status)}&nbsp;&nbsp;${f.label}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #64748b; text-align: right;">
            ${f.detail ?? ""}
          </td>
        </tr>`
    )
    .join("");

  const recommendationsHtml = recommendations
    .slice(0, 3)
    .map(
      (r, i) => `
        <tr>
          <td style="padding: 10px 0; font-size: 14px; color: #334155;">
            <span style="display: inline-block; width: 24px; height: 24px; border-radius: 12px; background: #f1f5f9; color: #475569; text-align: center; line-height: 24px; font-weight: 600; font-size: 12px; margin-right: 10px;">${i + 1}</span>
            ${r}
          </td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your AI Employer Brand Audit — ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: #0f172a;">
              <p style="margin: 0; font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">OpenRole</p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">AI Employer Brand Audit</p>
            </td>
          </tr>

          <!-- Score -->
          <tr>
            <td style="padding: 32px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Your AI Visibility Score</p>
              <p style="margin: 0; font-size: 56px; font-weight: 800; color: ${scoreColor}; line-height: 1;">${score}</p>
              <p style="margin: 8px 0 0; font-size: 13px; font-weight: 600; color: ${scoreColor};">${scoreLabel}</p>
              <p style="margin: 16px 0 0; font-size: 16px; font-weight: 700; color: #0f172a;">${companyName}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;" />
            </td>
          </tr>

          <!-- Findings -->
          <tr>
            <td style="padding: 24px 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #0f172a;">Summary of Findings</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${findingsHtml}
              </table>
            </td>
          </tr>

          <!-- Recommendations -->
          <tr>
            <td style="padding: 8px 32px 24px;">
              <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #0f172a;">Top Recommendations</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${recommendationsHtml}
              </table>
            </td>
          </tr>

          <!-- CTAs -->
          <tr>
            <td style="padding: 8px 32px 32px; text-align: center;">
              <a href="${reportUrl}" style="display: inline-block; padding: 14px 28px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; margin-bottom: 12px;">See your full report →</a>
              <br /><br />
              <a href="${fixUrl}" style="display: inline-block; padding: 12px 24px; background: #ffffff; color: #0f172a; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 600; border: 1px solid #e2e8f0;">Fix your employer brand</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                You received this because your email was submitted for an AI audit on OpenRole.
                <br />
                <a href="${baseUrl}/unsubscribe?email={{email}}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="${baseUrl}/privacy" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a>
              </p>
              <p style="margin: 12px 0 0; font-size: 11px; color: #cbd5e1; text-align: center;">
                © ${new Date().getFullYear()} OpenRole · London, UK
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
