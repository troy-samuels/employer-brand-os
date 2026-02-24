/**
 * @module components/dashboard/brand-intelligence/response-tracker
 * AI Response Tracker — shows what each AI model says about the company,
 * organised by category with confidence levels and gap indicators.
 * Client component for category tab interaction.
 */

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { TrackerRow, AIModel } from "@/lib/monitor/fetch-monitor-data";
import { AI_MODEL_LABELS, CATEGORY_LABELS } from "@/lib/monitor/fetch-monitor-data";

// ---------------------------------------------------------------------------
// Confidence bar (pure CSS)
// ---------------------------------------------------------------------------

function ConfidenceBar({ confidence }: { confidence: number }) {
  const clamped = Math.max(0, Math.min(100, confidence));
  const colour =
    clamped > 60
      ? "bg-status-verified"
      : clamped >= 35
        ? "bg-status-warning"
        : "bg-status-critical";

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 flex-1 rounded-full bg-neutral-100 overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence: ${clamped}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${colour}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-neutral-500 w-8 text-right">
        {clamped}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Match status badge
// ---------------------------------------------------------------------------

function MatchBadge({ status }: { status: TrackerRow["matchesVerified"] }) {
  if (status === "match") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-status-verified-light px-2 py-0.5 text-[10px] font-semibold text-status-verified">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-verified" />
        Verified
      </span>
    );
  }
  if (status === "mismatch") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-status-warning-light px-2 py-0.5 text-[10px] font-semibold text-status-warning">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-warning" />
        Gap
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-status-critical-light px-2 py-0.5 text-[10px] font-semibold text-status-critical">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-critical" />
      No data
    </span>
  );
}

// ---------------------------------------------------------------------------
// Model icon (simple text badge — no external images needed)
// ---------------------------------------------------------------------------

const MODEL_COLOURS: Record<AIModel, string> = {
  chatgpt: "bg-emerald-50 text-emerald-700 border-emerald-200",
  claude: "bg-orange-50 text-orange-700 border-orange-200",
  perplexity: "bg-teal-50 text-teal-700 border-teal-200",
  gemini: "bg-blue-50 text-blue-700 border-blue-200",
};

const DEFAULT_MODEL_COLOUR = "bg-neutral-50 text-neutral-700 border-neutral-200";

function ModelBadge({ model }: { model: AIModel }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${MODEL_COLOURS[model] ?? DEFAULT_MODEL_COLOUR}`}
    >
      {AI_MODEL_LABELS[model] ?? model}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ResponseTrackerProps {
  rows: TrackerRow[];
}

export function ResponseTracker({ rows }: ResponseTrackerProps) {
  // Get unique categories from data
  const categories = Array.from(new Set(rows.map((r) => r.category)));
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "salary");

  // Guard: if activeCategory doesn't exist in categories (e.g. after data refresh),
  // snap back to the first available category.
  const resolvedCategory = categories.includes(activeCategory)
    ? activeCategory
    : categories[0] ?? "salary";

  const categoryRows = rows.filter((r) => r.category === resolvedCategory);

  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950">
            AI Response Tracker
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            No response data available yet. Data will appear after your first monitoring check.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-950">
          AI Response Tracker
        </h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          What each AI model tells candidates about your company, by category
        </p>
      </div>

      {/* Category tabs */}
      <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none" role="tablist" aria-label="Response categories">
        {categories.map((cat) => {
          const isActive = cat === resolvedCategory;
          const catRows = rows.filter((r) => r.category === cat);
          const hasIssue = catRows.some(
            (r) => r.matchesVerified === "mismatch" || r.matchesVerified === "no-data",
          );

          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${cat}`}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2.5 text-[13px] font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
              {hasIssue && !isActive && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-warning" aria-label="Has issues" />
              )}
            </button>
          );
        })}
      </div>
      {/* Fade hint for horizontal scroll */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent" />
      </div>

      {/* Model responses for active category */}
      <div className="grid gap-3 sm:grid-cols-2" role="tabpanel" id={`tabpanel-${resolvedCategory}`} aria-label={CATEGORY_LABELS[resolvedCategory] ?? resolvedCategory}>
        {categoryRows.map((row) => (
          <Card
            key={`${row.category}-${row.model}`}
            variant="bordered"
            padding="md"
            className="space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <ModelBadge model={row.model} />
              <MatchBadge status={row.matchesVerified} />
            </div>

            {/* AI response */}
            <p className="text-sm text-neutral-700 leading-relaxed">
              &ldquo;{row.aiResponse}&rdquo;
            </p>

            {/* Confidence bar */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 mb-1">
                Confidence
              </p>
              <ConfidenceBar confidence={row.confidence} />
            </div>

            {/* Source attribution */}
            <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
              <p className="text-[11px] text-neutral-400">
                Source: <span className="text-neutral-600 font-medium">{row.sourceAttribution}</span>
              </p>
            </div>

            {/* Gap indicator */}
            {row.matchesVerified === "mismatch" && row.verifiedValue && (
              <div className="rounded-lg bg-status-warning-light/60 border border-status-warning/10 px-3 py-2">
                <p className="text-[11px] text-status-warning font-medium leading-relaxed">
                  ⚠ {row.verifiedValue}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-4 text-xs text-neutral-400 pt-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-status-verified" />
          Matches your data
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-status-warning" />
          Gap detected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-status-critical" />
          No data available
        </span>
      </div>
    </div>
  );
}
