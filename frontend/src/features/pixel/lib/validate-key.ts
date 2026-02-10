/**
 * @module features/pixel/lib/validate-key
 * API Key Validation
 * Validates Smart Pixel API keys against the database
 */

import { createHash } from "node:crypto";

import { logApiKeyValidation } from "@/lib/audit/audit-logger";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ValidatedPixelKey } from "../types/pixel.types";

export const PIXEL_API_KEY_REGEX = /^bos_(live|test)_[a-zA-Z0-9]+$/;

export type ApiKeyValidationFailureReason =
  | "invalid_format"
  | "not_found_or_inactive"
  | "expired"
  | "hash_mismatch"
  | "missing_organization"
  | "unexpected_error";

export type ApiKeyValidationResult =
  | {
      ok: true;
      key: ValidatedPixelKey;
    }
  | {
      ok: false;
      reason: ApiKeyValidationFailureReason;
    };

export function isValidPixelApiKeyFormat(fullKey: string): boolean {
  const trimmed = fullKey.trim();
  return trimmed.length >= 16 && PIXEL_API_KEY_REGEX.test(trimmed);
}

/**
 * Validate an API key and return the associated pixel configuration
 *
 * Business Logic:
 * - Keys are stored as hashed values, but we match on key_prefix for lookup
 * - Key must be active and not expired
 * - Updates last_used_at timestamp on successful validation
 *
 * @param fullKey - The full API key (e.g., "bos_live_abc123...")
 * @returns Validated key data or null if invalid
 */
export async function validateApiKey(
  fullKey: string,
  context?: {
    ipAddress?: string | null;
    userAgent?: string | null;
    resource?: string;
  }
): Promise<ValidatedPixelKey | null> {
  const result = await validateApiKeyWithStatus(fullKey, context);
  return result.ok ? result.key : null;
}

export async function validateApiKeyWithStatus(
  fullKey: string,
  context?: {
    ipAddress?: string | null;
    userAgent?: string | null;
    resource?: string;
  }
): Promise<ApiKeyValidationResult> {
  const trimmedKey = fullKey.trim();
  if (!isValidPixelApiKeyFormat(trimmedKey)) {
    return {
      ok: false,
      reason: "invalid_format",
    };
  }

  const keyPrefix = extractKeyPrefix(trimmedKey);

  try {
    const admin = supabaseAdmin;

    // Query API keys table by key_prefix.
    const { data: pixel, error } = await admin
      .from('api_keys')
      .select(`
        id,
        organization_id,
        name,
        scopes,
        key_hash,
        key_version,
        rate_limit_per_minute,
        is_active,
        expires_at
      `)
      .eq('key_prefix', keyPrefix)
      .eq('is_active', true)
      .single();

    if (error || !pixel) {
      void logApiKeyValidation({
        apiKeyPrefix: keyPrefix,
        result: 'failure',
        ipAddress: context?.ipAddress ?? null,
        metadata: {
          reason: 'not_found_or_inactive',
          resource: context?.resource ?? 'pixel',
          user_agent: context?.userAgent ?? null,
        },
      });
      return {
        ok: false,
        reason: "not_found_or_inactive",
      };
    }

    // Check expiration
    if (pixel.expires_at && new Date(pixel.expires_at) < new Date()) {
      void admin
        .from('api_keys')
        .update({
          is_active: false,
        })
        .eq('id', pixel.id);

      void logApiKeyValidation({
        apiKeyPrefix: keyPrefix,
        result: 'failure',
        organizationId: pixel.organization_id ?? null,
        ipAddress: context?.ipAddress ?? null,
        metadata: {
          reason: 'expired',
          resource: context?.resource ?? 'pixel',
          user_agent: context?.userAgent ?? null,
          key_version: pixel.key_version ?? null,
        },
      });
      return {
        ok: false,
        reason: "expired",
      };
    }

    const candidateHash = createHash('sha256').update(trimmedKey).digest('hex');
    if (candidateHash !== pixel.key_hash) {
      void logApiKeyValidation({
        apiKeyPrefix: keyPrefix,
        result: 'failure',
        organizationId: pixel.organization_id ?? null,
        ipAddress: context?.ipAddress ?? null,
        metadata: {
          reason: 'hash_mismatch',
          resource: context?.resource ?? 'pixel',
          user_agent: context?.userAgent ?? null,
          key_version: pixel.key_version ?? null,
        },
      });
      return {
        ok: false,
        reason: "hash_mismatch",
      };
    }

    // Update last_used_at timestamp (fire and forget - don't block response)
    admin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', pixel.id)
      .then(() => {
        // Intentionally empty - we don't wait for this
      });

    // Ensure organization_id exists
    const organizationId = pixel.organization_id;
    if (!organizationId) {
      void logApiKeyValidation({
        apiKeyPrefix: keyPrefix,
        result: 'failure',
        ipAddress: context?.ipAddress ?? null,
        metadata: {
          reason: 'missing_organization',
          resource: context?.resource ?? 'pixel',
          user_agent: context?.userAgent ?? null,
          key_version: pixel.key_version ?? null,
        },
      });
      return {
        ok: false,
        reason: "missing_organization",
      };
    }

    // Fetch allowed domains from the organization's smart pixel config
    // For now, we'll use a default pattern based on the organization
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('website')
      .eq('id', organizationId)
      .single();

    // Build allowed domains from organization website
    // In production, this would come from a dedicated allowed_domains column
    const allowedDomains: string[] = [];
    if (org?.website) {
      try {
        const url = new URL(org.website);
        allowedDomains.push(url.hostname);
        allowedDomains.push(`*.${url.hostname}`);
      } catch {
        // Invalid URL, skip
      }
    }

    void logApiKeyValidation({
      apiKeyPrefix: keyPrefix,
      result: 'success',
      organizationId,
      ipAddress: context?.ipAddress ?? null,
      metadata: {
        resource: context?.resource ?? 'pixel',
        user_agent: context?.userAgent ?? null,
        key_version: pixel.key_version ?? null,
      },
    });

    return {
      ok: true,
      key: {
        id: pixel.id,
        organisationId: organizationId,
        allowedDomains,
        rateLimitPerMinute: pixel.rate_limit_per_minute ?? 100,
        isActive: pixel.is_active ?? false,
        expiresAt: pixel.expires_at ? new Date(pixel.expires_at) : null,
        name: pixel.name,
        keyVersion: pixel.key_version ?? 1,
      },
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    void logApiKeyValidation({
      apiKeyPrefix: keyPrefix,
      result: 'failure',
      ipAddress: context?.ipAddress ?? null,
      metadata: {
        reason: 'unexpected_error',
        resource: context?.resource ?? 'pixel',
        user_agent: context?.userAgent ?? null,
      },
    });
    return {
      ok: false,
      reason: "unexpected_error",
    };
  }
}

/**
 * Extract the key prefix from a full API key
 * Format: bos_live_xxxxxxxx or bos_test_xxxxxxxx
 * @param fullKey - Full API key value.
 * @returns The fixed-length key prefix used for indexed lookup.
 */
export function extractKeyPrefix(fullKey: string): string {
  // Return first 16 characters as the prefix
  return fullKey.trim().substring(0, 16);
}
