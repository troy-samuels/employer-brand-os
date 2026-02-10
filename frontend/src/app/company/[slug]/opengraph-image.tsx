/**
 * @module app/company/[slug]/opengraph-image
 * Dynamic OG image for company audit pages.
 * Generates a branded score card that looks great when shared on LinkedIn/Twitter.
 *
 * Next.js auto-serves this at /company/[slug]/opengraph-image (1200x630).
 */

import { ImageResponse } from "next/og";

import { supabaseAdmin } from "@/lib/supabase/admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

export const runtime = "edge";
export const alt = "Rankwell AI Visibility Score";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#059669"; // emerald-600
  if (score >= 40) return "#d97706"; // amber-600
  return "#dc2626"; // red-600
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Work";
  if (score >= 20) return "Poor";
  return "Critical";
}

function scoreBg(score: number): string {
  if (score >= 70) return "#ecfdf5"; // emerald-50
  if (score >= 40) return "#fffbeb"; // amber-50
  return "#fef2f2"; // red-50
}

export default async function Image({ params }: PageProps) {
  const { slug } = await params;

  const { data } = await db
    .from("public_audits")
    .select("company_name, company_domain, score, score_breakdown, has_llms_txt, has_jsonld, has_salary_data, careers_page_status, robots_txt_status")
    .eq("company_slug", slug)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    // Fallback for unknown companies
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0a0a0a",
            color: "#fff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700 }}>Rankwell</div>
          <div style={{ fontSize: 24, color: "#a3a3a3", marginTop: 12 }}>
            AI Visibility Score
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const score = data.score as number;
  const companyName = data.company_name as string;
  const domain = data.company_domain as string;
  const color = scoreColor(score);
  const label = scoreLabel(score);
  const bg = scoreBg(score);

  // Build check summary
  const checks = [
    { name: "Careers Page", pass: data.careers_page_status === "full" },
    { name: "Structured Data", pass: !!data.has_jsonld },
    { name: "Salary Data", pass: !!data.has_salary_data },
    { name: "AI Instructions", pass: !!data.has_llms_txt },
    { name: "Bot Access", pass: data.robots_txt_status === "allows" },
  ];
  const passCount = checks.filter((c) => c.pass).length;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "28px 48px",
            backgroundColor: "#0a0a0a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
              Rankwell
            </div>
          </div>
          <div style={{ fontSize: 16, color: "#a3a3a3" }}>
            AI Visibility Report
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "48px",
            gap: 48,
          }}
        >
          {/* Left: Score */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 240,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: 180,
                height: 180,
                borderRadius: 24,
                backgroundColor: bg,
                border: `3px solid ${color}20`,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: color,
                  lineHeight: 1,
                }}
              >
                {score}
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#737373",
                  marginTop: 4,
                }}
              >
                / 100
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
                padding: "6px 16px",
                borderRadius: 20,
                backgroundColor: bg,
                color: color,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          </div>

          {/* Right: Company info + checks */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: "#0a0a0a",
                lineHeight: 1.2,
              }}
            >
              {companyName}
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#a3a3a3",
                marginTop: 6,
              }}
            >
              {domain} · {passCount}/5 checks passed
            </div>

            {/* Check grid */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 28,
              }}
            >
              {checks.map((check) => (
                <div
                  key={check.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    borderRadius: 10,
                    backgroundColor: check.pass ? "#ecfdf5" : "#fef2f2",
                    border: `1px solid ${check.pass ? "#059669" : "#dc2626"}20`,
                    fontSize: 15,
                    fontWeight: 500,
                    color: check.pass ? "#059669" : "#dc2626",
                  }}
                >
                  {check.pass ? "✓" : "✗"} {check.name}
                </div>
              ))}
            </div>

            {/* CTA text */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 28,
                fontSize: 16,
                color: "#737373",
              }}
            >
              How does your company score? → rankwell.io
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
