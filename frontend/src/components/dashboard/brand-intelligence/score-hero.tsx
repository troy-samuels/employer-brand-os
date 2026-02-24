/**
 * @module components/dashboard/brand-intelligence/score-hero
 * The hero section: large AI Visibility Score with sparkline and trend indicator.
 * Server component — no interactivity needed.
 */

import { Card } from "@/components/ui/card";
import type { ScoreSnapshot } from "@/lib/monitor/fetch-monitor-data";
import type { TrendDirection } from "@/lib/monitor/reputation-monitor";

// ---------------------------------------------------------------------------
// Sparkline (pure SVG — no chart library)
// ---------------------------------------------------------------------------

function Sparkline({
  data,
  width = 200,
  height = 48,
}: {
  data: ScoreSnapshot[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const scores = data.map((d) => d.score);
  const min = Math.min(...scores) - 5;
  const max = Math.max(...scores) + 5;
  const range = max - min || 1;

  const points = scores.map((score, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((score - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Gradient fill path — close the area under the line
  const fillD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-label="Score trend over 12 weeks"
      role="img"
    >
      <defs>
        <linearGradient id="sparkline-fill-hero" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#sparkline-fill-hero)" />
      <path
        d={pathD}
        fill="none"
        stroke="var(--brand-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Current point dot */}
      {scores.length > 0 && (
        <circle
          cx={width}
          cy={height - ((scores[scores.length - 1] - min) / range) * height}
          r="3"
          fill="var(--brand-accent)"
        />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Score colour helpers
// ---------------------------------------------------------------------------

function scoreColour(score: number): string {
  if (score > 70) return "text-status-verified";
  if (score >= 40) return "text-status-warning";
  return "text-status-critical";
}

function scoreBgColour(score: number): string {
  if (score > 70) return "bg-status-verified-light";
  if (score >= 40) return "bg-status-warning-light";
  return "bg-status-critical-light";
}

function trendIcon(trend: TrendDirection): string {
  if (trend === "improving") return "↑";
  if (trend === "declining") return "↓";
  return "→";
}

function trendLabel(trend: TrendDirection): string {
  if (trend === "improving") return "Improving";
  if (trend === "declining") return "Declining";
  return "Stable";
}

function trendColour(trend: TrendDirection): string {
  if (trend === "improving") return "text-status-verified";
  if (trend === "declining") return "text-status-critical";
  return "text-neutral-500";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ScoreHeroProps {
  score: number;
  previousScore: number | null;
  trend: TrendDirection;
  scoreHistory: ScoreSnapshot[];
  lastCheckedAt: string | null;
  isSimulated: boolean;
}

export function ScoreHero({
  score,
  previousScore,
  trend,
  scoreHistory,
  lastCheckedAt,
  isSimulated,
}: ScoreHeroProps) {
  const delta = previousScore !== null ? score - previousScore : null;

  return (
    <Card variant="bordered" padding="lg" className="relative overflow-hidden">
      {/* Simulated data notice */}
      {isSimulated && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-status-warning-light px-2.5 py-1 text-[10px] font-semibold text-status-warning">
            Sample data
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
        {/* Score display */}
        <div className="flex items-center gap-5">
          {/* Large score circle */}
          <div
            className={`flex items-center justify-center w-20 h-20 rounded-2xl ${scoreBgColour(score)}`}
          >
            <span className={`text-3xl font-bold tabular-nums ${scoreColour(score)}`}>
              {score}
            </span>
          </div>

          <div>
            <p className="overline mb-1">AI Visibility Score</p>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${trendColour(trend)}`}>
                {trendIcon(trend)} {trendLabel(trend)}
              </span>
              {delta !== null && (
                <span className="text-xs text-neutral-500">
                  ({delta > 0 ? "+" : ""}{delta} pts)
                </span>
              )}
            </div>
            {lastCheckedAt && (
              <p className="text-[11px] text-neutral-400 mt-1">
                Last checked {new Date(lastCheckedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex-1 flex flex-col items-end">
          <p className="text-[11px] text-neutral-400 mb-2">Last 12 weeks</p>
          <Sparkline data={scoreHistory} width={240} height={48} />
          <div className="flex justify-between w-[240px] mt-1">
            <span className="text-[10px] text-neutral-300">
              {scoreHistory[0]?.weekLabel}
            </span>
            <span className="text-[10px] text-neutral-300">
              {scoreHistory[scoreHistory.length - 1]?.weekLabel}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
