/**
 * @module lib/ats/generate-facts
 * Generate structured "Facts" content from job analysis data.
 * This data powers the employer visibility page with verified, up-to-date information.
 */

import type { JobAnalysis } from "./analyse";
import type { RawJob } from "./providers";

export interface GeneratedFacts {
  salaryRanges: Array<{
    role: string;
    range: string;
    source: string;
  }>;
  benefits: Array<{
    category: string;
    details: string;
  }>;
  techStack: string[];
  workPolicy: string;
  interviewProcess: string[];
  departments: Array<{
    name: string;
    openRoles: number;
  }>;
  lastUpdated: string;
  source: string;
}

/**
 * Extract salary information from individual jobs
 */
function extractSalaryRanges(jobs: RawJob[]): GeneratedFacts["salaryRanges"] {
  const salaryPattern = /(?:£|€|\$|USD|GBP|EUR)\s*\d{2,3}[,.]?\d{0,3}[kK]?\s*(?:-|to|–)\s*(?:£|€|\$|USD|GBP|EUR)?\s*\d{2,3}[,.]?\d{0,3}[kK]?/gi;
  const ranges: GeneratedFacts["salaryRanges"] = [];
  
  for (const job of jobs) {
    const text = job.description.replace(/<[^>]+>/g, " ");
    const matches = text.match(salaryPattern);
    
    if (matches && matches.length > 0) {
      ranges.push({
        role: job.title,
        range: matches[0].trim(),
        source: `${job.title} job posting`,
      });
    }
  }
  
  return ranges;
}

/**
 * Map benefit categories to user-friendly descriptions
 */
const BENEFIT_DESCRIPTIONS: Record<string, string> = {
  healthcare: "Comprehensive health, dental, and vision insurance",
  pension: "Retirement savings plan with employer contributions",
  equity: "Employee stock options or equity ownership",
  flexible: "Flexible working hours and work-life balance support",
  remote: "Remote work options available",
  pto: "Generous paid time off policy",
  learning: "Professional development and learning budget",
  parental: "Extended parental leave for all parents",
  wellbeing: "Mental health and wellness support programs",
  meals: "Free meals and snacks provided",
};

/**
 * Generate benefits list from analysis
 */
function generateBenefitsList(analysis: JobAnalysis): GeneratedFacts["benefits"] {
  return analysis.benefitsMentioned.topBenefits.map(category => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    details: BENEFIT_DESCRIPTIONS[category] || `${category} benefits mentioned`,
  }));
}

/**
 * Generate work policy description
 */
function generateWorkPolicy(analysis: JobAnalysis): string {
  if (!analysis.remotePolicy.mentioned) {
    return "Work policy not clearly specified in job postings";
  }
  
  switch (analysis.remotePolicy.policy) {
    case "remote":
      return "Fully remote positions available — work from anywhere";
    case "hybrid":
      return "Hybrid working model — mix of remote and office-based work";
    case "office":
      return "Office-based roles — in-person collaboration focus";
    default:
      return "Work policy varies by role — check individual job postings";
  }
}

/**
 * Generate interview process stages
 */
function generateInterviewProcess(analysis: JobAnalysis): string[] {
  if (!analysis.interviewProcess.mentioned) {
    return ["Interview process not specified in job postings"];
  }
  
  return analysis.interviewProcess.stages.map(stage => {
    // Capitalize and format stage names
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  });
}

/**
 * Calculate department statistics
 */
function calculateDepartments(jobs: RawJob[]): GeneratedFacts["departments"] {
  const deptCounts: Record<string, number> = {};
  
  for (const job of jobs) {
    const dept = job.department || "General";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  }
  
  return Object.entries(deptCounts)
    .map(([name, openRoles]) => ({ name, openRoles }))
    .sort((a, b) => b.openRoles - a.openRoles);
}

/**
 * Generate structured Facts from job analysis
 * 
 * @param jobs - Raw job postings from ATS
 * @param analysis - Job analysis results
 * @param atsProvider - Name of the ATS provider
 * @returns Structured facts ready for display
 * 
 * @example
 * ```typescript
 * const facts = generateFacts(jobs, analysis, "Greenhouse");
 * console.log(`Found ${facts.departments.length} departments`);
 * ```
 */
export function generateFacts(
  jobs: RawJob[],
  analysis: JobAnalysis,
  atsProvider: string
): GeneratedFacts {
  return {
    salaryRanges: extractSalaryRanges(jobs),
    benefits: generateBenefitsList(analysis),
    techStack: analysis.techStack.slice(0, 15), // Top 15 technologies
    workPolicy: generateWorkPolicy(analysis),
    interviewProcess: generateInterviewProcess(analysis),
    departments: calculateDepartments(jobs),
    lastUpdated: new Date().toISOString(),
    source: `Extracted from ${atsProvider} job postings`,
  };
}

/**
 * Check if generated facts are substantial enough to display
 * @param facts - Generated facts object
 * @returns True if facts contain meaningful data
 */
export function hasSubstantialFacts(facts: GeneratedFacts): boolean {
  return (
    facts.salaryRanges.length > 0 ||
    facts.benefits.length >= 3 ||
    facts.techStack.length >= 5 ||
    facts.departments.length >= 2
  );
}
