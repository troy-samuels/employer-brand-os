import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { OPTIONS, POST } from "@/app/api/pixel/v1/crawl-log/route";

const requireApiKeyMock = vi.fn();
const requireDomainMock = vi.fn();
const requireRateLimitMock = vi.fn();
const verifyPixelRequestSignatureMock = vi.fn();
const untypedTableMock = vi.fn();

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
    (input: { code: string; message: string; status: number; origin?: string | null }) =>
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
}));

vi.mock("@/lib/pixel/request-signing", () => ({
  verifyPixelRequestSignature: (...args: unknown[]) =>
    verifyPixelRequestSignatureMock(...args),
}));

vi.mock("@/lib/supabase/untyped-table", () => ({
  untypedTable: (...args: unknown[]) => untypedTableMock(...args),
}));

vi.mock("@/lib/pixel/health", () => ({
  markPixelServiceRequest: vi.fn(),
}));

function createPostRequest(body: string): NextRequest {
  return new NextRequest("https://openrole.test/api/pixel/v1/crawl-log", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://jobs.example.com",
      referer: "https://jobs.example.com/careers",
      "x-openrole-key": "bos_live_valid1234567890",
      "x-openrole-signature": "signature",
      "x-openrole-timestamp": "1700000000",
      "x-openrole-nonce": "nonce-1",
    },
    body,
  });
}

describe("POST /api/pixel/v1/crawl-log", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireApiKeyMock.mockResolvedValue({
      ok: true,
      key: "bos_live_valid1234567890",
      validatedKey: {
        id: "key-1",
        allowedDomains: ["example.com", "*.example.com"],
        rateLimitPerMinute: 100,
      },
    });
    requireDomainMock.mockReturnValue({ ok: true });
    requireRateLimitMock.mockResolvedValue({ ok: true });
    verifyPixelRequestSignatureMock.mockReturnValue({ ok: true });
    untypedTableMock.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  it("returns permissive preflight headers for browser preflight", async () => {
    const request = new NextRequest("https://openrole.test/api/pixel/v1/crawl-log", {
      method: "OPTIONS",
      headers: {
        origin: "https://jobs.example.com",
      },
    });

    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://jobs.example.com");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("returns 400 for malformed json payloads", async () => {
    const response = await POST(createPostRequest("{bad json"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.code).toBe("invalid_json");
  });

  it("rejects when api key validation fails", async () => {
    requireApiKeyMock.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Missing API key" }), {
        status: 401,
      }),
    });

    const response = await POST(
      createPostRequest(
        JSON.stringify({
          companyId: "org-1",
          botName: "GPTBot",
          userAgent: "GPTBot/1.0",
          pageUrl: "https://jobs.example.com/careers",
          couldRead: true,
        })
      )
    );

    expect(response.status).toBe(401);
  });

  it("rejects invalid signatures", async () => {
    verifyPixelRequestSignatureMock.mockReturnValueOnce({
      ok: false,
      error: "signature_mismatch",
      message: "Invalid request signature",
      status: 401,
    });

    const response = await POST(
      createPostRequest(
        JSON.stringify({
          companyId: "org-1",
          botName: "GPTBot",
          userAgent: "GPTBot/1.0",
          pageUrl: "https://jobs.example.com/careers",
          couldRead: true,
        })
      )
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("invalid_signature");
  });

  it("writes a crawl log entry when validation passes", async () => {
    const insertMock = vi.fn().mockResolvedValue({ error: null });
    untypedTableMock.mockReturnValueOnce({ insert: insertMock });

    const response = await POST(
      createPostRequest(
        JSON.stringify({
          companyId: "org-1",
          botName: "GPTBot",
          userAgent: "GPTBot/1.0",
          pageUrl: "https://jobs.example.com/careers",
          timestamp: "2026-02-12T10:00:00.000Z",
          couldRead: true,
        })
      )
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: "org-1",
        bot_name: "GPTBot",
        page_url: "https://jobs.example.com/careers",
        could_read: true,
      })
    );
  });
});
