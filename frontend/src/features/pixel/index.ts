/**
 * Smart Pixel Feature
 * Public exports for the BrandOS Smart Pixel infrastructure
 */

// Types
export type {
  ValidatedPixelKey,
  DomainValidationResult,
  RateLimitResult,
  JsonLdOptions,
  EmployerFact,
  OrganizationData,
  PixelErrorResponse,
  PixelEvent,
  JsonLdOrganization,
} from './types/pixel.types';

// Schemas
export {
  apiKeySchema,
  pixelFactsQuerySchema,
  domainPatternSchema,
  pixelErrorSchema,
} from './schemas/pixel.schema';

// Utilities
export { validateApiKey, extractKeyPrefix } from './lib/validate-key';
export { validateDomain, isValidDomainPattern } from './lib/validate-domain';
export { generateJsonLd } from './lib/generate-jsonld';
export {
  buildCorsHeaders,
  buildSuccessHeaders,
  buildErrorHeaders,
  buildPreflightResponse,
} from './lib/cors';
