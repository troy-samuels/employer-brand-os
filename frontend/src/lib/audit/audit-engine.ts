/**
 * @module lib/audit/audit-engine
 * Module implementation for audit-engine.ts.
 */

import type { AuditResult } from "@/types/audit";
import { SAMPLE_AUDIT_RESULT } from "@/lib/utils/constants";
import { runLlmTests } from "@/lib/audit/llm-testing";
import { checkCompliance } from "@/lib/audit/compliance-checker";

interface AuditRequest {
  domain: string;
  name: string;
  email: string;
}

/**
 * Defines the AuditEngine class.
 */
export class AuditEngine {
  async runComprehensiveAudit({ domain, name, email }: AuditRequest): Promise<AuditResult> {
    const llm_test_results = await runLlmTests(domain);
    const compliance_violations = await checkCompliance(domain);

    return {
      ...SAMPLE_AUDIT_RESULT,
      id: `audit_${Date.now()}`,
      company_domain: domain,
      company_name: name,
      email,
      llm_test_results,
      compliance_violations,
      created_at: new Date().toISOString(),
    };
  }
}
