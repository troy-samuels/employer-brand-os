/**
 * @module lib/ats/analyse
 * Analyse job postings for AI readiness signals: salary transparency, benefits,
 * remote policy, tech stack, interview processes, and diversity information.
 */

import type { RawJob } from "./providers";

export interface JobAnalysis {
  totalJobs: number;
  salaryTransparency: {
    count: number;
    percentage: number;
    examples: string[];
  };
  benefitsMentioned: {
    count: number;
    percentage: number;
    topBenefits: string[];
  };
  remotePolicy: {
    mentioned: boolean;
    policy: "remote" | "hybrid" | "office" | "unclear";
  };
  techStack: string[];
  departments: string[];
  locations: string[];
  interviewProcess: {
    mentioned: boolean;
    stages: string[];
  };
  diversityInfo: {
    mentioned: boolean;
  };
  aiReadinessScore: number; // 0-100
}

// Salary detection patterns
const SALARY_CURRENCY_PATTERN = /(?:£|€|\$|USD|GBP|EUR)/gi;
const SALARY_RANGE_PATTERN = /(?:£|€|\$|USD|GBP|EUR)\s*\d{2,3}[,.]?\d{0,3}[kK]?\s*(?:-|to|–)\s*(?:£|€|\$|USD|GBP|EUR)?\s*\d{2,3}[,.]?\d{0,3}[kK]?/gi;
const SALARY_SINGLE_PATTERN = /(?:£|€|\$|USD|GBP|EUR)\s*\d{2,3}[,.]?\d{0,3}[kK]?(?:\s*(?:per|\/)\s*(?:year|annum|pa))?/gi;
const COMPETITIVE_SALARY_PATTERN = /competitive\s+salary|salary\s+(?:commensurate|dependent)\s+(?:with|on)\s+experience/gi;

// Benefits keywords
const BENEFITS_KEYWORDS = {
  healthcare: ["health insurance", "healthcare", "medical insurance", "dental", "vision"],
  pension: ["pension", "401k", "retirement", "super", "superannuation"],
  equity: ["equity", "stock options", "rsu", "shares", "ownership"],
  flexible: ["flexible", "flextime", "flex hours", "work-life balance"],
  remote: ["remote work", "work from home", "wfh", "remote-first", "distributed"],
  pto: ["unlimited pto", "unlimited vacation", "time off", "annual leave", "holiday"],
  learning: ["learning budget", "training", "development", "courses", "conferences"],
  parental: ["parental leave", "maternity", "paternity", "family leave"],
  wellbeing: ["mental health", "wellbeing", "wellness", "gym", "fitness"],
  meals: ["free lunch", "free food", "catered", "snacks", "meals"],
};

// Remote work patterns
const REMOTE_PATTERNS = {
  remote: /\b(?:fully\s+)?remote(?:\s+(?:work|position|role|job))?\b|\bwork\s+from\s+(?:home|anywhere)\b|\bremote[-\s]first\b/gi,
  hybrid: /\bhybrid\b|\bflexible\s+(?:work|working)\b|\bremote\s+and\s+office\b|\boffice\s+and\s+remote\b/gi,
  office: /\b(?:in[-\s]office|on[-\s]site|office[-\s]based)\b/gi,
};

// Tech stack patterns (common technologies)
const TECH_KEYWORDS = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C\\+\\+", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
  // Frontend
  "React", "Vue", "Angular", "Next\\.js", "Svelte", "Tailwind",
  // Backend
  "Node\\.js", "Django", "Flask", "Spring", "Express", "\\.NET", "Rails",
  // Databases
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB",
  // Cloud
  "AWS", "Azure", "GCP", "Google Cloud", "Kubernetes", "Docker",
  // Other
  "GraphQL", "REST API", "microservices", "CI/CD", "Git",
];

// Interview process keywords
const INTERVIEW_KEYWORDS = [
  "interview", "screening", "technical test", "take-home", "coding challenge",
  "onsite", "culture fit", "final round", "assessment", "phone screen"
];

// Diversity keywords
const DIVERSITY_KEYWORDS = [
  "diversity", "inclusion", "equal opportunity", "eeo", "affirmative action",
  "underrepresented", "diverse", "inclusive", "equitable"
];

/**
 * Strip HTML tags and decode entities from a string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract salary information from job description
 */
function extractSalary(text: string): string | null {
  // Check for range first
  const rangeMatch = text.match(SALARY_RANGE_PATTERN);
  if (rangeMatch) {
    return rangeMatch[0].trim();
  }
  
  // Check for single amount
  const singleMatch = text.match(SALARY_SINGLE_PATTERN);
  if (singleMatch) {
    return singleMatch[0].trim();
  }
  
  // Check for "competitive" mentions
  const competitiveMatch = text.match(COMPETITIVE_SALARY_PATTERN);
  if (competitiveMatch) {
    return null; // Competitive = no transparency
  }
  
  return null;
}

/**
 * Extract benefits mentioned in job description
 */
function extractBenefits(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  
  for (const [category, keywords] of Object.entries(BENEFITS_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        found.push(category);
        break;
      }
    }
  }
  
  return [...new Set(found)];
}

/**
 * Detect remote work policy
 */
function detectRemotePolicy(text: string): "remote" | "hybrid" | "office" | "unclear" {
  const remoteMatches = text.match(REMOTE_PATTERNS.remote);
  const hybridMatches = text.match(REMOTE_PATTERNS.hybrid);
  const officeMatches = text.match(REMOTE_PATTERNS.office);
  
  const remoteCount = remoteMatches?.length || 0;
  const hybridCount = hybridMatches?.length || 0;
  const officeCount = officeMatches?.length || 0;
  
  if (remoteCount > hybridCount && remoteCount > officeCount) return "remote";
  if (hybridCount > 0) return "hybrid";
  if (officeCount > 0) return "office";
  
  return "unclear";
}

/**
 * Extract tech stack mentions
 */
function extractTechStack(text: string): string[] {
  const found: string[] = [];
  
  for (const tech of TECH_KEYWORDS) {
    const pattern = new RegExp(`\\b${tech}\\b`, "gi");
    if (pattern.test(text)) {
      found.push(tech.replace(/\\./g, "."));
    }
  }
  
  return [...new Set(found)];
}

/**
 * Check for interview process mentions
 */
function detectInterviewProcess(text: string): { mentioned: boolean; stages: string[] } {
  const lowerText = text.toLowerCase();
  const stages: string[] = [];
  
  for (const keyword of INTERVIEW_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      stages.push(keyword);
    }
  }
  
  return {
    mentioned: stages.length > 0,
    stages: [...new Set(stages)],
  };
}

/**
 * Check for diversity information
 */
function detectDiversity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return DIVERSITY_KEYWORDS.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Calculate AI readiness score based on analysis results
 */
function calculateAIReadinessScore(analysis: Omit<JobAnalysis, "aiReadinessScore">): number {
  let score = 0;
  const maxScore = 100;
  
  // Salary transparency: 25 points
  if (analysis.salaryTransparency.percentage > 50) {
    score += 25;
  } else if (analysis.salaryTransparency.percentage > 20) {
    score += 15;
  } else if (analysis.salaryTransparency.percentage > 0) {
    score += 5;
  }
  
  // Benefits mentioned: 20 points
  if (analysis.benefitsMentioned.percentage > 50) {
    score += 20;
  } else if (analysis.benefitsMentioned.percentage > 20) {
    score += 12;
  } else if (analysis.benefitsMentioned.percentage > 0) {
    score += 5;
  }
  
  // Remote policy: 15 points
  if (analysis.remotePolicy.mentioned) {
    score += 15;
  }
  
  // Tech stack: 15 points
  if (analysis.techStack.length > 10) {
    score += 15;
  } else if (analysis.techStack.length > 5) {
    score += 10;
  } else if (analysis.techStack.length > 0) {
    score += 5;
  }
  
  // Interview process: 15 points
  if (analysis.interviewProcess.mentioned && analysis.interviewProcess.stages.length > 3) {
    score += 15;
  } else if (analysis.interviewProcess.mentioned) {
    score += 8;
  }
  
  // Diversity info: 10 points
  if (analysis.diversityInfo.mentioned) {
    score += 10;
  }
  
  return Math.round((score / maxScore) * 100);
}

/**
 * Analyse job postings for AI readiness signals
 * 
 * @param jobs - Array of raw job postings from ATS
 * @returns Comprehensive analysis with AI readiness score
 * 
 * @example
 * ```typescript
 * const jobs = await fetchJobsFromProvider("greenhouse", "monzo");
 * const analysis = analyseJobs(jobs);
 * console.log(`AI Readiness Score: ${analysis.aiReadinessScore}/100`);
 * ```
 */
export function analyseJobs(jobs: RawJob[]): JobAnalysis {
  if (jobs.length === 0) {
    return {
      totalJobs: 0,
      salaryTransparency: { count: 0, percentage: 0, examples: [] },
      benefitsMentioned: { count: 0, percentage: 0, topBenefits: [] },
      remotePolicy: { mentioned: false, policy: "unclear" },
      techStack: [],
      departments: [],
      locations: [],
      interviewProcess: { mentioned: false, stages: [] },
      diversityInfo: { mentioned: false },
      aiReadinessScore: 0,
    };
  }
  
  const salaryExamples: string[] = [];
  let salaryCount = 0;
  const allBenefits: string[] = [];
  let benefitsCount = 0;
  const remotePolicies: Array<"remote" | "hybrid" | "office" | "unclear"> = [];
  const allTech: string[] = [];
  const allDepartments: string[] = [];
  const allLocations: string[] = [];
  const allInterviewStages: string[] = [];
  let interviewMentionCount = 0;
  let diversityCount = 0;
  
  for (const job of jobs) {
    const text = stripHtml(job.description);
    
    // Salary
    const salary = extractSalary(text);
    if (salary) {
      salaryCount++;
      if (salaryExamples.length < 3) {
        salaryExamples.push(salary);
      }
    }
    
    // Benefits
    const benefits = extractBenefits(text);
    if (benefits.length > 0) {
      benefitsCount++;
      allBenefits.push(...benefits);
    }
    
    // Remote policy
    const policy = detectRemotePolicy(text);
    remotePolicies.push(policy);
    
    // Tech stack
    const tech = extractTechStack(text);
    allTech.push(...tech);
    
    // Departments
    if (job.department && job.department !== "General") {
      allDepartments.push(job.department);
    }
    
    // Locations
    if (job.location && job.location !== "Not specified") {
      allLocations.push(job.location);
    }
    
    // Interview process
    const interview = detectInterviewProcess(text);
    if (interview.mentioned) {
      interviewMentionCount++;
      allInterviewStages.push(...interview.stages);
    }
    
    // Diversity
    if (detectDiversity(text)) {
      diversityCount++;
    }
  }
  
  // Count benefits frequency
  const benefitCounts = allBenefits.reduce((acc, benefit) => {
    acc[benefit] = (acc[benefit] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topBenefits = Object.entries(benefitCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([benefit]) => benefit);
  
  // Determine overall remote policy
  const policyCount = remotePolicies.reduce((acc, policy) => {
    acc[policy] = (acc[policy] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let overallPolicy: "remote" | "hybrid" | "office" | "unclear" = "unclear";
  let maxPolicyCount = 0;
  for (const [policy, count] of Object.entries(policyCount)) {
    if (count > maxPolicyCount) {
      maxPolicyCount = count;
      overallPolicy = policy as typeof overallPolicy;
    }
  }
  
  const partialAnalysis: Omit<JobAnalysis, "aiReadinessScore"> = {
    totalJobs: jobs.length,
    salaryTransparency: {
      count: salaryCount,
      percentage: Math.round((salaryCount / jobs.length) * 100),
      examples: salaryExamples,
    },
    benefitsMentioned: {
      count: benefitsCount,
      percentage: Math.round((benefitsCount / jobs.length) * 100),
      topBenefits,
    },
    remotePolicy: {
      mentioned: maxPolicyCount > 0 && overallPolicy !== "unclear",
      policy: overallPolicy,
    },
    techStack: [...new Set(allTech)],
    departments: [...new Set(allDepartments)].sort(),
    locations: [...new Set(allLocations)].sort(),
    interviewProcess: {
      mentioned: interviewMentionCount > 0,
      stages: [...new Set(allInterviewStages)],
    },
    diversityInfo: {
      mentioned: diversityCount > 0,
    },
  };
  
  return {
    ...partialAnalysis,
    aiReadinessScore: calculateAIReadinessScore(partialAnalysis),
  };
}
