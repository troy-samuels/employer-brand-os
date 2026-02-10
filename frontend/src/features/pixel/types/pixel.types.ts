/**
 * @module features/pixel/types/pixel.types
 * Smart Pixel Types
 * Core type definitions for the Rankwell Smart Pixel infrastructure
 */

// Validated API key data returned from database
export interface ValidatedPixelKey {
  id: string;
  organisationId: string;
  allowedDomains: string[];
  rateLimitPerMinute: number;
  isActive: boolean;
  expiresAt: Date | null;
  name: string | null;
  keyVersion: number;
}

// Domain validation result
/**
 * Defines the DomainValidationResult contract.
 */
export interface DomainValidationResult {
  valid: boolean;
  matchedDomain: string | null;
  requestedOrigin: string | null;
}

// Rate limit check result
/**
 * Defines the RateLimitResult contract.
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

// JSON-LD generation options
/**
 * Defines the JsonLdOptions contract.
 */
export interface JsonLdOptions {
  organisationId: string;
  locationId?: string;
  includeCategories?: string[];
}

// Employer fact from database
/**
 * Defines the EmployerFact contract.
 */
export interface EmployerFact {
  id: string;
  name: string;
  displayName: string;
  value: Record<string, unknown>;
  schemaProperty: string | null;
  category: string;
  verificationStatus: 'unverified' | 'pending' | 'verified';
}

// Organization data for JSON-LD
/**
 * Defines the OrganizationData contract.
 */
export interface OrganizationData {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  employeeCount: number | null;
}

// Pixel API error response
/**
 * Defines the PixelErrorResponse contract.
 */
export interface PixelErrorResponse {
  error: string;
  code?:
    | "invalid_key"
    | "domain_not_allowed"
    | "rate_limited"
    | "invalid_signature"
    | "replay_detected"
    | "internal_error"
    | "missing_code";
  status: number;
  retryAfter?: number;
}

// Pixel event for audit logging
/**
 * Defines the PixelEvent contract.
 */
export interface PixelEvent {
  organisationId: string;
  apiKeyId: string;
  eventType: 'page_load' | 'schema_inject' | 'error';
  pageUrl: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  referer: string | null;
  factsReturned: number;
  responseTimeMs: number;
  errorMessage: string | null;
}

// JSON-LD schema.org types
/**
 * Defines the JsonLdOrganization contract.
 */
export interface JsonLdOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url?: string;
  logo?: string;
  employee?: {
    '@type': 'QuantitativeValue';
    value: number;
  };
  sameAs?: string[];
  jobBenefits?: string[];
  [key: string]: unknown;
}
