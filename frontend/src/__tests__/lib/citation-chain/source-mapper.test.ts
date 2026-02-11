/**
 * @module __tests__/lib/citation-chain/source-mapper.test
 * Tests for citation-to-SERP source mapping.
 */

import { describe, expect, it } from "vitest";

import {
  classifySourceType,
  getCanonicalDomainKey,
  mapSources,
} from "@/lib/citation-chain/source-mapper";
import type { GoogleResult, LlmResponse } from "@/lib/citation-chain/types";

describe("source-mapper", () => {
  it("matches Glassdoor citations across regional domains", () => {
    const googleResults: GoogleResult[] = [
      {
        category: "reviews",
        query: "Monzo employee reviews",
        url: "https://www.glassdoor.co.uk/Reviews/Monzo-Reviews-E12345.htm",
        domain: "glassdoor.co.uk",
        title: "Monzo Reviews | Glassdoor",
        snippet: "Employee reviews",
        position: 2,
      },
    ];

    const llmResponses: LlmResponse[] = [
      {
        modelId: "chatgpt",
        category: "reviews",
        prompt: "How do employees review working at Monzo?",
        response: "Mixed reviews.",
        citations: ["https://www.glassdoor.com/Reviews/Monzo-Reviews-E12345.htm"],
        latencyMs: 100,
      },
      {
        modelId: "claude",
        category: "reviews",
        prompt: "How do employees review working at Monzo?",
        response: "Mostly positive reviews.",
        citations: ["https://www.glassdoor.sg/Reviews/Monzo-Reviews-E12345.htm"],
        latencyMs: 110,
      },
      {
        modelId: "perplexity",
        category: "reviews",
        prompt: "How do employees review working at Monzo?",
        response: "Discussion threads vary.",
        citations: ["https://www.reddit.com/r/jobs/comments/1"],
        latencyMs: 95,
      },
    ];

    const mappings = mapSources(googleResults, llmResponses, "monzo.com");

    expect(mappings).toEqual([
      {
        category: "reviews",
        googlePosition: 2,
        domain: "glassdoor.co.uk",
        citedByModels: ["chatgpt", "claude"],
        sourceType: "review-platform",
      },
    ]);
  });

  it("classifies employer sources when domain matches company", () => {
    expect(classifySourceType("careers.monzo.com", "monzo.com")).toBe("employer");
  });

  it("normalises regional Glassdoor domains to one canonical key", () => {
    expect(getCanonicalDomainKey("glassdoor.com")).toBe("glassdoor");
    expect(getCanonicalDomainKey("glassdoor.co.uk")).toBe("glassdoor");
    expect(getCanonicalDomainKey("glassdoor.sg")).toBe("glassdoor");
  });
});
