import { createHash, randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DEFAULT_GRACE_HOURS = 24;

export type RotatedApiKey = {
  keyId: string;
  rawKey: string;
  keyPrefix: string;
  keyVersion: number;
  gracePeriodHours: number;
  oldKeysExpireAt: string;
};

function generateSecureKey(): { raw: string; prefix: string; hash: string } {
  const randomPart = randomBytes(16).toString("hex");
  const raw = `pk_live_${randomPart}`;
  const prefix = raw.substring(0, 16);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Marks expired keys as inactive for an organization.
 */
export async function expireRotatedKeys(organizationId: string): Promise<void> {
  const nowIso = new Date().toISOString();
  const admin = supabaseAdmin as any;

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
 */
export async function rotateApiKey(params: {
  organizationId: string;
  name?: string;
  createdBy?: string | null;
  scopes?: string[];
  rateLimitPerMinute?: number;
  gracePeriodHours?: number;
}): Promise<RotatedApiKey> {
  const admin = supabaseAdmin as any;
  const now = new Date();
  const gracePeriodHours = params.gracePeriodHours ?? DEFAULT_GRACE_HOURS;
  const oldKeysExpireAt = addHours(now, gracePeriodHours).toISOString();

  await expireRotatedKeys(params.organizationId);

  const { data: existingActive } = await admin
    .from("api_keys")
    .select("id, key_version")
    .eq("organization_id", params.organizationId)
    .eq("is_active", true);

  let nextVersion = 1;
  if (Array.isArray(existingActive) && existingActive.length > 0) {
    nextVersion =
      existingActive.reduce((maxVersion: number, item: { key_version?: number | null }) => {
        return Math.max(maxVersion, item.key_version ?? 1);
      }, 1) + 1;

    await admin
      .from("api_keys")
      .update({
        expires_at: oldKeysExpireAt,
      })
      .eq("organization_id", params.organizationId)
      .eq("is_active", true);
  }

  const { raw, prefix, hash } = generateSecureKey();

  const { data: newKey, error: insertError } = await admin
    .from("api_keys")
    .insert({
      organization_id: params.organizationId,
      created_by: params.createdBy ?? null,
      name: params.name ?? "Production Key",
      key_prefix: prefix,
      key_hash: hash,
      scopes: params.scopes ?? ["pixel:read", "facts:read"],
      key_version: nextVersion,
      is_active: true,
      expires_at: null,
      rate_limit_per_minute: params.rateLimitPerMinute ?? 100,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !newKey) {
    throw new Error("Failed to create rotated API key");
  }

  return {
    keyId: newKey.id,
    rawKey: raw,
    keyPrefix: prefix,
    keyVersion: nextVersion,
    gracePeriodHours,
    oldKeysExpireAt,
  };
}
