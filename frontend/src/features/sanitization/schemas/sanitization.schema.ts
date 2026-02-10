/**
 * @module features/sanitization/schemas/sanitization.schema
 * Module implementation for sanitization.schema.ts.
 */

import { z } from 'zod';

/**
 * Schema for creating/updating a job title mapping
 */
export const jobTitleMappingSchema = z.object({
  internalCode: z
    .string()
    .min(1, 'Internal code is required')
    .max(100, 'Internal code must be 100 characters or less')
    .regex(/^[A-Za-z0-9\-_]+$/, 'Internal code can only contain letters, numbers, hyphens, and underscores'),
  publicTitle: z
    .string()
    .min(2, 'Public title must be at least 2 characters')
    .max(200, 'Public title must be 200 characters or less'),
  jobFamily: z
    .string()
    .max(100, 'Job family must be 100 characters or less')
    .optional()
    .or(z.literal('')),
  levelIndicator: z
    .string()
    .max(50, 'Level indicator must be 50 characters or less')
    .optional()
    .or(z.literal('')),
  locationId: z
    .string()
    .uuid('Invalid location ID')
    .optional()
    .or(z.literal('')),
  aliases: z
    .array(z.string())
    .optional()
    .default([]),
  isActive: z
    .boolean()
    .optional()
    .default(true),
});

/**
 * Defines the JobTitleMappingFormData contract.
 */
export type JobTitleMappingFormData = z.input<typeof jobTitleMappingSchema>;

/**
 * Schema for sanitization API request
 */
export const sanitizeRequestSchema = z.object({
  key: z.string().min(1, 'API key is required'),
  code: z.string().min(1, 'Internal code is required'),
});

/**
 * Defines the SanitizeRequestData contract.
 */
export type SanitizeRequestData = z.infer<typeof sanitizeRequestSchema>;

/**
 * Common job family options
 */
export const JOB_FAMILY_OPTIONS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'product', label: 'Product' },
  { value: 'design', label: 'Design' },
  { value: 'sales', label: 'Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'customer_success', label: 'Customer Success' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * Common level indicator options
 */
export const LEVEL_INDICATOR_OPTIONS = [
  { value: 'intern', label: 'Intern' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'staff', label: 'Staff' },
  { value: 'principal', label: 'Principal' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'VP' },
  { value: 'c_level', label: 'C-Level' },
] as const;
