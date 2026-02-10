/**
 * @module features/pixel/schemas/pixel.schema
 * Module implementation for pixel.schema.ts.
 */

/**
 * Smart Pixel Zod Schemas
 * Runtime validation for pixel API requests and responses
 */

import { z } from 'zod';

// API key format: bos_live_xxxx or bos_test_xxxx (16+ chars)
/**
 * Exposes exported value(s): apiKeySchema.
 */
export const apiKeySchema = z
  .string()
  .min(16, 'API key must be at least 16 characters')
  .regex(
    /^bos_(live|test)_[a-zA-Z0-9]+$/,
    'API key must start with bos_live_ or bos_test_'
  );

// Query parameters for pixel facts endpoint
/**
 * Exposes exported value(s): pixelFactsQuerySchema.
 */
export const pixelFactsQuerySchema = z.object({
  key: apiKeySchema,
  location: z.string().uuid().optional(),
});

// Domain pattern (supports wildcards like *.example.com)
/**
 * Exposes exported value(s): domainPatternSchema.
 */
export const domainPatternSchema = z
  .string()
  .regex(
    /^(\*\.)?[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/,
    'Invalid domain pattern'
  );

// Pixel error response
/**
 * Exposes exported value(s): pixelErrorSchema.
 */
export const pixelErrorSchema = z.object({
  error: z.enum([
    'invalid_key_format',
    'missing_api_key',
    'invalid_key',
    'key_expired',
    'domain_not_allowed',
    'rate_limited',
    'invalid_signature',
    'replay_detected',
    'malformed_request',
    'internal_error',
    'missing_code',
  ]),
  message: z.string(),
  retryAfter: z.number().optional(),
});

// Fact value - flexible JSONB
/**
 * Exposes exported value(s): factValueSchema.
 */
export const factValueSchema = z.record(z.string(), z.unknown());

// Employer fact from database
/**
 * Exposes exported value(s): employerFactSchema.
 */
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
/**
 * Exposes exported value(s): organizationSchema.
 */
export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  website: z.string().url().nullable(),
  logo_url: z.string().url().nullable(),
  employee_count: z.number().nullable(),
});

// Smart pixel from database
/**
 * Exposes exported value(s): smartPixelSchema.
 */
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
/**
 * Defines the ApiKeyInput contract.
 */
export type ApiKeyInput = z.infer<typeof apiKeySchema>;
/**
 * Defines the PixelFactsQuery contract.
 */
export type PixelFactsQuery = z.infer<typeof pixelFactsQuerySchema>;
/**
 * Defines the PixelError contract.
 */
export type PixelError = z.infer<typeof pixelErrorSchema>;
/**
 * Defines the EmployerFactRow contract.
 */
export type EmployerFactRow = z.infer<typeof employerFactSchema>;
/**
 * Defines the OrganizationRow contract.
 */
export type OrganizationRow = z.infer<typeof organizationSchema>;
/**
 * Defines the SmartPixelRow contract.
 */
export type SmartPixelRow = z.infer<typeof smartPixelSchema>;
