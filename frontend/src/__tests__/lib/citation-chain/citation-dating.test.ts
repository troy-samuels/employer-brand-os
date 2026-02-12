/**
 * @module __tests__/lib/citation-chain/citation-dating.test
 * Tests for citation freshness dating — URL extraction, domain blocking,
 * Wayback Machine integration, and aggregate analysis.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

import { analyseCitationFreshness } from "@/lib/citation-chain/citation-dating";
import type { LlmResponse } from "@/lib/citation-chain/types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const NOW = new Date("2026-02-12T10:00:00.000Z");

function createLlmResponse(
  modelId: "chatgpt" | "claude" | "perplexity",
  citations: string[],
): LlmResponse {
  return {
    modelId,
    category: "salary",
    prompt: "Test prompt",
    response: "Test response",
    citations,
    latencyMs: 100,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("citation-dating", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Mock fetch for Wayback Machine calls
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("[]", { status: 200 }),
    );
  });

  describe("URL date pattern extraction", () => {
    it("extracts full date from /YYYY/MM/DD/ path", async () => {
      const result = await analyseCitationFreshness(
        [createLlmResponse("chatgpt", ["https://blog.example.com/2023/06/15/article"])],
        { useWayback: false, now: NOW },
      );

      expect(result.citations).toHaveLength(1);
      expect(result.citations[0]!.date).toBe("2023-06-15");
      expect(result.citations[0]!.method).toBe("url-pattern");
      expect(result.citations[0]!.confidence).toBe("high");
      expect(result.citations[0]!.ageDays).toBeGreaterThan(600);
    });

    it("extracts month-level date from /YYYY/MM/ path", async () => {
      const result = await analyseCitationFreshness(
        [createLlmResponse("chatgpt", ["https://news.example.com/2024/03/article-title"])],
        { useWayback: false, now: NOW },
      );

      expect(result.citations[0]!.date).toBe("2024-03-15");
      expect(result.citations[0]!.confidence).toBe("medium");
    });

    it("extracts date from hyphenated path /YYYY-MM-DD/", async () => {
      const result = await analyseCitationFreshness(
        [createLlmResponse("claude", ["https://example.com/posts/2022-11-20/slug"])],
        { useWayback: false, now: NOW },
      );

      expect(result.citations[0]!.date).toBe("2022-11-20");
      expect(result.citations[0]!.method).toBe("url-pattern");
    });
  });

  describe("AI-blocking domain detection", () => {
    it("identifies Glassdoor as blocking AI crawlers", async () => {
      const result = await analyseCitationFreshness(
        [createLlmResponse("chatgpt", ["https://www.glassdoor.com/Reviews/Company-Reviews-E12345.htm"])],
        { useWayback: false, now: NOW },
      );

      expect(result.citations[0]!.blocksAiCrawlers).toBe(true);
      expect(result.citations[0]!.explanation).toContain("Cloudflare");
    });

    it("identifies Reddit as blocking AI crawlers", async () => {
      const result = await analyseCitationFreshness(
        [createLlmResponse("perplexity", ["https://www.reddit.com/r/cscareerquestions/comments/abc123/thread"])],
        { useWayback: false, now: NOW },
      );

      expect(result.citations[0]!.blocksAiCrawlers).toBe(true);
      expect(result.citations[0]!.explanation).toContain("Google AI deal");
    });

    it("identifies Indeed as blocking AI crawlers", async () => {
      const result = await analyseCitationFreshness(
        [createLlmResponse("claude", ["https://www.indeed.com/cmp/Acme/salaries"])],
        { useWayback: false, now: NOW },
      );

      expect(result.citations[0]!.blocksAiCrawlers).toBe(true);
    });

    it("identifies LinkedIn as blocking AI crawlers", async () => {
      const result = await analyseCitationFreshness(
        [createLlmResponse("chatgpt", ["https://www.linkedin.com/company/acme/jobs"])],
        { useWayback: false, now: NOW },
      );

      expect(result.citations[0]!.blocksAiCrawlers).toBe(true);
    });

    it("identifies TeamBlind as blocking AI crawlers", async () => {
      const result = await analyseCitationFreshness(
        [createLlmResponse("chatgpt", ["https://www.teamblind.com/post/Acme-salary-abc123"])],
        { useWayback: false, now: NOW },
      );

      expect(result.citations[0]!.blocksAiCrawlers).toBe(true);
    });

    it("does not flag non-blocking domains", async () => {
      const result = await analyseCitationFreshness(
        [createLlmResponse("chatgpt", ["https://www.acme.com/careers"])],
        { useWayback: false, now: NOW },
      );

      expect(result.citations[0]!.blocksAiCrawlers).toBe(false);
    });
  });

  describe("citation deduplication", () => {
    it("deduplicates the same URL cited by multiple models", async () => {
      const result = await analyseCitationFreshness(
        [
          createLlmResponse("chatgpt", ["https://www.glassdoor.com/Reviews/Acme-Reviews.htm"]),
          createLlmResponse("claude", ["https://www.glassdoor.com/Reviews/Acme-Reviews.htm"]),
          createLlmResponse("perplexity", ["https://www.glassdoor.com/Reviews/Acme-Reviews.htm"]),
        ],
        { useWayback: false, now: NOW },
      );

      expect(result.citations).toHaveLength(1);
      expect(result.citations[0]!.citedByModels).toContain("chatgpt");
      expect(result.citations[0]!.citedByModels).toContain("claude");
      expect(result.citations[0]!.citedByModels).toContain("perplexity");
    });
  });

  describe("aggregate analysis", () => {
    it("calculates median age across dated citations", async () => {
      const result = await analyseCitationFreshness(
        [
          createLlmResponse("chatgpt", [
            "https://blog.example.com/2024/01/15/recent",
            "https://blog.example.com/2022/06/15/old",
            "https://blog.example.com/2023/06/15/middle",
          ]),
        ],
        { useWayback: false, now: NOW },
      );

      expect(result.medianAgeDays).not.toBeNull();
      // Middle citation (2023-06-15) should be ~2.7 years = ~970 days
      expect(result.medianAgeDays).toBeGreaterThan(900);
      expect(result.medianAgeDays).toBeLessThan(1100);
    });

    it("calculates blocked source percentage", async () => {
      const result = await analyseCitationFreshness(
        [
          createLlmResponse("chatgpt", [
            "https://www.glassdoor.com/Reviews/Acme.htm",
            "https://www.reddit.com/r/jobs/thread",
            "https://www.acme.com/careers",
            "https://blog.example.com/2024/01/article",
          ]),
        ],
        { useWayback: false, now: NOW },
      );

      // 2 of 4 citations are from blocked domains
      expect(result.blockedSourcePercentage).toBe(50);
    });

    it("calculates date resolution rate", async () => {
      const result = await analyseCitationFreshness(
        [
          createLlmResponse("chatgpt", [
            "https://blog.example.com/2023/06/15/has-date",
            "https://www.glassdoor.com/Reviews/no-date.htm",
            "https://www.acme.com/careers",
          ]),
        ],
        { useWayback: false, now: NOW },
      );

      // 1 of 3 has a resolvable date (from URL pattern)
      expect(result.dateResolutionRate).toBe(33);
    });

    it("returns empty aggregates for no citations", async () => {
      const result = await analyseCitationFreshness([], { useWayback: false, now: NOW });

      expect(result.citations).toHaveLength(0);
      expect(result.medianAgeDays).toBeNull();
      expect(result.averageAgeDays).toBeNull();
      expect(result.oldestAgeDays).toBeNull();
      expect(result.blockedSourcePercentage).toBe(0);
      expect(result.dateResolutionRate).toBe(0);
    });
  });

  describe("freshness summary", () => {
    it("warns about stale data when median age exceeds 2 years", async () => {
      const result = await analyseCitationFreshness(
        [
          createLlmResponse("chatgpt", [
            "https://blog.example.com/2022/01/15/old-post",
            "https://news.example.com/2022/06/15/another-old",
          ]),
        ],
        { useWayback: false, now: NOW },
      );

      expect(result.summary).toContain("outdated");
    });

    it("warns about blocked sources when percentage is high", async () => {
      const result = await analyseCitationFreshness(
        [
          createLlmResponse("chatgpt", [
            "https://www.glassdoor.com/Reviews/Acme.htm",
            "https://www.reddit.com/r/jobs/thread",
            "https://www.indeed.com/cmp/Acme",
          ]),
        ],
        { useWayback: false, now: NOW },
      );

      expect(result.summary).toContain("block AI crawlers");
    });
  });

  describe("failed responses", () => {
    it("excludes citations from failed LLM responses", async () => {
      const failedResponse: LlmResponse = {
        modelId: "chatgpt",
        category: "salary",
        prompt: "Test",
        response: "",
        citations: ["https://example.com/should-be-excluded"],
        latencyMs: 0,
        failed: true,
        error: "Timeout",
      };

      const result = await analyseCitationFreshness(
        [failedResponse],
        { useWayback: false, now: NOW },
      );

      expect(result.citations).toHaveLength(0);
    });
  });

  describe("Wayback Machine integration", () => {
    it("falls back to Wayback when URL has no date pattern", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify([
            ["timestamp", "statuscode"],
            ["20231115120000", "200"],
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

      const result = await analyseCitationFreshness(
        [createLlmResponse("chatgpt", ["https://www.acme.com/careers"])],
        { useWayback: true, now: NOW },
      );

      expect(result.citations[0]!.date).toBe("2023-11-15");
      expect(result.citations[0]!.method).toBe("wayback-last-capture");
      expect(result.citations[0]!.confidence).toBe("medium");
    });

    it("handles Wayback API failure gracefully", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

      const result = await analyseCitationFreshness(
        [createLlmResponse("chatgpt", ["https://www.acme.com/careers"])],
        { useWayback: true, now: NOW },
      );

      expect(result.citations[0]!.date).toBeNull();
      expect(result.citations[0]!.method).toBe("unknown");
      expect(result.citations[0]!.confidence).toBe("none");
    });

    it("skips Wayback when useWayback is false", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      await analyseCitationFreshness(
        [createLlmResponse("chatgpt", ["https://www.acme.com/careers"])],
        { useWayback: false, now: NOW },
      );

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
