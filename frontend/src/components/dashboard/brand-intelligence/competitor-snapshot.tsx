/**
 * @module components/dashboard/brand-intelligence/competitor-snapshot
 * Competitor comparison snapshot — gated behind Compete+ plans.
 * Shows how the user's AI visibility score compares to tracked competitors.
 * Server component.
 */

import Link from "next/link";
import { Card } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CompetitorData {
  name: string;
  score: number;
  trend: "up" | "down" | "flat";
}

// ---------------------------------------------------------------------------
// Simulated competitor data
// ---------------------------------------------------------------------------

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function generateCompetitors(userScore: number): CompetitorData[] {
  return [
    { name: "Competitor A", score: clamp(userScore + 8), trend: "up" },
    { name: "Competitor B", score: clamp(userScore - 5), trend: "down" },
    { name: "Competitor C", score: clamp(userScore + 2), trend: "flat" },
    { name: "Industry avg.", score: clamp(userScore - 12), trend: "up" },
  ];
}

// ---------------------------------------------------------------------------
// Score bar (pure CSS)
// ---------------------------------------------------------------------------

function ScoreBar({ score, isUser = false }: { score: number; isUser?: boolean }) {
  const colour = isUser ? "bg-brand-accent" : "bg-neutral-200";

  return (
    <div className="flex items-center gap-3">
      <div className="h-3 flex-1 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colour}`}
          style={{ width: `${Math.max(score, 4)}%` }}
        />
      </div>
      <span className={`text-sm font-bold tabular-nums w-8 text-right ${isUser ? "text-brand-accent" : "text-neutral-600"}`}>
        {score}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Locked state (for non-compete plans)
// ---------------------------------------------------------------------------

export function CompetitorSnapshotLocked() {
  return (
    <Card variant="bordered" className="overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-950">
          Competitor Snapshot
        </h2>
      </div>
      <div className="px-6 py-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 mb-3">
          <span className="text-lg">🔒</span>
        </div>
        <h3 className="text-sm font-semibold text-neutral-950 mb-1">
          Available on Compete+ plans
        </h3>
        <p className="text-xs text-neutral-500 max-w-xs mx-auto mb-4">
          See how your AI visibility score compares to competitors and industry benchmarks.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center rounded-lg bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
        >
          Upgrade plan
        </Link>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CompetitorSnapshotProps {
  userScore: number;
  companyName?: string;
}

export function CompetitorSnapshot({ userScore, companyName }: CompetitorSnapshotProps) {
  const competitors = generateCompetitors(userScore);
  const avgCompetitorScore = Math.round(
    competitors.reduce((sum, c) => sum + c.score, 0) / competitors.length,
  );
  const gap = userScore - avgCompetitorScore;

  return (
    <Card variant="bordered" className="overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950">
              Competitor Snapshot
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              AI visibility vs. tracked competitors
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
              gap >= 0
                ? "bg-status-verified-light text-status-verified"
                : "bg-status-warning-light text-status-warning"
            }`}
          >
            {gap >= 0 ? "+" : ""}{gap} pts vs avg
          </span>
        </div>
      </div>

      <div className="px-6 py-3 space-y-3">
        {/* User's score */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-brand-accent">
              {companyName ?? "Your company"}
            </span>
            <span className="text-[10px] font-semibold text-brand-accent uppercase">You</span>
          </div>
          <ScoreBar score={userScore} isUser />
        </div>

        {/* Competitors */}
        {competitors.map((comp) => (
          <div key={comp.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-neutral-600">{comp.name}</span>
              <span className={`text-[11px] font-semibold ${
                comp.trend === "up"
                  ? "text-status-verified"
                  : comp.trend === "down"
                    ? "text-status-critical"
                    : "text-neutral-400"
              }`}>
                {comp.trend === "up" ? "↑" : comp.trend === "down" ? "↓" : "→"}
              </span>
            </div>
            <ScoreBar score={comp.score} />
          </div>
        ))}
      </div>

      <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/50">
        <p className="text-[11px] text-neutral-400">
          Competitor names anonymised. Based on weekly AI monitoring of companies in your sector.
        </p>
      </div>
    </Card>
  );
}
