/**
 * @module components/dashboard/brand-intelligence/metrics-row
 * Key metrics cards row: information gaps, AI corrections, models monitored, competitor gap.
 * Server component.
 */

import { Card } from "@/components/ui/card";

interface MetricsRowProps {
  informationGaps: number;
  aiCorrections: number;
  modelsMonitored: number;
  competitorGap: number | null;
  showCompetitor: boolean;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  description: string;
  accent?: "default" | "warning" | "success" | "info";
}

function MetricCard({ label, value, description, accent = "default" }: MetricCardProps) {
  const accentColours = {
    default: "text-neutral-950",
    warning: "text-status-warning",
    success: "text-status-verified",
    info: "text-brand-accent",
  };

  return (
    <Card variant="bordered" padding="md">
      <p className="overline mb-2">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accentColours[accent]}`}>
        {value}
      </p>
      <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

export function MetricsRow({
  informationGaps,
  aiCorrections,
  modelsMonitored,
  competitorGap,
  showCompetitor,
}: MetricsRowProps) {
  return (
    <div className={`grid gap-4 ${showCompetitor ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
      <MetricCard
        label="Information Gaps"
        value={informationGaps}
        description="Categories where AI models have low or no confidence in your data"
        accent={informationGaps > 5 ? "warning" : informationGaps > 0 ? "default" : "success"}
      />
      <MetricCard
        label="AI Corrections"
        value={aiCorrections}
        description="Times AI model responses improved since your last check"
        accent="success"
      />
      <MetricCard
        label="Models Monitored"
        value={modelsMonitored}
        description="ChatGPT, Claude, Perplexity, Gemini — tracked weekly"
        accent="info"
      />
      {showCompetitor && competitorGap !== null && (
        <MetricCard
          label="Competitor Gap"
          value={`${competitorGap > 0 ? "+" : ""}${competitorGap} pts`}
          description="Your score vs. the average of tracked competitors"
          accent={competitorGap >= 0 ? "success" : "warning"}
        />
      )}
    </div>
  );
}
