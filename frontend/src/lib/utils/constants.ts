/**
 * @module lib/utils/constants
 * Module implementation for constants.ts.
 */

import type { AuditResult } from "@/types/audit";
import type { AnalyticsOverview } from "@/types/analytics";
import type { JobPosting } from "@/types/jobs";

/**
 * Exposes exported value(s): SAMPLE_AUDIT_RESULT.
 */
export const SAMPLE_AUDIT_RESULT: AuditResult = {
  id: "audit_demo_001",
  company_domain: "acme.com",
  company_name: "Acme Corp",
  email: "audit@acme.com",
  overall_score: 6.8,
  technical_score: 6.2,
  ai_visibility_score: 7.1,
  compliance_score: 5.9,
  competitive_score: 7.9,
  issues: [
    {
      id: "issue_1",
      title: "Missing structured data on job pages",
      category: "technical",
      severity: "high",
      description:
        "Job postings lack JSON-LD markup, limiting discoverability by AI search engines.",
    },
    {
      id: "issue_2",
      title: "Pay transparency gaps in NYC roles",
      category: "compliance",
      severity: "medium",
      description:
        "Two open roles in New York are missing salary ranges required by Local Law 144.",
    },
  ],
  recommendations: [
    {
      id: "rec_1",
      title: "Deploy Smart Pixel across careers pages",
      impact: "high",
      description:
        "Inject verified JSON-LD schema to improve AI visibility within 24 hours.",
    },
    {
      id: "rec_2",
      title: "Standardize pay range disclosures",
      impact: "medium",
      description:
        "Add salary bands to all NYC and California job listings to avoid penalties.",
    },
    {
      id: "rec_3",
      title: "Refresh employer brand metadata",
      impact: "low",
      description:
        "Update mission, EVP, and benefits snippets for more accurate AI summaries.",
    },
  ],
  competitors_analyzed: [
    { name: "Apex Systems", score: 7.8, key_strength: "Consistent schema coverage" },
    { name: "Vertex Labs", score: 6.9, key_strength: "Pay transparency compliance" },
    { name: "Nimbus Works", score: 6.4, key_strength: "AI visibility messaging" },
  ],
  compliance_violations: [
    {
      jurisdiction: "New York City",
      law_reference: "Local Law 144",
      status: "warning",
      detail: "2 roles missing salary ranges in NYC postings.",
    },
  ],
  llm_test_results: {
    ChatGPT: [
      "Summarizes your benefits accurately but omits remote work policy.",
    ],
    Perplexity: [
      "Uses outdated salary ranges from 2023 job ads.",
    ],
  },
  pdf_report_url: "/reports/acme-ai-visibility.pdf",
  created_at: new Date().toISOString(),
};

/**
 * Exposes exported value(s): SAMPLE_JOBS.
 */
export const SAMPLE_JOBS: JobPosting[] = [
  {
    id: "job_001",
    title: "Senior Product Designer",
    description: "Lead design for AI-powered hiring experiences.",
    department: "Design",
    employment_type: "full-time",
    experience_level: "senior",
    remote_eligible: true,
    location: { city: "New York", state: "NY", country: "USA" },
    salary_range: { min: 120000, max: 160000, currency: "USD", period: "YEAR" },
    status: "active",
    posted_date: "2026-01-20",
    expires_date: "2026-03-01",
  },
  {
    id: "job_002",
    title: "People Analytics Lead",
    description: "Own AI visibility metrics and compliance analytics.",
    department: "People Ops",
    employment_type: "full-time",
    experience_level: "mid",
    remote_eligible: false,
    location: { city: "Austin", state: "TX", country: "USA" },
    salary_range: { min: 95000, max: 125000, currency: "USD", period: "YEAR" },
    status: "paused",
    posted_date: "2026-01-05",
    expires_date: "2026-02-28",
  },
  {
    id: "job_003",
    title: "Compliance Program Manager",
    description: "Ensure pay transparency compliance across jurisdictions.",
    department: "Legal",
    employment_type: "full-time",
    experience_level: "senior",
    remote_eligible: true,
    location: { city: "Remote", state: "CA", country: "USA" },
    salary_range: { min: 110000, max: 145000, currency: "USD", period: "YEAR" },
    status: "active",
    posted_date: "2026-01-12",
  },
];

/**
 * Exposes exported value(s): SAMPLE_ANALYTICS.
 */
export const SAMPLE_ANALYTICS: AnalyticsOverview = {
  metrics: [
    { label: "AI Visibility Score", value: "7.1/10", change: "+0.8" },
    { label: "Schema Requests", value: "18,450", change: "+12%" },
    { label: "Jobs Indexed", value: "48", change: "+6" },
    { label: "Compliance Alerts", value: "2", change: "-1" },
  ],
  engagement: {
    label: "Employer brand engagement",
    data: [12, 18, 22, 19, 28, 32, 36],
  },
  visibility: {
    label: "AI visibility trend",
    data: [45, 52, 58, 61, 70, 72, 78],
  },
};
