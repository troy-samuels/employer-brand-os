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
});
