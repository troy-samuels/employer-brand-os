/**
 * @module __tests__/lib/citation-chain/gap-analysis.test
 * Tests for source gap analysis logic.
 */

import { describe, expect, it } from "vitest";

import { analyseGaps } from "@/lib/citation-chain/gap-analysis";
import { PROMPT_CATEGORIES } from "@/lib/citation-chain/prompts";
import type {
  CitationChainModelId,
  CitationChainResult,
  GoogleResult,
  LlmResponse,
  PromptCategoryId,
} from "@/lib/citation-chain/types";

describe("gap-analysis", () => {
  it("returns red status when company domain is not cited by any model", () => {
    const result = createChainResult({
      llmResponses: [
        createLlmResponse("chatgpt", "salary", [
          "https://www.glassdoor.com/Salary/example",
          "https://www.indeed.com/cmp/example/salaries",
        ]),
        createLlmResponse("claude", "salary", [
          "https://www.reddit.com/r/jobs/comments/12345",
        ]),
      ],
    });

    const analysis = analyseGaps(result, "acme.com");
    const salaryRow = analysis.rows.find((row) => row.category === "salary");

    expect(salaryRow?.status).toBe("red");
  });

  it("returns green status when company domain is cited by all three models", () => {
    const result = createChainResult({
      llmResponses: [
        createLlmResponse("chatgpt", "reviews", ["https://www.acme.com/careers/reviews"]),
        createLlmResponse("claude", "reviews", ["https://careers.acme.com/life-at-acme"]),
        createLlmResponse("perplexity", "reviews", ["https://acme.com/about/culture"]),
      ],
    });

    const analysis = analyseGaps(result, "acme.com");
    const reviewsRow = analysis.rows.find((row) => row.category === "reviews");

    expect(reviewsRow?.status).toBe("green");
    expect(reviewsRow?.companyCitedByModels).toHaveLength(3);
  });

  it("always returns all 8 prompt categories even when input data is sparse", () => {
    const result = createChainResult({
      googleResults: [
        createGoogleResult("salary", 1, "https://www.glassdoor.com/Salary/example"),
      ],
      llmResponses: [
        createLlmResponse("chatgpt", "salary", [
          "https://www.glassdoor.com/Salary/example",
        ]),
      ],
    });

    const analysis = analyseGaps(result, "acme.com");
    const categorySet = new Set(analysis.rows.map((row) => row.category));

    expect(analysis.rows).toHaveLength(8);
    expect(categorySet.size).toBe(8);
    expect(Array.from(categorySet).sort()).toEqual(
      PROMPT_CATEGORIES.map((category) => category.id).sort()
    );
  });

  it("sorts rows by impact descending (high, then medium, then low)", () => {
    const analysis = analyseGaps(createChainResult(), "acme.com");
    const impactRank: Record<"high" | "medium" | "low", number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    const ranks = analysis.rows.map((row) => impactRank[row.impactLevel]);

    for (let index = 0; index < ranks.length - 1; index += 1) {
      expect(ranks[index]).toBeGreaterThanOrEqual(ranks[index + 1]);
    }
  });
});

function createChainResult(
  partial: Partial<CitationChainResult> = {}
): CitationChainResult {
  return {
    companyName: "Acme",
    companyDomain: "acme.com",
    googleResults: [],
    llmResponses: [],
    sourceMappings: [],
    citationScore: 0,
    timestamp: "2026-02-11T00:00:00.000Z",
    errors: [],
    ...partial,
  };
}

function createGoogleResult(
  category: PromptCategoryId,
  position: number,
  url: string
): GoogleResult {
  return {
    category,
    query: `${category} query`,
    url,
    domain: extractDomain(url),
    title: `Result ${position}`,
    snippet: `Snippet ${position}`,
    position,
  };
}

function createLlmResponse(
  modelId: CitationChainModelId,
  category: PromptCategoryId,
  citations: string[]
): LlmResponse {
  return {
    modelId,
    category,
    prompt: `${category} prompt`,
    response: `${modelId} response`,
    citations,
    latencyMs: 100,
  };
}

function extractDomain(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}
