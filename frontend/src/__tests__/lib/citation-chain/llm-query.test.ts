/**
 * @module __tests__/lib/citation-chain/llm-query.test
 * Tests for model query mocks and timeout behaviour.
 */

import { describe, expect, it } from "vitest";

import { queryModel } from "@/lib/citation-chain/llm-query";

describe("llm-query", () => {
  it("returns company-specific response and realistic citations", async () => {
    const result = await queryModel(
      "chatgpt",
      "What is the salary for a Software Engineer at Monzo?",
      { category: "salary", timeoutMs: 3_000 }
    );

    expect(result.modelId).toBe("chatgpt");
    expect(result.response).toContain("Monzo");
    expect(result.citations.some((citation) => citation.includes("glassdoor"))).toBe(true);
    expect(result.citations.some((citation) => citation.includes("indeed"))).toBe(true);
    expect(result.citations.some((citation) => citation.includes("reddit"))).toBe(true);
  });

  it("supports the three required models", async () => {
    const [chatgpt, claude, perplexity] = await Promise.all([
      queryModel("chatgpt", "How do employees review working at Stripe?", {
        category: "reviews",
        timeoutMs: 3_000,
      }),
      queryModel("claude", "How do employees review working at Stripe?", {
        category: "reviews",
        timeoutMs: 3_000,
      }),
      queryModel("perplexity", "How do employees review working at Stripe?", {
        category: "reviews",
        timeoutMs: 3_000,
      }),
    ]);

    expect([chatgpt.modelId, claude.modelId, perplexity.modelId]).toEqual([
      "chatgpt",
      "claude",
      "perplexity",
    ]);
  });

  it("throws when model query exceeds timeout", async () => {
    await expect(
      queryModel("claude", "What is the work culture like at Starling Bank?", {
        category: "culture",
        timeoutMs: 1,
      })
    ).rejects.toThrow("timed out");
  });
});
