/**
 * @module app/dashboard/proof/page
 * Proof measurement dashboard showing AI visibility changes over time.
 */

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import type { ProofReport } from "@/lib/proof/tracker";

/**
 * Fetches the proof report for a company.
 *
 * @param companySlug - Company slug
 * @returns The proof report
 */
async function fetchProofReport(companySlug: string): Promise<ProofReport> {
  const response = await fetch(`/api/proof/report?company=${companySlug}`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch proof report");
  }

  return response.json();
}

/**
 * Proof Tracker Dashboard Component.
 * Shows timeline, dimension changes, and milestones.
 */
export default function ProofTrackerPage() {
  const [report, setReport] = useState<ProofReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get company slug from user session
  const companySlug = "example-company";

  useEffect(() => {
    fetchProofReport(companySlug)
      .then(setReport)
      .catch((err) => {
        setError(err.message);
        console.error("Failed to load proof report:", err);
      })
      .finally(() => setLoading(false));
  }, [companySlug]);

  if (loading) {
    return <Loading label="Loading proof report" />;
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <p className="overline mb-2">Proof Tracker</p>
          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
            AI Visibility Measurement
          </h1>
        </div>
        <Card variant="bordered" padding="lg">
          <p className="text-neutral-500">
            No proof data available yet. Create your first snapshot to start tracking AI visibility changes.
          </p>
          <button className="mt-4 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent-hover">
            Create First Snapshot
          </button>
        </Card>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="overline mb-2">Proof Tracker</p>
        <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
          AI Visibility Measurement
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Tracking changes since {new Date(report.trackingStarted).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Score */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center justify-between">
          <div>
            <p className="overline mb-2">Overall Change</p>
            <p className="text-4xl font-bold text-neutral-950">
              {report.overallChange > 0 ? "+" : ""}
              {report.overallChange.toFixed(1)}
              <span className="text-lg text-neutral-500 ml-2">points</span>
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              {report.totalSnapshots} snapshot{report.totalSnapshots > 1 ? "s" : ""} captured
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-neutral-500 mb-1">Next snapshot</p>
            <p className="text-base font-semibold text-neutral-950">
              {new Date(report.nextSnapshotDue).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-neutral-400">Monday 9am</p>
          </div>
        </div>
      </Card>

      {/* Dimension Changes */}
      <Card variant="bordered" padding="lg">
        <h3 className="text-base font-semibold text-neutral-950 mb-4">
          Dimension Score Changes
        </h3>
        <div className="space-y-3">
          {report.dimensionChanges.map((change) => (
            <div
              key={change.dimension}
              className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-950 capitalize">
                  {change.dimension}
                </p>
                <p className="text-xs text-neutral-500">
                  {change.timeElapsed} elapsed
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Before</p>
                  <p className="text-sm font-mono text-neutral-700">
                    {change.baseline.score.toFixed(1)}
                  </p>
                </div>
                <div className="flex items-center">
                  {change.change > 0 ? (
                    <span className="text-status-verified text-xl">→</span>
                  ) : change.change < 0 ? (
                    <span className="text-status-warning text-xl">→</span>
                  ) : (
                    <span className="text-neutral-300 text-xl">→</span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs text-neutral-500">After</p>
                  <p className="text-sm font-mono text-neutral-950 font-semibold">
                    {change.current.score.toFixed(1)}
                  </p>
                </div>
                <div className="w-20 text-right">
                  {change.change !== 0 && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        change.change > 0
                          ? "bg-status-verified-light text-status-verified"
                          : "bg-status-warning-light text-status-warning"
                      }`}
                    >
                      {change.change > 0 ? "+" : ""}
                      {change.change.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Milestones */}
      {report.milestones.length > 0 && (
        <Card variant="bordered" padding="lg">
          <h3 className="text-base font-semibold text-neutral-950 mb-4">
            Milestones Achieved
          </h3>
          <div className="space-y-3">
            {report.milestones.map((milestone, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50"
              >
                <span
                  className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    milestone.type === "zero_to_one"
                      ? "bg-brand-accent-light text-brand-accent"
                      : milestone.type === "score_jump"
                        ? "bg-status-verified-light text-status-verified"
                        : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {milestone.type === "zero_to_one"
                    ? "🎉"
                    : milestone.type === "score_jump"
                      ? "📈"
                      : "✓"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-950 capitalize">
                    {milestone.type.replace("_", " ")}
                  </p>
                  <p className="text-sm text-neutral-700 mt-1">
                    {milestone.description}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(milestone.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Score</p>
                  <p className="text-sm font-mono">
                    <span className="text-neutral-400">
                      {milestone.beforeScore.toFixed(1)}
                    </span>
                    <span className="text-neutral-300 mx-1">→</span>
                    <span className="text-status-verified font-semibold">
                      {milestone.afterScore.toFixed(1)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Generate Case Study (Growth+ only) */}
      {report.overallChange > 0 && (
        <Card variant="bordered" padding="lg">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-950 mb-1">
                Generate Case Study
              </h3>
              <p className="text-sm text-neutral-500">
                Turn your proof into a shareable case study for marketing.
              </p>
            </div>
            <button className="px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent-hover font-medium text-sm">
              Generate
            </button>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-brand-accent-light/30 border border-brand-accent-light">
            <p className="text-xs text-neutral-600">
              <strong>Growth+ Feature:</strong> Auto-generate compelling case studies with real data.
            </p>
          </div>
        </Card>
      )}

      {/* Timeline Visualization */}
      <Card variant="bordered" padding="lg">
        <h3 className="text-base font-semibold text-neutral-950 mb-4">
          Score Timeline
        </h3>
        <div className="space-y-2">
          {report.dimensionChanges.slice(0, 3).map((change) => (
            <div key={change.dimension}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-neutral-700 capitalize">
                  {change.dimension}
                </span>
                <span className="text-xs text-neutral-500">
                  {change.baseline.score.toFixed(1)} → {change.current.score.toFixed(1)}
                </span>
              </div>
              <div className="w-full h-6 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neutral-300 to-status-verified transition-all"
                  style={{
                    width: `${(change.current.score / 10) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
