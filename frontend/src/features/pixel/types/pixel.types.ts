/**
 * Smart Pixel Types
 * Core type definitions for the BrandOS Smart Pixel infrastructure
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
}

// Domain validation result
export interface DomainValidationResult {
  valid: boolean;
  matchedDomain: string | null;
  requestedOrigin: string | null;
}

// Rate limit check result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

// JSON-LD generation options
export interface JsonLdOptions {
  organisationId: string;
  locationId?: string;
  includeCategories?: string[];
}

// Employer fact from database
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
export interface OrganizationData {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  employeeCount: number | null;
}

// Pixel API error response
export interface PixelErrorResponse {
  error: 'invalid_key' | 'domain_not_allowed' | 'rate_limited' | 'internal_error';
  message: string;
  retryAfter?: number;
}

// Pixel event for audit logging
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
