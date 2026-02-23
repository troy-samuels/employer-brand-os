/**
 * @module lib/auth/key-rotation
 * Rotates organization API keys with configurable grace periods.
 */

import { createHash, randomBytes } from "node:crypto";

import { supabaseAdmin } from "@/lib/supabase/admin";

const DEFAULT_GRACE_HOURS = 24;

/**
 * Defines the RotatedApiKey contract.
 */
export type RotatedApiKey = {
  keyId: string;
  rawKey: string;
  keyPrefix: string;
  gracePeriodHours: number;
  oldKeysExpireAt: string;
};

function deriveAllowedDomains(website: string | null | undefined): string[] {
  if (!website) {
    return [];
  }

  try {
    const parsed = new URL(website);
    const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (!hostname) {
      return [];
    }
    return [hostname, `*.${hostname}`];
  } catch {
    return [];
  }
}

/**
 * Generates a secure API key, deterministic prefix, and persisted hash.
 * @returns Key material used for insert and caller response.
 */
function generateSecureKey(): { raw: string; prefix: string; hash: string } {
  const randomPart = randomBytes(16).toString("hex");
  const raw = `bos_live_${randomPart}`;
  const prefix = raw.substring(0, 16);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

/**
 * Returns a new date offset by the provided number of hours.
 * @param date - Baseline date.
 * @param hours - Number of hours to add.
 * @returns A new date with the offset applied.
 */
function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Marks expired keys as inactive for an organization.
 * @param organizationId - Organization identifier.
 * @returns A promise that resolves after key expiration cleanup.
 */
export async function expireRotatedKeys(organizationId: string): Promise<void> {
  const nowIso = new Date().toISOString();
  const admin = supabaseAdmin;

  await admin
    .from("api_keys")
    .update({ is_active: false })
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .not("expires_at", "is", null)
    .lt("expires_at", nowIso);
}

/**
 * Rotate API key while keeping current active keys valid during a short grace window.
 * @param params - Rotation settings and key metadata.
 * @returns The newly rotated key details including temporary raw key value.
 */
export async function rotateApiKey(params: {
  organizationId: string;
  name?: string;
  createdBy?: string | null;
  scopes?: string[];
  rateLimitPerMinute?: number;
  gracePeriodHours?: number;
}): Promise<RotatedApiKey> {
  const admin = supabaseAdmin;
  const now = new Date();
  const gracePeriodHours = params.gracePeriodHours ?? DEFAULT_GRACE_HOURS;
  const oldKeysExpireAt = addHours(now, gracePeriodHours).toISOString();

  await expireRotatedKeys(params.organizationId);

  const { data: existingActive } = await admin
    .from("api_keys")
    .select("id")
    .eq("organization_id", params.organizationId)
    .eq("is_active", true);

  if (Array.isArray(existingActive) && existingActive.length > 0) {
    await admin
      .from("api_keys")
      .update({
        expires_at: oldKeysExpireAt,
      })
      .eq("organization_id", params.organizationId)
      .eq("is_active", true);
  }

  const { raw, prefix, hash } = generateSecureKey();
  const { data: orgData } = await admin
    .from("organizations")
    .select("website")
    .eq("id", params.organizationId)
    .maybeSingle();
  const allowedDomains = deriveAllowedDomains(
    (orgData as { website?: string | null } | null)?.website
  );

  const insertPayload: Record<string, unknown> = {
      organization_id: params.organizationId,
      created_by: params.createdBy ?? null,
      name: params.name ?? "Production Key",
      key_prefix: prefix,
      key_hash: hash,
      scopes: params.scopes ?? ["pixel:read", "facts:read"],
      is_active: true,
      expires_at: null,
      rate_limit_per_minute: params.rateLimitPerMinute ?? 100,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

  const { data: newKey, error: insertError } = await admin
    .from("api_keys")
    .insert(insertPayload as never)
    .select("id")
    .single();

  if (insertError || !newKey) {
    throw new Error("Failed to create rotated API key");
  }

  return {
    keyId: newKey.id,
    rawKey: raw,
    keyPrefix: prefix,
    keyVersion: 1,
    gracePeriodHours,
    oldKeysExpireAt,
  };
}
