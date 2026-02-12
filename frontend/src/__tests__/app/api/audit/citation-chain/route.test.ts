/**
 * @module __tests__/app/api/audit/citation-chain/route.test
 * Tests for citation-chain audit API route orchestration and failure handling.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import type { CitationChainResult } from "@/lib/citation-chain/types";
import type { GapAnalysis } from "@/lib/citation-chain/gap-analysis";
import type { EntityConfusionResult } from "@/lib/citation-chain/entity-detection";
import type { TrustDeltaResult } from "@/lib/citation-chain/trust-delta";

const {
  mockValidateCsrf,
  mockRateLimiterCheck,
  mockEngineRun,
  mockAnalyseGaps,
  mockDetectEntityConfusion,
  mockCalculateTrustDelta,
  mockLogAuditRequest,
} = vi.hoisted(() => ({
  mockValidateCsrf: vi.fn(),
  mockRateLimiterCheck: vi.fn(),
  mockEngineRun: vi.fn(),
  mockAnalyseGaps: vi.fn(),
  mockDetectEntityConfusion: vi.fn(),
  mockCalculateTrustDelta: vi.fn(),
  mockLogAuditRequest: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/utils/csrf", () => ({
  validateCsrf: mockValidateCsrf,
}));

vi.mock("@/lib/utils/rate-limiter", () => ({
  RateLimiter: class {
    check = mockRateLimiterCheck;
  },
}));

vi.mock("@/lib/citation-chain/engine", () => ({
  CitationChainEngine: class {
    run = mockEngineRun;
  },
}));

vi.mock("@/lib/citation-chain/gap-analysis", () => ({
  analyseGaps: mockAnalyseGaps,
}));

vi.mock("@/lib/citation-chain/entity-detection", () => ({
  detectEntityConfusion: mockDetectEntityConfusion,
}));

vi.mock("@/lib/citation-chain/trust-delta", () => ({
  calculateTrustDelta: mockCalculateTrustDelta,
}));

vi.mock("@/lib/audit/audit-logger", () => ({
  logAuditRequest: mockLogAuditRequest,
  logAuditEvent: vi.fn(() => Promise.resolve()),
}));

import { POST } from "@/app/api/audit/citation-chain/route";

function createCitationChainResult(): CitationChainResult {
  return {
    companyName: "Acme",
    companyDomain: "acme.com",
    googleResults: [
      {
        category: "salary",
        query: "Acme salary",
        url: "https://www.acme.com/salary",
        domain: "acme.com",
        title: "Acme Salary",
        snippet: "Salary details",
        position: 1,
      },
    ],
    llmResponses: [
      {
        modelId: "chatgpt",
        category: "salary",
        prompt: "Prompt",
        response: "Acme salary info",
        citations: ["https://www.acme.com/salary"],
        latencyMs: 120,
      },
    ],
    sourceMappings: [
      {
        category: "salary",
        googlePosition: 1,
        domain: "acme.com",
        citedByModels: ["chatgpt"],
        sourceType: "employer",
      },
    ],
    citationScore: 100,
    timestamp: "2026-02-11T12:00:00.000Z",
    errors: [],
  };
}

function createGapAnalysis(): GapAnalysis {
  return {
    companyDomain: "acme.com",
    rows: [],
  };
}

function createEntityConfusionResult(): EntityConfusionResult {
  return {
    isConfused: false,
    severity: "none",
    confusedEntities: [],
    correctIdentificationRate: 100,
    recommendation: "No action required.",
  };
}

function createTrustDeltaResult(): TrustDeltaResult {
  return {
    items: [],
    hallucinationRate: 0,
  };
}

function createMockRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/audit/citation-chain", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      host: "localhost:3000",
      "x-real-ip": "203.0.113.42",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/audit/citation-chain", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockValidateCsrf.mockReturnValue(true);
    mockRateLimiterCheck.mockResolvedValue(true);
    mockEngineRun.mockResolvedValue(createCitationChainResult());
    mockAnalyseGaps.mockReturnValue(createGapAnalysis());
    mockDetectEntityConfusion.mockReturnValue(createEntityConfusionResult());
    mockCalculateTrustDelta.mockReturnValue(createTrustDeltaResult());
  });

  it("returns 400 for missing companyName", async () => {
    const request = createMockRequest({ companyDomain: "acme.com" });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it("returns 400 for invalid domain format", async () => {
    const request = createMockRequest({
      companyName: "Acme",
      companyDomain: "not a domain",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockRateLimiterCheck.mockResolvedValue(false);

    const request = createMockRequest({
      companyName: "Acme",
      companyDomain: "acme.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.code).toBe("rate_limited");
    expect(mockEngineRun).not.toHaveBeenCalled();
  });

  it("returns partial results when one module throws", async () => {
    mockAnalyseGaps.mockImplementation(() => {
      throw new Error("Gap analysis failed");
    });

    const request = createMockRequest({
      companyName: "Acme",
      companyDomain: "acme.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.meta.partial).toBe(true);
    expect(data.meta.errorFlags.gapAnalysis.hasError).toBe(true);
    expect(data.meta.errorFlags.gapAnalysis.message).toContain("Gap analysis failed");
    expect(data.meta.errorFlags.citationChain.hasError).toBe(false);
    expect(data.meta.errorFlags.entityConfusion.hasError).toBe(false);
    expect(data.meta.errorFlags.trustDelta.hasError).toBe(false);
    expect(data.citationChain.companyDomain).toBe("acme.com");
    expect(data.gapAnalysis.rows).toEqual([]);
    expect(data.entityConfusion.isConfused).toBe(false);
    expect(data.trustDelta.hallucinationRate).toBe(0);
  });

  /* ---- CSRF rejection ---- */

  it("returns 403 when CSRF validation fails", async () => {
    mockValidateCsrf.mockReturnValue(false);

    const request = createMockRequest({
      companyName: "Acme",
      companyDomain: "acme.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.code).toBe("invalid_origin");
    expect(mockEngineRun).not.toHaveBeenCalled();
  });

  /* ---- Malformed JSON body ---- */

  it("returns 400 for invalid JSON body", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/audit/citation-chain",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: "http://localhost:3000",
          host: "localhost:3000",
          "x-real-ip": "203.0.113.42",
        },
        body: "{ this is not valid json",
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe("invalid_json");
    expect(mockEngineRun).not.toHaveBeenCalled();
  });

  /* ---- Engine hard failure ---- */

  it("returns 500 when the citation engine throws", async () => {
    mockEngineRun.mockRejectedValue(new Error("LLM provider unavailable"));

    const request = createMockRequest({
      companyName: "Acme",
      companyDomain: "acme.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe("internal_error");
  });

  /* ---- All downstream modules fail (partial result) ---- */

  it("returns partial result when all downstream modules throw", async () => {
    mockAnalyseGaps.mockImplementation(() => {
      throw new Error("gap boom");
    });
    mockDetectEntityConfusion.mockImplementation(() => {
      throw new Error("entity boom");
    });
    mockCalculateTrustDelta.mockImplementation(() => {
      throw new Error("trust boom");
    });

    const request = createMockRequest({
      companyName: "Acme",
      companyDomain: "acme.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.meta.partial).toBe(true);
    expect(data.meta.errorFlags.gapAnalysis.hasError).toBe(true);
    expect(data.meta.errorFlags.entityConfusion.hasError).toBe(true);
    expect(data.meta.errorFlags.trustDelta.hasError).toBe(true);
    // Core citation chain should still be present
    expect(data.citationChain.companyName).toBe("Acme");
  });

  /* ---- Domain normalisation ---- */

  it("normalises domain with protocol prefix", async () => {
    const request = createMockRequest({
      companyName: "Acme",
      companyDomain: "https://www.acme.com/careers",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.citationChain).toBeDefined();
    // Engine should have been called — domain was valid after normalisation
    expect(mockEngineRun).toHaveBeenCalled();
  });

  /* ---- Success response shape ---- */

  it("returns full response with meta on success", async () => {
    const request = createMockRequest({
      companyName: "Acme",
      companyDomain: "acme.com",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.citationChain).toBeDefined();
    expect(data.gapAnalysis).toBeDefined();
    expect(data.entityConfusion).toBeDefined();
    expect(data.trustDelta).toBeDefined();
    expect(data.meta).toBeDefined();
    expect(data.meta.generatedAt).toBeTruthy();
    expect(data.meta.auditVersion).toBe("1.0.0");
    expect(data.meta.partial).toBe(false);
  });
});
