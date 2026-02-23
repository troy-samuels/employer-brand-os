/**
 * @module lib/proof/tracker
 * Compare AI snapshots over time and detect milestones.
 */

import { untypedTable } from "@/lib/supabase/untyped-table";
import {
  getAllSnapshots,
  getBaselineSnapshot,
  getLatestSnapshot,
  type AISnapshot,
} from "./snapshot";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/**
 * A milestone detected during tracking.
 */
export interface Milestone {
  type: "zero_to_one" | "score_jump" | "new_citation" | "gap_filled";
  dimension: string;
  description: string;
  date: string;
  beforeScore: number;
  afterScore: number;
}

/**
 * Score change for a single dimension between two snapshots.
 */
export interface ScoreChange {
  companySlug: string;
  dimension: string;
  baseline: {
    score: number;
    date: string;
    snapshot: string;
  };
  current: {
    score: number;
    date: string;
    snapshot: string;
  };
  change: number;
  percentageChange: number;
  timeElapsed: string;
}

/**
 * Complete proof report showing all changes and milestones.
 */
export interface ProofReport {
  companySlug: string;
  companyName: string;
  trackingStarted: string;
  totalSnapshots: number;
  overallChange: number;
  dimensionChanges: ScoreChange[];
  milestones: Milestone[];
  nextSnapshotDue: string;
}

/* ------------------------------------------------------------------ */
/* Time Calculations                                                   */
/* ------------------------------------------------------------------ */

/**
 * Calculates human-readable time elapsed between two dates.
 *
 * @param start - Start date
 * @param end - End date
 * @returns Human-readable duration like "7 days" or "2 weeks"
 */
function calculateTimeElapsed(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day";
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 14) return "1 week";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`;
  if (diffDays < 60) return "1 month";
  return `${Math.floor(diffDays / 30)} months`;
}

/**
 * Calculates the next Monday 9am from a given date.
 *
 * @param from - Starting date
 * @returns ISO string of next Monday at 9am
 */
function nextMonday9am(from: Date = new Date()): string {
  const date = new Date(from);
  const dayOfWeek = date.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  
  date.setDate(date.getDate() + daysUntilMonday);
  date.setHours(9, 0, 0, 0);
  
  return date.toISOString();
}

/* ------------------------------------------------------------------ */
/* Snapshot Comparison                                                 */
/* ------------------------------------------------------------------ */

/**
 * Compares two snapshots and returns dimension-level score changes.
 *
 * @param baseline - The baseline snapshot
 * @param current - The current snapshot
 * @returns Array of score changes per dimension
 */
export function compareSnapshots(
  baseline: AISnapshot,
  current: AISnapshot
): ScoreChange[] {
  const changes: ScoreChange[] = [];
  const dimensions = Object.keys(baseline.dimensionScores);

  for (const dimension of dimensions) {
    const baselineScore = baseline.dimensionScores[dimension] ?? 0;
    const currentScore = current.dimensionScores[dimension] ?? 0;
    const change = currentScore - baselineScore;
    const percentageChange = baselineScore > 0 
      ? Math.round((change / baselineScore) * 100)
      : currentScore > 0 ? 100 : 0;

    changes.push({
      companySlug: baseline.companySlug,
      dimension,
      baseline: {
        score: baselineScore,
        date: baseline.capturedAt,
        snapshot: baseline.id,
      },
      current: {
        score: currentScore,
        date: current.capturedAt,
        snapshot: current.id,
      },
      change,
      percentageChange,
      timeElapsed: calculateTimeElapsed(baseline.capturedAt, current.capturedAt),
    });
  }

  return changes;
}

/* ------------------------------------------------------------------ */
/* Milestone Detection                                                 */
/* ------------------------------------------------------------------ */

/**
 * Detects milestones from score changes.
 *
 * @param changes - Array of score changes
 * @returns Array of detected milestones
 */
export function detectMilestones(changes: ScoreChange[]): Milestone[] {
  const milestones: Milestone[] = [];

  for (const change of changes) {
    const { dimension, baseline, current } = change;

    // Zero to One: dimension score goes from 0 to positive
    if (baseline.score === 0 && current.score > 0) {
      milestones.push({
        type: "zero_to_one",
        dimension,
        description: `${dimension} visibility went from 0% to ${current.score * 10}%`,
        date: current.date,
        beforeScore: baseline.score,
        afterScore: current.score,
      });
    }

    // Score Jump: improvement of ≥20%
    if (change.change > 0 && change.percentageChange >= 20) {
      milestones.push({
        type: "score_jump",
        dimension,
        description: `${dimension} score jumped ${change.percentageChange}% in ${change.timeElapsed}`,
        date: current.date,
        beforeScore: baseline.score,
        afterScore: current.score,
      });
    }

    // New Citation: employer domain starts appearing
    // (Would need actual query analysis - placeholder for now)

    // Gap Filled: information gap resolved
    // (Would need query-level gap detection - placeholder for now)
  }

  return milestones;
}

/**
 * Stores milestones in the database.
 *
 * @param companySlug - Company slug
 * @param milestones - Milestones to store
 * @param snapshotId - Snapshot ID that triggered the milestones
 */
async function storeMilestones(
  companySlug: string,
  milestones: Milestone[],
  snapshotId: string
): Promise<void> {
  if (milestones.length === 0) return;

  const rows = milestones.map((m) => ({
    company_slug: companySlug,
    milestone_type: m.type,
    dimension: m.dimension,
    description: m.description,
    before_score: m.beforeScore,
    after_score: m.afterScore,
    snapshot_id: snapshotId,
    detected_at: m.date,
  }));

  await untypedTable("proof_milestones").insert(rows);
}

/**
 * Gets all milestones for a company.
 *
 * @param companySlug - Company slug
 * @returns Array of milestones
 */
async function getMilestones(companySlug: string): Promise<Milestone[]> {
  const { data, error } = await untypedTable("proof_milestones")
    .select("*")
    .eq("company_slug", companySlug)
    .order("detected_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => ({
    type: row.milestone_type,
    dimension: row.dimension,
    description: row.description,
    date: row.detected_at,
    beforeScore: row.before_score,
    afterScore: row.after_score,
  }));
}

/* ------------------------------------------------------------------ */
/* Proof Report Generation                                             */
/* ------------------------------------------------------------------ */

/**
 * Generates a complete proof report for a company.
 * Compares all snapshots and detects milestones.
 *
 * @param companySlug - Company slug
 * @returns Complete proof report
 * @throws Error if no snapshots exist
 */
export async function generateProofReport(
  companySlug: string
): Promise<ProofReport> {
  // Get all snapshots
  const allSnapshots = await getAllSnapshots(companySlug);
  
  if (allSnapshots.length === 0) {
    throw new Error(`No snapshots found for company: ${companySlug}`);
  }

  // Get baseline and latest
  const baseline = await getBaselineSnapshot(companySlug) ?? allSnapshots[0];
  const latest = await getLatestSnapshot(companySlug) ?? allSnapshots[allSnapshots.length - 1];

  // Compare snapshots
  const dimensionChanges = compareSnapshots(baseline, latest);
  
  // Get company name from latest snapshot
  const companyName = companySlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Calculate overall change
  const overallChange = latest.overallScore - baseline.overallScore;

  // Get stored milestones
  const milestones = await getMilestones(companySlug);

  // If this is a new comparison, detect and store new milestones
  if (allSnapshots.length > 1) {
    const newMilestones = detectMilestones(dimensionChanges);
    if (newMilestones.length > 0) {
      await storeMilestones(companySlug, newMilestones, latest.id);
      milestones.unshift(...newMilestones);
    }
  }

  return {
    companySlug,
    companyName,
    trackingStarted: baseline.capturedAt,
    totalSnapshots: allSnapshots.length,
    overallChange,
    dimensionChanges,
    milestones,
    nextSnapshotDue: nextMonday9am(),
  };
}

/**
 * Batch generates proof reports for multiple companies.
 * Used by cron jobs.
 *
 * @param companySlugs - Array of company slugs
 * @returns Array of successful reports and errors
 */
export async function batchGenerateReports(
  companySlugs: string[]
): Promise<{
  reports: ProofReport[];
  errors: { slug: string; error: string }[];
}> {
  const reports: ProofReport[] = [];
  const errors: { slug: string; error: string }[] = [];

  for (const slug of companySlugs) {
    try {
      const report = await generateProofReport(slug);
      reports.push(report);
    } catch (error) {
      errors.push({
        slug,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { reports, errors };
}
