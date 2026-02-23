/**
 * @module lib/email/templates/nurture-day1
 * Day 1 follow-up: "What AI actually gets wrong about {company}"
 * Sent 24 hours after initial audit. Data-specific, high-value.
 */

interface NurtureDay1Props {
  companyName: string;
  companySlug: string;
  score: number;
  topGaps: string[];
  recipientName?: string;
  baseUrl?: string;
}

function getScoreColor(score: number): string {
  if (score > 60) return "#059669";
  if (score > 30) return "#d97706";
  return "#dc2626";
}

function getScoreContext(score: number): string {
  if (score > 60) return "better than most UK employers";
  if (score > 30) return "typical for UK mid-market companies";
  return "in the bottom 25% of UK employers we've audited";
}

export function renderNurtureDay1Email({
  companyName,
  companySlug,
  score,
  topGaps,
  recipientName,
  baseUrl = "https://openrole.co.uk",
}: NurtureDay1Props): string {
  const scoreColor = getScoreColor(score);
  const scoreContext = getScoreContext(score);
  const greeting = recipientName ? `Hi ${recipientName}` : "Hi there";
  const reportUrl = `${baseUrl}/company/${companySlug}`;
  const pricingUrl = `${baseUrl}/pricing`;

  const gapsHtml = topGaps
    .slice(0, 3)
    .map(
      (gap) => `
      <tr>
        <td style="padding: 10px 16px; border-left: 3px solid ${scoreColor}; background: #fefce8; margin-bottom: 8px; font-size: 14px; color: #334155; line-height: 1.5;">
          ${gap}
        </td>
      </tr>
      <tr><td style="height: 8px;"></td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>What AI gets wrong about ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 0;">
              <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">OpenRole</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.6;">
                ${greeting},
              </p>
              <p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.6;">
                Yesterday you ran an AI audit on <strong>${companyName}</strong>. Your score was
                <strong style="color: ${scoreColor};">${score}/100</strong> — ${scoreContext}.
              </p>
              <p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.6;">
                But the score isn't the interesting part. Here's what AI <em>can't</em> answer about ${companyName}:
              </p>

              <!-- Gaps -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
                ${gapsHtml}
              </table>

              <p style="margin: 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
                When candidates ask ChatGPT or Perplexity these questions, they get guesses — often wrong ones.
                The companies filling these gaps are seeing measurable improvements in just 2 weeks.
              </p>

              <p style="margin: 16px 0 24px; font-size: 15px; color: #334155; line-height: 1.6;">
                <strong>One company published a single blog post and went from 0% to 11% AI visibility in 14 days.</strong>
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${reportUrl}" style="display: inline-block; padding: 14px 28px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">See your full report →</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                Want the content playbook that tells you exactly what to publish?
                <a href="${pricingUrl}" style="color: #0d9488; text-decoration: underline;">See plans from £149/month</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
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
