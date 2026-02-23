/**
 * @module lib/pdf/employer-briefing
 * React PDF component for the "AI Employer Brand Briefing" — a single-page
 * executive leave-behind that HR Directors can attach to budget request emails.
 *
 * Uses @react-pdf/renderer for pixel-perfect PDF output.
 */

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

import type { CheckItem } from "@/lib/audit/shared";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface BriefingData {
  companyName: string;
  companyDomain: string;
  companySlug: string;
  score: number;
  ukAverage: number;
  percentile: number;
  risks: Array<{
    name: string;
    description: string;
    status: "fail" | "partial";
  }>;
  generatedDate: string;
  qrCodeDataUrl: string;
}

/* ------------------------------------------------------------------ */
/* Colours                                                             */
/* ------------------------------------------------------------------ */

const COLOURS = {
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",
  white: "#ffffff",
  teal600: "#059669",
  teal500: "#10b981",
  teal50: "#ecfdf5",
  amber600: "#d97706",
  amber500: "#f59e0b",
  amber50: "#fffbeb",
  red600: "#dc2626",
  red500: "#ef4444",
  red50: "#fef2f2",
};

function getScoreColour(score: number): string {
  if (score >= 70) return COLOURS.teal600;
  if (score >= 40) return COLOURS.amber600;
  return COLOURS.red600;
}

function getScoreBg(score: number): string {
  if (score >= 70) return COLOURS.teal50;
  if (score >= 40) return COLOURS.amber50;
  return COLOURS.red50;
}

function getScoreLabel(score: number): string {
  if (score >= 70) return "STRONG";
  if (score >= 40) return "NEEDS WORK";
  return "CRITICAL";
}

function getRiskColour(status: "fail" | "partial"): string {
  return status === "fail" ? COLOURS.red600 : COLOURS.amber600;
}

function getRiskBg(status: "fail" | "partial"): string {
  return status === "fail" ? COLOURS.red50 : COLOURS.amber50;
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Helvetica",
    backgroundColor: COLOURS.white,
  },

  /* Header */
  header: {
    backgroundColor: COLOURS.slate900,
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {},
  wordmark: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: COLOURS.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 9,
    color: COLOURS.slate400,
    marginTop: 3,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerDate: {
    fontSize: 8,
    color: COLOURS.slate500,
  },

  /* Prepared for */
  preparedFor: {
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 4,
  },
  preparedLabel: {
    fontSize: 9,
    color: COLOURS.slate400,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  companyName: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: COLOURS.slate900,
    letterSpacing: -0.5,
  },
  companyDomain: {
    fontSize: 10,
    color: COLOURS.slate500,
    marginTop: 4,
  },

  /* Score section */
  scoreSection: {
    flexDirection: "row",
    marginHorizontal: 40,
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
    border: `1 solid ${COLOURS.slate200}`,
  },
  scoreMain: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 52,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1,
  },
  scoreOutOf: {
    fontSize: 14,
    color: COLOURS.slate400,
    marginTop: 2,
  },
  scoreStatus: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    marginTop: 8,
  },
  scoreComparison: {
    flex: 1.6,
    padding: 24,
    backgroundColor: COLOURS.slate50,
    justifyContent: "center",
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  comparisonLabel: {
    fontSize: 10,
    color: COLOURS.slate600,
  },
  comparisonValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLOURS.slate900,
  },
  comparisonBarTrack: {
    height: 6,
    backgroundColor: COLOURS.slate200,
    borderRadius: 3,
    marginBottom: 16,
  },
  comparisonBarFill: {
    height: 6,
    borderRadius: 3,
  },
  deltaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTop: `1 solid ${COLOURS.slate200}`,
  },
  deltaLabel: {
    fontSize: 9,
    color: COLOURS.slate500,
  },
  deltaValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  percentileLabel: {
    fontSize: 9,
    color: COLOURS.slate500,
  },

  /* Risks section */
  risksSection: {
    marginHorizontal: 40,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLOURS.slate900,
    marginBottom: 12,
  },
  riskCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  riskIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 3,
    marginRight: 10,
  },
  riskContent: {
    flex: 1,
  },
  riskName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLOURS.slate900,
    marginBottom: 2,
  },
  riskDescription: {
    fontSize: 9,
    color: COLOURS.slate600,
    lineHeight: 1.4,
  },

  /* Cost of inaction */
  costSection: {
    marginHorizontal: 40,
    marginTop: 20,
    padding: 20,
    backgroundColor: COLOURS.slate50,
    borderRadius: 8,
    border: `1 solid ${COLOURS.slate200}`,
  },
  costTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLOURS.slate900,
    marginBottom: 12,
  },
  costItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  costBullet: {
    fontSize: 9,
    color: COLOURS.slate400,
    marginRight: 8,
    marginTop: 1,
  },
  costText: {
    fontSize: 9,
    color: COLOURS.slate700,
    lineHeight: 1.5,
    flex: 1,
  },
  costBold: {
    fontFamily: "Helvetica-Bold",
  },
  costSource: {
    fontSize: 7,
    color: COLOURS.slate400,
    fontStyle: "italic",
  },

  /* Footer */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 40,
    paddingBottom: 28,
  },
  footerLeft: {},
  footerText: {
    fontSize: 7,
    color: COLOURS.slate400,
    lineHeight: 1.6,
  },
  footerCta: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLOURS.teal600,
    marginTop: 6,
  },
  footerRight: {
    alignItems: "center",
  },
  qrCode: {
    width: 64,
    height: 64,
  },
  qrLabel: {
    fontSize: 7,
    color: COLOURS.slate400,
    marginTop: 4,
    textAlign: "center",
  },

  /* Divider */
  divider: {
    height: 1,
    backgroundColor: COLOURS.slate200,
    marginHorizontal: 40,
    marginTop: 20,
  },
});

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function EmployerBriefingDocument({
  data,
}: {
  data: BriefingData;
}) {
  const scoreColour = getScoreColour(data.score);
  const scoreBg = getScoreBg(data.score);
  const label = getScoreLabel(data.score);
  const delta = data.score - data.ukAverage;

  const costItems = [
    {
      text: "72% of candidates now use AI tools to research employers before applying.",
      source: "Gartner Candidate Experience Survey, 2025",
    },
    {
      text: "Employers with low AI visibility receive up to 30% fewer quality applications — candidates can't find accurate information, so they don't apply.",
      source: "LinkedIn Talent Solutions, 2025",
    },
    {
      text: "Each unfilled role costs an average of £4,700 per month in lost productivity, overtime, and recruitment spend.",
      source: "CIPD Resourcing and Talent Planning Report, 2024",
    },
  ];

  return (
    <Document
      title={`AI Employer Brand Briefing — ${data.companyName}`}
      author="OpenRole"
      subject={`AI Visibility Score: ${data.score}/100`}
      creator="OpenRole (openrole.co.uk)"
    >
      <Page size="A4" style={s.page}>
        {/* ── Header ──────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.wordmark}>OpenRole</Text>
            <Text style={s.headerSubtitle}>AI Employer Brand Briefing</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerDate}>{data.generatedDate}</Text>
          </View>
        </View>

        {/* ── Prepared For ────────────────────────── */}
        <View style={s.preparedFor}>
          <Text style={s.preparedLabel}>Prepared for</Text>
          <Text style={s.companyName}>{data.companyName}</Text>
          <Text style={s.companyDomain}>{data.companyDomain}</Text>
        </View>

        {/* ── Score Panel ─────────────────────────── */}
        <View style={s.scoreSection}>
          {/* Score display */}
          <View style={[s.scoreMain, { backgroundColor: scoreBg }]}>
            <Text style={[s.scoreNumber, { color: scoreColour }]}>
              {data.score}
            </Text>
            <Text style={s.scoreOutOf}>/100</Text>
            <Text style={[s.scoreStatus, { color: scoreColour }]}>
              {label}
            </Text>
          </View>

          {/* Comparison */}
          <View style={s.scoreComparison}>
            {/* Your score bar */}
            <View style={s.comparisonRow}>
              <Text style={s.comparisonLabel}>Your score</Text>
              <Text style={[s.comparisonValue, { color: scoreColour }]}>
                {data.score}
              </Text>
            </View>
            <View style={s.comparisonBarTrack}>
              <View
                style={[
                  s.comparisonBarFill,
                  {
                    width: `${Math.min(data.score, 100)}%`,
                    backgroundColor: scoreColour,
                  },
                ]}
              />
            </View>

            {/* UK average bar */}
            <View style={s.comparisonRow}>
              <Text style={s.comparisonLabel}>UK average</Text>
              <Text
                style={[s.comparisonValue, { color: COLOURS.slate400 }]}
              >
                {data.ukAverage}
              </Text>
            </View>
            <View style={s.comparisonBarTrack}>
              <View
                style={[
                  s.comparisonBarFill,
                  {
                    width: `${Math.min(data.ukAverage, 100)}%`,
                    backgroundColor: COLOURS.slate300,
                  },
                ]}
              />
            </View>

            {/* Delta + percentile */}
            <View style={s.deltaRow}>
              <View>
                <Text style={s.deltaLabel}>Difference</Text>
                <Text
                  style={[
                    s.deltaValue,
                    {
                      color: delta >= 0 ? COLOURS.teal600 : COLOURS.red600,
                    },
                  ]}
                >
                  {delta >= 0 ? "+" : ""}
                  {delta} points
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" as const }}>
                <Text style={s.percentileLabel}>Ranking</Text>
                <Text
                  style={[s.deltaValue, { color: COLOURS.slate900 }]}
                >
                  Top {100 - data.percentile}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Biggest Risks ───────────────────────── */}
        {data.risks.length > 0 && (
          <View style={s.risksSection}>
            <Text style={s.sectionTitle}>
              {data.risks.length === 1 ? "Biggest Risk" : `${data.risks.length} Biggest Risks`}
            </Text>
            {data.risks.map((risk, i) => (
              <View
                key={i}
                style={[s.riskCard, { backgroundColor: getRiskBg(risk.status) }]}
              >
                <View
                  style={[
                    s.riskIndicator,
                    { backgroundColor: getRiskColour(risk.status) },
                  ]}
                />
                <View style={s.riskContent}>
                  <Text style={s.riskName}>{risk.name}</Text>
                  <Text style={s.riskDescription}>{risk.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Cost of Inaction ────────────────────── */}
        <View style={s.costSection}>
          <Text style={s.costTitle}>Estimated Cost of Inaction</Text>
          {costItems.map((item, i) => (
            <View key={i} style={s.costItem}>
              <Text style={s.costBullet}>→</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.costText}>{item.text}</Text>
                <Text style={s.costSource}>{item.source}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Footer with QR ──────────────────────── */}
        <View style={s.footer}>
          <View style={s.footerLeft}>
            <Text style={s.footerText}>
              This report is based on publicly available data from{" "}
              {data.companyDomain}.
            </Text>
            <Text style={s.footerText}>
              Scores are calculated using the OpenRole AI Visibility
              methodology.
            </Text>
            <Text style={s.footerCta}>
              Claim your profile → openrole.co.uk/company/{data.companySlug}
            </Text>
          </View>
          <View style={s.footerRight}>
            {data.qrCodeDataUrl && (
              <Image style={s.qrCode} src={data.qrCodeDataUrl} />
            )}
            <Text style={s.qrLabel}>Scan for full report</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
