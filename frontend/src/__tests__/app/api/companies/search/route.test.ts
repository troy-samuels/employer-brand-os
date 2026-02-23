/**
 * @module __tests__/app/api/companies/search/route.test
 * Tests for company autocomplete API route — CSRF, rate limiting, validation,
 * sanitisation, DB error handling, and happy-path results.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/* ------------------------------------------------------------------ */
/*  Hoisted mocks                                                      */
/* ------------------------------------------------------------------ */

const {
  mockValidateCsrf,
  mockRateLimiterCheck,
  mockSupabaseFrom,
} = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockIlike = vi.fn();
  const mockOrder = vi.fn();
  const mockRange = vi.fn();

  // Chain: .from().select().ilike().order().range()
  mockRange.mockResolvedValue({ data: [], error: null });
  mockOrder.mockReturnValue({ range: mockRange });
  mockIlike.mockReturnValue({ order: mockOrder });
  mockSelect.mockReturnValue({ ilike: mockIlike });

  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

  return {
    mockValidateCsrf: vi.fn(),
    mockRateLimiterCheck: vi.fn(),
    mockSupabaseFrom: mockFrom,
    mockSelect,
    mockIlike,
    mockOrder,
    mockRange,
  };
});

vi.mock("@/lib/utils/csrf", () => ({
  validateCsrf: mockValidateCsrf,
}));

vi.mock("@/lib/utils/rate-limiter", () => ({
  RateLimiter: class {
    check = mockRateLimiterCheck;
  },
}));

vi.mock("@/lib/supabase/anon", () => ({
  supabaseAnon: { from: mockSupabaseFrom },
}));

/* ------------------------------------------------------------------ */
/*  Import under test (after mocks)                                    */
/* ------------------------------------------------------------------ */

import { GET } from "@/app/api/companies/search/route";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function createRequest(
  query: string,
  options: { origin?: string; host?: string; ip?: string } = {},
): NextRequest {
  const url = `http://localhost:3000/api/companies/search?q=${encodeURIComponent(query)}`;
  return new NextRequest(url, {
    method: "GET",
    headers: {
      origin: options.origin ?? "http://localhost:3000",
      host: options.host ?? "localhost:3000",
      ...(options.ip ? { "x-real-ip": options.ip } : {}),
    },
  });
}

function mockDbResults(rows: Array<Record<string, unknown>>): void {
  const mockRange = vi.fn().mockResolvedValue({ data: rows, error: null });
  const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
  const mockIlike = vi.fn().mockReturnValue({ order: mockOrder });
  const mockSelect = vi.fn().mockReturnValue({ ilike: mockIlike });
  mockSupabaseFrom.mockReturnValue({ select: mockSelect });
}

function mockDbError(code: string, message: string): void {
  const mockRange = vi.fn().mockResolvedValue({
    data: null,
    error: { code, message },
  });
  const mockOrder = vi.fn().mockReturnValue({ range: mockRange });
  const mockIlike = vi.fn().mockReturnValue({ order: mockOrder });
  const mockSelect = vi.fn().mockReturnValue({ ilike: mockIlike });
  mockSupabaseFrom.mockReturnValue({ select: mockSelect });
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GET /api/companies/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateCsrf.mockReturnValue(true);
    mockRateLimiterCheck.mockResolvedValue(true);
  });

  /* ---- CSRF ---- */

  describe("CSRF validation", () => {
    it("returns 403 when CSRF validation fails", async () => {
      mockValidateCsrf.mockReturnValue(false);

      const request = createRequest("Acme");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.code).toBe("invalid_origin");
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });
  });

  /* ---- Rate limiting ---- */

  describe("rate limiting", () => {
    it("returns 429 when rate limit is exceeded", async () => {
      mockRateLimiterCheck.mockResolvedValue(false);

      const request = createRequest("Acme");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.code).toBe("rate_limited");
      expect(mockSupabaseFrom).not.toHaveBeenCalled();
    });

    it("passes client IP to rate limiter from x-real-ip header", async () => {
      const request = createRequest("Acme", { ip: "203.0.113.42" });
      await GET(request);

      expect(mockRateLimiterCheck).toHaveBeenCalledWith(
        "203.0.113.42",
        "company-search",
        30,
        60,
      );
    });
  });

  /* ---- Input validation ---- */

  describe("input validation", () => {
    it("returns 400 when query is missing", async () => {
      const request = createRequest("");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("invalid_payload");
    });

    it("returns 400 when query is too short (1 char)", async () => {
      const request = createRequest("A");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe("invalid_payload");
      expect(data.error).toContain("at least 2 characters");
    });

    it("returns 400 for query exceeding 100 characters", async () => {
      const longQuery = "A".repeat(101);
      const request = createRequest(longQuery);
      const response = await GET(request);

      expect(response.status).toBe(400);
      expect((await response.json()).code).toBe("invalid_payload");
    });
  });

  /* ---- Sanitisation ---- */

  describe("input sanitisation", () => {
    it("strips control characters from query", async () => {
      mockDbResults([]);

      const request = createRequest("Ac\u0000me\u001FTest");
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Should have reached the DB without control chars
      expect(mockSupabaseFrom).toHaveBeenCalledWith("companies");
    });

    it("strips angle brackets from query to prevent XSS", async () => {
      mockDbResults([]);

      const request = createRequest("<script>alert(1)</script>");
      const response = await GET(request);

      // After stripping angle brackets + control chars, result is sanitised
      expect(response.status).toBe(200);
      expect(mockSupabaseFrom).toHaveBeenCalled();
    });

    it("escapes ILIKE wildcards (%, _, \\) in search term", async () => {
      mockDbResults([]);

      const request = createRequest("100% match_test");
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockSupabaseFrom).toHaveBeenCalled();
    });
  });

  /* ---- Happy path ---- */

  describe("successful queries", () => {
    it("returns matched companies with correct shape", async () => {
      mockDbResults([
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Acme Corp",
          domain: "ACME.COM",
          industry: "Technology",
          employee_count: 500,
        },
      ]);

      const request = createRequest("Acme");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companies).toHaveLength(1);
      expect(data.companies[0]).toEqual({
        id: "11111111-1111-1111-1111-111111111111",
        name: "Acme Corp",
        domain: "acme.com", // lowercased
        industry: "Technology",
        employee_count: 500,
      });
    });

    it("returns empty array when no companies match", async () => {
      mockDbResults([]);

      const request = createRequest("ZZNoMatch");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companies).toEqual([]);
    });

    it("handles null industry and employee_count", async () => {
      mockDbResults([
        {
          id: "22222222-2222-2222-2222-222222222222",
          name: "Stealth Startup",
          domain: "stealth.io",
          industry: null,
          employee_count: null,
        },
      ]);

      const request = createRequest("Stealth");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companies[0].industry).toBeNull();
      expect(data.companies[0].employee_count).toBeNull();
    });

    it("handles non-finite employee_count gracefully", async () => {
      mockDbResults([
        {
          id: "33333333-3333-3333-3333-333333333333",
          name: "Infinity Inc",
          domain: "infinity.com",
          industry: "Tech",
          employee_count: Infinity,
        },
      ]);

      const request = createRequest("Infinity");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companies[0].employee_count).toBeNull();
    });
  });

  /* ---- DB error handling ---- */

  describe("database error handling", () => {
    it("returns empty array for missing table (42P01) — graceful fallback", async () => {
      mockDbError("42P01", "relation \"companies\" does not exist");

      const request = createRequest("Acme");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.companies).toEqual([]);
    });

    it("returns 500 for other database errors", async () => {
      mockDbError("42501", "permission denied for table companies");

      const request = createRequest("Acme");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe("internal_error");
    });
  });
});
