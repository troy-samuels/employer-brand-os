/**
 * @module __tests__/lib/audit/company-resolver.test
 * Module implementation for company-resolver.test.ts.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { normalizeUrl, resolveCompanyUrl } from "@/lib/audit/company-resolver";
import { validateUrl } from "@/lib/audit/url-validator";

vi.mock("@/lib/audit/url-validator", () => ({
  validateUrl: vi.fn(),
}));

const originalFetch = global.fetch;

describe("company-resolver", () => {
  const defaultValidationResult = {
    ok: true as const,
    normalizedUrl: new URL("https://example.com"),
    resolvedAddresses: ["93.184.216.34"],
  };

  vi.mocked(validateUrl).mockResolvedValue(defaultValidationResult);

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
    vi.mocked(validateUrl).mockResolvedValue(defaultValidationResult);
  });

  describe("normalizeUrl", () => {
    it("should handle full URLs with https://", () => {
      expect(normalizeUrl("https://example.com")).toBe("https://example.com");
    });

    it("should handle full URLs with http://", () => {
      expect(normalizeUrl("http://example.com")).toBe("https://example.com");
    });

    it("should add https:// to bare domains", () => {
      expect(normalizeUrl("example.com")).toBe("https://example.com");
    });

    it("should handle URLs with www", () => {
      expect(normalizeUrl("www.example.com")).toBe("https://www.example.com");
    });

    it("should handle URLs with paths", () => {
      expect(normalizeUrl("https://example.com/path/to/page")).toBe(
        "https://example.com",
      );
    });

    it("should handle URLs with query strings", () => {
      expect(normalizeUrl("https://example.com?query=param")).toBe(
        "https://example.com",
      );
    });

    it("should handle garbage input", () => {
      expect(normalizeUrl("not a url at all")).toBe("");
    });

    it("should handle empty strings", () => {
      expect(normalizeUrl("")).toBe("");
    });

    it("should handle whitespace", () => {
      expect(normalizeUrl("   ")).toBe("");
    });

    it("should lowercase the hostname", () => {
      expect(normalizeUrl("HTTPS://EXAMPLE.COM")).toBe("https://example.com");
    });

    it("should reject non-http(s) protocols", () => {
      expect(normalizeUrl("ftp://example.com")).toBe("");
      expect(normalizeUrl("file:///path/to/file")).toBe("");
    });
  });

  describe("resolveCompanyUrl", () => {
    it("should handle URL input and derive company name from hostname", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response("", { status: 200 })),
      ) as typeof fetch;

      const result = await resolveCompanyUrl("https://acme-corp.com");

      expect(result.name).toBe("Acme Corp");
      expect(result.url).toBe("https://acme-corp.com");
    });

    it("should handle URL with www and derive name correctly", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response("", { status: 200 })),
      ) as typeof fetch;

      const result = await resolveCompanyUrl("https://www.example.com");

      expect(result.name).toBe("Example");
      expect(result.url).toBe("https://www.example.com");
    });

    it("should handle company name input and try .com domain", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response("", { status: 200 })),
      ) as typeof fetch;

      const result = await resolveCompanyUrl("Acme Corp");

      expect(result.name).toBe("Acme Corp");
      expect(result.url).toBe("https://acme-corp.com");
    });

    it("should try www variant if primary .com fails", async () => {
      global.fetch = vi.fn((url: string | URL | Request) => {
        const urlString = typeof url === "string" ? url : url.toString();
        if (urlString.includes("www.acme-corp.com")) {
          return Promise.resolve(new Response("", { status: 200 }));
        }
        return Promise.resolve(new Response("", { status: 404 }));
      }) as typeof fetch;

      const result = await resolveCompanyUrl("Acme Corp");

      expect(result.name).toBe("Acme Corp");
      expect(result.url).toBe("https://www.acme-corp.com");
    });

    it("should return null URL for unreachable domain", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response("", { status: 404 })),
      ) as typeof fetch;

      const result = await resolveCompanyUrl("NonExistent Company");

      expect(result.name).toBe("NonExistent Company");
      expect(result.url).toBeNull();
    });

    it("should handle network errors gracefully", async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error("Network error")),
      ) as typeof fetch;

      const result = await resolveCompanyUrl("Test Company");

      expect(result.name).toBe("Test Company");
      expect(result.url).toBeNull();
    });

    it("should handle empty input", async () => {
      const result = await resolveCompanyUrl("");

      expect(result.name).toBe("");
      expect(result.url).toBeNull();
    });

    it("should handle whitespace-only input", async () => {
      const result = await resolveCompanyUrl("   ");

      expect(result.name).toBe("");
      expect(result.url).toBeNull();
    });

    it("should normalize company names with extra whitespace", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response("", { status: 200 })),
      ) as typeof fetch;

      const result = await resolveCompanyUrl("  Acme   Corp  ");

      expect(result.name).toBe("Acme Corp");
    });

    it("should handle company names with special characters", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve(new Response("", { status: 200 })),
      ) as typeof fetch;

      const result = await resolveCompanyUrl("Acme & Associates");

      expect(result.name).toBe("Acme & Associates");
      expect(result.url).toBe("https://acme-associates.com");
    });

    it("should handle HEAD request success", async () => {
      global.fetch = vi.fn((url: string | URL | Request, init?: RequestInit) => {
        if (init?.method === "HEAD") {
          return Promise.resolve(new Response(null, { status: 200 }));
        }
        return Promise.resolve(new Response("", { status: 404 }));
      }) as typeof fetch;

      const result = await resolveCompanyUrl("Test Company");

      expect(result.url).toBe("https://test-company.com");
    });

    it("should fallback to GET if HEAD fails", async () => {
      global.fetch = vi.fn((url: string | URL | Request, init?: RequestInit) => {
        if (init?.method === "HEAD") {
          return Promise.resolve(new Response(null, { status: 404 }));
        }
        if (init?.method === "GET") {
          return Promise.resolve(new Response("", { status: 200 }));
        }
        return Promise.resolve(new Response("", { status: 404 }));
      }) as typeof fetch;

      const result = await resolveCompanyUrl("Test Company");

      expect(result.url).toBe("https://test-company.com");
    });

    it("should not fetch when URL validation fails", async () => {
      vi.mocked(validateUrl).mockResolvedValue({
        ok: false,
        reason: "private_network",
      });
      global.fetch = vi.fn() as typeof fetch;

      const result = await resolveCompanyUrl("Acme Corp");

      expect(result.url).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should try country-specific TLDs like .co.uk and .de", async () => {
      const attemptedUrls: string[] = [];
      
      global.fetch = vi.fn((url: string | URL | Request) => {
        const urlString = typeof url === "string" ? url : url.toString();
        attemptedUrls.push(urlString);
        
        if (urlString.includes("test-company.de")) {
          return Promise.resolve(new Response("", { status: 200 }));
        }
        return Promise.resolve(new Response("", { status: 404 }));
      }) as typeof fetch;

      const result = await resolveCompanyUrl("Test Company");

      expect(result.url).toBe("https://test-company.de");
      expect(attemptedUrls.some(url => url.includes(".co.uk"))).toBe(true);
      expect(attemptedUrls.some(url => url.includes(".de"))).toBe(true);
    });

    it("should fallback to web search when TLD guessing fails", async () => {
      let searchCalled = false;
      
      global.fetch = vi.fn((url: string | URL | Request) => {
        const urlString = typeof url === "string" ? url : url.toString();
        
        // Mock DuckDuckGo API call
        if (urlString.includes("duckduckgo.com")) {
          searchCalled = true;
          return Promise.resolve(
            new Response(
              JSON.stringify({ AbstractURL: "https://realcompany.io" }),
              { status: 200 }
            )
          );
        }
        
        // Mock the final URL check for realcompany.io
        if (urlString.includes("realcompany.io")) {
          return Promise.resolve(new Response("", { status: 200 }));
        }
        
        return Promise.resolve(new Response("", { status: 404 }));
      }) as typeof fetch;

      const result = await resolveCompanyUrl("Real Company");

      expect(searchCalled).toBe(true);
      expect(result.url).toBe("https://realcompany.io");
    });
  });
});
