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

export interface SanitizationResult {
  originalCode: string;
  publicTitle: string | null;
  jobFamily: string | null;
  levelIndicator: string | null;
  sanitized: boolean;
}

export interface SaveMappingResult {
  success: boolean;
  error?: string;
  mapping?: JobTitleMapping;
}

export interface DeleteMappingResult {
  success: boolean;
  error?: string;
}

export interface BulkImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export interface MappingListResult {
  mappings: JobTitleMapping[];
  total: number;
  error?: string;
}
