/**
 * Defines the AnalyticsMetric contract.
 */
/**
 * @module types/analytics
 * Module implementation for analytics.ts.
 */

export interface AnalyticsMetric {
  label: string;
  value: string;
  change: string;
}

/**
 * Defines the AnalyticsSeries contract.
 */
export interface AnalyticsSeries {
  label: string;
  data: number[];
}

/**
 * Defines the AnalyticsOverview contract.
 */
export interface AnalyticsOverview {
  metrics: AnalyticsMetric[];
  engagement: AnalyticsSeries;
  visibility: AnalyticsSeries;
}
