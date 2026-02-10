/**
 * Defines the OrganizationData contract.
 */
/**
 * @module features/facts/types/facts.types
 * Module implementation for facts.types.ts.
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
 * Defines the EmployerFactData contract.
 */
export interface EmployerFactData {
  id: string;
  organization_id: string;
  definition_id: string;
  value: Record<string, unknown>;
  include_in_jsonld: boolean;
  is_current: boolean;
}

/**
 * Defines the SaveFactsResult contract.
 */
export interface SaveFactsResult {
  success: boolean;
  error?: string;
}
