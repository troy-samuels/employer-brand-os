/**
 * @module lib/email/templates/nurture-day3
 * Day 3 follow-up: Social proof + competitor framing.
 * "Your competitors are already doing this."
 */

interface NurtureDay3Props {
  companyName: string;
  companySlug: string;
  score: number;
  industryAvg: number;
  topCompetitorName?: string;
  topCompetitorScore?: number;
  recipientName?: string;
  baseUrl?: string;
}

function getScoreColor(score: number): string {
  if (score > 60) return "#059669";
  if (score > 30) return "#d97706";
  return "#dc2626";
}

export function renderNurtureDay3Email({
  companyName,
  companySlug,
  score,
  industryAvg,
  topCompetitorName,
  topCompetitorScore,
  recipientName,
  baseUrl = "https://openrole.co.uk",
}: NurtureDay3Props): string {
  const scoreColor = getScoreColor(score);
  const greeting = recipientName ? `Hi ${recipientName}` : "Hi there";
  const pricingUrl = `${baseUrl}/pricing`;
  const indexUrl = `${baseUrl}/uk-index`;
  const gap = industryAvg - score;
  const isBelow = gap > 0;

  const competitorLine =
    topCompetitorName && topCompetitorScore
      ? `<p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.6;">
          For example, <strong>${topCompetitorName}</strong> scores <strong style="color: #059669;">${topCompetitorScore}/100</strong>.
          That means when a candidate asks AI to compare you, ${topCompetitorName} looks significantly better.
        </p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>How ${companyName} compares to your industry</title>
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
                We've now audited over 100 UK employers. Here's how <strong>${companyName}</strong> compares:
              </p>

              <!-- Comparison -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px; background: #f8fafc; font-size: 13px; color: #64748b; font-weight: 600;">
                    ${companyName}
                  </td>
                  <td style="padding: 16px 20px; background: #f8fafc; text-align: right; font-size: 20px; font-weight: 700; color: ${scoreColor};">
                    ${score}/100
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px; font-size: 13px; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0;">
                    UK Industry Average
                  </td>
                  <td style="padding: 16px 20px; text-align: right; font-size: 20px; font-weight: 700; color: #0f172a; border-top: 1px solid #e2e8f0;">
                    ${industryAvg}/100
                  </td>
                </tr>
              </table>

              ${
                isBelow
                  ? `<p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.6;">
                  You're <strong style="color: #dc2626;">${gap} points below</strong> the average.
                  That's not just a vanity metric — it means AI is actively sending candidates to better-represented employers.
                </p>`
                  : `<p style="margin: 0 0 16px; font-size: 15px; color: #334155; line-height: 1.6;">
                  You're above average — but the top performers are scoring 70+. There's still a gap to close.
                </p>`
              }

              ${competitorLine}

              <p style="margin: 16px 0 24px; font-size: 15px; color: #334155; line-height: 1.6;">
                Companies that actively manage their AI presence see <strong>2-3x more qualified inbound applicants</strong> within 90 days.
                The ones ignoring it are losing candidates they never even knew existed.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${pricingUrl}" style="display: inline-block; padding: 14px 28px; background: #0d9488; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Start fixing your AI presence →</a>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 12px;">
                    <a href="${indexUrl}" style="font-size: 13px; color: #64748b; text-decoration: underline;">See the full UK Visibility Index</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

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
