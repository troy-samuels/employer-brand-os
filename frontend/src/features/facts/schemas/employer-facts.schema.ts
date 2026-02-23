/**
 * @module features/facts/schemas/employer-facts.schema
 * Zod validation schemas for employer facts questionnaire
 */

import { z } from 'zod';

// Sub-schemas for nested objects
export const salaryBandSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  min: z.number().positive('Must be positive'),
  max: z.number().positive('Must be positive'),
  currency: z.enum(['GBP', 'USD', 'EUR']),
  equity: z.boolean(),
}).refine(data => data.max > data.min, {
  message: 'Maximum must be greater than minimum',
  path: ['max'],
});

export const benefitSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required'),
  details: z.string().optional(),
});

export const officeLocationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  address: z.string().optional(),
});

export const techStackCategorySchema = z.object({
  category: z.string().min(1, 'Category is required'),
  tools: z.array(z.string()).min(1, 'At least one tool required'),
});

export const interviewStageSchema = z.object({
  stage: z.string().min(1, 'Stage name is required'),
  description: z.string().optional(),
  duration: z.string().optional(),
});

export const companyValueSchema = z.object({
  value: z.string().min(1, 'Value name is required'),
  description: z.string().optional(),
});

export const deiInitiativeSchema = z.object({
  name: z.string().min(1, 'Initiative name is required'),
  description: z.string().optional(),
});

export const careerLevelSchema = z.object({
  level: z.string().min(1, 'Level is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

// Main employer facts schema
export const employerFactsSchema = z.object({
  company_slug: z.string().min(1, 'Company slug is required'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  
  // Salary & Compensation
  salary_bands: z.array(salaryBandSchema).optional(),
  bonus_structure: z.string().optional(),
  pay_review_cycle: z.enum(['annual', 'biannual', 'quarterly', '']).optional(),
  
  // Benefits
  benefits: z.array(benefitSchema).optional(),
  pension_contribution: z.string().optional(),
  healthcare: z.string().optional(),
  
  // Work Policy
  remote_policy: z.enum(['fully-remote', 'hybrid', 'office-first', 'flexible', '']).optional(),
  remote_details: z.string().optional(),
  office_locations: z.array(officeLocationSchema).optional(),
  flexible_hours: z.boolean().optional(),
  flexible_hours_details: z.string().optional(),
  
  // Tech & Tools
  tech_stack: z.array(techStackCategorySchema).optional(),
  engineering_blog_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  
  // Interview Process
  interview_stages: z.array(interviewStageSchema).optional(),
  interview_timeline: z.string().optional(),
  
  // Culture & Values
  company_values: z.array(companyValueSchema).optional(),
  culture_description: z.string().max(500, 'Must be 500 characters or less').optional(),
  team_size: z.string().optional(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  
  // Diversity & Inclusion
  dei_statement: z.string().optional(),
  dei_initiatives: z.array(deiInitiativeSchema).optional(),
  gender_pay_gap_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  
  // Career Growth
  promotion_framework: z.string().optional(),
  learning_budget: z.string().optional(),
  career_levels: z.array(careerLevelSchema).optional(),
  
  // Parental & Leave
  maternity_leave: z.string().optional(),
  paternity_leave: z.string().optional(),
  parental_leave_details: z.string().optional(),
  annual_leave: z.string().optional(),
  
  // Metadata
  published: z.boolean().optional(),
});

export type EmployerFactsFormData = z.infer<typeof employerFactsSchema>;

/**
 * Currency options for salary bands
 */
export const CURRENCY_OPTIONS = [
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
] as const;

/**
 * Remote policy options
 */
export const REMOTE_POLICY_OPTIONS = [
  { value: 'fully-remote', label: 'Fully Remote', description: 'No office requirement' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of office and remote' },
  { value: 'office-first', label: 'Office First', description: 'Primarily in-office' },
  { value: 'flexible', label: 'Flexible', description: 'Team-dependent policy' },
] as const;

/**
 * Pay review cycle options
 */
export const PAY_REVIEW_OPTIONS = [
  { value: 'annual', label: 'Annual' },
  { value: 'biannual', label: 'Biannual (Twice yearly)' },
  { value: 'quarterly', label: 'Quarterly' },
] as const;
