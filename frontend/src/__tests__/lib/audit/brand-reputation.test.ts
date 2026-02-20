import { afterEach, describe, expect, it, vi } from "vitest";

import { checkBrandReputation, scoreBrandReputation } from "@/lib/audit/brand-reputation";

describe("brand-reputation", () => {
  const originalBraveApiKey = process.env.BRAVE_SEARCH_API_KEY;

  afterEach(() => {
    if (originalBraveApiKey === undefined) {
      delete process.env.BRAVE_SEARCH_API_KEY;
    } else {
      process.env.BRAVE_SEARCH_API_KEY = originalBraveApiKey;
    }
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("falls back to Brave HTML search when BRAVE_SEARCH_API_KEY is not set", async () => {
    delete process.env.BRAVE_SEARCH_API_KEY;

    const htmlSearchResults = `
      <div class="snippet">
        <a href="https://www.glassdoor.co.uk/Reviews/Tesco-Reviews-E10250.htm">
          <div class="title">Tesco Reviews | Glassdoor</div>
        </a>
        <div class="content">Great place to work with excellent culture.</div>
      </div>
      <div class="snippet">
        <a href="https://uk.indeed.com/cmp/Tesco/reviews">
          <div class="title">Working at Tesco | Indeed</div>
        </a>
        <div class="content">Recommended by many employees.</div>
      </div>
      <div class="snippet">
        <a href="https://www.linkedin.com/company/tesco/jobs/">
          <div class="title">Tesco Jobs | LinkedIn</div>
        </a>
        <div class="content">Company profile and open roles.</div>
      </div>
    `;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(htmlSearchResults),
    });

    vi.stubGlobal("fetch", fetchMock);

    const reputation = await checkBrandReputation("Tesco");
    const platformNames = reputation.platforms.map((platform) => platform.name);

    expect(platformNames).toContain("Glassdoor");
    expect(platformNames).toContain("Indeed");
    expect(platformNames).toContain("LinkedIn");
    expect(reputation.sourceCount).toBe(3);
    expect(scoreBrandReputation(reputation)).toBeGreaterThan(0);
  });

  it("uses Brave API results directly when BRAVE_SEARCH_API_KEY is configured", async () => {
    process.env.BRAVE_SEARCH_API_KEY = "test-api-key";

    const fetchMock = vi.fn().mockImplementation((input: string | URL) => {
      const url = String(input);
      const query = new URL(url).searchParams.get("q") ?? "";

      const results = query.includes("linkedin")
        ? [
            {
              title: "Tesco | LinkedIn",
              url: "https://www.linkedin.com/company/tesco/",
              description: "Top employer",
            },
          ]
        : [
            {
              title: "Tesco Reviews | Glassdoor",
              url: "https://www.glassdoor.co.uk/Reviews/Tesco-Reviews-E10250.htm",
              description: "Great benefits",
            },
            {
              title: "Working at Tesco | Indeed",
              url: "https://uk.indeed.com/cmp/Tesco/reviews",
              description: "Highly rated",
            },
          ];

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ web: { results } }),
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const reputation = await checkBrandReputation("Tesco");
    const platformNames = reputation.platforms.map((platform) => platform.name);

    expect(platformNames).toContain("Glassdoor");
    expect(platformNames).toContain("Indeed");
    expect(platformNames).toContain("LinkedIn");
    expect(reputation.sourceCount).toBe(3);
    const usedHtmlFallback = fetchMock.mock.calls.some(([url]) =>
      String(url).includes("search.brave.com/search"),
    );
    expect(usedHtmlFallback).toBe(false);
  });
});
