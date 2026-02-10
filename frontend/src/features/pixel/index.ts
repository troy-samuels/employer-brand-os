/**
 * @module features/pixel/index
 * Module implementation for index.ts.
 */

/**
 * Smart Pixel Feature
 * Public exports for the Rankwell Smart Pixel infrastructure
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
export {
  validateApiKey,
  validateApiKeyWithStatus,
  extractKeyPrefix,
  isValidPixelApiKeyFormat,
  PIXEL_API_KEY_REGEX,
} from './lib/validate-key';
export { validateDomain, isValidDomainPattern } from './lib/validate-domain';
export { generateJsonLd } from './lib/generate-jsonld';
export {
  extractClientIp,
  getCorsOrigin,
  pixelErrorResponse,
  requireApiKey,
  requireDomain,
  requireRateLimit,
  zodValidationDetails,
} from './lib/pixel-api';
export {
  buildCorsHeaders,
  buildSuccessHeaders,
  buildErrorHeaders,
  buildPreflightResponse,
} from './lib/cors';
