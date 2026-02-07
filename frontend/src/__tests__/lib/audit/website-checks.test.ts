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
  });
});
