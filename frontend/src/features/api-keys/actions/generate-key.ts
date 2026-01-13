'use server';

/**
 * API Key Generation Server Action
 * Generates secure production API keys for the Smart Pixel
 *
 * Security:
 * - Raw key is returned ONLY ONCE at creation time
 * - Hash is stored in DB (SHA-256)
 * - Key prefix is stored for lookup/display
 */

import { randomBytes, createHash } from 'crypto';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getUserOrganization, hasPermission } from '@/lib/auth/get-user-org';
import type {
  GenerateKeyResult,
  GetApiKeyResult,
  RevokeKeyResult,
  DEFAULT_SCOPES,
} from '../types/api-key.types';

/**
 * Generate a cryptographically secure API key
 * Format: pk_live_<32 random hex chars>
 */
function generateSecureKey(): { raw: string; prefix: string; hash: string } {
  const randomPart = randomBytes(16).toString('hex');
  const raw = `pk_live_${randomPart}`;
  const prefix = raw.substring(0, 16); // pk_live_xxxxxxxx
  const hash = createHash('sha256').update(raw).digest('hex');

  return { raw, prefix, hash };
}

/**
 * Generate a new production API key for the current user's organization
 *
 * Business Logic:
 * - User must be authenticated and belong to an organization
 * - User must have admin permission
 * - Only one active key per organization (revokes existing)
 * - Raw key is returned once, then only hash is stored
 */
export async function generateApiKey(
  name: string = 'Production Key'
): Promise<GenerateKeyResult> {
  try {
    // 1. Verify user and organization
    const userOrg = await getUserOrganization();

    if (!userOrg) {
      return { success: false, error: 'You must be logged in to generate an API key' };
    }

    // 2. Check admin permission
    if (!hasPermission(userOrg.userRole, 'admin')) {
      return { success: false, error: 'Only administrators can generate API keys' };
    }

    const orgId = userOrg.organizationId;

    // 3. Revoke any existing active keys for this organization
    await supabaseAdmin
      .from('api_keys')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', orgId)
      .eq('is_active', true);

    // 4. Generate new secure key
    const { raw, prefix, hash } = generateSecureKey();

    // 5. Store key in database (hash only)
    const { data: newKey, error: insertError } = await supabaseAdmin
      .from('api_keys')
      .insert({
        organization_id: orgId,
        name,
        key_prefix: prefix,
        key_hash: hash,
        scopes: ['pixel:read', 'facts:read'],
        is_active: true,
        rate_limit_per_minute: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError || !newKey) {
      console.error('Error creating API key:', insertError);
      return { success: false, error: 'Failed to create API key' };
    }

    // 6. Create audit log entry
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: orgId,
      user_id: userOrg.userId,
      action: 'api_key.created',
      table_name: 'api_keys',
      record_id: newKey.id,
      new_values: { name, key_prefix: prefix },
    });

    // 7. Revalidate the integration page
    revalidatePath('/dashboard/integration');

    // Return the raw key ONE TIME ONLY
    return {
      success: true,
      rawKey: raw,
      keyPrefix: prefix,
      keyId: newKey.id,
    };
  } catch (error) {
    console.error('Unexpected error generating API key:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get the current API key for the organization (prefix only, not raw key)
 */
export async function getApiKey(): Promise<GetApiKeyResult> {
  try {
    // 1. Verify user and organization
    const userOrg = await getUserOrganization();

    if (!userOrg) {
      return { success: false, error: 'Not authenticated', hasKey: false };
    }

    const orgId = userOrg.organizationId;

    // 2. Query for active key
    const { data: key, error } = await supabaseAdmin
      .from('api_keys')
      .select(`
        id,
        organization_id,
        name,
        key_prefix,
        scopes,
        is_active,
        created_at,
        last_used_at,
        expires_at
      `)
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .single();

    if (error || !key) {
      return { success: true, hasKey: false };
    }

    return {
      success: true,
      hasKey: true,
      keyPrefix: key.key_prefix,
      key: {
        id: key.id,
        organizationId: key.organization_id ?? '',
        name: key.name ?? 'API Key',
        keyPrefix: key.key_prefix,
        scopes: (key.scopes as string[]) ?? [],
        isActive: key.is_active ?? false,
        createdAt: key.created_at ?? new Date().toISOString(),
        lastUsedAt: key.last_used_at,
        expiresAt: key.expires_at,
      },
    };
  } catch (error) {
    console.error('Error fetching API key:', error);
    return { success: false, error: 'Failed to fetch API key', hasKey: false };
  }
}

/**
 * Revoke the current API key
 */
export async function revokeApiKey(keyId: string): Promise<RevokeKeyResult> {
  try {
    // 1. Verify user and organization
    const userOrg = await getUserOrganization();

    if (!userOrg) {
      return { success: false, error: 'Not authenticated' };
    }

    // 2. Check admin permission
    if (!hasPermission(userOrg.userRole, 'admin')) {
      return { success: false, error: 'Only administrators can revoke API keys' };
    }

    // 3. Revoke key (verify it belongs to user's org)
    const { error } = await supabaseAdmin
      .from('api_keys')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', keyId)
      .eq('organization_id', userOrg.organizationId);

    if (error) {
      return { success: false, error: 'Failed to revoke API key' };
    }

    // 4. Audit log
    await supabaseAdmin.from('audit_logs').insert({
      organization_id: userOrg.organizationId,
      user_id: userOrg.userId,
      action: 'api_key.revoked',
      table_name: 'api_keys',
      record_id: keyId,
    });

    revalidatePath('/dashboard/integration');

    return { success: true };
  } catch (error) {
    console.error('Error revoking API key:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
