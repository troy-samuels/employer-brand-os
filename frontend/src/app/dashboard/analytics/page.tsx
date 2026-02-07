"use client";

import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { Loading } from "@/components/ui/loading";
import { useAnalytics } from "@/lib/hooks/use-analytics";

export default function AnalyticsPage() {
  const { overview, isLoading } = useAnalytics();

  if (isLoading || !overview) {
    return <Loading label="Loading analytics" />;
  }

  return <AnalyticsDashboard overview={overview} />;
}
