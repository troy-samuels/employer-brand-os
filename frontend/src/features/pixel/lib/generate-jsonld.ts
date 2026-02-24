/**
 * @module features/pixel/lib/generate-jsonld
 * JSON-LD Generator
 * 
 * Builds schema.org compliant JSON-LD from employer facts
 *
 * This is the core value proposition of OpenRole:
 * Transform verified employer data into structured data that
 * AI agents and search engines can consume accurately.
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { sanitizeOrganizationJsonLd } from '@/lib/utils/sanitize-jsonld';
import type {
  JsonLdOptions,
  JsonLdOrganization,
  OrganizationData,
} from '../types/pixel.types';
import type { EmployerFacts } from '@/features/facts/types/employer-facts.types';

/**
 * Generate JSON-LD for an organization's verified facts
 *
 * Business Logic:
 * - Reads from the flat questionnaire schema
 * - Maps fact columns to schema.org properties
 * - Published facts get higher visibility
 * - Optionally filters by location for multi-location orgs
 *
 * @param options - Generation options including org ID and filters
 * @returns Schema.org compliant JSON-LD object
 */
export async function generateJsonLd(
  options: JsonLdOptions
): Promise<JsonLdOrganization> {
  const { organisationId } = options;

  // Fetch organization details
  const org = await fetchOrganization(organisationId);
  if (!org) {
    throw new Error('Organization not found');
  }

  // Fetch employer facts by company slug
  const facts = await fetchFacts(org.id);

  // Build the JSON-LD structure
  const jsonLd: JsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: facts?.company_name || org.name,
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
  if (facts) {
    mapFactsToJsonLd(facts, jsonLd);
  }

  // SECURITY: Sanitize all values before injection into customer domains
  // This prevents XSS even if malicious data gets into the database
  const sanitized = sanitizeOrganizationJsonLd(jsonLd as Record<string, unknown>);

  return sanitized as JsonLdOrganization;
}

/**
 * Fetch organization data from database
 * Gets the company_slug for fact lookup
 */
async function fetchOrganization(
  organisationId: string
): Promise<(OrganizationData & { slug?: string }) | null> {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('id, name, slug, website, logo_url, employee_count')
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
    slug: data.slug,
  };
}

/**
 * Fetch employer facts from the flat questionnaire schema
 * Returns the complete facts record for the organization
 */
async function fetchFacts(
  organisationId: string
): Promise<EmployerFacts | null> {
  // First get the organization's slug
  const { data: org } = await supabaseAdmin
    .from('organizations')
    .select('slug')
    .eq('id', organisationId)
    .single();

  if (!org?.slug) {
    return null;
  }

  // Fetch employer facts by company_slug
  const { data, error } = await supabaseAdmin
    .from('employer_facts')
    .select('*')
    .eq('company_slug', org.slug)
    .eq('published', true) // Only include published facts
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as EmployerFacts;
}

/**
 * Map employer facts to JSON-LD properties
 *
 * Mapping strategy:
 * - Map flat questionnaire columns to schema.org properties
 * - Use appropriate schema.org types for structured data
 * - Handle arrays and objects appropriately
 */
function mapFactsToJsonLd(
  facts: EmployerFacts,
  jsonLd: JsonLdOrganization
): void {
  // Company description → description
  if (facts.culture_description) {
    jsonLd.description = facts.culture_description;
  }

  // DEI statement → append to description
  if (facts.dei_statement) {
    const existingDesc = jsonLd.description || '';
    jsonLd.description = existingDesc
      ? `${existingDesc}\n\n${facts.dei_statement}`
      : facts.dei_statement;
  }

  // Founded year → foundingDate
  if (facts.founded_year) {
    jsonLd.foundingDate = facts.founded_year.toString();
  }

  // Team size → numberOfEmployees
  if (facts.team_size) {
    // Parse team size (e.g., "10-50" or "50")
    const match = facts.team_size.match(/(\d+)/);
    if (match) {
      jsonLd.numberOfEmployees = {
        '@type': 'QuantitativeValue',
        value: parseInt(match[1], 10),
      };
    }
  }

  // Salary bands → baseSalary (use first band as representative)
  if (facts.salary_bands && Array.isArray(facts.salary_bands)) {
    const salaryBands = facts.salary_bands as Array<{
      role?: string;
      min?: number;
      max?: number;
      currency?: string;
      equity?: boolean;
    }>;
    
    if (salaryBands.length > 0) {
      const firstBand = salaryBands[0];
      if (firstBand.min || firstBand.max) {
        jsonLd.baseSalary = {
          '@type': 'MonetaryAmountDistribution',
          currency: firstBand.currency || 'USD',
          ...(firstBand.min && { minValue: firstBand.min }),
          ...(firstBand.max && { maxValue: firstBand.max }),
        };
      }
    }
  }

  // Benefits → jobBenefits
  if (facts.benefits && Array.isArray(facts.benefits)) {
    const benefits = facts.benefits as Array<{
      category?: string;
      name?: string;
      details?: string;
    }>;
    
    const benefitNames = benefits
      .map((b) => b.name)
      .filter((name): name is string => Boolean(name));
    
    if (benefitNames.length > 0) {
      jsonLd.jobBenefits = benefitNames;
    }
  }

  // Remote policy → jobLocationType
  if (facts.remote_policy) {
    const remotePolicyMap: Record<string, string> = {
      'fully-remote': 'TELECOMMUTE',
      'hybrid': 'TELECOMMUTE',
      'office-first': 'OFFICE',
      'flexible': 'TELECOMMUTE',
    };
    
    jsonLd.jobLocationType = remotePolicyMap[facts.remote_policy] || facts.remote_policy;
  }

  // Office locations → location
  if (facts.office_locations && Array.isArray(facts.office_locations)) {
    const locations = facts.office_locations as Array<{
      city?: string;
      country?: string;
      address?: string;
    }>;
    
    const locationObjects = locations.map((loc) => ({
      '@type': 'Place',
      ...(loc.address && { address: loc.address }),
      ...(loc.city && { addressLocality: loc.city }),
      ...(loc.country && { addressCountry: loc.country }),
    }));
    
    if (locationObjects.length > 0) {
      jsonLd.location = locationObjects.length === 1 ? locationObjects[0] : locationObjects;
    }
  }

  // Tech stack → knowsAbout
  if (facts.tech_stack && Array.isArray(facts.tech_stack)) {
    const techStack = facts.tech_stack as Array<{
      category?: string;
      tools?: string[];
    }>;
    
    const allTools = techStack.flatMap((cat) => cat.tools || []);
    
    if (allTools.length > 0) {
      jsonLd.knowsAbout = allTools;
    }
  }

  // Engineering blog → publishingPrinciples (or custom property)
  if (facts.engineering_blog_url) {
    jsonLd['x-engineeringBlog'] = facts.engineering_blog_url;
  }

  // Interview process → custom properties
  if (facts.interview_stages && Array.isArray(facts.interview_stages)) {
    jsonLd['x-interviewStages'] = facts.interview_stages;
  }

  if (facts.interview_timeline) {
    jsonLd['x-interviewTimeline'] = facts.interview_timeline;
  }

  // Company values → knowsAbout or custom
  if (facts.company_values && Array.isArray(facts.company_values)) {
    const values = facts.company_values as Array<{
      value?: string;
      description?: string;
    }>;
    
    const valueNames = values
      .map((v) => v.value)
      .filter((val): val is string => Boolean(val));
    
    if (valueNames.length > 0) {
      jsonLd['x-companyValues'] = valueNames;
    }
  }

  // DEI initiatives → custom properties
  if (facts.dei_initiatives && Array.isArray(facts.dei_initiatives)) {
    jsonLd['x-deiInitiatives'] = facts.dei_initiatives;
  }

  if (facts.gender_pay_gap_url) {
    jsonLd['x-genderPayGapReport'] = facts.gender_pay_gap_url;
  }

  // Flexible hours
  if (facts.flexible_hours) {
    jsonLd['x-flexibleHours'] = facts.flexible_hours_details || true;
  }

  // Leave policies
  const leaveData: Record<string, string> = {};
  if (facts.annual_leave) leaveData.annualLeave = facts.annual_leave;
  if (facts.maternity_leave) leaveData.maternityLeave = facts.maternity_leave;
  if (facts.paternity_leave) leaveData.paternityLeave = facts.paternity_leave;
  if (facts.parental_leave_details) leaveData.parentalLeave = facts.parental_leave_details;
  
  if (Object.keys(leaveData).length > 0) {
    jsonLd['x-leavePolicy'] = leaveData;
  }

  // Compensation details
  if (facts.bonus_structure) {
    jsonLd['x-bonusStructure'] = facts.bonus_structure;
  }

  if (facts.pay_review_cycle) {
    jsonLd['x-payReviewCycle'] = facts.pay_review_cycle;
  }

  if (facts.pension_contribution) {
    jsonLd['x-pensionContribution'] = facts.pension_contribution;
  }

  // Career development
  if (facts.promotion_framework) {
    jsonLd['x-promotionFramework'] = facts.promotion_framework;
  }

  if (facts.learning_budget) {
    jsonLd['x-learningBudget'] = facts.learning_budget;
  }

  if (facts.career_levels && Array.isArray(facts.career_levels)) {
    jsonLd['x-careerLevels'] = facts.career_levels;
  }
}
