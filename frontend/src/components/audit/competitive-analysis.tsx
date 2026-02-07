import { Card } from "@/components/ui/card";
import type { CompetitorInsight } from "@/types/audit";

interface CompetitiveAnalysisProps {
  competitors: CompetitorInsight[];
}

export function CompetitiveAnalysis({ competitors }: CompetitiveAnalysisProps) {
  return (
    <Card variant="bordered" padding="lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Competitive Visibility Snapshot
      </h3>
      <div className="space-y-3">
        {competitors.map((competitor) => (
          <div
            key={competitor.name}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{competitor.name}</p>
              <p className="text-xs text-gray-500">{competitor.key_strength}</p>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {competitor.score.toFixed(1)}/10
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
