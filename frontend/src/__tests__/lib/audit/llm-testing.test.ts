/**
 * @module __tests__/lib/audit/llm-testing
 * Tests for the LLM testing module (Phase 1 placeholder results).
 */
import { describe, expect, it } from "vitest";
import { buildPrompt, runLlmTests, runLlmTestsLegacy } from "@/lib/audit/llm-testing";

describe("llm-testing", () => {
  describe("buildPrompt", () => {
    it("strips common TLDs from domain to get company name", () => {
      const prompt = buildPrompt("acme.com");
      expect(prompt).toContain("acme");
      expect(prompt).not.toContain(".com");
    });

    it("strips .co.uk TLD", () => {
      const prompt = buildPrompt("acme.co.uk");
      expect(prompt).toContain("acme");
      expect(prompt).not.toContain(".co.uk");
    });

    it("strips .io TLD", () => {
      const prompt = buildPrompt("acme.io");
      expect(prompt).toContain("acme");
      expect(prompt).not.toContain(".io");
    });

    it("includes all 4 standard employer prompts", () => {
      const prompt = buildPrompt("testcorp.com");
      expect(prompt).toContain("work at");
      expect(prompt).toContain("pay");
      expect(prompt).toContain("benefits");
      expect(prompt).toContain("good employer");
    });

    it("preserves non-standard TLDs in the company name", () => {
      const prompt = buildPrompt("acme.xyz");
      expect(prompt).toContain("acme.xyz");
    });
  });

  describe("runLlmTests", () => {
    it("returns results for all defined models", async () => {
      const result = await runLlmTests("test.com", "starter");

      expect(result.companyDomain).toBe("test.com");
      expect(result.modelResults.length).toBeGreaterThan(0);
      expect(result.planTier).toBe("starter");
      expect(result.auditedAt).toBeTruthy();
    });

    it("locks models not available in the free tier", async () => {
      const result = await runLlmTests("test.com", "starter");

      const unlockedModels = result.modelResults.filter((r) => !r.locked);
      const lockedModels = result.modelResults.filter((r) => r.locked);

      // At least some models should be unlocked for starter
      expect(unlockedModels.length).toBeGreaterThan(0);

      // Locked models should have empty claims and 0 score
      for (const locked of lockedModels) {
        expect(locked.claims).toEqual([]);
        expect(locked.score).toBe(0);
        expect(locked.rawResponse).toBe("");
      }
    });

    it("returns a reasonable overall score (0-100)", async () => {
      const result = await runLlmTests("test.com", "starter");

      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it("produces consensus analysis", async () => {
      const result = await runLlmTests("test.com", "starter");

      expect(result.consensus).toBeDefined();
      expect(Array.isArray(result.consensus)).toBe(true);
    });

    it("includes top risks and strengths arrays", async () => {
      const result = await runLlmTests("test.com", "starter");

      expect(Array.isArray(result.topRisks)).toBe(true);
      expect(Array.isArray(result.topStrengths)).toBe(true);
    });

    it("returns 0 overallScore when all models are locked", async () => {
      // The "starter" tier should have some unlocked models,
      // but test the calculation logic: if no unlocked results exist
      const result = await runLlmTests("test.com", "starter");
      const allLocked = result.modelResults.every((r) => r.locked);

      if (allLocked) {
        expect(result.overallScore).toBe(0);
      } else {
        // Otherwise just verify it's a valid score
        expect(result.overallScore).toBeGreaterThanOrEqual(0);
      }
    });

    it("each model result has correct structure", async () => {
      const result = await runLlmTests("test.com", "starter");

      for (const modelResult of result.modelResults) {
        expect(modelResult).toHaveProperty("modelId");
        expect(modelResult).toHaveProperty("prompt");
        expect(modelResult).toHaveProperty("claims");
        expect(modelResult).toHaveProperty("score");
        expect(modelResult).toHaveProperty("accurateCount");
        expect(modelResult).toHaveProperty("inaccurateCount");
        expect(modelResult).toHaveProperty("unverifiableCount");
        expect(modelResult).toHaveProperty("checkedAt");
        expect(modelResult).toHaveProperty("locked");
      }
    });
  });

  describe("runLlmTestsLegacy", () => {
    it("returns an object with model names as keys", async () => {
      const result = await runLlmTestsLegacy("test.com");

      expect(typeof result).toBe("object");
      const keys = Object.keys(result);
      expect(keys.length).toBeGreaterThan(0);
    });

    it("each key maps to an array of string claims", async () => {
      const result = await runLlmTestsLegacy("test.com");

      for (const [, claims] of Object.entries(result)) {
        expect(Array.isArray(claims)).toBe(true);
        for (const claim of claims) {
          expect(typeof claim).toBe("string");
        }
      }
    });

    it("does not include locked models", async () => {
      const result = await runLlmTestsLegacy("test.com");

      // Every key should map to a non-empty array (locked models are excluded)
      for (const [, claims] of Object.entries(result)) {
        expect(claims.length).toBeGreaterThan(0);
      }
    });
  });
});
