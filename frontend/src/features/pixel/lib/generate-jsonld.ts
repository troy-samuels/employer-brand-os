/**
 * @module features/pixel/lib/generate-jsonld
 * Module implementation for generate-jsonld.ts.
 */

/**
 * JSON-LD Generator
 * Builds schema.org compliant JSON-LD from employer facts
 *
 * This is the core value proposition of Rankwell:
 * Transform verified employer data into structured data that
 * AI agents and search engines can consume accurately.
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import type {
  JsonLdOptions,
  JsonLdOrganization,
  OrganizationData,
  EmployerFact,
} from '../types/pixel.types';

/**
 * Generate JSON-LD for an organization's verified facts
 *
 * Business Logic:
 * - Only includes facts marked with include_in_jsonld = true
 * - Maps fact categories to schema.org properties
 * - Verified facts get higher visibility
 * - Optionally filters by location for multi-location orgs
 *
 * @param options - Generation options including org ID and filters
 * @returns Schema.org compliant JSON-LD object
 */
export async function generateJsonLd(
  options: JsonLdOptions
): Promise<JsonLdOrganization> {
  const { organisationId, locationId } = options;

  // Fetch organization details
  const org = await fetchOrganization(organisationId);
  if (!org) {
    throw new Error('Organization not found');
  }

  // Fetch employer facts
  const facts = await fetchFacts(organisationId, locationId);

  // Build the JSON-LD structure
  const jsonLd: JsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
  };

  // Add optional organization fields
  if (org.website) {
    jsonLd.url = org.website;
  }

  if (org.logoUrl) {
    jsonLd.logo = org.logoUrl;
  }

  if (org.employeeCount) {
    jsonLd.employee = {
      '@type': 'QuantitativeValue',
      value: org.employeeCount,
    };
  }

  // Map facts to JSON-LD properties
  mapFactsToJsonLd(facts, jsonLd);

  return jsonLd;
}

/**
 * Fetch organization data from database
 */
async function fetchOrganization(
  organisationId: string
): Promise<OrganizationData | null> {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('id, name, website, logo_url, employee_count')
    .eq('id', organisationId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    website: data.website,
    logoUrl: data.logo_url,
    employeeCount: data.employee_count,
  };
}

/**
 * Fetch employer facts marked for JSON-LD inclusion
 */
async function fetchFacts(
  organisationId: string,
  locationId?: string
): Promise<EmployerFact[]> {
  let query = supabaseAdmin
    .from('employer_facts')
    .select(`
      id,
      definition_id,
      value,
      verification_status,
      fact_definitions (
        name,
        display_name,
        schema_property,
        category_id,
        fact_categories (
          name
        )
      )
    `)
    .eq('organization_id', organisationId)
    .eq('include_in_jsonld', true)
    .eq('is_current', true);

  // Filter by location if specified
  if (locationId) {
    query = query.eq('location_id', locationId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  // Transform database rows to EmployerFact type
  return data.map((row) => ({
    id: row.id,
    name: (row.fact_definitions as { name: string })?.name || '',
    displayName: (row.fact_definitions as { display_name: string })?.display_name || '',
    value: row.value as Record<string, unknown>,
    schemaProperty: (row.fact_definitions as { schema_property: string | null })?.schema_property || null,
    category: ((row.fact_definitions as { fact_categories: { name: string } | null })?.fact_categories?.name) || 'other',
    verificationStatus: row.verification_status as 'unverified' | 'pending' | 'verified',
  }));
}

/**
 * Map employer facts to JSON-LD properties
 *
 * Mapping strategy:
 * - If fact has schema_property, use it directly
 * - Otherwise, use category-based defaults
 * - Group related facts (e.g., all benefits into jobBenefits array)
 */
function mapFactsToJsonLd(
  facts: EmployerFact[],
  jsonLd: JsonLdOrganization
): void {
  const benefits: string[] = [];
  const sameAs: string[] = [];

  for (const fact of facts) {
    // Use explicit schema property if defined
    if (fact.schemaProperty) {
      const value = formatFactValue(fact);
      // Only assign if value is not empty (omit null/undefined/empty strings/empty arrays)
      if (value !== undefined && value !== null && value !== '' &&
          !(Array.isArray(value) && value.length === 0)) {
        jsonLd[fact.schemaProperty] = value;
      }
      continue;
    }

    // Category-based mapping
    switch (fact.category) {
      case 'benefits':
      case 'time_off':
      case 'perks':
        // Collect into jobBenefits array
        benefits.push(formatBenefitValue(fact));
        break;

      case 'compensation':
        // Map salary-related facts
        if (fact.name.includes('salary')) {
          jsonLd.baseSalary = formatSalaryValue(fact);
        }
        break;

      case 'work_style':
        // Map to employmentType or similar
        if (fact.name.includes('remote')) {
          jsonLd.jobLocationType = formatFactValue(fact);
        }
        break;

      case 'culture':
        // Add to description or knowsAbout
        jsonLd.knowsAbout = formatFactValue(fact);
        break;

      default:
        // Store under a custom property
        jsonLd[`x-${fact.name}`] = formatFactValue(fact);
    }
  }

  // Add collected arrays if not empty AND not already set by schemaProperty
  // This ensures dashboard-saved facts (with schemaProperty) take precedence over legacy individual facts
  if (benefits.length > 0 && !jsonLd.jobBenefits) {
    jsonLd.jobBenefits = benefits;
  }

  if (sameAs.length > 0) {
    jsonLd.sameAs = sameAs;
  }
}

/**
 * Format a fact value for JSON-LD output
 */
function formatFactValue(fact: EmployerFact): unknown {
  const value = fact.value;

  // If value has a 'display' property, use it
  if (typeof value === 'object' && value !== null && 'display' in value) {
    return value.display;
  }

  // If value has a 'value' property, use it
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return value.value;
  }

  return value;
}

/**
 * Format a benefit for the jobBenefits array
 */
function formatBenefitValue(fact: EmployerFact): string {
  const value = fact.value;

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    if ('display' in value && typeof value.display === 'string') {
      return value.display;
    }
    if ('name' in value && typeof value.name === 'string') {
      return value.name;
    }
  }

  return fact.displayName;
}

/**
 * Format salary data as schema.org MonetaryAmountDistribution
 */
function formatSalaryValue(fact: EmployerFact): object {
  const value = fact.value as {
    min?: number;
    max?: number;
    currency?: string;
    median?: number;
  };

  return {
    '@type': 'MonetaryAmountDistribution',
    currency: value.currency || 'USD',
    ...(value.min && { minValue: value.min }),
    ...(value.max && { maxValue: value.max }),
    ...(value.median && { median: value.median }),
  };
}
