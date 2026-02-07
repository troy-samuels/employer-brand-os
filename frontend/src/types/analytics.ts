export interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
}

export interface AnalyticsSeries {
  label: string;
  data: number[];
}

export interface AnalyticsOverview {
  metrics: AnalyticsMetric[];
  engagement: AnalyticsSeries;
  visibility: AnalyticsSeries;
}
