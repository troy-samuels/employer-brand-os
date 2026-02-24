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
  const accentConfig = {
    default: { text: "text-neutral-950", dot: "" },
    warning: { text: "text-status-warning", dot: "bg-status-warning" },
    success: { text: "text-status-verified", dot: "bg-status-verified" },
    info: { text: "text-brand-accent", dot: "bg-brand-accent" },
  };
  const { text, dot } = accentConfig[accent];

  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-center gap-2 mb-3">
        {dot && <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />}
        <p className="overline !mb-0">{label}</p>
      </div>
      <p className={`text-3xl font-bold tabular-nums ${text}`}>
        {value}
      </p>
      <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
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
  const showCompetitorCard = showCompetitor && competitorGap !== null;
  return (
    <div className={`grid gap-4 ${showCompetitorCard ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
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
      {showCompetitorCard && (
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
