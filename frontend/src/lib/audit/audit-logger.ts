/**
 * @module lib/audit/audit-logger
 * Records audit and security events to persistent storage.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/types/database.types";

type AuditResult = "success" | "failure" | "denied";

type AuditLogInput = {
  action: string;
  actor: string;
  resource: string;
  result: AuditResult;
  metadata?: Record<string, unknown>;
  organizationId?: string | null;
  userId?: string | null;
  tableName?: string;
  recordId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

function toJson(value: Record<string, unknown> | undefined): Json {
  return (value ?? {}) as Json;
}

/**
 * Write an audit event. Logging failures are intentionally non-fatal.
 * @param input - Structured audit event details.
 * @returns A promise that resolves when the write attempt completes.
 */
export async function logAuditEvent(input: AuditLogInput): Promise<void> {
  const timestamp = new Date().toISOString();

  try {
    await supabaseAdmin.from("audit_logs").insert({
      created_at: timestamp,
      timestamp,
      action: input.action,
      actor: input.actor,
      resource: input.resource,
      result: input.result,
      metadata: toJson(input.metadata),
      organization_id: input.organizationId ?? null,
      user_id: input.userId ?? null,
      table_name: input.tableName ?? input.resource,
      record_id: input.recordId ?? null,
      new_values: toJson(input.metadata),
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent ?? null,
    });
  } catch (error) {
    console.error("[AUDIT] Failed to write audit log:", error);
  }
}

/**
 * Records API key validation outcomes in the audit trail.
 * @param input - Validation metadata and result.
 * @returns A promise that resolves when logging has completed.
 */
export async function logApiKeyValidation(input: {
  apiKeyPrefix: string;
  result: AuditResult;
  organizationId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await logAuditEvent({
    action: "api_key.validate",
    actor: input.apiKeyPrefix,
    resource: "api_keys",
    result: input.result,
    organizationId: input.organizationId ?? null,
    ipAddress: input.ipAddress ?? null,
    metadata: input.metadata,
    tableName: "api_keys",
  });
}

/**
 * Records inbound audit endpoint requests for security monitoring.
 * @param input - Request actor, result, and metadata.
 * @returns A promise that resolves when logging has completed.
 */
export async function logAuditRequest(input: {
  actor: string;
  result: AuditResult;
  resource: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await logAuditEvent({
    action: "audit.request",
    actor: input.actor,
    resource: input.resource,
    result: input.result,
    metadata: input.metadata,
    tableName: "audit_website_checks",
  });
}

/**
 * Records Smart Pixel script load events.
 * @param input - Pixel load details.
 * @returns A promise that resolves when logging has completed.
 */
export async function logPixelLoad(input: {
  actor: string;
  result: AuditResult;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await logAuditEvent({
    action: "pixel.load",
    actor: input.actor,
    resource: "pixel_script",
    result: input.result,
    metadata: input.metadata,
    tableName: "pixel_events",
  });
}

/**
 * Records privileged admin operations for traceability.
 * @param input - Admin action metadata.
 * @returns A promise that resolves when logging has completed.
 */
export async function logAdminAction(input: {
  actor: string;
  action: string;
  resource: string;
  result: AuditResult;
  organizationId?: string | null;
  userId?: string | null;
  recordId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await logAuditEvent({
    action: input.action,
    actor: input.actor,
    resource: input.resource,
    result: input.result,
    organizationId: input.organizationId ?? null,
    userId: input.userId ?? null,
    recordId: input.recordId ?? null,
    metadata: input.metadata,
    tableName: input.resource,
  });
}
