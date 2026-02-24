/**
 * @module __tests__/lib/monitor/fetch-monitor-data
 * Tests for the Brand Intelligence data layer.
 * Verifies simulation produces valid, bounded data in all edge cases.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  fetchBrandIntelligenceData,
  AI_MODEL_LABELS,
  CATEGORY_LABELS,
  type BrandIntelligenceData,
  type AIModel,
} from "@/lib/monitor/fetch-monitor-data";

// Mock Supabase to isolate simulation path
vi.mock("@/lib/supabase/untyped-table", () => ({
  untypedTable: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

describe("fetchBrandIntelligenceData", () => {
  let data: BrandIntelligenceData;

  beforeEach(async () => {
    data = await fetchBrandIntelligenceData("test-company");
  });

  // -----------------------------------------------------------------------
  // Score invariants
  // -----------------------------------------------------------------------

  it("returns a score between 0 and 100", () => {
    expect(data.score).toBeGreaterThanOrEqual(0);
    expect(data.score).toBeLessThanOrEqual(100);
  });

  it("returns a previousScore between 0 and 100 or null", () => {
    if (data.previousScore !== null) {
      expect(data.previousScore).toBeGreaterThanOrEqual(0);
      expect(data.previousScore).toBeLessThanOrEqual(100);
    }
  });

  it("returns a valid trend direction", () => {
    expect(["improving", "declining", "stable"]).toContain(data.trend);
  });

  // -----------------------------------------------------------------------
  // Score history (sparkline)
  // -----------------------------------------------------------------------

  it("returns 12 score history entries", () => {
    expect(data.scoreHistory).toHaveLength(12);
  });

  it("score history entries have valid scores (0-100)", () => {
    for (const snap of data.scoreHistory) {
      expect(snap.score).toBeGreaterThanOrEqual(0);
      expect(snap.score).toBeLessThanOrEqual(100);
    }
  });

  it("score history entries have non-empty weekLabels", () => {
    for (const snap of data.scoreHistory) {
      expect(snap.weekLabel).toBeTruthy();
      expect(typeof snap.weekLabel).toBe("string");
    }
  });

  // -----------------------------------------------------------------------
  // Metrics
  // -----------------------------------------------------------------------

  it("returns non-negative metrics", () => {
    expect(data.metrics.informationGaps).toBeGreaterThanOrEqual(0);
    expect(data.metrics.aiCorrections).toBeGreaterThanOrEqual(0);
    expect(data.metrics.modelsMonitored).toBeGreaterThan(0);
  });

  // -----------------------------------------------------------------------
  // Tracker rows
  // -----------------------------------------------------------------------

  it("returns tracker rows with valid AI models", () => {
    const validModels = new Set<AIModel>(["chatgpt", "claude", "perplexity", "gemini"]);
    for (const row of data.trackerRows) {
      expect(validModels.has(row.model)).toBe(true);
      expect(AI_MODEL_LABELS[row.model]).toBeTruthy();
    }
  });

  it("returns tracker rows with bounded confidence (0-100)", () => {
    for (const row of data.trackerRows) {
      expect(row.confidence).toBeGreaterThanOrEqual(0);
      expect(row.confidence).toBeLessThanOrEqual(100);
    }
  });

  it("returns tracker rows with valid matchesVerified status", () => {
    const validStatuses = new Set(["match", "mismatch", "no-data"]);
    for (const row of data.trackerRows) {
      expect(validStatuses.has(row.matchesVerified)).toBe(true);
    }
  });

  it("returns tracker rows with non-empty category labels", () => {
    for (const row of data.trackerRows) {
      expect(row.categoryLabel).toBeTruthy();
    }
  });

  it("returns tracker rows with non-empty AI responses", () => {
    for (const row of data.trackerRows) {
      expect(row.aiResponse).toBeTruthy();
    }
  });

  // -----------------------------------------------------------------------
  // Changes
  // -----------------------------------------------------------------------

  it("returns changes with valid direction values", () => {
    const validDirections = new Set(["improved", "declined", "neutral"]);
    for (const change of data.changes) {
      expect(validDirections.has(change.direction)).toBe(true);
    }
  });

  it("returns changes with non-empty summaries", () => {
    for (const change of data.changes) {
      expect(change.summary).toBeTruthy();
    }
  });

  // -----------------------------------------------------------------------
  // Recommendations
  // -----------------------------------------------------------------------

  it("returns recommendations with valid impact levels", () => {
    const validImpacts = new Set(["high", "medium", "low"]);
    for (const rec of data.recommendations) {
      expect(validImpacts.has(rec.impact)).toBe(true);
    }
  });

  it("returns recommendations with non-empty titles and descriptions", () => {
    for (const rec of data.recommendations) {
      expect(rec.title).toBeTruthy();
      expect(rec.description).toBeTruthy();
    }
  });

  // -----------------------------------------------------------------------
  // Simulation flag
  // -----------------------------------------------------------------------

  it("marks data as simulated when no Supabase data exists", () => {
    expect(data.isSimulated).toBe(true);
  });

  // -----------------------------------------------------------------------
  // Determinism — same slug produces same data
  // -----------------------------------------------------------------------

  it("produces deterministic results for the same slug", async () => {
    const data2 = await fetchBrandIntelligenceData("test-company");
    expect(data2.score).toBe(data.score);
    expect(data2.trackerRows.length).toBe(data.trackerRows.length);
  });

  // -----------------------------------------------------------------------
  // Edge: undefined slug
  // -----------------------------------------------------------------------

  it("handles undefined companySlug gracefully", async () => {
    const result = await fetchBrandIntelligenceData(undefined);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.isSimulated).toBe(true);
  });
});
