/**
 * @module components/dashboard/analytics-dashboard
 * Module implementation for analytics-dashboard.tsx.
 */

import { Card } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import type { AnalyticsOverview } from "@/types/analytics";

interface AnalyticsDashboardProps {
  overview: AnalyticsOverview;
}

/**
 * Executes AnalyticsDashboard.
 * @param param1 - param1 input.
 * @returns The resulting value.
 */
export function AnalyticsDashboard({ overview }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overview.metrics.map((metric) => (
          <Card key={metric.label} variant="bordered" padding="md">
            <p className="text-sm text-gray-500">{metric.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{metric.value}</p>
            <p className="text-sm text-success mt-1">{metric.change}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {overview.engagement.label}
          </h3>
          <Chart data={overview.engagement.data} ariaLabel="Engagement trend" />
        </Card>
        <Card variant="bordered" padding="lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {overview.visibility.label}
          </h3>
          <Chart data={overview.visibility.data} ariaLabel="Visibility trend" />
        </Card>
      </div>
    </div>
  );
}
