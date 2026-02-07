// @ts-nocheck — job_title_mappings not in generated Supabase types yet
'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserOrganization, hasPermission } from '@/lib/auth/get-user-org';
import type { JobTitleMappingFormData } from '../schemas/sanitization.schema';
import type {
  JobTitleMapping,
  SaveMappingResult,
  DeleteMappingResult,
  MappingListResult,
} from '../types/sanitization.types';

async function requireOrganization(permission: 'view' | 'edit') {
  const userOrg = await getUserOrganization();

  if (!userOrg) {
    return { error: 'You must be logged in to access sanitization settings' };
  }

  if (!hasPermission(userOrg.userRole, permission)) {
    return { error: 'You do not have permission to perform this action' };
  }

  return { userOrg };
}

/**
 * Get all job title mappings for the organization
 */
export async function getMappings(): Promise<MappingListResult> {
  try {
    const auth = await requireOrganization('view');
    if (!auth.userOrg) {
      return { mappings: [], total: 0, error: auth.error };
    }

    const orgId = auth.userOrg.organizationId;
    const { data, error, count } = await supabaseAdmin
      .from('job_title_mappings' as any)
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mappings:', error);
      return { mappings: [], total: 0, error: 'Failed to load mappings' };
    }

    return {
      mappings: data as unknown as JobTitleMapping[],
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
    const auth = await requireOrganization('view');
    if (!auth.userOrg) {
      return null;
    }

    const orgId = auth.userOrg.organizationId;
    const { data, error } = await supabaseAdmin
      .from('job_title_mappings' as any)
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();

    if (error) {
      console.error('Error fetching mapping:', error);
      return null;
    }

    return data as unknown as JobTitleMapping;
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
    const auth = await requireOrganization('edit');
    if (!auth.userOrg) {
      return { success: false, error: auth.error };
    }

    const orgId = auth.userOrg.organizationId;
    const userId = auth.userOrg.userId;
    // Check if internal code already exists
    const { data: existing } = await supabaseAdmin
      .from('job_title_mappings' as any)
      .select('id')
      .eq('organization_id', orgId)
      .eq('internal_code', data.internalCode)
      .single();

    if (existing) {
      return {
        success: false,
        error: `Internal code "${data.internalCode}" already exists`,
      };
    }

    const { data: created, error } = await supabaseAdmin
      .from('job_title_mappings' as any)
      .insert({
        organization_id: orgId,
        internal_code: data.internalCode,
        public_title: data.publicTitle,
        job_family: data.jobFamily || null,
        level_indicator: data.levelIndicator || null,
        location_id: data.locationId || null,
        aliases: data.aliases,
        is_active: data.isActive,
        created_by: userId,
        updated_by: userId,
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
      mapping: created as unknown as JobTitleMapping,
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
    const auth = await requireOrganization('edit');
    if (!auth.userOrg) {
      return { success: false, error: auth.error };
    }

    const orgId = auth.userOrg.organizationId;
    const userId = auth.userOrg.userId;
    // Check if internal code is being changed and already exists
    const { data: existing } = await supabaseAdmin
      .from('job_title_mappings' as any)
      .select('id, internal_code')
      .eq('organization_id', orgId)
      .eq('internal_code', data.internalCode)
      .single();

    if (existing && existing.id !== id) {
      return {
        success: false,
        error: `Internal code "${data.internalCode}" already exists`,
      };
    }

    const { data: updated, error } = await supabaseAdmin
      .from('job_title_mappings' as any)
      .update({
        internal_code: data.internalCode,
        public_title: data.publicTitle,
        job_family: data.jobFamily || null,
        level_indicator: data.levelIndicator || null,
        location_id: data.locationId || null,
        aliases: data.aliases,
        is_active: data.isActive,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Error updating mapping:', error);
      return { success: false, error: 'Failed to update mapping' };
    }

    revalidatePath('/dashboard/sanitization');

    return {
      success: true,
      mapping: updated as unknown as JobTitleMapping,
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
    const auth = await requireOrganization('edit');
    if (!auth.userOrg) {
      return { success: false, error: auth.error };
    }

    const orgId = auth.userOrg.organizationId;
    const { error } = await supabaseAdmin
      .from('job_title_mappings' as any)
      .delete()
      .eq('id', id)
      .eq('organization_id', orgId);

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
    const auth = await requireOrganization('edit');
    if (!auth.userOrg) {
      return { success: false, error: auth.error };
    }

    const orgId = auth.userOrg.organizationId;
    const userId = auth.userOrg.userId;
    const { data: updated, error } = await supabaseAdmin
      .from('job_title_mappings' as any)
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .eq('organization_id', orgId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling mapping:', error);
      return { success: false, error: 'Failed to update mapping status' };
    }

    revalidatePath('/dashboard/sanitization');

    return {
      success: true,
      mapping: updated as unknown as JobTitleMapping,
    };
  } catch (error) {
    console.error('Unexpected error toggling mapping:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
