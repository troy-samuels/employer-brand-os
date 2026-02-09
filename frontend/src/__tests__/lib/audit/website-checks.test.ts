import { beforeEach, describe, expect, it, vi } from "vitest";

import { parseRobotsPolicy, runWebsiteChecks } from "@/lib/audit/website-checks";
import { validateUrl } from "@/lib/audit/url-validator";

vi.mock("@/lib/audit/url-validator", () => ({
  validateUrl: vi.fn(),
}));

describe("website-checks", () => {
  const validationPass = {
    ok: true as const,
    normalizedUrl: new URL("https://example.com"),
    resolvedAddresses: ["93.184.216.34"],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(validateUrl).mockResolvedValue(validationPass);
  });

  describe("parseRobotsPolicy", () => {
    it("uses User-agent: * fallback and keeps specific AI allows", () => {
      const robots = `
User-agent: *
Disallow: /

User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /
`;

      const parsed = parseRobotsPolicy(robots);

      expect(parsed.status).toBe("partial");
      expect(parsed.allowedBots).toEqual(["GPTBot", "Google-Extended"]);
      expect(parsed.blockedBots).toEqual([
        "ChatGPT-User",
        "Anthropic",
        "CCBot",
      ]);
    });

    it("scores as allows when wildcard blocks but all tracked AI bots are explicitly allowed", () => {
      const robots = `
User-agent: *
Disallow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /
`;

      const parsed = parseRobotsPolicy(robots);

      expect(parsed.status).toBe("allows");
      expect(parsed.allowedBots).toEqual([
        "GPTBot",
        "ChatGPT-User",
        "Google-Extended",
        "Anthropic",
        "CCBot",
      ]);
      expect(parsed.blockedBots).toEqual([]);
    });

    it("returns no_rules when tracked AI crawlers have no directives", () => {
      const robots = `User-agent: bingbot\nDisallow: /private`;

      const parsed = parseRobotsPolicy(robots);

      expect(parsed.status).toBe("no_rules");
      expect(parsed.allowedBots).toEqual([]);
      expect(parsed.blockedBots).toEqual([]);
    });

    it("returns blocks when wildcard disallows everything", () => {
      const parsed = parseRobotsPolicy("User-agent: *\nDisallow: /");

      expect(parsed.status).toBe("blocks");
      expect(parsed.allowedBots).toEqual([]);
      expect(parsed.blockedBots).toEqual([
        "GPTBot",
        "ChatGPT-User",
        "Google-Extended",
        "Anthropic",
        "CCBot",
      ]);
    });
  });

  describe("runWebsiteChecks", () => {
    function createFetchMock(careersHtml: string) {
      return vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/llms.txt")) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve(""),
          });
        }

        if (url.endsWith("/robots.txt")) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve(""),
          });
        }

        if (url.endsWith("/careers")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(careersHtml),
          });
        }

        if (url.endsWith("/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve("<html><body>Homepage content</body></html>"),
          });
        }

        return Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve(""),
        });
      });
    }

    it("uses JobPosting baseSalary JSON-LD as highest-confidence salary signal", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          '<html><head><script type="application/ld+json">{"@context":"https://schema.org","@type":"JobPosting","title":"Software Engineer","baseSalary":{"@type":"MonetaryAmount","currency":"GBP","value":{"@type":"QuantitativeValue","minValue":50000,"maxValue":70000,"unitText":"YEAR"}}}</script></head><body>£50,000 - £70,000</body></html>',
        ),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      expect(result.hasSalaryData).toBe(true);
      expect(result.salaryConfidence).toBe("jsonld_base_salary");
      expect(result.scoreBreakdown.salaryData).toBe(20);
      expect(result.detectedCurrency).toBe("GBP");
    });

    it("scores 15 when multiple concrete salary ranges are listed on careers page", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          "<html><body><h2>Software Engineer</h2><p>£50,000 - £70,000</p><h2>Product Manager</h2><p>£80k to £100k</p></body></html>",
        ),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      expect(result.hasSalaryData).toBe(true);
      expect(result.salaryConfidence).toBe("multiple_ranges");
      expect(result.scoreBreakdown.salaryData).toBe(15);
    });

    it("scores 5 for mention-only salary language with no disclosed range", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          "<html><body><h2>Open Roles</h2><p>We offer a competitive salary and benefits package.</p></body></html>",
        ),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      expect(result.hasSalaryData).toBe(true);
      expect(result.salaryConfidence).toBe("mention_only");
      expect(result.scoreBreakdown.salaryData).toBe(5);
    });

    it("does not score salary data when careers page has no salary references", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          "<html><body><h2>Open Roles</h2><p>Join our mission and build great products.</p></body></html>",
        ),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      expect(result.hasSalaryData).toBe(false);
      expect(result.salaryConfidence).toBe("none");
      expect(result.scoreBreakdown.salaryData).toBe(0);
    });

    it("detects salary data from linked job listing pages when careers index has none", async () => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/llms.txt")) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve(""),
          });
        }

        if (url.endsWith("/robots.txt")) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve(""),
          });
        }

        if (url.endsWith("/careers")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () =>
              Promise.resolve(
                '<html><body><h2>Open Roles</h2><a href="/jobs/staff-frontend-engineer">Staff Frontend Engineer</a><a href="/about">About us</a></body></html>',
              ),
          });
        }

        if (url.endsWith("/jobs/staff-frontend-engineer")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () =>
              Promise.resolve(
                "<html><body><h1>Staff Frontend Engineer</h1><p>Compensation: $145,000 - $175,000</p></body></html>",
              ),
          });
        }

        if (url.endsWith("/")) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve("<html><body>Homepage content</body></html>"),
          });
        }

        return Promise.resolve({
          ok: false,
          status: 404,
          text: () => Promise.resolve(""),
        });
      });

      vi.stubGlobal("fetch", fetchMock);

      const result = await runWebsiteChecks("example.com", "Example");
      const fetchedUrls = fetchMock.mock.calls.map((call) => call[0]);

      expect(result.hasSalaryData).toBe(true);
      expect(result.salaryConfidence).toBe("single_range");
      expect(result.scoreBreakdown.salaryData).toBe(10);
      expect(fetchedUrls).toContain("https://example.com/jobs/staff-frontend-engineer");
      expect(fetchedUrls).not.toContain("https://example.com/about");
    });

    it("returns partial robots scoring with accurate allowed/blocked bot lists", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation((url: string) => {
          if (url.endsWith("/llms.txt")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              text: () => Promise.resolve("Careers and hiring information."),
            });
          }

          if (url.endsWith("/robots.txt")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              text: () =>
                Promise.resolve(
                  "User-agent: *\nDisallow: /\n\nUser-agent: GPTBot\nAllow: /",
                ),
            });
          }

          if (url.endsWith("/careers")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              text: () => Promise.resolve(`<html><body>${"Join us. ".repeat(220)}Salary included.</body></html>`),
            });
          }

          if (url.endsWith("/")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              text: () =>
                Promise.resolve(
                  '<html><head><script type="application/ld+json">{"@type":"Organization"}</script></head><body>Home</body></html>',
                ),
            });
          }

          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve(""),
          });
        }),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      expect(result.robotsTxtStatus).toBe("partial");
      expect(result.robotsTxtAllowedBots).toEqual(["GPTBot"]);
      expect(result.robotsTxtBlockedBots).toEqual([
        "ChatGPT-User",
        "Google-Extended",
        "Anthropic",
        "CCBot",
      ]);
      expect(result.scoreBreakdown.robotsTxt).toBeGreaterThan(8);
      expect(result.scoreBreakdown.robotsTxt).toBeLessThan(15);
    });

    it("does not call fetch when URL validation fails", async () => {
      vi.mocked(validateUrl).mockResolvedValue({
        ok: false,
        reason: "private_network",
      });
      vi.stubGlobal("fetch", vi.fn());

      const result = await runWebsiteChecks("127.0.0.1", "Localhost");

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.score).toBe(0);
      expect(result.robotsTxtStatus).toBe("not_found");
      expect(result.robotsTxtAllowedBots).toEqual([]);
      expect(result.robotsTxtBlockedBots).toEqual([]);
    });

    it("detects multiple currency formats including non-Western", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          "<html><body><h2>Engineer</h2><p>¥5,000,000 - ¥8,000,000</p></body></html>",
        ),
      );

      const result = await runWebsiteChecks("example.co.jp", "Example Japan");

      expect(result.hasSalaryData).toBe(true);
      expect(result.detectedCurrency).toBe("JPY");
    });

    it("detects sitemap.xml when present", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation((url: string) => {
          if (url.endsWith("/sitemap.xml")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              text: () => Promise.resolve('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'),
            });
          }

          if (url.endsWith("/llms.txt")) {
            return Promise.resolve({
              ok: false,
              status: 404,
              text: () => Promise.resolve(""),
            });
          }

          if (url.endsWith("/robots.txt")) {
            return Promise.resolve({
              ok: false,
              status: 404,
              text: () => Promise.resolve(""),
            });
          }

          if (url.endsWith("/careers")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              text: () => Promise.resolve("<html><body>Join us</body></html>"),
            });
          }

          if (url.endsWith("/")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              text: () => Promise.resolve("<html><body>Home</body></html>"),
            });
          }

          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve(""),
          });
        }),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      expect(result.hasSitemap).toBe(true);
    });

    it("detects international careers paths", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation((url: string) => {
          if (url.endsWith("/karriere")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              text: () => Promise.resolve(`<html><body>${"Arbeiten Sie mit uns. ".repeat(220)}</body></html>`),
            });
          }

          if (url.endsWith("/llms.txt")) {
            return Promise.resolve({
              ok: false,
              status: 404,
              text: () => Promise.resolve(""),
            });
          }

          if (url.endsWith("/robots.txt")) {
            return Promise.resolve({
              ok: false,
              status: 404,
              text: () => Promise.resolve(""),
            });
          }

          if (url.endsWith("/sitemap.xml")) {
            return Promise.resolve({
              ok: false,
              status: 404,
              text: () => Promise.resolve(""),
            });
          }

          if (url.endsWith("/careers") || url.endsWith("/jobs") || url.endsWith("/careers/") || url.endsWith("/jobs/")) {
            return Promise.resolve({
              ok: false,
              status: 404,
              text: () => Promise.resolve(""),
            });
          }

          if (url.endsWith("/")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              text: () => Promise.resolve("<html><body>Home</body></html>"),
            });
          }

          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve(""),
          });
        }),
      );

      const result = await runWebsiteChecks("example.de", "Example DE");

      expect(result.careersPageStatus).toBe("full");
      expect(result.careersPageUrl).toBe("https://example.de/karriere");
    });
  });
});
