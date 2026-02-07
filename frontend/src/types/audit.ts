export type AuditSeverity = "low" | "medium" | "high";
export type AuditCategory =
  | "technical"
  | "ai_visibility"
  | "compliance"
  | "competitive";

export interface AuditIssue {
  id: string;
  title: string;
  category: AuditCategory;
  severity: AuditSeverity;
  description: string;
}

export interface AuditRecommendation {
  id: string;
  title: string;
  impact: AuditSeverity;
  description: string;
}

export interface CompetitorInsight {
  name: string;
  score: number;
  key_strength: string;
}

export interface ComplianceViolation {
  jurisdiction: string;
  law_reference: string;
  status: "compliant" | "violation" | "warning";
  detail: string;
}

export interface AuditScores {
  overall_score: number;
  technical_score: number;
  ai_visibility_score: number;
  compliance_score: number;
  competitive_score: number;
}

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
