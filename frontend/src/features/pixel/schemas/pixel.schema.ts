/**
 * Smart Pixel Zod Schemas
 * Runtime validation for pixel API requests and responses
 */

import { z } from 'zod';

// API key format: bos_live_xxxx or bos_test_xxxx (16+ chars)
export const apiKeySchema = z
  .string()
  .min(16, 'API key must be at least 16 characters')
  .regex(
    /^bos_(live|test)_[a-zA-Z0-9]+$/,
    'API key must start with bos_live_ or bos_test_'
  );

// Query parameters for pixel facts endpoint
export const pixelFactsQuerySchema = z.object({
  key: apiKeySchema,
  location: z.string().uuid().optional(),
});

// Domain pattern (supports wildcards like *.example.com)
export const domainPatternSchema = z
  .string()
  .regex(
    /^(\*\.)?[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/,
    'Invalid domain pattern'
  );

// Pixel error response
export const pixelErrorSchema = z.object({
  error: z.enum(['invalid_key', 'domain_not_allowed', 'rate_limited', 'internal_error']),
  message: z.string(),
  retryAfter: z.number().optional(),
});

// Fact value - flexible JSONB
export const factValueSchema = z.record(z.string(), z.unknown());

// Employer fact from database
export const employerFactSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  display_name: z.string(),
  value: factValueSchema,
  schema_property: z.string().nullable(),
  category: z.string(),
  verification_status: z.enum(['unverified', 'pending', 'verified']),
});

// Organization data
export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  website: z.string().url().nullable(),
  logo_url: z.string().url().nullable(),
  employee_count: z.number().nullable(),
});

// Smart pixel from database
export const smartPixelSchema = z.object({
  id: z.string().uuid(),
  organisation_id: z.string().uuid(),
  allowed_domains: z.array(z.string()),
  rate_limit_per_minute: z.number().int().positive(),
  is_active: z.boolean(),
  expires_at: z.string().datetime().nullable(),
  name: z.string().nullable(),
});

// Type exports from schemas
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
export type PixelFactsQuery = z.infer<typeof pixelFactsQuerySchema>;
export type PixelError = z.infer<typeof pixelErrorSchema>;
export type EmployerFactRow = z.infer<typeof employerFactSchema>;
export type OrganizationRow = z.infer<typeof organizationSchema>;
export type SmartPixelRow = z.infer<typeof smartPixelSchema>;
