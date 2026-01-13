'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserOrganization, hasPermission } from '@/lib/auth/get-user-org';
import type { CompanyFactsFormData } from '../schemas/facts.schema';
import type { SaveFactsResult } from '../types/facts.types';
import type { Json } from '@/types/database.types';

export async function saveCompanyFacts(
  data: CompanyFactsFormData
): Promise<SaveFactsResult> {
  try {
    // Get authenticated user's organization
    const userOrg = await getUserOrganization();

    if (!userOrg) {
      return { success: false, error: 'You must be logged in to save facts' };
    }

    // Check if user has permission to edit facts
    if (!hasPermission(userOrg.userRole, 'edit')) {
      return { success: false, error: 'You do not have permission to edit facts' };
    }

    const orgId = userOrg.organizationId;

    // 1. Update organization name only (no description column in table)
    const { error: orgError } = await supabaseAdmin
      .from('organizations')
      .update({
        name: data.companyName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (orgError) {
      console.error('Error updating organization:', orgError);
      return { success: false, error: 'Failed to update organization' };
    }

    // 2. Get or create fact definitions for our fields
    const definitions = await getOrCreateFactDefinitions();

    // 3. Save description fact
    if (data.description) {
      const descError = await saveOrUpdateFact(orgId, definitions.description, data.description);
      if (descError) {
        return { success: false, error: 'Failed to save description' };
      }
    }

    // 4. Save salary fact
    const salaryValue = {
      min: data.salaryMin,
      max: data.salaryMax,
      currency: data.currency,
    };
    const salaryError = await saveOrUpdateFact(orgId, definitions.salary, salaryValue);
    if (salaryError) {
      return { success: false, error: 'Failed to save salary information' };
    }

    // 5. Save benefits fact
    const benefitsError = await saveOrUpdateFact(orgId, definitions.benefits, data.benefits);
    if (benefitsError) {
      return { success: false, error: 'Failed to save benefits information' };
    }

    // 6. Save remote policy fact
    const remotePolicyDisplay = {
      remote: 'Fully Remote',
      hybrid: 'Hybrid',
      onsite: 'On-site',
    }[data.remotePolicy];

    const policyValue = {
      value: data.remotePolicy,
      display: remotePolicyDisplay,
    };
    const policyError = await saveOrUpdateFact(orgId, definitions.remotePolicy, policyValue);
    if (policyError) {
      return { success: false, error: 'Failed to save remote policy' };
    }

    // Revalidate the facts page to show updated data
    revalidatePath('/dashboard/facts');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error saving facts:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Helper to save or update a fact (no unique constraint, so we check first)
async function saveOrUpdateFact(
  orgId: string,
  definitionId: string,
  value: Json
): Promise<string | null> {
  try {
    // Check if fact already exists
    const { data: existing } = await supabaseAdmin
      .from('employer_facts')
      .select('id')
      .eq('organization_id', orgId)
      .eq('definition_id', definitionId)
      .eq('is_current', true)
      .single();

    if (existing) {
      // Update existing fact
      const { error } = await supabaseAdmin
        .from('employer_facts')
        .update({
          value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating fact:', error);
        return error.message;
      }
    } else {
      // Insert new fact
      const { error } = await supabaseAdmin
        .from('employer_facts')
        .insert({
          organization_id: orgId,
          definition_id: definitionId,
          value,
          include_in_jsonld: true,
          is_current: true,
          verification_status: 'unverified',
          effective_date: new Date().toISOString(),
        });

      if (error) {
        console.error('Error inserting fact:', error);
        return error.message;
      }
    }

    return null; // Success
  } catch (error) {
    console.error('Unexpected error saving fact:', error);
    return 'Unexpected error';
  }
}

// Helper to get existing fact definition IDs or create them
async function getOrCreateFactDefinitions(): Promise<{
  description: string;
  salary: string;
  benefits: string;
  remotePolicy: string;
}> {
  // First, ensure we have a category
  let categoryId: string;

  const { data: existingCategory } = await supabaseAdmin
    .from('fact_categories')
    .select('id')
    .eq('name', 'compensation')
    .single();

  if (existingCategory) {
    categoryId = existingCategory.id;
  } else {
    const { data: newCategory } = await supabaseAdmin
      .from('fact_categories')
      .insert({
        name: 'compensation',
        display_name: 'Compensation & Benefits',
        description: 'Salary, benefits, and work policies',
        icon: 'dollar-sign',
        sort_order: 1,
      })
      .select('id')
      .single();

    categoryId = newCategory?.id || '';
  }

  // Get or create description definition
  const descriptionDef = await getOrCreateDefinition({
    name: 'company_description',
    displayName: 'Company Description',
    categoryId,
    dataType: 'text',
    schemaProperty: 'description',
  });

  // Get or create salary definition
  const salaryDef = await getOrCreateDefinition({
    name: 'base_salary',
    displayName: 'Base Salary',
    categoryId,
    dataType: 'range',
    schemaProperty: 'baseSalary',
  });

  // Get or create benefits definition
  const benefitsDef = await getOrCreateDefinition({
    name: 'benefits_list',
    displayName: 'Benefits',
    categoryId,
    dataType: 'list',
    schemaProperty: 'jobBenefits',
  });

  // Get or create remote policy definition
  const remoteDef = await getOrCreateDefinition({
    name: 'remote_policy',
    displayName: 'Remote Policy',
    categoryId,
    dataType: 'enum',
    schemaProperty: 'jobLocationType',
  });

  return {
    description: descriptionDef,
    salary: salaryDef,
    benefits: benefitsDef,
    remotePolicy: remoteDef,
  };
}

async function getOrCreateDefinition(params: {
  name: string;
  displayName: string;
  categoryId: string;
  dataType: string;
  schemaProperty: string;
}): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from('fact_definitions')
    .select('id')
    .eq('name', params.name)
    .is('organization_id', null)
    .single();

  if (existing) {
    return existing.id;
  }

  const { data: created } = await supabaseAdmin
    .from('fact_definitions')
    .insert({
      organization_id: null, // System-wide definition
      category_id: params.categoryId,
      name: params.name,
      display_name: params.displayName,
      data_type: params.dataType,
      schema_property: params.schemaProperty,
      include_in_jsonld: true,
      is_required: false,
      is_public: true,
      sort_order: 1,
    })
    .select('id')
    .single();

  return created?.id || '';
}

export async function getCompanyFacts(): Promise<CompanyFactsFormData | null> {
  try {
    // Get authenticated user's organization
    const userOrg = await getUserOrganization();

    if (!userOrg) {
      return null;
    }

    const orgId = userOrg.organizationId;

    // Get organization data (name only - no description column)
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();

    if (!org) return null;

    // Get fact definitions
    const definitions = await getOrCreateFactDefinitions();

    // Get description fact
    const { data: descFact } = await supabaseAdmin
      .from('employer_facts')
      .select('value')
      .eq('organization_id', orgId)
      .eq('definition_id', definitions.description)
      .eq('is_current', true)
      .single();

    // Get salary fact
    const { data: salaryFact } = await supabaseAdmin
      .from('employer_facts')
      .select('value')
      .eq('organization_id', orgId)
      .eq('definition_id', definitions.salary)
      .eq('is_current', true)
      .single();

    // Get benefits fact
    const { data: benefitsFact } = await supabaseAdmin
      .from('employer_facts')
      .select('value')
      .eq('organization_id', orgId)
      .eq('definition_id', definitions.benefits)
      .eq('is_current', true)
      .single();

    // Get remote policy fact
    const { data: remoteFact } = await supabaseAdmin
      .from('employer_facts')
      .select('value')
      .eq('organization_id', orgId)
      .eq('definition_id', definitions.remotePolicy)
      .eq('is_current', true)
      .single();

    const descValue = descFact?.value as string | null;
    const salaryValue = salaryFact?.value as { min?: number; max?: number; currency?: string } | null;
    const benefitsValue = benefitsFact?.value as string[] | null;
    const remoteValue = remoteFact?.value as { value?: string } | null;

    return {
      companyName: org.name || '',
      description: descValue || '',
      salaryMin: salaryValue?.min || 0,
      salaryMax: salaryValue?.max || 0,
      currency: (salaryValue?.currency as 'USD' | 'EUR' | 'GBP') || 'USD',
      benefits: benefitsValue || [],
      remotePolicy: (remoteValue?.value as 'remote' | 'hybrid' | 'onsite') || 'hybrid',
    };
  } catch (error) {
    console.error('Error fetching company facts:', error);
    return null;
  }
}
