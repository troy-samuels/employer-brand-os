import { z } from 'zod';

export const companyFactsSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name must be at least 2 characters'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  salaryMin: z
    .coerce
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Must be a positive number'),
  salaryMax: z
    .coerce
    .number({ invalid_type_error: 'Must be a number' })
    .positive('Must be a positive number'),
  currency: z.enum(['USD', 'EUR', 'GBP'], {
    required_error: 'Please select a currency',
  }),
  benefits: z.array(z.string()).default([]),
  remotePolicy: z.enum(['remote', 'hybrid', 'onsite'], {
    required_error: 'Please select a remote policy',
  }),
}).refine(
  (data) => data.salaryMax > data.salaryMin,
  {
    message: 'Maximum salary must be greater than minimum salary',
    path: ['salaryMax'],
  }
);

export type CompanyFactsFormData = z.infer<typeof companyFactsSchema>;

export const BENEFIT_OPTIONS = [
  { id: 'health', label: 'Health Insurance' },
  { id: '401k', label: '401(k) Matching' },
  { id: 'dental', label: 'Dental Insurance' },
  { id: 'vision', label: 'Vision Insurance' },
  { id: 'pto', label: 'Unlimited PTO' },
  { id: 'remote', label: 'Remote Work Stipend' },
  { id: 'equity', label: 'Stock Options / Equity' },
  { id: 'parental', label: 'Parental Leave' },
  { id: 'education', label: 'Education / Learning Budget' },
  { id: 'wellness', label: 'Wellness Programs' },
] as const;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
] as const;

export const REMOTE_POLICY_OPTIONS = [
  { value: 'remote', label: 'Fully Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
] as const;
