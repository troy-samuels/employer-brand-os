/**
 * @module features/facts/types/employer-facts.types
 * Type definitions for the comprehensive employer facts questionnaire
 */

export interface SalaryBand {
  role: string;
  min: number;
  max: number;
  currency: 'GBP' | 'USD' | 'EUR';
  equity: boolean;
}

export interface Benefit {
  category: string;
  name: string;
  details: string;
}

export interface OfficeLocation {
  city: string;
  country: string;
  address?: string;
}

export interface TechStackCategory {
  category: string;
  tools: string[];
}

export interface InterviewStage {
  stage: string;
  description: string;
  duration: string;
}

export interface CompanyValue {
  value: string;
  description: string;
}

export interface DEIInitiative {
  name: string;
  description: string;
}

export interface CareerLevel {
  level: string;
  title: string;
  description: string;
}

/**
 * Complete employer facts data structure
 */
export interface EmployerFacts {
  id?: string;
  company_slug: string;
  company_name: string;
  
  // Salary & Compensation
  salary_bands?: SalaryBand[];
  bonus_structure?: string;
  pay_review_cycle?: 'annual' | 'biannual' | 'quarterly' | '';
  
  // Benefits
  benefits?: Benefit[];
  pension_contribution?: string;
  healthcare?: string;
  
  // Work Policy
  remote_policy?: 'fully-remote' | 'hybrid' | 'office-first' | 'flexible' | '';
  remote_details?: string;
  office_locations?: OfficeLocation[];
  flexible_hours?: boolean;
  flexible_hours_details?: string;
  
  // Tech & Tools
  tech_stack?: TechStackCategory[];
  engineering_blog_url?: string;
  
  // Interview Process
  interview_stages?: InterviewStage[];
  interview_timeline?: string;
  
  // Culture & Values
  company_values?: CompanyValue[];
  culture_description?: string;
  team_size?: string;
  founded_year?: number;
  
  // Diversity & Inclusion
  dei_statement?: string;
  dei_initiatives?: DEIInitiative[];
  gender_pay_gap_url?: string;
  
  // Career Growth
  promotion_framework?: string;
  learning_budget?: string;
  career_levels?: CareerLevel[];
  
  // Parental & Leave
  maternity_leave?: string;
  paternity_leave?: string;
  parental_leave_details?: string;
  annual_leave?: string;
  
  // Metadata
  published?: boolean;
  updated_at?: string;
  created_at?: string;
}

/**
 * AEO content output formats
 */
export interface AEOOutput {
  llmsTxt: string;
  schemaJsonLd: object;
  markdownPage: string;
  factPageHtml: string;
}

/**
 * Section completion status for progress tracking
 */
export interface SectionCompletion {
  compensation: number;
  benefits: number;
  workPolicy: number;
  techStack: number;
  interview: number;
  culture: number;
  dei: number;
  careerGrowth: number;
  leave: number;
}

/**
 * Common benefit categories
 */
export const BENEFIT_CATEGORIES = [
  'Healthcare',
  'Pension',
  'Equity',
  'Wellbeing',
  'Learning',
  'Family',
  'Social'
] as const;

/**
 * Common quick-add benefits
 */
export const QUICK_ADD_BENEFITS = [
  'Private healthcare',
  'Dental',
  'Eye care',
  'Gym membership',
  'Cycle to work',
  'EAP',
  'Life insurance'
] as const;

/**
 * Tech stack categories
 */
export const TECH_CATEGORIES = [
  'Frontend',
  'Backend',
  'Infrastructure',
  'Data',
  'Mobile',
  'DevOps'
] as const;
