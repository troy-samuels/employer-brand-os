/**
 * Defines the AuditSeverity contract.
 */
/**
 * @module types/audit
 * Module implementation for audit.ts.
 */

export type AuditSeverity = "low" | "medium" | "high";
/**
 * Defines the AuditCategory contract.
 */
export type AuditCategory =
  | "technical"
  | "ai_visibility"
  | "compliance"
  | "competitive";

/**
 * Defines the AuditIssue contract.
 */
export interface AuditIssue {
  id: string;
  title: string;
  category: AuditCategory;
  severity: AuditSeverity;
  description: string;
}

/**
 * Defines the AuditRecommendation contract.
 */
export interface AuditRecommendation {
  id: string;
  title: string;
  impact: AuditSeverity;
  description: string;
}

/**
 * Defines the CompetitorInsight contract.
 */
export interface CompetitorInsight {
  name: string;
  score: number;
  key_strength: string;
}

/**
 * Defines the ComplianceViolation contract.
 */
export interface ComplianceViolation {
  jurisdiction: string;
  law_reference: string;
  status: "compliant" | "violation" | "warning";
  detail: string;
}

/**
 * Defines the AuditScores contract.
 */
export interface AuditScores {
  overall_score: number;
  technical_score: number;
  ai_visibility_score: number;
  compliance_score: number;
  competitive_score: number;
}

/**
 * Defines the AuditResult contract.
 */
export interface AuditResult extends AuditScores {
  id: string;
  company_domain: string;
  company_name: string;
  email: string;
  issues: AuditIssue[];
  recommendations: AuditRecommendation[];
  competitors_analyzed: CompetitorInsight[];
  compliance_violations: ComplianceViolation[];
  llm_test_results: Record<string, string[]>;
  pdf_report_url?: string;
  created_at: string;
}
