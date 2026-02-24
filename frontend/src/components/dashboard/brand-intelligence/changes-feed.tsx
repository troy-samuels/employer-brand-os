/**
 * @module components/dashboard/brand-intelligence/changes-feed
 * Weekly Changes Feed — timeline showing what changed since last week.
 * Server component.
 */

import { Card } from "@/components/ui/card";
import type { MonitorChange } from "@/lib/monitor/reputation-monitor";
import { CATEGORY_LABELS } from "@/lib/monitor/fetch-monitor-data";

// ---------------------------------------------------------------------------
// Change entry
// ---------------------------------------------------------------------------

function directionIcon(direction: MonitorChange["direction"]): {
  icon: string;
  bg: string;
  text: string;
} {
  if (direction === "improved") {
    return { icon: "↑", bg: "bg-status-verified-light", text: "text-status-verified" };
  }
  if (direction === "declined") {
    return { icon: "↓", bg: "bg-status-critical-light", text: "text-status-critical" };
  }
  return { icon: "→", bg: "bg-status-info-light", text: "text-status-info" };
}

function ChangeEntry({ change }: { change: MonitorChange }) {
  const { icon, bg, text } = directionIcon(change.direction);
  const categoryLabel = CATEGORY_LABELS[change.category] ?? change.category;

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Icon */}
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${bg} ${text}`}
      >
        {icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-950 font-medium leading-snug">
          {change.summary}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            {categoryLabel}
          </span>
          {change.previousValue && (
            <>
              <span className="text-[10px] text-neutral-300">•</span>
              <span className="text-[11px] text-neutral-400 line-through truncate max-w-[200px]">
                {change.previousValue}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Direction badge */}
      <span
        className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${bg} ${text}`}
      >
        {change.direction === "improved" ? "Improved" : change.direction === "declined" ? "Needs attention" : "New"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ChangesFeedProps {
  changes: MonitorChange[];
}

export function ChangesFeed({ changes }: ChangesFeedProps) {
  if (changes.length === 0) {
    return (
      <Card variant="bordered" padding="lg">
        <h2 className="text-lg font-semibold text-neutral-950 mb-2">
          Weekly Changes
        </h2>
        <p className="text-sm text-neutral-500">
          No changes detected yet. Changes will appear here after your second monitoring check.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="bordered" className="overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100">
        <h2 className="text-lg font-semibold text-neutral-950">
          Weekly Changes
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          What changed in AI responses since your last check
        </p>
      </div>

      <div className="divide-y divide-neutral-50 px-6">
        {changes.map((change, i) => (
          <ChangeEntry key={`${change.category}-${i}`} change={change} />
        ))}
      </div>

      {/* Summary */}
      <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/50">
        <div className="flex items-center gap-4 text-[11px] text-neutral-400">
          <span>
            <span className="font-semibold text-status-verified">
              {changes.filter((c) => c.direction === "improved").length}
            </span>{" "}
            improved
          </span>
          <span>
            <span className="font-semibold text-status-critical">
              {changes.filter((c) => c.direction === "declined").length}
            </span>{" "}
            declined
          </span>
          <span>
            <span className="font-semibold text-status-info">
              {changes.filter((c) => c.direction === "neutral").length}
            </span>{" "}
            new
          </span>
        </div>
      </div>
    </Card>
  );
}
