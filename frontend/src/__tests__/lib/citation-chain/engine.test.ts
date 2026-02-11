/**
 * @module __tests__/lib/citation-chain/engine.test
 * Tests for citation-chain orchestration and scoring.
 */

import { describe, expect, it, vi } from "vitest";

import { CitationChainEngine, calculateCitationScore } from "@/lib/citation-chain/engine";
import type { LlmResponse } from "@/lib/citation-chain/types";

describe("citation-chain engine", () => {
  it("returns citation score 0 when no employer citation exists", () => {
    const llmResponses: LlmResponse[] = [
      {
        modelId: "chatgpt",
        category: "salary",
        prompt: "salary prompt",
        response: "response",
        citations: [
          "https://www.glassdoor.com/Salary/example",
          "https://www.indeed.com/cmp/example/salaries",
        ],
        latencyMs: 100,
      },
    ];

    expect(calculateCitationScore("monzo.com", llmResponses)).toBe(0);
  });

  it("returns citation score 100 when all citations are employer domain", () => {
    const llmResponses: LlmResponse[] = [
      {
        modelId: "chatgpt",
        category: "culture",
        prompt: "culture prompt",
        response: "response",
        citations: ["https://www.monzo.com/careers", "https://careers.monzo.com/jobs"],
        latencyMs: 100,
      },
      {
        modelId: "perplexity",
        category: "culture",
        prompt: "culture prompt",
        response: "response",
        citations: ["https://monzo.com/about"],
        latencyMs: 95,
      },
    ];

    expect(calculateCitationScore("monzo.com", llmResponses)).toBe(100);
  });

  it("returns partial results when one model times out", async () => {
    const fetchGoogleResultsFn = vi.fn(async (query: string, options?: { category?: string }) => {
      const category: LlmResponse["category"] = options?.category === "salary" ? "salary" : "salary";
      return [
        {
          category,
          query,
          url: "https://www.monzo.com/careers",
          domain: "monzo.com",
          title: "Monzo Careers",
          snippet: "Careers at Monzo",
          position: 1,
        },
      ];
    });

    const queryModelFn = vi.fn(async (modelId: "chatgpt" | "claude" | "perplexity", prompt: string, options?: { category?: string }) => {
      if (modelId === "claude") {
        throw new Error("claude query timed out after 5000ms");
      }

      const category: LlmResponse["category"] = options?.category === "salary" ? "salary" : "salary";
      return {
        modelId,
        category,
        prompt,
        response: `Model response for ${modelId}`,
        citations: ["https://www.monzo.com/careers"],
        latencyMs: 120,
      };
    });

    const engine = new CitationChainEngine({
      fetchGoogleResultsFn,
      queryModelFn,
      now: () => new Date("2026-02-11T12:00:00.000Z"),
    });

    const result = await engine.run("Monzo", "monzo.com", {
      categories: ["salary"],
      role: "Software Engineer",
    });

    expect(result.googleResults).toHaveLength(1);
    expect(result.llmResponses).toHaveLength(3);
    expect(result.llmResponses.filter((response) => response.failed)).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.scope).toBe("claude");
    expect(result.citationScore).toBe(100);
    expect(result.timestamp).toBe("2026-02-11T12:00:00.000Z");
  });
});
