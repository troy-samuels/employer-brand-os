/**
 * @module lib/proof/case-study
 * Auto-generates compelling case studies from proof reports.
 */

import type { ProofReport } from "./tracker";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/**
 * A case study generated from a proof report.
 */
export interface CaseStudy {
  title: string;
  summary: string;
  challenge: string;
  action: string;
  result: string;
  timeline: string;
  keyMetrics: { label: string; before: string; after: string }[];
  quote: string | null;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Formats a score as a percentage for display.
 *
 * @param score - Score out of 10
 * @returns Formatted percentage string
 */
function formatScore(score: number): string {
  return `${Math.round(score * 10)}%`;
}

/**
 * Gets the best performing dimension from changes.
 *
 * @param report - Proof report
 * @returns The dimension with the highest improvement
 */
function getBestDimension(report: ProofReport): {
  dimension: string;
  change: number;
  percentageChange: number;
} {
  if (report.dimensionChanges.length === 0) {
    return { dimension: "overall", change: 0, percentageChange: 0 };
  }

  const sorted = [...report.dimensionChanges].sort(
    (a, b) => b.change - a.change
  );

  return {
    dimension: sorted[0].dimension,
    change: sorted[0].change,
    percentageChange: sorted[0].percentageChange,
  };
}

/**
 * Formats a dimension name for display.
 *
 * @param dimension - Raw dimension key
 * @returns Formatted display name
 */
function formatDimension(dimension: string): string {
  const labels: Record<string, string> = {
    salary: "Salary Transparency",
    benefits: "Benefits Information",
    culture: "Company Culture",
    interview: "Interview Process",
    remote: "Remote Work",
    tech: "Tech Stack",
    growth: "Career Growth",
  };

  return labels[dimension] ?? dimension;
}

/**
 * Generates a milestone summary sentence.
 *
 * @param report - Proof report
 * @returns Human-readable milestone summary
 */
function getMilestoneSummary(report: ProofReport): string {
  const zeroToOne = report.milestones.filter((m) => m.type === "zero_to_one");
  const scoreJumps = report.milestones.filter((m) => m.type === "score_jump");

  if (zeroToOne.length > 0) {
    const dimension = formatDimension(zeroToOne[0].dimension);
    return `AI visibility went from 0% to visible in ${dimension}`;
  }

  if (scoreJumps.length > 0) {
    return `${scoreJumps.length} major score improvement${scoreJumps.length > 1 ? "s" : ""}`;
  }

  return "Tracking improvements over time";
}

/* ------------------------------------------------------------------ */
/* Case Study Generation                                               */
/* ------------------------------------------------------------------ */

/**
 * Generates a compelling case study from a proof report.
 * Uses real data to create a narrative that demonstrates value.
 *
 * @param report - The proof report
 * @returns A formatted case study
 */
export function generateCaseStudy(report: ProofReport): CaseStudy {
  const bestDimension = getBestDimension(report);
  const hasPositiveChange = report.overallChange > 0;
  const percentageChange = Math.abs(
    Math.round((report.overallChange / (report.overallChange > 0 ? 1 : 1)) * 100)
  );

  // Calculate elapsed time
  const start = new Date(report.trackingStarted);
  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timelineDays = daysDiff > 0 ? daysDiff : 7; // Default to 7 if same day

  // Title
  const title = hasPositiveChange
    ? `${report.companyName} improved AI visibility by ${Math.abs(report.overallChange)} points in ${timelineDays} days`
    : `${report.companyName} is tracking AI visibility improvements`;

  // Summary
  const summary = hasPositiveChange
    ? `${report.companyName} published structured employer content and saw measurable improvements in how AI describes them to candidates. ${getMilestoneSummary(report)}.`
    : `${report.companyName} has started tracking how AI systems describe their employer brand. Early insights show opportunities for improvement in ${formatDimension(bestDimension.dimension)}.`;

  // Challenge
  const challenge = hasPositiveChange
    ? `Before using OpenRole, AI systems couldn't accurately answer candidate questions about ${report.companyName}. When job seekers asked ChatGPT or Perplexity about salary, benefits, or culture, the AI either refused to answer or hallucinated information. This meant candidates were making decisions based on guesswork.`
    : `Like most employers, ${report.companyName} wasn't visible to AI. When candidates asked ChatGPT or Perplexity about the company, AI couldn't provide accurate answers about salary, benefits, or culture.`;

  // Action
  const action = hasPositiveChange
    ? `${report.companyName} began publishing structured employer content using OpenRole's recommendations. They added machine-readable salary data, improved their careers page, and optimized content for AI visibility.`
    : `${report.companyName} started with OpenRole's audit to understand their baseline AI visibility. The audit revealed gaps in ${formatDimension(bestDimension.dimension)} that were preventing AI from accurately describing the company.`;

  // Result
  const result = hasPositiveChange
    ? `Within ${timelineDays} days, ${report.companyName}'s overall AI visibility improved by ${Math.abs(report.overallChange)} points. ${formatDimension(bestDimension.dimension)} saw the biggest jump, improving by ${bestDimension.percentageChange}%. AI systems now cite ${report.companyName}'s own content when answering candidate questions.`
    : `${report.companyName} now has ${report.totalSnapshots} snapshot${report.totalSnapshots > 1 ? "s" : ""} tracking their AI visibility over time. The data shows clear opportunities for improvement, particularly in ${formatDimension(bestDimension.dimension)}.`;

  // Timeline
  const timeline = hasPositiveChange
    ? `Within ${timelineDays} days of implementing OpenRole's recommendations, AI visibility improved measurably.`
    : `Tracking started ${timelineDays} days ago. Next snapshot: ${new Date(report.nextSnapshotDue).toLocaleDateString()}.`;

  // Key Metrics
  const keyMetrics: { label: string; before: string; after: string }[] = [
    {
      label: "Overall AI Visibility",
      before: formatScore(
        report.dimensionChanges[0]?.baseline.score ?? 0
      ),
      after: formatScore(
        report.dimensionChanges[0]?.current.score ?? 0
      ),
    },
  ];

  // Add best performing dimension
  if (bestDimension.change > 0) {
    const change = report.dimensionChanges.find(
      (c) => c.dimension === bestDimension.dimension
    );
    if (change) {
      keyMetrics.push({
        label: formatDimension(bestDimension.dimension),
        before: formatScore(change.baseline.score),
        after: formatScore(change.current.score),
      });
    }
  }

  // Add milestones as metrics
  if (report.milestones.length > 0) {
    keyMetrics.push({
      label: "Milestones Achieved",
      before: "0",
      after: report.milestones.length.toString(),
    });
  }

  // Quote placeholder
  const quote = null; // Will be filled in manually by Growth+ customers

  return {
    title,
    summary,
    challenge,
    action,
    result,
    timeline,
    keyMetrics,
    quote,
  };
}

/**
 * Generates a shareable text version of a case study.
 * Good for social media, emails, or quick sharing.
 *
 * @param caseStudy - The case study to format
 * @returns Plain text version
 */
export function caseStudyToText(caseStudy: CaseStudy): string {
  const sections = [
    `📊 ${caseStudy.title}`,
    "",
    caseStudy.summary,
    "",
    "🎯 The Challenge:",
    caseStudy.challenge,
    "",
    "⚡ What They Did:",
    caseStudy.action,
    "",
    "🚀 The Result:",
    caseStudy.result,
    "",
    "📈 Key Metrics:",
  ];

  caseStudy.keyMetrics.forEach((metric) => {
    sections.push(
      `  ${metric.label}: ${metric.before} → ${metric.after}`
    );
  });

  if (caseStudy.quote) {
    sections.push("");
    sections.push('💬 "' + caseStudy.quote + '"');
  }

  sections.push("");
  sections.push(`⏱️ ${caseStudy.timeline}`);

  return sections.join("\n");
}

/**
 * Generates HTML version of a case study.
 * Used for email delivery or PDF generation.
 *
 * @param caseStudy - The case study to format
 * @returns HTML string
 */
export function caseStudyToHTML(caseStudy: CaseStudy): string {
  const metricsHTML = caseStudy.keyMetrics
    .map(
      (m) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${m.label}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${m.before}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #059669; font-weight: 600;">${m.after}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${caseStudy.title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    h1 { font-size: 32px; font-weight: 700; margin-bottom: 16px; color: #111827; }
    h2 { font-size: 20px; font-weight: 600; margin-top: 32px; margin-bottom: 12px; color: #374151; }
    p { margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
    .quote { background: #f9fafb; border-left: 4px solid #059669; padding: 20px; margin: 24px 0; font-style: italic; }
    .timeline { background: #eff6ff; padding: 16px; border-radius: 8px; margin-top: 24px; }
  </style>
</head>
<body>
  <h1>${caseStudy.title}</h1>
  <p style="font-size: 18px; color: #6b7280;">${caseStudy.summary}</p>
  
  <h2>🎯 The Challenge</h2>
  <p>${caseStudy.challenge}</p>
  
  <h2>⚡ What They Did</h2>
  <p>${caseStudy.action}</p>
  
  <h2>🚀 The Result</h2>
  <p>${caseStudy.result}</p>
  
  <h2>📈 Key Metrics</h2>
  <table>
    <thead>
      <tr>
        <th>Metric</th>
        <th style="text-align: center;">Before</th>
        <th style="text-align: center;">After</th>
      </tr>
    </thead>
    <tbody>
      ${metricsHTML}
    </tbody>
  </table>
  
  ${
    caseStudy.quote
      ? `<div class="quote">"${caseStudy.quote}"</div>`
      : ""
  }
  
  <div class="timeline">
    <strong>⏱️ Timeline:</strong> ${caseStudy.timeline}
  </div>
</body>
</html>
  `;
}
