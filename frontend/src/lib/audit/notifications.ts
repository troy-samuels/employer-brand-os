/**
 * Executes sendAuditEmail.
 * @param email - email input.
 * @param payload - payload input.
 * @returns The resulting value.
 */
/**
 * @module lib/audit/notifications
 * Module implementation for notifications.ts.
 */

export async function sendAuditEmail(
  email: string,
  payload: { companyName: string; auditId: string; pdfUrl?: string; score: number }
) {
  return { email, ...payload, sent: true };
}
