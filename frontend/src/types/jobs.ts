/**
 * Defines the EmploymentType contract.
 */
/**
 * @module types/jobs
 * Module implementation for jobs.ts.
 */

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "temporary"
  | "internship";

/**
 * Defines the ExperienceLevel contract.
 */
export type ExperienceLevel = "entry" | "mid" | "senior" | "executive";

/**
 * Defines the JobStatus contract.
 */
export type JobStatus = "draft" | "active" | "paused" | "closed";

/**
 * Defines the JobLocation contract.
 */
export interface JobLocation {
  city: string;
  state: string;
  country: string;
}

/**
 * Defines the SalaryRange contract.
 */
export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: "YEAR" | "MONTH" | "HOUR";
}

/**
 * Defines the JobPosting contract.
 */
export interface JobPosting {
  id: string;
  title: string;
  description: string;
  department: string;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  remote_eligible: boolean;
  location?: JobLocation;
  salary_range?: SalaryRange;
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  ats_job_id?: string;
  external_url?: string;
  status: JobStatus;
  posted_date: string;
  expires_date?: string;
}
