/**
 * @module __tests__/lib/monitor/reputation-monitor
 * Tests for score computation, trend detection, change detection,
 * and recommendation generation.
 */

import { describe, expect, it } from "vitest";
import {
  computeScore,
  determineTrend,
  detectChanges,
  generateRecommendations,
  collectDataPoints,
  runMonitorCheck,
  type CheckDataPoint,
} from "@/lib/monitor/reputation-monitor";

// ---------------------------------------------------------------------------
// computeScore
// ---------------------------------------------------------------------------

describe("computeScore", () => {
  it("returns 0 for empty data points", () => {
    expect(computeScore([])).toBe(0);
  });

  it("returns a score between 0 and 100 for valid data", () => {
    const dataPoints: CheckDataPoint[] = [
      { category: "salary", value: "£50k", confidence: 80, source: "chatgpt" },
      { category: "culture", value: "Good", confidence: 60, source: "claude" },
    ];
    const score = computeScore(dataPoints);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("returns 100 when all confidences are 100", () => {
    const dataPoints: CheckDataPoint[] = [
      { category: "salary", value: "£50k", confidence: 100, source: "chatgpt" },
      { category: "culture", value: "Good", confidence: 100, source: "claude" },
    ];
    expect(computeScore(dataPoints)).toBe(100);
  });

  it("returns 0 when all confidences are 0", () => {
    const dataPoints: CheckDataPoint[] = [
      { category: "salary", value: "Unknown", confidence: 0, source: "chatgpt" },
      { category: "culture", value: "Unknown", confidence: 0, source: "claude" },
    ];
    expect(computeScore(dataPoints)).toBe(0);
  });

  it("applies category weights correctly (salary weighted higher)", () => {
    const highSalary: CheckDataPoint[] = [
      { category: "salary", value: "£80k", confidence: 100, source: "chatgpt" },
      { category: "reputation", value: "Ok", confidence: 0, source: "claude" },
    ];
    const highReputation: CheckDataPoint[] = [
      { category: "salary", value: "Unknown", confidence: 0, source: "chatgpt" },
      { category: "reputation", value: "Great", confidence: 100, source: "claude" },
    ];
    // Salary has weight 30, reputation has weight 10 — so high salary should score higher
    expect(computeScore(highSalary)).toBeGreaterThan(computeScore(highReputation));
  });

  it("handles unknown categories with default weight", () => {
    const dataPoints: CheckDataPoint[] = [
      { category: "unknown_cat", value: "Something", confidence: 50, source: "chatgpt" },
    ];
    const score = computeScore(dataPoints);
    expect(score).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// determineTrend
// ---------------------------------------------------------------------------

describe("determineTrend", () => {
  it("returns 'stable' when previous is null", () => {
    expect(determineTrend(50, null)).toBe("stable");
  });

  it("returns 'improving' when score increased by >= 3", () => {
    expect(determineTrend(53, 50)).toBe("improving");
    expect(determineTrend(60, 50)).toBe("improving");
  });

  it("returns 'declining' when score decreased by >= 3", () => {
    expect(determineTrend(47, 50)).toBe("declining");
    expect(determineTrend(40, 50)).toBe("declining");
  });

  it("returns 'stable' when change is within ±2", () => {
    expect(determineTrend(50, 50)).toBe("stable");
    expect(determineTrend(51, 50)).toBe("stable");
    expect(determineTrend(49, 50)).toBe("stable");
    expect(determineTrend(52, 50)).toBe("stable");
    expect(determineTrend(48, 50)).toBe("stable");
  });
});

// ---------------------------------------------------------------------------
// detectChanges
// ---------------------------------------------------------------------------

describe("detectChanges", () => {
  it("returns empty array when both inputs are empty", () => {
    expect(detectChanges([], [])).toEqual([]);
  });

  it("detects new categories", () => {
    const current: CheckDataPoint[] = [
      { category: "salary", value: "£50k", confidence: 60, source: "chatgpt" },
    ];
    const changes = detectChanges([], current);
    expect(changes).toHaveLength(1);
    expect(changes[0].direction).toBe("neutral");
    expect(changes[0].previousValue).toBeNull();
  });

  it("detects improved values", () => {
    const previous: CheckDataPoint[] = [
      { category: "salary", value: "£45k", confidence: 40, source: "chatgpt" },
    ];
    const current: CheckDataPoint[] = [
      { category: "salary", value: "£50k", confidence: 60, source: "chatgpt" },
    ];
    const changes = detectChanges(previous, current);
    expect(changes).toHaveLength(1);
    expect(changes[0].direction).toBe("improved");
  });

  it("detects declined values", () => {
    const previous: CheckDataPoint[] = [
      { category: "culture", value: "Great", confidence: 80, source: "claude" },
    ];
    const current: CheckDataPoint[] = [
      { category: "culture", value: "Mixed", confidence: 40, source: "claude" },
    ];
    const changes = detectChanges(previous, current);
    expect(changes).toHaveLength(1);
    expect(changes[0].direction).toBe("declined");
  });

  it("returns no changes when values are identical", () => {
    const dp: CheckDataPoint[] = [
      { category: "salary", value: "£50k", confidence: 60, source: "chatgpt" },
    ];
    expect(detectChanges(dp, dp)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// generateRecommendations
// ---------------------------------------------------------------------------

describe("generateRecommendations", () => {
  it("generates recommendation for low-confidence salary", () => {
    const dataPoints: CheckDataPoint[] = [
      { category: "salary", value: "Unknown", confidence: 30, source: "chatgpt" },
    ];
    const recs = generateRecommendations(dataPoints, []);
    expect(recs.some((r) => r.category === "salary")).toBe(true);
    expect(recs.find((r) => r.category === "salary")?.impact).toBe("high");
  });

  it("de-duplicates recommendations by category", () => {
    const dataPoints: CheckDataPoint[] = [
      { category: "salary", value: "Unknown", confidence: 20, source: "chatgpt" },
      { category: "salary", value: "Unknown", confidence: 25, source: "claude" },
    ];
    const recs = generateRecommendations(dataPoints, []);
    const salaryRecs = recs.filter((r) => r.category === "salary");
    expect(salaryRecs).toHaveLength(1);
  });

  it("flags declining changes as high impact", () => {
    const changes = [
      {
        category: "reputation",
        previousValue: "Good",
        currentValue: "Mixed",
        direction: "declined" as const,
        summary: "Reputation declined",
      },
    ];
    const recs = generateRecommendations([], changes);
    expect(recs.some((r) => r.category === "reputation" && r.impact === "high")).toBe(true);
  });

  it("returns empty array when all data is high confidence", () => {
    const dataPoints: CheckDataPoint[] = [
      { category: "salary", value: "£80k", confidence: 90, source: "chatgpt" },
      { category: "culture", value: "Great", confidence: 85, source: "claude" },
      { category: "benefits", value: "Excellent", confidence: 80, source: "perplexity" },
      { category: "work_policy", value: "Hybrid", confidence: 75, source: "gemini" },
    ];
    const recs = generateRecommendations(dataPoints, []);
    expect(recs).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// collectDataPoints (simulation)
// ---------------------------------------------------------------------------

describe("collectDataPoints", () => {
  it("returns data for all tracked categories", () => {
    const points = collectDataPoints("test-company");
    const categories = points.map((p) => p.category);
    expect(categories).toContain("salary");
    expect(categories).toContain("culture");
    expect(categories).toContain("benefits");
    expect(categories).toContain("work_policy");
    expect(categories).toContain("reputation");
  });

  it("returns confidences between 0 and 100", () => {
    const points = collectDataPoints("test-company");
    for (const p of points) {
      expect(p.confidence).toBeGreaterThanOrEqual(0);
      expect(p.confidence).toBeLessThanOrEqual(100);
    }
  });

  it("is deterministic for the same slug", () => {
    const a = collectDataPoints("acme-corp");
    const b = collectDataPoints("acme-corp");
    expect(a).toEqual(b);
  });

  it("produces different results for different slugs", () => {
    const a = collectDataPoints("company-a");
    const b = collectDataPoints("company-b");
    // Scores should differ (different seed)
    expect(a.map((p) => p.confidence)).not.toEqual(b.map((p) => p.confidence));
  });
});

// ---------------------------------------------------------------------------
// runMonitorCheck (integration)
// ---------------------------------------------------------------------------

describe("runMonitorCheck", () => {
  it("returns a complete result with all required fields", () => {
    const data = collectDataPoints("test-company");
    const result = runMonitorCheck("test-company", data, null);

    expect(result.companySlug).toBe("test-company");
    expect(result.checkedAt).toBeTruthy();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.previousScore).toBeNull();
    expect(result.trend).toBe("stable"); // No previous → stable
    expect(result.checkData).toEqual(data);
    expect(Array.isArray(result.changes)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it("detects improving trend from previous check", () => {
    const data1 = collectDataPoints("test-company");
    const result1 = runMonitorCheck("test-company", data1, null);

    // Simulate improved data
    const data2 = data1.map((dp) => ({
      ...dp,
      confidence: Math.min(100, dp.confidence + 10),
    }));
    const result2 = runMonitorCheck("test-company", data2, result1);

    expect(result2.previousScore).toBe(result1.score);
    // Score should increase enough to be "improving"
    if (result2.score - result1.score >= 3) {
      expect(result2.trend).toBe("improving");
    }
  });
});
