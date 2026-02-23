/**
 * @module app/compare/[slugs]/opengraph-image
 * Dynamic OG image for head-to-head comparison pages.
 * Shows both companies' scores side by side — perfect for LinkedIn/Twitter shares.
 */

import { ImageResponse } from "next/og";

import { untypedTable } from "@/lib/supabase/untyped-table";
import { formatCompanyName } from "@/lib/utils/company-names";

export const runtime = "edge";
export const alt = "OpenRole AI Visibility Comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface PageProps {
  params: Promise<{ slugs: string }>;
}

function scoreColor(score: number): string {
  if (score >= 70) return "#0D9488";
  if (score >= 40) return "#d97706";
  return "#dc2626";
}

function scoreBg(score: number): string {
  if (score >= 70) return "#F0FDFA";
  if (score >= 40) return "#fffbeb";
  return "#fef2f2";
}

export default async function Image({ params }: PageProps) {
  const { slugs } = await params;
  const parts = slugs.split("-vs-");

  if (parts.length !== 2) {
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
          <div style={{ fontSize: 48, fontWeight: 700 }}>OpenRole</div>
          <div style={{ fontSize: 24, color: "#a3a3a3", marginTop: 12 }}>
            Company Comparison
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const [slugA, slugB] = parts;

  const [dataA, dataB] = await Promise.all([
    untypedTable("public_audits")
      .select("company_name, score")
      .eq("company_slug", slugA)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single(),
    untypedTable("public_audits")
      .select("company_name, score")
      .eq("company_slug", slugB)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const a = dataA.data as { company_name: string; score: number } | null;
  const b = dataB.data as { company_name: string; score: number } | null;

  if (!a || !b) {
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
          <div style={{ fontSize: 48, fontWeight: 700 }}>OpenRole</div>
          <div style={{ fontSize: 24, color: "#a3a3a3", marginTop: 12 }}>
            Company Comparison
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const nameA = formatCompanyName(a.company_name, slugA!);
  const nameB = formatCompanyName(b.company_name, slugB!);

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
              OpenRole
            </div>
          </div>
          <div style={{ fontSize: 16, color: "#a3a3a3" }}>
            Head-to-Head Comparison
          </div>
        </div>

        {/* Main content — two score cards side by side */}
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "48px",
            gap: 32,
            alignItems: "center",
          }}
        >
          {/* Company A */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              padding: "32px",
              borderRadius: 20,
              border: `2px solid ${a.score >= b.score ? scoreColor(a.score) : "#e5e5e5"}`,
              backgroundColor: a.score >= b.score ? scoreBg(a.score) : "#fff",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#0a0a0a",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {nameA}
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: scoreColor(a.score),
                lineHeight: 1,
              }}
            >
              {a.score}
            </div>
            <div style={{ fontSize: 18, color: "#737373", marginTop: 4 }}>
              / 100
            </div>
          </div>

          {/* VS divider */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#d4d4d4",
              }}
            >
              VS
            </div>
          </div>

          {/* Company B */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              padding: "32px",
              borderRadius: 20,
              border: `2px solid ${b.score > a.score ? scoreColor(b.score) : "#e5e5e5"}`,
              backgroundColor: b.score > a.score ? scoreBg(b.score) : "#fff",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#0a0a0a",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {nameB}
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: scoreColor(b.score),
                lineHeight: 1,
              }}
            >
              {b.score}
            </div>
            <div style={{ fontSize: 18, color: "#737373", marginTop: 4 }}>
              / 100
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "0 48px 36px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: "#737373",
            }}
          >
            AI Visibility Comparison → openrole.co.uk/compare
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
