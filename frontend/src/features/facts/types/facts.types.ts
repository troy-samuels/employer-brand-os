/**
 * @module features/facts/types/facts.types
 * Type definitions for facts-related functionality
 */

/**
 * Organization data structure
 */
export interface OrganizationData {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  employee_count: number | null;
}

/**
 * Result type for save operations
 */
export interface SaveFactsResult {
  success: boolean;
  error?: string;
}
