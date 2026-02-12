/**
 * @module components/audit/citation-score-hero
 * Hero section that visualises the Citation Score with a circular progress ring.
 */

"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Citation-score colour band used for UI styling.
 */
export type CitationScoreBand = "red" | "amber" | "green";

/**
 * Props for the citation score hero component.
 */
export interface CitationScoreHeroProps {
  /** Company name displayed in the heading. */
  companyName: string;
  /** Citation Score (0-100). */
  citationScore: number;
  /** Optional wrapper class names. */
  className?: string;
}

interface ScoreBandStyle {
  ring: string;
  meter: string;
  value: string;
  badge: string;
}

const SCORE_BAND_STYLES: Record<CitationScoreBand, ScoreBandStyle> = {
  red: {
    ring: "stroke-red-500/20",
    meter: "stroke-red-500",
    value: "text-red-400",
    badge: "border-red-400/40 bg-red-400/15 text-red-100",
  },
  amber: {
    ring: "stroke-amber-500/20",
    meter: "stroke-amber-400",
    value: "text-amber-300",
    badge: "border-amber-300/35 bg-amber-300/10 text-amber-100",
  },
  green: {
    ring: "stroke-teal-500/20",
    meter: "stroke-emerald-400",
    value: "text-emerald-300",
    badge: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
  },
};

const RING_RADIUS = 84;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Map a Citation Score to the required traffic-light colour band.
 */
export function getCitationScoreBand(score: number): CitationScoreBand {
  const resolvedScore = clampScore(score);

  if (resolvedScore <= 30) {
    return "red";
  }

  if (resolvedScore <= 60) {
    return "amber";
  }

  return "green";
}

/**
 * Render the headline Citation Score hero for the audit report.
 */
export function CitationScoreHero({
  companyName,
  citationScore,
  className,
}: CitationScoreHeroProps) {
  const resolvedScore = clampScore(citationScore);
  const uncontrolledShare = Math.max(0, 100 - resolvedScore);
  const scoreBand = getCitationScoreBand(resolvedScore);
  const bandStyle = SCORE_BAND_STYLES[scoreBand];
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - resolvedScore / 100);

  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-700 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 p-6 text-white shadow-2xl sm:p-10",
        className
      )}
      data-score-band={scoreBand}
      data-testid="citation-score-hero"
    >
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
        <div>
          <span
            className={cn(
              "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
              bandStyle.badge
            )}
          >
            Citation Score
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {companyName}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-200 sm:text-lg">
            {uncontrolledShare}% of what AI tells candidates about you comes from sources you
            don&apos;t control.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center sm:h-[250px] sm:w-[250px]"
        >
          <svg
            viewBox="0 0 220 220"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label={`Citation score ${resolvedScore} out of 100`}
          >
            <circle
              cx="110"
              cy="110"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="16"
              className={bandStyle.ring}
            />
            <motion.circle
              cx="110"
              cy="110"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="16"
              strokeLinecap="round"
              className={bandStyle.meter}
              strokeDasharray={RING_CIRCUMFERENCE}
              initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </svg>
          <div className="pointer-events-none absolute text-center">
            <p className={cn("text-5xl font-bold tracking-tight", bandStyle.value)}>{resolvedScore}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-300">
              out of 100
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
