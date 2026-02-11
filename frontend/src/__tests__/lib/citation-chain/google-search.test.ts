/**
 * @module __tests__/lib/citation-chain/google-search.test
 * Tests for Google SERP retrieval and fallback behaviour.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchGoogleResults,
  getMockGoogleResults,
  normaliseDomain,
} from "@/lib/citation-chain/google-search";

const originalFetch = global.fetch;
const originalSerperKey = process.env.SERPER_API_KEY;

afterEach(() => {
  global.fetch = originalFetch;
  process.env.SERPER_API_KEY = originalSerperKey;
  vi.restoreAllMocks();
});

describe("google-search", () => {
  it("returns 10 realistic mock results without an API key", async () => {
    delete process.env.SERPER_API_KEY;

    const results = await fetchGoogleResults("Monzo software engineer salary", {
      category: "salary",
    });

    expect(results).toHaveLength(10);
    expect(results[0]).toMatchObject({
      category: "salary",
      query: "Monzo software engineer salary",
      position: 1,
    });
    expect(results.map((result) => result.domain)).toContain("glassdoor.com");
    expect(results.map((result) => result.domain)).toContain("indeed.com");
    expect(results.map((result) => result.domain)).toContain("reddit.com");
  });

  it("maps Serper organic results to the GoogleResult shape", async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({
          organic: [
            {
              title: "Example Careers",
              link: "https://www.example.com/careers",
              snippet: "Work at Example",
              position: 3,
            },
          ],
        }),
        { status: 200 }
      )) as typeof fetch;

    const results = await fetchGoogleResults("Example employee reviews", {
      category: "reviews",
      apiKey: "serper-test-key",
    });

    expect(results).toEqual([
      {
        category: "reviews",
        query: "Example employee reviews",
        url: "https://www.example.com/careers",
        domain: "example.com",
        title: "Example Careers",
        snippet: "Work at Example",
        position: 3,
      },
    ]);
  });

  it("normalises domains from URLs and hostnames", () => {
    expect(normaliseDomain("https://www.Glassdoor.co.uk/Reviews")).toBe("glassdoor.co.uk");
    expect(normaliseDomain("reddit.com")).toBe("reddit.com");
    expect(normaliseDomain("not-a-domain")).toBe("");
  });

  it("builds company-specific mock data", () => {
    const results = getMockGoogleResults("Revolut employee reviews", "reviews");

    expect(results[0]?.title).toContain("Revolut");
    expect(results[0]?.snippet).toContain("Revolut");
  });
});
