/**
 * @module api/badge/[slug]/route
 * Dynamic SVG badge API — returns a shields.io-style badge showing
 * a company's AI Visibility Score.
 *
 * Usage: <img src="https://openrole.co.uk/api/badge/deloitte" />
 *
 * - Looks up the company's latest audit score from Supabase
 * - Returns an SVG badge: "AI Visibility | XX/100 | OpenRole"
 * - Caches the response for 24h (CDN + browser)
 * - Returns a "Not yet audited" badge if no score exists
 */

import { NextRequest, NextResponse } from "next/server";
import { untypedTable } from "@/lib/supabase/untyped-table";

/* ------------------------------------------------------------------ */
/* SVG generators                                                      */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 70) return "#059669"; // green
  if (score >= 40) return "#d97706"; // amber
  return "#dc2626"; // red
}

function generateBadgeSvg(score: number): string {
  const color = scoreColor(score);
  const scoreText = `${score}/100`;

  // Calculate widths — shields.io style with 3 segments
  const labelText = "AI Visibility";
  const brandText = "OpenRole";

  const labelWidth = 90;
  const scoreWidth = 52;
  const brandWidth = 62;
  const totalWidth = labelWidth + scoreWidth + brandWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${scoreText}">
  <title>${labelText}: ${scoreText} - ${brandText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${scoreWidth}" height="20" fill="${color}"/>
    <rect x="${labelWidth + scoreWidth}" width="${brandWidth}" height="20" fill="#0d9488"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${labelText}</text>
    <text x="${labelWidth / 2}" y="14">${labelText}</text>
    <text aria-hidden="true" x="${labelWidth + scoreWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${scoreText}</text>
    <text x="${labelWidth + scoreWidth / 2}" y="14">${scoreText}</text>
    <text aria-hidden="true" x="${labelWidth + scoreWidth + brandWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${brandText}</text>
    <text x="${labelWidth + scoreWidth + brandWidth / 2}" y="14">${brandText}</text>
  </g>
</svg>`;
}

function generateNotAuditedBadgeSvg(): string {
  const labelText = "AI Visibility";
  const statusText = "not yet audited";
  const brandText = "OpenRole";

  const labelWidth = 90;
  const statusWidth = 100;
  const brandWidth = 62;
  const totalWidth = labelWidth + statusWidth + brandWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${labelText}: ${statusText}">
  <title>${labelText}: ${statusText} - ${brandText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${statusWidth}" height="20" fill="#9ca3af"/>
    <rect x="${labelWidth + statusWidth}" width="${brandWidth}" height="20" fill="#0d9488"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${labelText}</text>
    <text x="${labelWidth / 2}" y="14">${labelText}</text>
    <text aria-hidden="true" x="${labelWidth + statusWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${statusText}</text>
    <text x="${labelWidth + statusWidth / 2}" y="14">${statusText}</text>
    <text aria-hidden="true" x="${labelWidth + statusWidth + brandWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${brandText}</text>
    <text x="${labelWidth + statusWidth + brandWidth / 2}" y="14">${brandText}</text>
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Route handler                                                       */
/* ------------------------------------------------------------------ */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Look up the company's latest audit score
  const { data, error } = await untypedTable("public_audits")
    .select("score")
    .eq("company_slug", slug)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  let svg: string;

  if (error || !data) {
    svg = generateNotAuditedBadgeSvg();
  } else {
    svg = generateBadgeSvg(data.score as number);
  }

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
