// Sanitization Engine Feature
// Part of Layer 1: Infrastructure - ATS Code Translation

// Types
export type {
  JobTitleMapping,
  SanitizationResult,
  SaveMappingResult,
  DeleteMappingResult,
  BulkImportResult,
  MappingListResult,
} from './types/sanitization.types';

// Schemas
export {
  jobTitleMappingSchema,
  sanitizeRequestSchema,
  JOB_FAMILY_OPTIONS,
  LEVEL_INDICATOR_OPTIONS,
} from './schemas/sanitization.schema';
export type {
  JobTitleMappingFormData,
  SanitizeRequestData,
} from './schemas/sanitization.schema';

// Actions
export {
  getMappings,
  getMapping,
  createMapping,
  updateMapping,
  deleteMapping,
  toggleMappingActive,
} from './actions/sanitization-actions';

// Core logic
export { sanitizeJobCode, sanitizeJobCodes } from './lib/sanitize';
