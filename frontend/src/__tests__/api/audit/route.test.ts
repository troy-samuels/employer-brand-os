/**
 * @module __tests__/api/audit/route.test
 * Module implementation for route.test.ts.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { POST } from "@/app/api/audit/route";
import { validateUrl } from "@/lib/audit/url-validator";

vi.mock("@/lib/audit/url-validator", () => ({
  isLikelyDomainOrUrl: vi.fn((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (trimmed.includes(" ")) return false;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
      return /^https?:\/\//i.test(trimmed);
    }
    return /\./.test(trimmed);
  }),
  validateUrl: vi.fn((value: string) => {
    const trimmed = value.trim();
    if (/localhost|127\.0\.0\.1/i.test(trimmed)) {
      return Promise.resolve({ ok: false, reason: "private_network" as const });
    }

    const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    return Promise.resolve({
      ok: true as const,
      normalizedUrl: new URL(normalized),
      resolvedAddresses: ["93.184.216.34"],
    });
  }),
}));

vi.mock("@/lib/audit/company-resolver", () => ({
  resolveCompanyUrl: vi.fn((input: string) => {
    if (input === "example.com" || input === "https://example.com") {
      return Promise.resolve({
        name: "Example Corp",
        url: "https://example.com",
      });
    }

    return Promise.resolve({ name: "Example Corp", url: null });
  }),
}));

vi.mock("@/lib/audit/website-checks", () => ({
  runWebsiteChecks: vi.fn((domain: string, companyName: string) =>
    Promise.resolve({
      domain,
      companyName,
      companySlug: companyName.toLowerCase().replace(/\s+/g, "-"),
      hasLlmsTxt: false,
      llmsTxtHasEmployment: false,
      hasJsonld: false,
      jsonldSchemasFound: [],
      hasSalaryData: false,
      salaryConfidence: "none",
      careersPageStatus: "not_found",
      careersPageUrl: null,
      robotsTxtStatus: "not_found",
      robotsTxtAllowedBots: [],
      robotsTxtBlockedBots: [],
      score: 0,
      scoreBreakdown: {
        llmsTxt: 0,
        jsonld: 0,
        salaryData: 0,
        careersPage: 0,
        robotsTxt: 0,
      },
    }),
  ),
}));

vi.mock("@/lib/utils/csrf", () => ({
  validateCsrf: vi.fn(() => true),
}));

vi.mock("@/lib/audit/audit-logger", () => ({
  logAuditRequest: vi.fn(() => Promise.resolve()),
  logAuditEvent: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/audit/audit-persistence", () => ({
  persistAuditResult: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/utils/rate-limiter", () => ({
  RateLimiter: class {
    async check() {
      return true;
    }
  },
}));

function createMockRequest(body: unknown, xRealIp = "203.0.113.42"): NextRequest {
  return new NextRequest("http://localhost:3000/api/audit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": xRealIp,
      "x-forwarded-for": "1.2.3.4, 5.6.7.8",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns WebsiteCheckResult on successful audit", async () => {
    const request = createMockRequest({ url: "example.com" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("domain");
    expect(data).toHaveProperty("companyName");
    expect(data).toHaveProperty("score");
    expect(data).toHaveProperty("scoreBreakdown");
  });

  it("handles full URL input", async () => {
    const request = createMockRequest({ url: "https://example.com" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.domain).toBe("https://example.com");
  });

  it("returns 400 for missing url field", async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("Missing or invalid 'url' field");
  });

  it("returns 400 for non-string url", async () => {
    const request = createMockRequest({ url: 123 });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 400 for empty url", async () => {
    const request = createMockRequest({ url: "" });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 400 for values that do not look like a domain or URL", async () => {
    const request = createMockRequest({ url: "Acme Corp" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("valid domain or HTTP(S) URL");
  });

  it("trims whitespace from URL input", async () => {
    const request = createMockRequest({ url: "  example.com  " });
    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it("returns 400 for blocked/private targets", async () => {
    vi.mocked(validateUrl).mockResolvedValueOnce({
      ok: false,
      reason: "private_network",
    });

    const request = createMockRequest({ url: "http://localhost:3000" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("blocked or private network");
  });

  it("handles internal server errors", async () => {
    const { runWebsiteChecks } = await import("@/lib/audit/website-checks");
    vi.mocked(runWebsiteChecks).mockRejectedValueOnce(new Error("Internal error"));

    const request = createMockRequest({ url: "example.com" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });

  it("falls back to anonymous limiter key when no trusted IP exists", async () => {
    const request = new NextRequest("http://localhost:3000/api/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: "example.com" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  it("returns 400 for malformed JSON body", async () => {
    const request = new NextRequest("http://localhost:3000/api/audit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Malformed JSON body.");
  });
});
