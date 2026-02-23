/**
 * @module lib/email/templates/nurture-day7
 * Day 7 follow-up: Last touch — PDF briefing + founding member offer.
 * "Take this to your CFO."
 */

interface NurtureDay7Props {
  companyName: string;
  companySlug: string;
  score: number;
  recipientName?: string;
  baseUrl?: string;
}

export function renderNurtureDay7Email({
  companyName,
  companySlug,
  score,
  recipientName,
  baseUrl = "https://openrole.co.uk",
}: NurtureDay7Props): string {
  const greeting = recipientName ? `Hi ${recipientName}` : "Hi there";
  const pdfUrl = `${baseUrl}/api/pdf/briefing/${companySlug}`;
  const pricingUrl = `${baseUrl}/pricing`;
  const reportUrl = `${baseUrl}/company/${companySlug}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your ${companyName} AI briefing is ready</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">

          <tr>
            <td style="padding: 32px 32px 0;">
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">OpenRole</p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.6;">
                ${greeting},
              </p>
              <p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.6;">
                Last week you ran an AI audit on <strong>${companyName}</strong> (score: ${score}/100).
                We've packaged your results into a one-page executive briefing — designed to take straight to your CFO or leadership team.
              </p>

              <!-- PDF CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px; text-align: center; background: #f8fafc;">
                    <p style="margin: 0 0 4px; font-size: 32px;">📄</p>
                    <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: #0f172a;">AI Employer Brand Briefing</p>
                    <p style="margin: 0 0 16px; font-size: 13px; color: #64748b;">${companyName} · Score: ${score}/100 · 1 page</p>
                    <a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Download PDF briefing →</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.6;">
                <strong>What it includes:</strong>
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding: 4px 0; font-size: 14px; color: #334155;">✓ Your AI Visibility Score vs UK average</td></tr>
                <tr><td style="padding: 4px 0; font-size: 14px; color: #334155;">✓ Top information gaps candidates encounter</td></tr>
                <tr><td style="padding: 4px 0; font-size: 14px; color: #334155;">✓ Estimated cost of inaction (hiring impact)</td></tr>
                <tr><td style="padding: 4px 0; font-size: 14px; color: #334155;">✓ 3 quick wins you can implement this week</td></tr>
              </table>

              <!-- Founding offer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; border: 2px solid #0d9488; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 24px; background: #f0fdfa;">
                    <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #0d9488;">🚀 Founding Member Offer</p>
                    <p style="margin: 0 0 12px; font-size: 14px; color: #334155; line-height: 1.5;">
                      We're onboarding our first 10 customers at <strong>£99/month</strong> (locked for 12 months) —
                      that's the full Growth plan including content playbook, competitor benchmarking, and hallucination alerts.
                    </p>
                    <a href="${pricingUrl}?ref=founding" style="display: inline-block; padding: 10px 20px; background: #0d9488; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600;">Claim your founding spot →</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Or just <a href="${reportUrl}" style="color: #64748b; text-decoration: underline;">revisit your report</a> — it updates as AI models change.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                This is the last email in this sequence. No more follow-ups.
                <br /><br />
                <a href="${baseUrl}/unsubscribe?email={{email}}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
                &nbsp;·&nbsp;
                <a href="${baseUrl}/privacy" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a>
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
