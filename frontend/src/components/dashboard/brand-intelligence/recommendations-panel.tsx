/**
 * @module components/dashboard/brand-intelligence/recommendations-panel
 * Actionable recommendations derived from monitoring data.
 * Priority-ordered with impact indicators. Server component.
 */

import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { MonitorRecommendation } from "@/lib/monitor/reputation-monitor";

// ---------------------------------------------------------------------------
// Impact badge
// ---------------------------------------------------------------------------

function ImpactBadge({ impact }: { impact: MonitorRecommendation["impact"] }) {
  const config = {
    high: {
      label: "High impact",
      bg: "bg-status-critical-light",
      text: "text-status-critical",
      dot: "bg-status-critical",
    },
    medium: {
      label: "Medium",
      bg: "bg-status-warning-light",
      text: "text-status-warning",
      dot: "bg-status-warning",
    },
    low: {
      label: "Low",
      bg: "bg-neutral-100",
      text: "text-neutral-500",
      dot: "bg-neutral-400",
    },
  };
  const c = config[impact];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.bg} ${c.text}`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Category → action link mapping
// ---------------------------------------------------------------------------

const CATEGORY_ACTIONS: Record<string, { href: string; label: string }> = {
  salary: { href: "/dashboard/facts", label: "Add salary data →" },
  benefits: { href: "/dashboard/facts", label: "Add benefits →" },
  culture: { href: "/dashboard/facts", label: "Update culture info →" },
  work_policy: { href: "/dashboard/facts", label: "Set work policy →" },
  interview_process: { href: "/dashboard/facts", label: "Document process →" },
  tech_stack: { href: "/dashboard/facts", label: "List tech stack →" },
  career_growth: { href: "/dashboard/facts", label: "Add growth paths →" },
  reputation: { href: "/dashboard/facts", label: "Manage reputation →" },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RecommendationsPanelProps {
  recommendations: MonitorRecommendation[];
}

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  // Sort by impact: high → medium → low
  const impactOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...recommendations].sort(
    (a, b) => impactOrder[a.impact] - impactOrder[b.impact],
  );

  if (sorted.length === 0) {
    return (
      <Card variant="bordered" padding="lg">
        <h2 className="text-lg font-semibold text-neutral-950 mb-2">
          Recommendations
        </h2>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-status-verified-light text-status-verified text-sm">
            ✓
          </span>
          <p className="text-sm text-neutral-500">
            No recommendations right now — your AI presence looks good!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="bordered" className="overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-950">
          Recommendations
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Actions to improve how AI represents your company
        </p>
      </div>

      <div className="divide-y divide-neutral-50">
        {sorted.map((rec, i) => {
          const action = CATEGORY_ACTIONS[rec.category];

          return (
            <div key={`${rec.category}-${i}`} className="px-6 py-4">
              <div className="flex items-start gap-3">
                {/* Number */}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-bold text-neutral-600">
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {/* Title + badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-neutral-950">
                      {rec.title}
                    </h3>
                    <ImpactBadge impact={rec.impact} />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    {rec.description}
                  </p>

                  {/* Action link */}
                  {action && (
                    <Link
                      href={action.href}
                      className="inline-flex items-center mt-2 text-xs font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
                    >
                      {action.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
