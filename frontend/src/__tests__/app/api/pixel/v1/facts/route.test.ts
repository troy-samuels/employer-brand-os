import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET, OPTIONS } from "@/app/api/pixel/v1/facts/route";

const requireApiKeyMock = vi.fn();
const requireDomainMock = vi.fn();
const requireRateLimitMock = vi.fn();
const verifyPixelRequestSignatureMock = vi.fn();
const generateJsonLdMock = vi.fn();

vi.mock("@/features/pixel/lib/pixel-api", () => ({
  getCorsOrigin: vi.fn((origin: string | null) => {
    if (!origin) return null;
    try {
      return new URL(origin).origin;
    } catch {
      return null;
    }
  }),
  pixelErrorResponse: vi.fn(
    (input: { code: string; message: string; status: number }) =>
      new Response(
        JSON.stringify({
          error: input.message,
          code: input.code,
          status: input.status,
        }),
        { status: input.status }
      )
  ),
  requireApiKey: (...args: unknown[]) => requireApiKeyMock(...args),
  requireDomain: (...args: unknown[]) => requireDomainMock(...args),
  requireRateLimit: (...args: unknown[]) => requireRateLimitMock(...args),
  zodValidationDetails: vi.fn(() => ({ formErrors: [], fieldErrors: {} })),
}));

vi.mock("@/features/pixel/lib/generate-jsonld", () => ({
  generateJsonLd: (...args: unknown[]) => generateJsonLdMock(...args),
}));

vi.mock("@/lib/pixel/request-signing", () => ({
  verifyPixelRequestSignature: (...args: unknown[]) =>
    verifyPixelRequestSignatureMock(...args),
}));

vi.mock("@/lib/pixel/health", () => ({
  markPixelServiceRequest: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe("pixel facts api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiKeyMock.mockResolvedValue({
      ok: true,
      key: "bos_live_valid1234567890",
      validatedKey: {
        id: "key-1",
        organisationId: "org-1",
        allowedDomains: ["example.com", "*.example.com"],
        rateLimitPerMinute: 100,
      },
    });
    requireDomainMock.mockReturnValue({ ok: true });
    requireRateLimitMock.mockResolvedValue({ ok: true });
    verifyPixelRequestSignatureMock.mockReturnValue({ ok: true });
    generateJsonLdMock.mockResolvedValue({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Example Inc",
    });
  });

  it("supports preflight requests without query-string key values", async () => {
    const request = new NextRequest("https://rankwell.test/api/pixel/v1/facts", {
      method: "OPTIONS",
      headers: {
        origin: "https://jobs.example.com",
      },
    });

    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://jobs.example.com"
    );
  });

  it("accepts api keys from X-Rankwell-Key header", async () => {
    const request = new NextRequest("https://rankwell.test/api/pixel/v1/facts?location=33f8f54e-e9d2-48e8-b7b8-2e3c833365d6", {
      method: "GET",
      headers: {
        origin: "https://jobs.example.com",
        referer: "https://jobs.example.com/careers",
        "x-rankwell-key": "bos_live_valid1234567890",
        "x-rankwell-signature": "signature",
        "x-rankwell-timestamp": "1700000000",
        "x-rankwell-nonce": "nonce-1",
      },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(requireApiKeyMock).toHaveBeenCalledWith(
      "bos_live_valid1234567890",
      expect.any(NextRequest),
      "pixel.v1.facts",
      "https://jobs.example.com"
    );
    expect(response.status).toBe(200);
    expect(body["@type"]).toBe("Organization");
  });
});
