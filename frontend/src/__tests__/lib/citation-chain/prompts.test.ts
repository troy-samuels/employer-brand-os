/**
 * @module __tests__/lib/citation-chain/prompts.test
 * Tests for citation-chain prompt templates.
 */

import { describe, expect, it } from "vitest";

import {
  buildGoogleQuery,
  buildLlmPrompt,
  PROMPT_CATEGORIES,
} from "@/lib/citation-chain/prompts";

describe("citation-chain prompts", () => {
  it("defines exactly 8 required prompt categories", () => {
    expect(PROMPT_CATEGORIES).toHaveLength(8);
    expect(PROMPT_CATEGORIES.map((category) => category.id)).toEqual([
      "salary",
      "culture",
      "benefits",
      "remote_policy",
      "interview",
      "competitors",
      "reviews",
      "growth",
    ]);
  });

  it("interpolates company name into templates", () => {
    const prompt = buildLlmPrompt("salary", "Monzo", "Backend Engineer");

    expect(prompt).toBe("What is the salary for a Backend Engineer at Monzo?");
    expect(prompt).not.toContain("{company}");
    expect(prompt).not.toContain("{role}");
  });

  it("interpolates company name into Google queries", () => {
    const query = buildGoogleQuery("reviews", "Octopus Energy");

    expect(query).toContain("Octopus Energy");
    expect(query).toBe("Octopus Energy employee reviews");
  });
});
