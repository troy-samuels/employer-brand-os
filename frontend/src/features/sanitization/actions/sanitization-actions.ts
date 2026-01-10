'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { JobTitleMappingFormData } from '../schemas/sanitization.schema';
import type {
  JobTitleMapping,
  SaveMappingResult,
  DeleteMappingResult,
  MappingListResult,
} from '../types/sanitization.types';

// MVP: Using test organization ID
// TODO: Get from authenticated user session
const TEST_ORG_ID = '6e5805ce-1576-4d06-b32c-38d2957854a0';

/**
 * Get all job title mappings for the organization
 */
export async function getMappings(): Promise<MappingListResult> {
  try {
    const { data, error, count } = await supabaseAdmin
      .from('job_title_mappings')
      .select('*', { count: 'exact' })
      .eq('organization_id', TEST_ORG_ID)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mappings:', error);
      return { mappings: [], total: 0 };
    }

    return {
      mappings: data as JobTitleMapping[],
      total: count || 0,
    };
  } catch (error) {
    console.error('Unexpected error fetching mappings:', error);
    return { mappings: [], total: 0 };
  }
}

/**
 * Get a single mapping by ID
 */
export async function getMapping(id: string): Promise<JobTitleMapping | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('job_title_mappings')
      .select('*')
      .eq('id', id)
      .eq('organization_id', TEST_ORG_ID)
      .single();

    if (error) {
      console.error('Error fetching mapping:', error);
      return null;
    }

    return data as JobTitleMapping;
  } catch (error) {
    console.error('Unexpected error fetching mapping:', error);
    return null;
  }
}

/**
 * Create a new job title mapping
 */
export async function createMapping(
  data: JobTitleMappingFormData
): Promise<SaveMappingResult> {
  try {
    // Check if internal code already exists
    const { data: existing } = await supabaseAdmin
      .from('job_title_mappings')
      .select('id')
      .eq('organization_id', TEST_ORG_ID)
      .eq('internal_code', data.internalCode)
      .single();

    if (existing) {
      return {
        success: false,
        error: `Internal code "${data.internalCode}" already exists`,
      };
    }

    const { data: created, error } = await supabaseAdmin
      .from('job_title_mappings')
      .insert({
        organization_id: TEST_ORG_ID,
        internal_code: data.internalCode,
        public_title: data.publicTitle,
        job_family: data.jobFamily || null,
        level_indicator: data.levelIndicator || null,
        location_id: data.locationId || null,
        aliases: data.aliases,
        is_active: data.isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mapping:', error);
      return { success: false, error: 'Failed to create mapping' };
    }

    revalidatePath('/dashboard/sanitization');

    return {
      success: true,
      mapping: created as JobTitleMapping,
    };
  } catch (error) {
    console.error('Unexpected error creating mapping:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing job title mapping
 */
export async function updateMapping(
  id: string,
  data: JobTitleMappingFormData
): Promise<SaveMappingResult> {
  try {
    // Check if internal code is being changed and already exists
    const { data: existing } = await supabaseAdmin
      .from('job_title_mappings')
      .select('id, internal_code')
      .eq('organization_id', TEST_ORG_ID)
      .eq('internal_code', data.internalCode)
      .single();

    if (existing && existing.id !== id) {
      return {
        success: false,
        error: `Internal code "${data.internalCode}" already exists`,
      };
    }

    const { data: updated, error } = await supabaseAdmin
      .from('job_title_mappings')
      .update({
        internal_code: data.internalCode,
        public_title: data.publicTitle,
        job_family: data.jobFamily || null,
        level_indicator: data.levelIndicator || null,
        location_id: data.locationId || null,
        aliases: data.aliases,
        is_active: data.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', TEST_ORG_ID)
      .select()
      .single();

    if (error) {
      console.error('Error updating mapping:', error);
      return { success: false, error: 'Failed to update mapping' };
    }

    revalidatePath('/dashboard/sanitization');

    return {
      success: true,
      mapping: updated as JobTitleMapping,
    };
  } catch (error) {
    console.error('Unexpected error updating mapping:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a job title mapping
 */
export async function deleteMapping(id: string): Promise<DeleteMappingResult> {
  try {
    const { error } = await supabaseAdmin
      .from('job_title_mappings')
      .delete()
      .eq('id', id)
      .eq('organization_id', TEST_ORG_ID);

    if (error) {
      console.error('Error deleting mapping:', error);
      return { success: false, error: 'Failed to delete mapping' };
    }

    revalidatePath('/dashboard/sanitization');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting mapping:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Toggle active status of a mapping
 */
export async function toggleMappingActive(
  id: string,
  isActive: boolean
): Promise<SaveMappingResult> {
  try {
    const { data: updated, error } = await supabaseAdmin
      .from('job_title_mappings')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', TEST_ORG_ID)
      .select()
      .single();

    if (error) {
      console.error('Error toggling mapping:', error);
      return { success: false, error: 'Failed to update mapping status' };
    }

    revalidatePath('/dashboard/sanitization');

    return {
      success: true,
      mapping: updated as JobTitleMapping,
    };
  } catch (error) {
    console.error('Unexpected error toggling mapping:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
