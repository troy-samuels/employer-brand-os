/**
 * @module lib/monitor/monitor-email
 * Generates HTML email content for the weekly AI Reputation Monitor digest.
 * Uses inline styles only (email-safe, no external CSS).
 */

import type {
  MonitorCheckResult,
  MonitorChange,
  MonitorRecommendation,
  TrendDirection,
} from "./reputation-monitor";

// ---------------------------------------------------------------------------
// Palette (inline-safe tokens)
// ---------------------------------------------------------------------------

const COLOR = {
  bg: "#fafafa",
  card: "#ffffff",
  border: "#e5e5e5",
  text: "#171717",
  muted: "#737373",
  accent: "#6366f1",
  accentLight: "#eef2ff",
  green: "#16a34a",
  greenLight: "#f0fdf4",
  red: "#dc2626",
  redLight: "#fef2f2",
  yellow: "#ca8a04",
  yellowLight: "#fefce8",
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the display label and colour for a trend direction.
 * @param trend - The trend direction.
 * @returns An object with `label` and `color` strings.
 */
function trendMeta(trend: TrendDirection): { label: string; color: string } {
  switch (trend) {
    case "improving":
      return { label: "↑ Improving", color: COLOR.green };
    case "declining":
      return { label: "↓ Declining", color: COLOR.red };
    case "stable":
      return { label: "→ Stable", color: COLOR.yellow };
  }
}

/**
 * Returns the direction badge colour for a change direction.
 * @param direction - Change direction string.
 * @returns Hex colour string.
 */
function changeColor(direction: MonitorChange["direction"]): string {
  switch (direction) {
    case "improved":
      return COLOR.green;
    case "declined":
      return COLOR.red;
    case "neutral":
      return COLOR.muted;
  }
}

/**
 * Returns the impact badge background colour.
 * @param impact - The recommendation impact level.
 * @returns Hex background colour string.
 */
function impactBg(impact: MonitorRecommendation["impact"]): string {
  switch (impact) {
    case "high":
      return COLOR.redLight;
    case "medium":
      return COLOR.yellowLight;
    case "low":
      return COLOR.greenLight;
  }
}

/**
 * Returns the impact badge text colour.
 * @param impact - The recommendation impact level.
 * @returns Hex text colour string.
 */
function impactColor(impact: MonitorRecommendation["impact"]): string {
  switch (impact) {
    case "high":
      return COLOR.red;
    case "medium":
      return COLOR.yellow;
    case "low":
      return COLOR.green;
  }
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------

function renderScore(result: MonitorCheckResult): string {
  const { label, color } = trendMeta(result.trend);
  const delta =
    result.previousScore !== null ? result.score - result.previousScore : null;
  const deltaStr =
    delta !== null
      ? ` (${delta >= 0 ? "+" : ""}${delta} from last week)`
      : "";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="margin-bottom:24px;border-radius:12px;overflow:hidden;border:1px solid ${COLOR.border};">
      <tr>
        <td style="background:${COLOR.card};padding:32px;text-align:center;">
          <p style="margin:0 0 8px;font-size:13px;color:${COLOR.muted};text-transform:uppercase;letter-spacing:0.05em;">
            AI Reputation Score
          </p>
          <p style="margin:0 0 8px;font-size:48px;font-weight:700;color:${COLOR.text};">
            ${result.score}
          </p>
          <p style="margin:0;font-size:14px;color:${color};font-weight:600;">
            ${label}${deltaStr}
          </p>
        </td>
      </tr>
    </table>`;
}

function renderChanges(changes: MonitorChange[]): string {
  if (changes.length === 0) {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
        style="margin-bottom:24px;border-radius:12px;overflow:hidden;border:1px solid ${COLOR.border};">
        <tr>
          <td style="background:${COLOR.card};padding:24px;">
            <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:${COLOR.text};">
              Changes this week
            </p>
            <p style="margin:0;font-size:14px;color:${COLOR.muted};">
              No changes detected — AI perception is holding steady.
            </p>
          </td>
        </tr>
      </table>`;
  }

  const rows = changes
    .map(
      (c) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${COLOR.border};">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${COLOR.text};">
            <span style="color:${changeColor(c.direction)};margin-right:6px;">●</span>
            ${capitalize(c.category)}
          </p>
          <p style="margin:0;font-size:13px;color:${COLOR.muted};">
            ${escapeHtml(c.summary)}
          </p>
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="margin-bottom:24px;border-radius:12px;overflow:hidden;border:1px solid ${COLOR.border};">
      <tr>
        <td style="background:${COLOR.card};padding:24px;">
          <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:${COLOR.text};">
            Changes this week
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`;
}

function renderRecommendations(recs: MonitorRecommendation[]): string {
  if (recs.length === 0) return "";

  const rows = recs
    .map(
      (r) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${COLOR.border};">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:${COLOR.text};">
            ${escapeHtml(r.title)}
            <span style="display:inline-block;margin-left:8px;padding:2px 8px;font-size:11px;font-weight:600;border-radius:9999px;background:${impactBg(r.impact)};color:${impactColor(r.impact)};">
              ${r.impact}
            </span>
          </p>
          <p style="margin:0;font-size:13px;color:${COLOR.muted};line-height:1.5;">
            ${escapeHtml(r.description)}
          </p>
        </td>
      </tr>`,
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="margin-bottom:24px;border-radius:12px;overflow:hidden;border:1px solid ${COLOR.border};">
      <tr>
        <td style="background:${COLOR.card};padding:24px;">
          <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:${COLOR.text};">
            Recommendations
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`;
}

function renderCta(companySlug: string): string {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://openrole.co.uk"}/dashboard?company=${encodeURIComponent(companySlug)}`;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
      style="margin-bottom:24px;">
      <tr>
        <td align="center" style="padding:8px 0;">
          <a href="${dashboardUrl}"
            style="display:inline-block;padding:12px 32px;background:${COLOR.accent};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
            View full dashboard →
          </a>
        </td>
      </tr>
    </table>`;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates the complete HTML email body for a weekly AI Reputation Monitor
 * digest. The output uses only inline styles and table-based layout for
 * maximum email client compatibility.
 *
 * @param result      - The monitor check result to render.
 * @param companyName - Human-readable company name for the greeting.
 * @returns A self-contained HTML string ready to send.
 */
export function generateMonitorEmail(
  result: MonitorCheckResult,
  companyName: string,
): string {
  const dateStr = new Date(result.checkedAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>OpenRole — Weekly AI Reputation Report</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${COLOR.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px;">
              <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:${COLOR.text};">
                OpenRole
              </p>
              <p style="margin:0;font-size:13px;color:${COLOR.muted};">
                Weekly AI Reputation Report — ${dateStr}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0;font-size:15px;color:${COLOR.text};line-height:1.6;">
                Here's what AI models are saying about
                <strong>${escapeHtml(companyName)}</strong> this week.
              </p>
            </td>
          </tr>

          <!-- Score -->
          <tr><td>${renderScore(result)}</td></tr>

          <!-- Changes -->
          <tr><td>${renderChanges(result.changes)}</td></tr>

          <!-- Recommendations -->
          <tr><td>${renderRecommendations(result.recommendations)}</td></tr>

          <!-- CTA -->
          <tr><td>${renderCta(result.companySlug)}</td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;border-top:1px solid ${COLOR.border};">
              <p style="margin:0;font-size:12px;color:${COLOR.muted};line-height:1.6;">
                You're receiving this because your company is monitored by OpenRole.
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://openrole.co.uk"}/unsubscribe" style="color:${COLOR.accent};text-decoration:none;">Unsubscribe</a>
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
