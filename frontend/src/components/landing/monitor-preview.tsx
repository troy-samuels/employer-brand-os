/**
 * @module components/landing/monitor-preview
 * Landing page section that previews the weekly Monday email digest.
 * Shows mock data with a score trend and before/after snapshot.
 */

"use client";

import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Mail } from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_SCORE = 72;
const MOCK_PREVIOUS_SCORE = 64;
const MOCK_TREND_POINTS = [41, 48, 52, 55, 58, 64, 72];
const MOCK_WEEKS = ["6w ago", "5w ago", "4w ago", "3w ago", "2w ago", "Last week", "This week"];

const MOCK_CHANGES = [
  {
    category: "Salary",
    direction: "improved" as const,
    summary: "Estimate corrected from £55k to £75k after careers page update",
  },
  {
    category: "Benefits",
    direction: "improved" as const,
    summary: "AI now cites your private healthcare & learning budget",
  },
  {
    category: "Work Policy",
    direction: "neutral" as const,
    summary: "Still showing \"hybrid\" — consider adding specifics",
  },
];

const MOCK_RECOMMENDATIONS = [
  {
    title: "Add salary data to your careers page",
    description:
      "AI is guessing £20K below your actual range. Structured salary data fixes this within one crawl cycle.",
    impact: "high" as const,
  },
  {
    title: "Publish your remote policy explicitly",
    description:
      "Models are defaulting to \"office-based\" because your policy page doesn't state it.",
    impact: "medium" as const,
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreRing() {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (MOCK_SCORE / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-neutral-200"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-brand-accent"
        />
      </svg>
      <span className="absolute text-2xl font-bold text-neutral-950">{MOCK_SCORE}</span>
    </div>
  );
}

function TrendChart() {
  const max = Math.max(...MOCK_TREND_POINTS);
  const min = Math.min(...MOCK_TREND_POINTS);
  const range = max - min || 1;
  const chartH = 48;

  const points = MOCK_TREND_POINTS.map((v, i) => {
    const x = (i / (MOCK_TREND_POINTS.length - 1)) * 100;
    const y = chartH - ((v - min) / range) * chartH;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="mt-4 w-full">
      <svg viewBox={`0 0 100 ${chartH}`} className="h-12 w-full" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-accent"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-1 flex justify-between">
        {MOCK_WEEKS.map((w) => (
          <span key={w} className="text-[10px] text-neutral-400">
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChangeRow({
  category,
  direction,
  summary,
}: {
  category: string;
  direction: "improved" | "declined" | "neutral";
  summary: string;
}) {
  const dotColor =
    direction === "improved"
      ? "bg-status-verified"
      : direction === "declined"
        ? "bg-status-critical"
        : "bg-neutral-400";

  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
      <div>
        <p className="text-sm font-semibold text-neutral-950">{category}</p>
        <p className="text-xs text-neutral-500 leading-relaxed">{summary}</p>
      </div>
    </div>
  );
}

function RecommendationRow({
  title,
  description,
  impact,
}: {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}) {
  const badgeClasses =
    impact === "high"
      ? "bg-status-critical-light text-status-critical"
      : impact === "medium"
        ? "bg-yellow-50 text-yellow-700"
        : "bg-status-verified-light text-status-verified";

  return (
    <div className="py-3 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm font-semibold text-neutral-950">{title}</p>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${badgeClasses}`}
        >
          {impact}
        </span>
      </div>
      <p className="text-xs text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Landing page section previewing the weekly Monday email.
 * Renders a mock email digest with score ring, trend chart, changes,
 * and recommendations to demonstrate the AI Reputation Monitor feature.
 * @returns The MonitorPreview React element.
 */
export default function MonitorPreview() {
  return (
    <section id="monitor" className="bg-white py-20 lg:py-28 relative">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-14 lg:mb-16">
          <div className="mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-accent" />
            <p className="overline">Monday report</p>
          </div>
          <h2 className="max-w-xl text-3xl lg:text-4xl font-bold text-neutral-950 tracking-tight">
            Every Monday morning, know exactly where you stand
          </h2>
          <p className="mt-4 max-w-xl text-neutral-500 leading-relaxed">
            A weekly email showing what AI models are saying about your company
            right now — what changed, your score trend, and exactly what to fix.
          </p>
        </div>

        {/* ── Mock email preview ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl"
        >
          {/* Email chrome */}
          <div className="rounded-xl border border-neutral-200 bg-white shadow-card overflow-hidden">
            {/* Fake email header bar */}
            <div className="flex items-center gap-3 border-b border-neutral-100 bg-neutral-50/80 px-5 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs text-neutral-400">
                  From: <span className="text-neutral-600">Rankwell</span> · Monday 9:00 AM
                </p>
              </div>
            </div>

            {/* Email body */}
            <div className="p-6 lg:p-8">
              {/* Subject */}
              <p className="mb-1 text-base font-semibold text-neutral-950">
                Your AI Reputation Report — Week of 14 Jul
              </p>
              <p className="mb-6 text-sm text-neutral-500">
                Here&apos;s what AI models are saying about <strong>Acme Corp</strong> this week.
              </p>

              {/* Score + trend */}
              <div className="mb-6 rounded-lg border border-neutral-100 bg-neutral-50/50 p-5">
                <div className="flex items-center gap-6">
                  <ScoreRing />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-status-verified" />
                      <span className="text-sm font-semibold text-status-verified">
                        +{MOCK_SCORE - MOCK_PREVIOUS_SCORE} from last week
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Score improved 8 points — salary correction had the biggest impact.
                    </p>
                    <TrendChart />
                  </div>
                </div>
              </div>

              {/* Changes */}
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold text-neutral-950">Changes this week</p>
                {MOCK_CHANGES.map((c) => (
                  <ChangeRow key={c.category} {...c} />
                ))}
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold text-neutral-950">Recommendations</p>
                {MOCK_RECOMMENDATIONS.map((r) => (
                  <RecommendationRow key={r.title} {...r} />
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white">
                  View full dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* Caption */}
          <p className="mt-4 text-center text-xs text-neutral-400">
            Actual Monday email preview — delivered to your inbox every week.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
