/**
 * @module lib/audit/audit-engine
 * Orchestrates the full audit: website checks + per-LLM reputation checks.
 */

import type { AuditResult } from "@/types/audit";
import type { ComprehensiveLlmAudit, PlanTier } from "@/types/llm-audit";
import { SAMPLE_AUDIT_RESULT } from "@/lib/utils/constants";
import { runLlmTests, runLlmTestsLegacy } from "@/lib/audit/llm-testing";
import { checkCompliance } from "@/lib/audit/compliance-checker";

interface AuditRequest {
  domain: string;
  name: string;
  email: string;
  /** Plan tier determines which LLMs are checked. Defaults to free (website only). */
  tier?: PlanTier;
}

/**
 * The AuditEngine runs website checks (free, deterministic) and
 * per-LLM reputation checks (paid, gated by plan tier).
 */
export class AuditEngine {
  /**
   * Run the full audit — website checks + LLM reputation checks.
   * The `tier` parameter controls which LLM models are queried.
   */
  async runComprehensiveAudit({ domain, name, email, tier }: AuditRequest): Promise<AuditResult & { llmAudit?: ComprehensiveLlmAudit }> {
    // Website checks (always free, deterministic, zero API cost)
    const compliance_violations = await checkCompliance(domain);

    // Legacy LLM test results (backward compat with existing UI)
    const llm_test_results = await runLlmTestsLegacy(domain);

    // Per-LLM audit (gated by tier — only runs for paid plans)
    let llmAudit: ComprehensiveLlmAudit | undefined;
    if (tier) {
      llmAudit = await runLlmTests(domain, tier);
    }

    return {
      ...SAMPLE_AUDIT_RESULT,
      id: `audit_${Date.now()}`,
      company_domain: domain,
      company_name: name,
      email,
      llm_test_results,
      compliance_violations,
      created_at: new Date().toISOString(),
      ...(llmAudit ? { llmAudit } : {}),
    };
  }
}
