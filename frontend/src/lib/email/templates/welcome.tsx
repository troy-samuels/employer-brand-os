/**
 * @module lib/email/templates/welcome
 * HTML email template for the post-signup / post-checkout welcome email.
 */

interface WelcomeEmailProps {
  companyName?: string;
  baseUrl?: string;
}

/**
 * Generates the HTML string for the welcome email.
 */
export function renderWelcomeEmail({
  companyName,
  baseUrl = "https://openrole.co.uk",
}: WelcomeEmailProps = {}): string {
  const dashboardUrl = `${baseUrl}/dashboard`;
  const greeting = companyName
    ? `Welcome to OpenRole, ${companyName}!`
    : "Welcome to OpenRole!";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to OpenRole</title>
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
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 16px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">${greeting}</h1>
              <p style="margin: 16px 0 0; font-size: 14px; color: #475569; line-height: 1.6;">
                You&rsquo;re now set up to influence what AI says about your company. Here&rsquo;s how to get started:
              </p>
            </td>
          </tr>

          <!-- Steps -->
          <tr>
            <td style="padding: 8px 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Step 1 -->
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <span style="display: inline-block; width: 28px; height: 28px; border-radius: 14px; background: #0f172a; color: #ffffff; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">1</span>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a;">Run your AI audit</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">See exactly what ChatGPT, Claude, and Perplexity say about you right now.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Step 2 -->
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <span style="display: inline-block; width: 28px; height: 28px; border-radius: 14px; background: #0f172a; color: #ffffff; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">2</span>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a;">Add your verified facts</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">Upload salary ranges, benefits, and culture data. We push this to AI models automatically.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Step 3 -->
                <tr>
                  <td style="padding: 16px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 36px; vertical-align: top;">
                          <span style="display: inline-block; width: 28px; height: 28px; border-radius: 14px; background: #0f172a; color: #ffffff; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">3</span>
                        </td>
                        <td style="vertical-align: top;">
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a;">Install the OpenRole Pixel</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #64748b; line-height: 1.5;">One script tag on your careers page. It keeps AI models up to date every time you post a job.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 8px 32px 32px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">Go to your dashboard →</a>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0; font-size: 13px; color: #64748b; text-align: center; line-height: 1.6;">
                Need help? Reply to this email or reach us at
                <a href="mailto:hello@openrole.co.uk" style="color: #0f172a; font-weight: 500;">hello@openrole.co.uk</a>
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
              <p style="margin: 12px 0 0; font-size: 11px; color: #cbd5e1; text-align: center;">
                &copy; ${new Date().getFullYear()} OpenRole &middot; London, UK
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
