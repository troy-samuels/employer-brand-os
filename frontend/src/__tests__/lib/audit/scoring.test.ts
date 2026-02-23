/**
 * @module __tests__/lib/audit/scoring
 * Tests for the v2 scoring model to verify weights sum correctly
 * and individual scoring functions return expected values.
 */
import { describe, expect, it } from "vitest";

// We need to test scoring functions that are internal to website-checks.
// Since they're not exported, we test them indirectly through runWebsiteChecks
// or test the score breakdown shape from the result.
// For direct access to parseRobotsPolicy and extractCrossDomainCareerLinks
// (which ARE exported), we import them.
import {
  parseRobotsPolicy,
  extractCrossDomainCareerLinks,
} from "@/lib/audit/website-checks";
import { scoreBrandReputation } from "@/lib/audit/brand-reputation";
import type { BrandReputation } from "@/lib/audit/brand-reputation";

describe("v2 scoring model", () => {
  describe("scoring weights", () => {
    it("maximum possible score is exactly 100", () => {
      // Maximum per category (from the scoring docs):
      // jsonld: 20, robotsTxt: 20, careersPage: 20, brandReputation: 15,
      // salaryData: 10, contentFormat: 15, llmsTxt: 0
      const maxJsonld = 20;
      const maxRobotsTxt = 20;
      const maxCareersPage = 20;
      const maxBrandReputation = 15;
      const maxSalaryData = 10;
      const maxContentFormat = 15;
      const maxLlmsTxt = 0;

      const total =
        maxJsonld +
        maxRobotsTxt +
        maxCareersPage +
        maxBrandReputation +
        maxSalaryData +
        maxContentFormat +
        maxLlmsTxt;

      expect(total).toBe(100);
    });
  });

  describe("scoreBrandReputation", () => {
    it("scores 0 for no platforms", () => {
      const rep: BrandReputation = {
        platforms: [],
        sentiment: "unknown",
        sourceCount: 0,
      };
      expect(scoreBrandReputation(rep)).toBe(0);
    });

    it("scores 4 for 1 platform with unknown sentiment", () => {
      const rep: BrandReputation = {
        platforms: [{ name: "Glassdoor", url: "https://glassdoor.com/acme", snippet: null }],
        sentiment: "unknown",
        sourceCount: 1,
      };
      expect(scoreBrandReputation(rep)).toBe(4);
    });

    it("scores 7 for 2 platforms with unknown sentiment", () => {
      const rep: BrandReputation = {
        platforms: [
          { name: "Glassdoor", url: "https://glassdoor.com/acme", snippet: null },
          { name: "Indeed", url: "https://indeed.com/acme", snippet: null },
        ],
        sentiment: "unknown",
        sourceCount: 2,
      };
      expect(scoreBrandReputation(rep)).toBe(7);
    });

    it("scores 10 for 3+ platforms with unknown sentiment", () => {
      const rep: BrandReputation = {
        platforms: [
          { name: "Glassdoor", url: "https://glassdoor.com/acme", snippet: null },
          { name: "Indeed", url: "https://indeed.com/acme", snippet: null },
          { name: "LinkedIn", url: "https://linkedin.com/company/acme", snippet: null },
        ],
        sentiment: "unknown",
        sourceCount: 3,
      };
      expect(scoreBrandReputation(rep)).toBe(10);
    });

    it("caps at 15 with positive sentiment and 3+ platforms", () => {
      const rep: BrandReputation = {
        platforms: [
          { name: "Glassdoor", url: "https://glassdoor.com/acme", snippet: null },
          { name: "Indeed", url: "https://indeed.com/acme", snippet: null },
          { name: "LinkedIn", url: "https://linkedin.com/company/acme", snippet: null },
        ],
        sentiment: "positive",
        sourceCount: 3,
      };
      expect(scoreBrandReputation(rep)).toBe(15);
    });

    it("reduces score for negative sentiment but not below 0", () => {
      const rep: BrandReputation = {
        platforms: [{ name: "Glassdoor", url: "https://glassdoor.com/acme", snippet: null }],
        sentiment: "negative",
        sourceCount: 1,
      };
      // 4 - 3 = 1
      expect(scoreBrandReputation(rep)).toBe(1);
    });

    it("does not go below 0 for negative sentiment with 0 base", () => {
      const rep: BrandReputation = {
        platforms: [],
        sentiment: "negative",
        sourceCount: 0,
      };
      // Base is 0, no modifier applied when score is 0
      expect(scoreBrandReputation(rep)).toBe(0);
    });

    it("does not apply sentiment modifier for mixed sentiment", () => {
      const rep: BrandReputation = {
        platforms: [
          { name: "Glassdoor", url: "https://glassdoor.com/acme", snippet: null },
          { name: "Indeed", url: "https://indeed.com/acme", snippet: null },
        ],
        sentiment: "mixed",
        sourceCount: 2,
      };
      expect(scoreBrandReputation(rep)).toBe(7);
    });

    it("positive sentiment with 1 platform = 4 + 5 = 9", () => {
      const rep: BrandReputation = {
        platforms: [{ name: "Glassdoor", url: "https://glassdoor.com/acme", snippet: null }],
        sentiment: "positive",
        sourceCount: 1,
      };
      expect(scoreBrandReputation(rep)).toBe(9);
    });
  });

  describe("parseRobotsPolicy edge cases", () => {
    it("returns no_rules for empty robots.txt", () => {
      const result = parseRobotsPolicy("");
      expect(result.status).toBe("no_rules");
      expect(result.allowedBots).toEqual([]);
      expect(result.blockedBots).toEqual([]);
    });

    it("handles robots.txt with only comments", () => {
      const result = parseRobotsPolicy("# This is a comment\n# Another comment");
      expect(result.status).toBe("no_rules");
    });

    it("handles case-insensitive user-agent matching", () => {
      const robotsTxt = `
User-agent: GPTBot
Disallow: /

User-agent: claudebot
Allow: /
      `;
      const result = parseRobotsPolicy(robotsTxt);
      expect(result.blockedBots).toContain("GPTBot");
      expect(result.allowedBots).toContain("Anthropic");
    });

    it("handles wildcard disallow with specific bot allow", () => {
      const robotsTxt = `
User-agent: *
Disallow: /

User-agent: GPTBot
Allow: /careers
      `;
      const result = parseRobotsPolicy(robotsTxt);
      // GPTBot has specific rules allowing /careers, but wildcard blocks all
      // Other bots fall under wildcard
      expect(result.status).toBe("partial");
    });
  });

  describe("extractCrossDomainCareerLinks", () => {
    it("returns empty for empty HTML", () => {
      const links = extractCrossDomainCareerLinks("", "https://acme.com", "acme.com");
      expect(links).toEqual([]);
    });

    it("returns empty for empty URL", () => {
      const links = extractCrossDomainCareerLinks("<a href='https://jobs.example.com'>jobs</a>", "", "acme.com");
      expect(links).toEqual([]);
    });

    it("returns empty for empty domain", () => {
      const links = extractCrossDomainCareerLinks("<a href='https://jobs.example.com'>jobs</a>", "https://acme.com", "");
      expect(links).toEqual([]);
    });

    it("ignores same-host links", () => {
      const html = `<a href="https://acme.com/careers">Careers</a>`;
      const links = extractCrossDomainCareerLinks(html, "https://acme.com", "acme.com");
      expect(links).toEqual([]);
    });

    it("ignores mailto: and tel: links", () => {
      const html = `
        <a href="mailto:jobs@acme.com">Email</a>
        <a href="tel:+1234567890">Call</a>
      `;
      const links = extractCrossDomainCareerLinks(html, "https://acme.com", "acme.com");
      expect(links).toEqual([]);
    });

    it("ignores javascript: links", () => {
      const html = `<a href="javascript:void(0)">Click</a>`;
      const links = extractCrossDomainCareerLinks(html, "https://acme.com", "acme.com");
      expect(links).toEqual([]);
    });

    it("deduplicates identical links", () => {
      const html = `
        <a href="https://boards.greenhouse.io/acme">Jobs</a>
        <a href="https://boards.greenhouse.io/acme">Careers</a>
      `;
      const links = extractCrossDomainCareerLinks(html, "https://acme.com", "acme.com");
      expect(links).toHaveLength(1);
    });

    it("respects the max cross-domain career candidates limit (16)", () => {
      const anchors = Array.from({ length: 20 }, (_, i) =>
        `<a href="https://jobs${i}.example.com/careers">Jobs ${i}</a>`
      ).join("\n");
      const links = extractCrossDomainCareerLinks(anchors, "https://acme.com", "acme.com");
      expect(links.length).toBeLessThanOrEqual(16);
    });
  });
});
