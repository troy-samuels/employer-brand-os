/**
 * @module __tests__/lib/audit/audit-engine
 * Tests for the AuditEngine orchestrator.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock all dependencies so we don't make real network calls
vi.mock("@/lib/audit/compliance-checker", () => ({
  checkCompliance: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/audit/llm-testing", () => ({
  runLlmTests: vi.fn().mockResolvedValue({
    companyDomain: "test.com",
    companyName: "test",
    overallScore: 50,
    modelResults: [],
    consensus: [],
    topRisks: [],
    topStrengths: [],
    planTier: "starter",
    auditedAt: new Date().toISOString(),
  }),
  runLlmTestsLegacy: vi.fn().mockResolvedValue({ ChatGPT: ["test claim"] }),
}));

vi.mock("@/lib/utils/constants", () => ({
  SAMPLE_AUDIT_RESULT: {
    id: "sample",
    company_domain: "",
    company_name: "",
    email: "",
    overall_score: 0,
    technical_score: 0,
    ai_visibility_score: 0,
    compliance_score: 0,
    competitive_score: 0,
    issues: [],
    recommendations: [],
    competitors_analyzed: [],
    compliance_violations: [],
    llm_test_results: {},
    created_at: "",
  },
}));

import { AuditEngine } from "@/lib/audit/audit-engine";

describe("AuditEngine", () => {
  let engine: AuditEngine;

  beforeEach(() => {
    engine = new AuditEngine();
  });

  it("returns result with correct company_domain and company_name", async () => {
    const result = await engine.runComprehensiveAudit({
      domain: "acme.com",
      name: "Acme Corp",
      email: "test@acme.com",
    });

    expect(result.company_domain).toBe("acme.com");
    expect(result.company_name).toBe("Acme Corp");
    expect(result.email).toBe("test@acme.com");
  });

  it("generates a unique ID with timestamp prefix", async () => {
    const result = await engine.runComprehensiveAudit({
      domain: "acme.com",
      name: "Acme Corp",
      email: "test@acme.com",
    });

    expect(result.id).toMatch(/^audit_\d+$/);
  });

  it("includes created_at as ISO timestamp", async () => {
    const result = await engine.runComprehensiveAudit({
      domain: "acme.com",
      name: "Acme Corp",
      email: "test@acme.com",
    });

    expect(() => new Date(result.created_at)).not.toThrow();
    expect(new Date(result.created_at).toISOString()).toBe(result.created_at);
  });

  it("does not include llmAudit when tier is not provided", async () => {
    const result = await engine.runComprehensiveAudit({
      domain: "acme.com",
      name: "Acme Corp",
      email: "test@acme.com",
    });

    expect(result.llmAudit).toBeUndefined();
  });

  it("includes llmAudit when tier is provided", async () => {
    const result = await engine.runComprehensiveAudit({
      domain: "acme.com",
      name: "Acme Corp",
      email: "test@acme.com",
      tier: "starter",
    });

    expect(result.llmAudit).toBeDefined();
    expect(result.llmAudit).toHaveProperty("overallScore");
  });

  it("includes compliance_violations array", async () => {
    const result = await engine.runComprehensiveAudit({
      domain: "acme.com",
      name: "Acme Corp",
      email: "test@acme.com",
    });

    expect(Array.isArray(result.compliance_violations)).toBe(true);
  });

  it("includes llm_test_results from legacy endpoint", async () => {
    const result = await engine.runComprehensiveAudit({
      domain: "acme.com",
      name: "Acme Corp",
      email: "test@acme.com",
    });

    expect(typeof result.llm_test_results).toBe("object");
  });
});
