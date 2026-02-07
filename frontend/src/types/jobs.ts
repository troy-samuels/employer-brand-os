export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "temporary"
  | "internship";

export type ExperienceLevel = "entry" | "mid" | "senior" | "executive";

export type JobStatus = "draft" | "active" | "paused" | "closed";

export interface JobLocation {
  city: string;
  state: string;
  country: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: "YEAR" | "MONTH" | "HOUR";
}

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
