/**
 * @module features/facts/actions/get-employer-facts
 * Server action to fetch employer facts
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import type { EmployerFacts } from '../types/employer-facts.types';

/**
 * Fetch employer facts for the current user's company
 * @returns Employer facts data or null if not found
 */
export async function getEmployerFacts(): Promise<EmployerFacts | null> {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('User not authenticated');
      return null;
    }

    // Get company slug from user metadata or profile
    const companySlug = user.user_metadata?.company_slug;
    
    if (!companySlug) {
      console.error('No company slug found for user');
      return null;
    }

    // Fetch employer facts
    const { data, error } = await supabase
      .from('employer_facts')
      .select('*')
      .eq('company_slug', companySlug)
      .single();

    if (error) {
      // If no data exists yet, that's fine - return null
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching employer facts:', error);
      return null;
    }

    return data as EmployerFacts;
  } catch (error) {
    console.error('Unexpected error fetching employer facts:', error);
    return null;
  }
}

/**
 * Get company slug and name from user metadata/profile
 * @returns Company info or null
 */
export async function getCompanyInfo(): Promise<{ slug: string; name: string } | null> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    // Try user metadata first
    const slug = user.user_metadata?.company_slug;
    const name = user.user_metadata?.company_name;

    if (slug && name) {
      return { slug, name };
    }

    // Fallback: try to get from profiles or companies table
    // This is a placeholder - implement based on your schema
    return null;
  } catch (error) {
    console.error('Error getting company info:', error);
    return null;
  }
}
