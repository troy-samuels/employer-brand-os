/**
 * @module features/api-keys/actions/generate-key
 * Server actions for creating, fetching, and revoking organization API keys.
 */

"use server";

import { revalidatePath } from "next/cache";

import { logAdminAction } from "@/lib/audit/audit-logger";
import { getUserOrganization, hasPermission } from "@/lib/auth/get-user-org";
import { expireRotatedKeys, rotateApiKey } from "@/lib/auth/key-rotation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";
import type {
  GenerateKeyResult,
  GetApiKeyResult,
  RevokeKeyResult,
} from "../types/api-key.types";

/**
 * Generate a new production API key for the current user's organization
 *
 * Business Logic:
 * - User must be authenticated and belong to an organization
 * - User must have admin permission
 * - Key rotation keeps previous key valid for 24 hours
 * - Raw key is returned once, then only hash is stored
 * @param name - Optional display name for the generated key.
 * @returns Result object containing new key metadata on success.
 */
export async function generateApiKey(
  name: string = "Production Key",
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

    const rotatedKey = await rotateApiKey({
      organizationId: userOrg.organizationId,
      createdBy: userOrg.userId,
      name,
      scopes: ['pixel:read', 'facts:read'],
      rateLimitPerMinute: 100,
      gracePeriodHours: 24,
    });

    await logAdminAction({
      actor: userOrg.userId,
      action: 'api_key.rotated',
      resource: 'api_keys',
      result: 'success',
      organizationId: userOrg.organizationId,
      userId: userOrg.userId,
      recordId: rotatedKey.keyId,
      metadata: {
        key_prefix: rotatedKey.keyPrefix,
        key_version: rotatedKey.keyVersion,
        old_keys_expire_at: rotatedKey.oldKeysExpireAt,
      },
    });

    revalidatePath('/dashboard/integration');

    return {
      success: true,
      rawKey: rotatedKey.rawKey,
      keyPrefix: rotatedKey.keyPrefix,
      keyId: rotatedKey.keyId,
    };
  } catch (error) {
    console.error('Unexpected error generating API key:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get the current API key for the organization (prefix only, not raw key)
 * @returns Result object with current active key metadata when available.
 */
export async function getApiKey(): Promise<GetApiKeyResult> {
  try {
    // 1. Verify user and organization
    const userOrg = await getUserOrganization();

    if (!userOrg) {
      return { success: false, error: 'Not authenticated', hasKey: false };
    }

    const orgId = userOrg.organizationId;
    const admin = supabaseAdmin;
    const now = Date.now();

    await expireRotatedKeys(orgId);

    // Query all active keys and select the newest key version.
    const { data: keys, error } = await admin
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
      .eq('is_active', true);

    if (error || !Array.isArray(keys) || keys.length === 0) {
      return { success: true, hasKey: false };
    }

    const validKeys = keys.filter(
      (key: { expires_at?: string | null }) =>
        !key.expires_at || new Date(key.expires_at).getTime() > now
    );

    if (validKeys.length === 0) {
      return { success: true, hasKey: false };
    }

    const newestKey = validKeys.sort(
      (
        left: { created_at?: string | null },
        right: { created_at?: string | null }
      ) => {
        return (
          new Date(right.created_at ?? 0).getTime() -
          new Date(left.created_at ?? 0).getTime()
        );
      }
    )[0];

    return {
      success: true,
      hasKey: true,
      keyPrefix: newestKey.key_prefix,
      key: {
        id: newestKey.id,
        organizationId: newestKey.organization_id ?? '',
        name: newestKey.name ?? 'API Key',
        keyPrefix: newestKey.key_prefix,
        scopes: jsonToStringArray(newestKey.scopes),
        isActive: newestKey.is_active ?? false,
        createdAt: newestKey.created_at ?? new Date().toISOString(),
        lastUsedAt: newestKey.last_used_at,
        expiresAt: newestKey.expires_at,
        graceExpiresAt: newestKey.expires_at,
      },
    };
  } catch (error) {
    console.error('Error fetching API key:', error);
    return { success: false, error: 'Failed to fetch API key', hasKey: false };
  }
}

/**
 * Revoke the current API key
 * @param keyId - API key identifier to revoke.
 * @returns Result object indicating whether revocation succeeded.
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

    const admin = supabaseAdmin;

    // Revoke key (verify it belongs to user's org)
    const { error } = await admin
      .from('api_keys')
      .update({
        is_active: false,
        expires_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', keyId)
      .eq('organization_id', userOrg.organizationId);

    if (error) {
      return { success: false, error: 'Failed to revoke API key' };
    }

    await logAdminAction({
      actor: userOrg.userId,
      action: 'api_key.revoked',
      resource: 'api_keys',
      result: 'success',
      organizationId: userOrg.organizationId,
      userId: userOrg.userId,
      recordId: keyId,
    });

    revalidatePath('/dashboard/integration');

    return { success: true };
  } catch (error) {
    console.error('Error revoking API key:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Converts JSON values from Supabase to a list of string scopes.
 * @param value - JSON value returned from the database.
 * @returns A normalized list of key scopes.
 */
function jsonToStringArray(value: Json | null): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}
