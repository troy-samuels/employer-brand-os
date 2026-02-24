/**
 * @module features/facts/actions/save-facts
 * Server actions to save and retrieve employer facts
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserOrganization, hasPermission } from '@/lib/auth/get-user-org';
import { logAdminAction } from '@/lib/audit/audit-logger';
import type { CompanyFactsFormData } from '../schemas/facts.schema';
import type { SaveFactsResult } from '../types/facts.types';

/**
 * Save company facts using the questionnaire schema
 * Maps form data to the flat employer_facts table columns
 * 
 * @param data - Form data from the facts questionnaire
 * @returns Success/error result
 */
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

    // Get company slug from user metadata
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication failed' };
    }

    const companySlug = user.user_metadata?.company_slug;
    
    if (!companySlug) {
      return { success: false, error: 'No company slug found for user' };
    }

    // Map form data to questionnaire schema columns
    const remotePolicyMap: Record<string, string> = {
      remote: 'fully-remote',
      hybrid: 'hybrid',
      onsite: 'office-first',
    };

    const employerFactsData = {
      company_slug: companySlug,
      company_name: data.companyName,
      culture_description: data.description || null,
      salary_bands: [
        {
          role: 'General',
          min: data.salaryMin,
          max: data.salaryMax,
          currency: data.currency,
          equity: false,
        },
      ],
      benefits: data.benefits.map((benefit) => ({
        category: 'General',
        name: benefit,
        details: '',
      })),
      remote_policy: remotePolicyMap[data.remotePolicy] || 'hybrid',
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Upsert employer facts (conflict on company_slug)
    const { error: upsertError } = await supabaseAdmin
      .from('employer_facts')
      .upsert(employerFactsData, {
        onConflict: 'company_slug',
      });

    if (upsertError) {
      console.error('Error upserting employer facts:', upsertError);
      return { success: false, error: 'Failed to save employer facts' };
    }

    // Revalidate the facts page to show updated data
    revalidatePath('/dashboard/facts');

    // Log the action for audit trail
    await logAdminAction({
      actor: userOrg.userId,
      action: 'facts.updated',
      resource: 'employer_facts',
      result: 'success',
      organizationId: userOrg.organizationId,
      userId: userOrg.userId,
      recordId: companySlug,
      metadata: {
        company_name: data.companyName,
        company_slug: companySlug,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Unexpected error saving facts:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get company facts for the current user
 * Reads from the flat questionnaire schema and maps to form data
 * 
 * @returns Form data or null if not found
 */
export async function getCompanyFacts(): Promise<CompanyFactsFormData | null> {
  try {
    // Get authenticated user's organization
    const userOrg = await getUserOrganization();

    if (!userOrg) {
      return null;
    }

    // Get company slug from user metadata
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const companySlug = user.user_metadata?.company_slug;
    
    if (!companySlug) {
      return null;
    }

    // Fetch employer facts by company slug
    const { data: facts, error: fetchError } = await supabaseAdmin
      .from('employer_facts')
      .select('*')
      .eq('company_slug', companySlug)
      .single();

    if (fetchError) {
      // If no data exists yet, that's fine - return null
      if (fetchError.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching employer facts:', fetchError);
      return null;
    }

    // Map questionnaire schema back to form data
    const remotePolicyReverseMap: Record<string, 'remote' | 'hybrid' | 'onsite'> = {
      'fully-remote': 'remote',
      'hybrid': 'hybrid',
      'office-first': 'onsite',
      'flexible': 'hybrid', // Default flexible to hybrid
    };

    // Extract salary band (first one, as we only support General role for now)
    const salaryBands = facts.salary_bands as Array<{
      role?: string;
      min?: number;
      max?: number;
      currency?: string;
      equity?: boolean;
    }> | null;
    const firstBand = salaryBands?.[0];

    // Extract benefits (map from structured to simple array)
    const benefitsData = facts.benefits as Array<{
      category?: string;
      name?: string;
      details?: string;
    }> | null;
    const benefitsList = benefitsData?.map((b) => b.name || '').filter(Boolean) || [];

    return {
      companyName: facts.company_name || '',
      description: facts.culture_description || '',
      salaryMin: firstBand?.min || 0,
      salaryMax: firstBand?.max || 0,
      currency: (firstBand?.currency as 'USD' | 'EUR' | 'GBP') || 'USD',
      benefits: benefitsList,
      remotePolicy: remotePolicyReverseMap[facts.remote_policy || 'hybrid'] || 'hybrid',
    };
  } catch (error) {
    console.error('Error fetching company facts:', error);
    return null;
  }
}
