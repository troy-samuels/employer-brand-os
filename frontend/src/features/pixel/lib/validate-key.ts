/**
 * API Key Validation
 * Validates Smart Pixel API keys against the database
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import type { ValidatedPixelKey } from '../types/pixel.types';

/**
 * Validate an API key and return the associated pixel configuration
 *
 * Business Logic:
 * - Keys are stored as hashed values, but we match on key_prefix for lookup
 * - Key must be active and not expired
 * - Updates last_used_at timestamp on successful validation
 *
 * @param keyPrefix - The API key prefix (e.g., "bos_live_abc123")
 * @returns Validated key data or null if invalid
 */
export async function validateApiKey(
  keyPrefix: string
): Promise<ValidatedPixelKey | null> {
  try {
    // Query smart_pixels table by key_prefix
    // The key_prefix column stores the identifiable portion of the key
    const { data: pixel, error } = await supabaseAdmin
      .from('api_keys')
      .select(`
        id,
        organization_id,
        name,
        scopes,
        rate_limit_per_minute,
        is_active,
        expires_at
      `)
      .eq('key_prefix', keyPrefix.substring(0, 16))
      .eq('is_active', true)
      .single();

    if (error || !pixel) {
      return null;
    }

    // Check expiration
    if (pixel.expires_at && new Date(pixel.expires_at) < new Date()) {
      return null;
    }

    // Update last_used_at timestamp (fire and forget - don't block response)
    supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', pixel.id)
      .then(() => {
        // Intentionally empty - we don't wait for this
      });

    // Ensure organization_id exists
    const organizationId = pixel.organization_id;
    if (!organizationId) {
      return null;
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

    return {
      id: pixel.id,
      organisationId: organizationId,
      allowedDomains,
      rateLimitPerMinute: pixel.rate_limit_per_minute ?? 100,
      isActive: pixel.is_active ?? false,
      expiresAt: pixel.expires_at ? new Date(pixel.expires_at) : null,
      name: pixel.name,
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

/**
 * Extract the key prefix from a full API key
 * Format: bos_live_xxxxxxxx or bos_test_xxxxxxxx
 */
export function extractKeyPrefix(fullKey: string): string {
  // Return first 16 characters as the prefix
  return fullKey.substring(0, 16);
}
