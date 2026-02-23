/**
 * @module lib/proof/snapshot
 * AI response snapshot capture and storage.
 * Captures what AI says about a company at a point in time.
 */

import { untypedTable } from "@/lib/supabase/untyped-table";
import { getCompanyAudit, type StoredAuditResult } from "@/lib/audit/shared";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/**
 * A single AI query response snapshot.
 */
export interface QuerySnapshot {
  query: string;
  category: string;
  response: string;
  sources: string[];
  citesEmployer: boolean;
  citesGlassdoor: boolean;
  citesOther: string[];
  factualAccuracy: "accurate" | "inaccurate" | "unknown" | "hallucinated";
  informationGap: boolean;
  score: number;
}

/**
 * Complete AI snapshot for a company at a specific point in time.
 */
export interface AISnapshot {
  id: string;
  companySlug: string;
  capturedAt: string;
  queries: QuerySnapshot[];
  overallScore: number;
  dimensionScores: Record<string, number>;
  isBaseline?: boolean;
}

/* ------------------------------------------------------------------ */
/* Standard Queries                                                    */
/* ------------------------------------------------------------------ */

/**
 * Standard query set run for every company snapshot.
 */
export const STANDARD_QUERIES = [
  { query: "What is it like to work at [Company]?", category: "culture" },
  { query: "What is the salary at [Company]?", category: "salary" },
  { query: "What benefits does [Company] offer?", category: "benefits" },
  { query: "What is the interview process at [Company]?", category: "interview" },
  { query: "Does [Company] offer remote work?", category: "remote" },
  { query: "What tech stack does [Company] use?", category: "tech" },
  { query: "What is career growth like at [Company]?", category: "growth" },
  { query: "What do employees say about [Company] culture?", category: "culture" },
] as const;

/* ------------------------------------------------------------------ */
/* Snapshot Creation                                                   */
/* ------------------------------------------------------------------ */

/**
 * Converts audit data into a QuerySnapshot format.
 * This is a placeholder that structures existing audit data.
 * Real AI querying will be added when API keys are available.
 *
 * @param audit - The stored audit result
 * @param query - The query being assessed
 * @param category - The category of the query
 * @returns A QuerySnapshot derived from audit data
 */
function auditToQuerySnapshot(
  audit: StoredAuditResult,
  query: string,
  category: string
): QuerySnapshot {
  // Map audit data to dimension scores
  const dimensionMap: Record<string, number> = {
    salary: audit.score_breakdown.salaryData ?? 0,
    benefits: audit.score_breakdown.careersPage ?? 0,
    culture: audit.score_breakdown.brandReputation ?? 0,
    interview: audit.score_breakdown.careersPage ?? 0,
    remote: audit.score_breakdown.careersPage ?? 0,
    tech: audit.score_breakdown.careersPage ?? 0,
    growth: audit.score_breakdown.brandReputation ?? 0,
  };

  const score = dimensionMap[category] ?? audit.score;

  // Determine information gap and factual accuracy
  const informationGap = score < 5;
  const factualAccuracy: QuerySnapshot["factualAccuracy"] = 
    score >= 7 ? "accurate" : 
    score >= 4 ? "unknown" : 
    "hallucinated";

  // Mock sources based on audit data
  const sources: string[] = [];
  if (audit.has_jsonld || audit.careers_page_status !== "none") {
    sources.push(audit.company_domain);
  }
  
  const citesEmployer = sources.length > 0;
  const citesGlassdoor = false; // Would be detected in real AI query
  const citesOther: string[] = [];

  return {
    query: query.replace("[Company]", audit.company_name),
    category,
    response: `[AI response for: ${query.replace("[Company]", audit.company_name)}]`,
    sources,
    citesEmployer,
    citesGlassdoor,
    citesOther,
    factualAccuracy,
    informationGap,
    score,
  };
}

/**
 * Captures a new AI snapshot for a company.
 * Reads the latest audit data and structures it as a snapshot.
 *
 * @param companySlug - The company slug to snapshot
 * @param isBaseline - Whether this is the baseline snapshot for tracking
 * @returns The created snapshot
 * @throws Error if company audit not found or snapshot creation fails
 */
export async function captureSnapshot(
  companySlug: string,
  isBaseline = false
): Promise<AISnapshot> {
  // Get the latest audit data
  const audit = await getCompanyAudit(companySlug);
  
  if (!audit) {
    throw new Error(`No audit found for company: ${companySlug}`);
  }

  // Build query snapshots from audit data
  const queries: QuerySnapshot[] = STANDARD_QUERIES.map(({ query, category }) =>
    auditToQuerySnapshot(audit, query, category)
  );

  // Calculate dimension scores
  const dimensionScores: Record<string, number> = {
    salary: audit.score_breakdown.salaryData ?? 0,
    benefits: audit.score_breakdown.careersPage ?? 0,
    culture: audit.score_breakdown.brandReputation ?? 0,
    interview: audit.score_breakdown.careersPage ?? 0,
    remote: audit.score_breakdown.careersPage ?? 0,
    tech: audit.score_breakdown.careersPage ?? 0,
    growth: audit.score_breakdown.brandReputation ?? 0,
  };

  const overallScore = audit.score;

  // Store the snapshot
  const { data, error } = await untypedTable("ai_snapshots")
    .insert({
      company_slug: companySlug,
      captured_at: new Date().toISOString(),
      overall_score: overallScore,
      dimension_scores: dimensionScores,
      queries,
      is_baseline: isBaseline,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create snapshot: ${error?.message ?? "Unknown error"}`);
  }

  return {
    id: data.id,
    companySlug: data.company_slug,
    capturedAt: data.captured_at,
    queries: data.queries,
    overallScore: data.overall_score,
    dimensionScores: data.dimension_scores,
    isBaseline: data.is_baseline,
  };
}

/**
 * Gets the latest snapshot for a company.
 *
 * @param companySlug - The company slug
 * @returns The latest snapshot or null if none exists
 */
export async function getLatestSnapshot(
  companySlug: string
): Promise<AISnapshot | null> {
  const { data, error } = await untypedTable("ai_snapshots")
    .select("*")
    .eq("company_slug", companySlug)
    .order("captured_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    companySlug: data.company_slug,
    capturedAt: data.captured_at,
    queries: data.queries,
    overallScore: data.overall_score,
    dimensionScores: data.dimension_scores,
    isBaseline: data.is_baseline,
  };
}

/**
 * Gets the baseline snapshot for a company.
 *
 * @param companySlug - The company slug
 * @returns The baseline snapshot or null if none exists
 */
export async function getBaselineSnapshot(
  companySlug: string
): Promise<AISnapshot | null> {
  const { data, error } = await untypedTable("ai_snapshots")
    .select("*")
    .eq("company_slug", companySlug)
    .eq("is_baseline", true)
    .order("captured_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    companySlug: data.company_slug,
    capturedAt: data.captured_at,
    queries: data.queries,
    overallScore: data.overall_score,
    dimensionScores: data.dimension_scores,
    isBaseline: data.is_baseline,
  };
}

/**
 * Gets all snapshots for a company, ordered by date.
 *
 * @param companySlug - The company slug
 * @returns Array of snapshots
 */
export async function getAllSnapshots(
  companySlug: string
): Promise<AISnapshot[]> {
  const { data, error } = await untypedTable("ai_snapshots")
    .select("*")
    .eq("company_slug", companySlug)
    .order("captured_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    companySlug: row.company_slug,
    capturedAt: row.captured_at,
    queries: row.queries,
    overallScore: row.overall_score,
    dimensionScores: row.dimension_scores,
    isBaseline: row.is_baseline,
  }));
}

/**
 * Gets all companies that have at least one snapshot.
 * Used by the cron job to know which companies to re-snapshot.
 *
 * @returns Array of unique company slugs
 */
export async function getTrackedCompanies(): Promise<string[]> {
  const { data, error } = await untypedTable("ai_snapshots")
    .select("company_slug")
    .order("company_slug");

  if (error || !data) return [];

  // Return unique slugs
  const slugs: string[] = data.map((row: any) => row.company_slug as string);
  return [...new Set(slugs)];
}
