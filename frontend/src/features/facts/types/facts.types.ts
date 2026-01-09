export interface OrganizationData {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  employee_count: number | null;
}

export interface EmployerFactData {
  id: string;
  organization_id: string;
  definition_id: string;
  value: Record<string, unknown>;
  include_in_jsonld: boolean;
  is_current: boolean;
}

export interface SaveFactsResult {
  success: boolean;
  error?: string;
}
