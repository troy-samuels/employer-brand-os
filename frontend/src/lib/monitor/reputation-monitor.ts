/**
 * @module lib/monitor/reputation-monitor
 * Runs lightweight AI reputation checks for a company and detects drift
 * from previous checks stored in Supabase.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single data point captured during an AI reputation check. */
export interface CheckDataPoint {
  /** The category being checked (e.g. "salary", "culture", "benefits"). */
  category: string;
  /** The raw value or statement returned by the AI model. */
  value: string;
  /** Confidence score from 0–100 for this data point. */
  confidence: number;
  /** Source model that produced the data point. */
  source: string;
}

/** Describes a single change detected between two checks. */
export interface MonitorChange {
  /** Category that changed. */
  category: string;
  /** The previous value (or `null` for new categories). */
  previousValue: string | null;
  /** The current value. */
  currentValue: string;
  /** Direction of the change relative to accuracy / reputation. */
  direction: "improved" | "declined" | "neutral";
  /** Human-readable summary of the change. */
  summary: string;
}

/** An actionable recommendation derived from check results. */
export interface MonitorRecommendation {
  /** Short title for the recommendation. */
  title: string;
  /** Longer description of why this matters and what to do. */
  description: string;
  /** Expected impact if actioned. */
  impact: "high" | "medium" | "low";
  /** The category this recommendation targets. */
  category: string;
}

/** Overall trend direction for the company's AI reputation. */
export type TrendDirection = "improving" | "declining" | "stable";

/** Complete result from a single monitoring run. */
export interface MonitorCheckResult {
  /** Company slug that was checked. */
  companySlug: string;
  /** Timestamp of the check (ISO-8601). */
  checkedAt: string;
  /** Overall AI reputation score (0–100). */
  score: number;
  /** Previous score, if a prior check exists. */
  previousScore: number | null;
  /** Trend direction based on recent checks. */
  trend: TrendDirection;
  /** Raw data points collected during this check. */
  checkData: CheckDataPoint[];
  /** Changes detected since the last check. */
  changes: MonitorChange[];
  /** Actionable recommendations based on the check. */
  recommendations: MonitorRecommendation[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORIES = ["salary", "culture", "benefits", "work_policy", "reputation"] as const;

const CATEGORY_WEIGHTS: Record<string, number> = {
  salary: 30,
  culture: 25,
  benefits: 20,
  work_policy: 15,
  reputation: 10,
};

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------

/**
 * Computes a weighted overall score from individual data-point confidences.
 * @param dataPoints - The data points to aggregate.
 * @returns A score between 0 and 100.
 */
export function computeScore(dataPoints: CheckDataPoint[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const dp of dataPoints) {
    const weight = CATEGORY_WEIGHTS[dp.category] ?? 10;
    weightedSum += dp.confidence * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  return Math.round(weightedSum / totalWeight);
}

/**
 * Determines the trend direction from the current and previous score.
 * @param current  - The current score.
 * @param previous - The previous score (or `null`).
 * @returns The trend direction.
 */
export function determineTrend(
  current: number,
  previous: number | null,
): TrendDirection {
  if (previous === null) return "stable";
  const delta = current - previous;
  if (delta >= 3) return "improving";
  if (delta <= -3) return "declining";
  return "stable";
}

// ---------------------------------------------------------------------------
// Diff / changelog
// ---------------------------------------------------------------------------

/**
 * Generates a list of changes between a previous and current set of data
 * points, grouped by category.
 * @param previous - Data points from the prior check (empty array when none).
 * @param current  - Data points from the current check.
 * @returns An array of detected changes.
 */
export function detectChanges(
  previous: CheckDataPoint[],
  current: CheckDataPoint[],
): MonitorChange[] {
  const prevMap = new Map<string, CheckDataPoint>();
  for (const dp of previous) {
    prevMap.set(dp.category, dp);
  }

  const changes: MonitorChange[] = [];

  for (const dp of current) {
    const prev = prevMap.get(dp.category);
    if (!prev) {
      changes.push({
        category: dp.category,
        previousValue: null,
        currentValue: dp.value,
        direction: "neutral",
        summary: `New data point for "${dp.category}": ${dp.value}`,
      });
      continue;
    }

    if (prev.value !== dp.value) {
      const direction =
        dp.confidence > prev.confidence
          ? "improved"
          : dp.confidence < prev.confidence
            ? "declined"
            : "neutral";

      changes.push({
        category: dp.category,
        previousValue: prev.value,
        currentValue: dp.value,
        direction,
        summary: `"${dp.category}" changed from "${prev.value}" to "${dp.value}"`,
      });
    }
  }

  return changes;
}

// ---------------------------------------------------------------------------
// Recommendations engine
// ---------------------------------------------------------------------------

/**
 * Generates actionable recommendations based on check data.
 * @param dataPoints - Current data points.
 * @param changes   - Detected changes since last check.
 * @returns A prioritised list of recommendations.
 */
export function generateRecommendations(
  dataPoints: CheckDataPoint[],
  changes: MonitorChange[],
): MonitorRecommendation[] {
  const recommendations: MonitorRecommendation[] = [];

  for (const dp of dataPoints) {
    if (dp.category === "salary" && dp.confidence < 50) {
      recommendations.push({
        title: "Publish verified salary data",
        description:
          "AI is guessing your salary range with low confidence. Add structured salary data to your careers page so AI models can cite accurate figures.",
        impact: "high",
        category: "salary",
      });
    }

    if (dp.category === "benefits" && dp.confidence < 40) {
      recommendations.push({
        title: "Add benefits to your careers page",
        description:
          "AI models have very little data about your benefits package. List key benefits (healthcare, holidays, learning budget) on your site.",
        impact: "medium",
        category: "benefits",
      });
    }

    if (dp.category === "culture" && dp.confidence < 45) {
      recommendations.push({
        title: "Strengthen your culture narrative",
        description:
          "AI is relying on third-party reviews for culture info. Publish an authentic culture page with specifics — remote policy, team rituals, values in action.",
        impact: "medium",
        category: "culture",
      });
    }

    if (dp.category === "work_policy" && dp.confidence < 50) {
      recommendations.push({
        title: "Clarify your work policy",
        description:
          "Your remote/hybrid/office policy is unclear to AI models. State it explicitly on your careers page.",
        impact: "medium",
        category: "work_policy",
      });
    }
  }

  // Flag declining categories
  for (const change of changes) {
    if (change.direction === "declined") {
      recommendations.push({
        title: `Address decline in ${change.category}`,
        description: `AI perception of your ${change.category} has worsened: ${change.summary}. Review and update the relevant section of your careers page.`,
        impact: "high",
        category: change.category,
      });
    }
  }

  // De-duplicate by category — keep highest impact
  const seen = new Set<string>();
  return recommendations.filter((r) => {
    if (seen.has(r.category)) return false;
    seen.add(r.category);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Runs a lightweight AI reputation check for a company, compares against a
 * previous check, and returns the full result including score, changes,
 * and recommendations.
 *
 * @param companySlug     - The company identifier slug.
 * @param currentData     - Data points collected during this check.
 * @param previousCheck   - The previous check result (or `null` for first run).
 * @returns A complete {@link MonitorCheckResult}.
 */
export function runMonitorCheck(
  companySlug: string,
  currentData: CheckDataPoint[],
  previousCheck: MonitorCheckResult | null,
): MonitorCheckResult {
  const previousData = previousCheck?.checkData ?? [];
  const previousScore = previousCheck?.score ?? null;

  const score = computeScore(currentData);
  const trend = determineTrend(score, previousScore);
  const changes = detectChanges(previousData, currentData);
  const recommendations = generateRecommendations(currentData, changes);

  return {
    companySlug,
    checkedAt: new Date().toISOString(),
    score,
    previousScore,
    trend,
    checkData: currentData,
    changes,
    recommendations,
  };
}

/**
 * Returns placeholder / simulated AI data points for a company.
 * In production this would call actual AI model APIs.
 * @param companySlug - The company identifier slug.
 * @returns Simulated data points for all tracked categories.
 */
export function collectDataPoints(companySlug: string): CheckDataPoint[] {
  // Deterministic-ish seed from slug to keep results stable per-company
  const seed = companySlug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = (seed % 40) + 30; // 30-69 base confidence

  return CATEGORIES.map((category) => {
    const jitter = ((seed * category.length) % 20) - 10;
    const confidence = Math.max(0, Math.min(100, base + jitter));

    const valueMap: Record<string, string> = {
      salary: `£${45 + (seed % 30)}k – £${70 + (seed % 25)}k estimated`,
      culture: confidence > 50 ? "Positive — collaborative team" : "Mixed — limited data",
      benefits: confidence > 45 ? "Standard package mentioned" : "No specific data found",
      work_policy: confidence > 50 ? "Hybrid, office 2-3 days" : "Unclear from available data",
      reputation: confidence > 55 ? "Generally well-regarded" : "Limited online presence",
    };

    return {
      category,
      value: valueMap[category] ?? "Unknown",
      confidence,
      source: "ai-monitor-v1",
    };
  });
}
