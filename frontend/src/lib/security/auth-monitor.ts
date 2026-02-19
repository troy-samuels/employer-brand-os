/**
 * @module lib/security/auth-monitor
 * Monitors authentication failures to detect and prevent brute force attacks.
 * 
 * SECURITY CRITICAL: This helps detect:
 * - Brute force attacks on API keys
 * - Replay attack attempts
 * - Signature tampering
 * - Domain spoofing
 * 
 * Defense strategy:
 * - Track failures per IP address
 * - Auto-block IPs with excessive failures
 * - Alert on suspicious patterns
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { untypedTable } from '@/lib/supabase/untyped-table';

type FailureType =
  | 'invalid_signature'
  | 'replay_detected'
  | 'invalid_key'
  | 'key_expired'
  | 'domain_not_allowed'
  | 'rate_limited';

type FailureRecord = {
  count: number;
  firstFailureAt: number;
  lastFailureAt: number;
  blocked: boolean;
};

// In-memory failure tracking (per-instance)
// PRODUCTION: Migrate to Redis for distributed tracking
const failureTracker = new Map<string, FailureRecord>();

const FAILURE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILURES_PER_WINDOW = 20; // Block after 20 failures in 5 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // Block for 30 minutes

/**
 * Record an authentication failure
 * 
 * @param ip - Client IP address
 * @param failureType - Type of authentication failure
 * @param metadata - Additional context for logging
 * @returns True if the IP should be blocked
 */
export async function recordAuthFailure(
  ip: string | null,
  failureType: FailureType,
  metadata?: {
    apiKeyPrefix?: string;
    origin?: string;
    userAgent?: string;
    resource?: string;
  }
): Promise<boolean> {
  if (!ip || ip === 'unknown') {
    return false; // Can't track without IP
  }

  const now = Date.now();
  const existing = failureTracker.get(ip);

  // Check if already blocked
  if (existing?.blocked) {
    const blockExpiry = existing.lastFailureAt + BLOCK_DURATION_MS;
    if (now < blockExpiry) {
      console.warn(
        `[AuthMonitor] Blocked IP ${ip} attempted access (${failureType})`
      );
      return true; // Still blocked
    }
    // Block expired, reset
    failureTracker.delete(ip);
  }

  // Initialize or update failure record
  const record = existing ?? {
    count: 0,
    firstFailureAt: now,
    lastFailureAt: now,
    blocked: false,
  };

  // Reset if outside the window
  if (now - record.firstFailureAt > FAILURE_WINDOW_MS) {
    record.count = 1;
    record.firstFailureAt = now;
    record.lastFailureAt = now;
  } else {
    record.count += 1;
    record.lastFailureAt = now;
  }

  // Check if threshold exceeded
  if (record.count >= MAX_FAILURES_PER_WINDOW) {
    record.blocked = true;
    failureTracker.set(ip, record);

    // Log security event (fire and forget)
    void logSecurityEvent({
      eventType: 'ip_blocked',
      severity: 'high',
      ip,
      failureType,
      failureCount: record.count,
      metadata,
    });

    console.error(
      `[AuthMonitor] IP ${ip} blocked after ${record.count} failures`
    );

    return true; // Block this IP
  }

  failureTracker.set(ip, record);

  // Log individual failure (fire and forget)
  void logSecurityEvent({
    eventType: 'auth_failure',
    severity: record.count > 10 ? 'medium' : 'low',
    ip,
    failureType,
    failureCount: record.count,
    metadata,
  });

  return false; // Not blocked yet
}

/**
 * Check if an IP is currently blocked
 * 
 * @param ip - Client IP address
 * @returns True if blocked
 */
export function isIpBlocked(ip: string | null): boolean {
  if (!ip || ip === 'unknown') {
    return false;
  }

  const record = failureTracker.get(ip);
  if (!record?.blocked) {
    return false;
  }

  const now = Date.now();
  const blockExpiry = record.lastFailureAt + BLOCK_DURATION_MS;

  if (now >= blockExpiry) {
    // Block expired
    failureTracker.delete(ip);
    return false;
  }

  return true;
}

/**
 * Reset failure tracking for an IP (e.g., after successful auth)
 * 
 * @param ip - Client IP address
 */
export function resetAuthFailures(ip: string | null): void {
  if (!ip || ip === 'unknown') {
    return;
  }

  failureTracker.delete(ip);
}

/**
 * Log a security event to the database
 * Fire and forget - don't block the response
 */
async function logSecurityEvent(event: {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  failureType: FailureType;
  failureCount: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await untypedTable('security_events').insert({
      event_type: event.eventType,
      severity: event.severity,
      ip_address: event.ip,
      details: {
        failure_type: event.failureType,
        failure_count: event.failureCount,
        ...event.metadata,
      },
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't let logging failures affect the API response
    console.error('[AuthMonitor] Failed to log security event:', error);
  }
}

/**
 * Get current failure statistics (for monitoring dashboards)
 * 
 * @returns Array of IPs with failure counts
 */
export function getFailureStats(): Array<{
  ip: string;
  count: number;
  blocked: boolean;
  firstFailureAt: Date;
  lastFailureAt: Date;
}> {
  const stats: Array<{
    ip: string;
    count: number;
    blocked: boolean;
    firstFailureAt: Date;
    lastFailureAt: Date;
  }> = [];

  for (const [ip, record] of failureTracker.entries()) {
    stats.push({
      ip,
      count: record.count,
      blocked: record.blocked,
      firstFailureAt: new Date(record.firstFailureAt),
      lastFailureAt: new Date(record.lastFailureAt),
    });
  }

  return stats.sort((a, b) => b.count - a.count);
}
