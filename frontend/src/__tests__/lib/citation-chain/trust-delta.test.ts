/**
 * @module __tests__/lib/citation-chain/trust-delta.test
 * Tests for trust delta extraction and cost estimation helpers.
 */

import { describe, expect, it } from "vitest";

import {
  calculateMisinformationCost,
  calculateTrustDelta,
  deriveHallucinationRate,
  parseSalaryRange,
  type DeltaItem,
} from "@/lib/citation-chain/trust-delta";
import type { LlmResponse } from "@/lib/citation-chain/types";

function createDeltaItem(overrides: Partial<DeltaItem>): DeltaItem {
  return {
    category: "Category",
    aiSays: "AI value",
    reality: "Published value",
    delta: "Matches published data",
    source: "Glassdoor",
    confidence: "medium",
    ...overrides,
  };
}

describe("trust-delta", () => {
  it("parses £ salary ranges", () => {
    const parsed = parseSalaryRange("Senior Engineer salary is £55,000 – £68,000.");

    expect(parsed).toEqual({
      currency: "£",
      min: 55_000,
      max: 68_000,
      raw: "£55,000 – £68,000",
    });
  });

  it("parses $K salary ranges with /yr", () => {
    const parsed = parseSalaryRange("Compensation is typically $150K - $250K/yr in the US.");

    expect(parsed).toEqual({
      currency: "$",
      min: 150_000,
      max: 250_000,
      raw: "$150K - $250K/yr",
    });
  });

  it("parses €k salary ranges with per annum", () => {
    const parsed = parseSalaryRange("Engineers are paid around €45k-60k per annum.");

    expect(parsed).toEqual({
      currency: "€",
      min: 45_000,
      max: 60_000,
      raw: "€45k-60k per annum",
    });
  });

  it("calculates misinformation cost using known values", () => {
    const result = calculateMisinformationCost({
      activeRoles: 10,
      monthlyViews: 2_000,
      costPerHire: 8_500,
      hallucinationRate: 62.5,
      estimatedDropoff: 0.2,
      viewsPerHire: 100,
    });

    expect(result.monthlyWastedSpend).toBe(21_250);
    expect(result.roi).toBeCloseTo(71.07, 2);
  });

  it("derives hallucination rate from wrong or missing categories", () => {
    const items: DeltaItem[] = [
      createDeltaItem({ category: "A", delta: "Matches published data", reality: "Yes" }),
      createDeltaItem({ category: "B", delta: "Matches published data", reality: "Yes" }),
      createDeltaItem({ category: "C", delta: "Matches published range", reality: "Yes" }),
      createDeltaItem({ category: "D", delta: "-£20K", reality: "£80,000 - £90,000" }),
      createDeltaItem({ category: "E", delta: "+£5K", reality: "£60,000 - £70,000" }),
      createDeltaItem({ category: "F", delta: "Mismatch with published data", reality: "Hybrid" }),
      createDeltaItem({ category: "G", delta: null, reality: null }),
      createDeltaItem({ category: "H", delta: null, reality: null }),
    ];

    expect(deriveHallucinationRate(items)).toBe(62.5);
  });

  it("returns null delta when reality is unknown", () => {
    const llmResponses: LlmResponse[] = [
      {
        modelId: "chatgpt",
        category: "salary",
        prompt: "What is the salary for a Software Engineer at Example Corp?",
        response: "Most sources suggest £55,000 - £68,000 for senior engineers.",
        citations: ["https://www.glassdoor.com/Salary/example-corp-salary"],
        latencyMs: 120,
      },
    ];

    const result = calculateTrustDelta(llmResponses, "example.com");
    const salaryItem = result.items.find((item) => item.category === "Senior Engineer Salary");

    expect(salaryItem?.reality).toBeNull();
    expect(salaryItem?.delta).toBeNull();
  });
});
