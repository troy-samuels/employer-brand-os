/**
 * @module features/sanitization/types/sanitization.types
 * Module implementation for sanitization.types.ts.
 */

/**
 * Sanitization Engine Types
 * Part of Layer 1: Infrastructure - ATS Code Translation
 */

export interface JobTitleMapping {
  id: string;
  organization_id: string;
  internal_code: string;
  public_title: string;
  job_family: string | null;
  level_indicator: string | null;
  location_id: string | null;
  aliases: string[];
  keywords: string[];
  pay_transparency_ready: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

/**
 * Defines the SanitizationResult contract.
 */
export interface SanitizationResult {
  originalCode: string;
  publicTitle: string | null;
  jobFamily: string | null;
  levelIndicator: string | null;
  sanitized: boolean;
}

/**
 * Defines the SaveMappingResult contract.
 */
export interface SaveMappingResult {
  success: boolean;
  error?: string;
  mapping?: JobTitleMapping;
}

/**
 * Defines the DeleteMappingResult contract.
 */
export interface DeleteMappingResult {
  success: boolean;
  error?: string;
}

/**
 * Defines the BulkImportResult contract.
 */
export interface BulkImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

/**
 * Defines the MappingListResult contract.
 */
export interface MappingListResult {
  mappings: JobTitleMapping[];
  total: number;
  error?: string;
}
