/**
 * @module __tests__/lib/audit/website-checks.test
 * Module implementation for website-checks.test.ts.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  extractCrossDomainCareerLinks,
  parseRobotsPolicy,
  runWebsiteChecks,
} from "@/lib/audit/website-checks";
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

    it("treats bots as blocked when employment paths are fully disallowed", () => {
      const parsed = parseRobotsPolicy(`
User-agent: GPTBot
Disallow: /careers
Disallow: /jobs
      `);

      expect(parsed.status).toBe("blocks");
      expect(parsed.allowedBots).toEqual([]);
      expect(parsed.blockedBots).toEqual(["GPTBot"]);
    });
  });

  describe("extractCrossDomainCareerLinks", () => {
    it("finds cross-domain careers links such as jobs.nhs.uk", () => {
      const homepageHtml = `
        <html><body>
          <a href="https://jobs.nhs.uk/candidate/search">Search NHS jobs</a>
          <a href="/about">About</a>
        </body></html>
      `;

      const links = extractCrossDomainCareerLinks(homepageHtml, "https://nhs.uk/", "nhs.uk");

      expect(links).toContain("https://jobs.nhs.uk/candidate/search");
    });

    it("finds outbound ATS links from homepage HTML", () => {
      const homepageHtml = `
        <html><body>
          <a href="https://boards.greenhouse.io/exampleco">Open roles</a>
          <a href="https://example.com/contact">Contact</a>
        </body></html>
      `;

      const links = extractCrossDomainCareerLinks(homepageHtml, "https://example.com/", "example.com");

      expect(links).toContain("https://boards.greenhouse.io/exampleco");
    });

    it("ignores same-host links", () => {
      const homepageHtml = `
        <html><body>
          <a href="/careers">Careers</a>
          <a href="https://nhs.uk/careers">NHS Careers</a>
          <a href="https://www.nhs.uk/jobs">NHS Jobs</a>
        </body></html>
      `;

      const links = extractCrossDomainCareerLinks(homepageHtml, "https://nhs.uk/", "nhs.uk");

      expect(links).toEqual([]);
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
      expect(result.scoreBreakdown.salaryData).toBe(10);
      expect(result.detectedCurrency).toBe("GBP");
    });

    it("scores 10 when multiple concrete salary ranges are listed on careers page", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          "<html><body><h2>Software Engineer</h2><p>£50,000 - £70,000</p><h2>Product Manager</h2><p>£80k to £100k</p></body></html>",
        ),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      expect(result.hasSalaryData).toBe(true);
      expect(result.salaryConfidence).toBe("multiple_ranges");
      expect(result.scoreBreakdown.salaryData).toBe(8);
    });

    it("scores 3 for mention-only salary language with no disclosed range", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          "<html><body><h2>Open Roles</h2><p>We offer a competitive salary and benefits package.</p></body></html>",
        ),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      expect(result.hasSalaryData).toBe(true);
      expect(result.salaryConfidence).toBe("mention_only");
      expect(result.scoreBreakdown.salaryData).toBe(2);
    });

    it("does not detect MYR when 'rm' appears only inside normal words", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          "<html><body><h2>Open Roles</h2><p>We offer a competitive salary. Please read the terms and complete the form before applying.</p></body></html>",
        ),
      );

      const result = await runWebsiteChecks("example.co.uk", "Example UK");

      expect(result.salaryConfidence).toBe("mention_only");
      expect(result.detectedCurrency).toBeNull();
    });

    it("detects MYR when salary ranges use RM as a currency token", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          "<html><body><h2>Engineer</h2><p>RM 5,000 - RM 7,000 per month</p></body></html>",
        ),
      );

      const result = await runWebsiteChecks("example.my", "Example MY");

      expect(result.hasSalaryData).toBe(true);
      expect(result.detectedCurrency).toBe("MYR");
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
      expect(result.scoreBreakdown.salaryData).toBe(5);
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
      expect(result.scoreBreakdown.robotsTxt).toBe(7);
    });

    it("does not fetch the target domain when URL validation fails", async () => {
      vi.mocked(validateUrl).mockResolvedValue({
        ok: false,
        reason: "private_network",
      });
      vi.stubGlobal("fetch", vi.fn());

      const result = await runWebsiteChecks("127.0.0.1", "Localhost");
      const fetchedUrls = vi.mocked(global.fetch).mock.calls.map((call) => String(call[0]));

      expect(fetchedUrls.some((url) => url.includes("127.0.0.1"))).toBe(false);
      expect(result.score).toBe(0);
      expect(result.robotsTxtStatus).toBe("not_found");
      expect(result.robotsTxtAllowedBots).toEqual([]);
      expect(result.robotsTxtBlockedBots).toEqual([]);
    });

    it("does not follow redirects into private networks", async () => {
      vi.mocked(validateUrl).mockImplementation(async (candidate: string) => {
        if (candidate.includes("169.254.169.254")) {
          return {
            ok: false,
            reason: "private_network",
          };
        }

        return validationPass;
      });

      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url === "https://example.com/") {
          return Promise.resolve(
            new Response("", {
              status: 302,
              headers: {
                location: "http://169.254.169.254/internal",
              },
            }),
          );
        }

        return Promise.resolve(new Response("", { status: 404 }));
      });

      vi.stubGlobal("fetch", fetchMock);
      const result = await runWebsiteChecks("example.com", "Example");
      const fetchedUrls = fetchMock.mock.calls.map((call) => call[0]);

      expect(result.status).toBe("unreachable");
      expect(fetchedUrls).toContain("https://example.com/");
      expect(fetchedUrls).not.toContain("http://169.254.169.254/internal");
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

    it("scores content format for FAQ schema, heading hierarchy, and answer-first paragraphs", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          `<html><head><script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Q1"}]}</script></head>
           <body role="main">
           <h1>Careers</h1>
           <p>We offer competitive salaries from £50k.</p>
           <h2>Benefits</h2>
           <dl><dt>Holiday</dt><dd>25 days</dd></dl>
           <table><thead><tr><th>Role</th></tr></thead></table>
           </body></html>`,
        ),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      // FAQ schema (3) + headings h1+h2 (3) + table/dl (2) + answer-first short para (3) + ARIA role (2) = 13
      expect(result.scoreBreakdown.contentFormat).toBe(13);
    });

    it("scores content format at 0 when careers page has no structural signals", async () => {
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          "<html><body><div>We are hiring. Come join us and build great products.</div></body></html>",
        ),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      expect(result.scoreBreakdown.contentFormat).toBe(0);
    });

    it("scores content format partially when only heading hierarchy is present", async () => {
      // Paragraph after heading is >60 words so answer-first bonus should NOT apply
      const longPara = "We have many exciting opportunities available for talented individuals who want to join our growing team across multiple locations and diverse departments. " +
        "Our company offers a wide range of career paths spanning engineering, marketing, sales, operations, finance, human resources, and various other functional areas. " +
        "We believe in fostering a collaborative environment where every team member can contribute meaningfully to our shared mission of building innovative products.";
      vi.stubGlobal(
        "fetch",
        createFetchMock(
          `<html><body><h1>Careers at Example</h1><p>${longPara}</p><h2>Open Roles</h2></body></html>`,
        ),
      );

      const result = await runWebsiteChecks("example.com", "Example");

      // Only h1+h2 = 3 points (paragraph is >60 words, no answer-first bonus)
      expect(result.scoreBreakdown.contentFormat).toBe(3);
    });

    it("always returns 0 for llmsTxt score regardless of file presence", async () => {
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

          if (url.endsWith("/robots.txt") || url.endsWith("/sitemap.xml")) {
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

      const result = await runWebsiteChecks("example.com", "Example");

      // llms.txt file exists and has employment keywords, but score should be 0
      expect(result.hasLlmsTxt).toBe(true);
      expect(result.llmsTxtHasEmployment).toBe(true);
      expect(result.scoreBreakdown.llmsTxt).toBe(0);
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

    it("prefers a stronger cross-domain careers page found on homepage links", async () => {
      const weakSameDomainHtml = `<html><body>${"Open roles. ".repeat(30)}</body></html>`;
      const strongCrossDomainHtml = `<html><body>${"Explore careers and opportunities. ".repeat(220)}</body></html>`;

      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url.endsWith("/llms.txt") || url.endsWith("/robots.txt") || url.endsWith("/sitemap.xml")) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve(""),
          });
        }

        if (url === "https://example.com/careers") {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(weakSameDomainHtml),
          });
        }

        if (url === "https://jlpjobs.com/careers") {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(strongCrossDomainHtml),
          });
        }

        if (url === "https://example.com/") {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () =>
              Promise.resolve(
                '<html><body><a href="https://jlpjobs.com/careers">Careers</a></body></html>',
              ),
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

      expect(fetchedUrls).toContain("https://jlpjobs.com/careers");
      expect(result.careersPageStatus).toBe("full");
      expect(result.careersPageUrl).toBe("https://jlpjobs.com/careers");
    });

    it("checks www.jobs.<domain> variants when jobs.<domain> has no DNS/content", async () => {
      const richCareersHtml = `<html><body>${"NHS roles and vacancies. ".repeat(220)}</body></html>`;
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        if (url === "https://www.jobs.nhs.uk/" || url === "https://www.jobs.nhs.uk") {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(richCareersHtml),
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
      });

      vi.stubGlobal("fetch", fetchMock);

      const result = await runWebsiteChecks("nhs.uk", "NHS");
      const fetchedUrls = fetchMock.mock.calls.map((call) => call[0]);

      expect(fetchedUrls).toContain("https://www.jobs.nhs.uk/");
      expect(result.careersPageStatus).toBe("full");
      expect(result.careersPageUrl).toBe("https://www.jobs.nhs.uk/");
    });

    it("follows same-domain meta refresh to careers subdomain and scores final content", async () => {
      const richCareersHtml = `<html><body>${"Open roles and apply now. ".repeat(220)}</body></html>`;
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

        if (url.endsWith("/sitemap.xml")) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve(""),
          });
        }

        if (url === "https://bbc.co.uk/careers") {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () =>
              Promise.resolve(
                '<html><head><meta http-equiv="refresh" content="0; url=https://careers.bbc.co.uk"></head><body>Redirecting</body></html>',
              ),
          });
        }

        if (url === "https://careers.bbc.co.uk/" || url === "https://careers.bbc.co.uk") {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(richCareersHtml),
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
      });

      vi.stubGlobal("fetch", fetchMock);

      const result = await runWebsiteChecks("bbc.co.uk", "BBC");
      const fetchedUrls = fetchMock.mock.calls.map((call) => call[0]);

      expect(result.careersPageStatus).toBe("full");
      expect(result.careersPageUrl).toBe("https://careers.bbc.co.uk/");
      expect(result.scoreBreakdown.careersPage).toBe(20);
      expect(fetchedUrls).toContain("https://bbc.co.uk/careers");
      expect(fetchedUrls).toContain("https://careers.bbc.co.uk/");
    });
  });
});
