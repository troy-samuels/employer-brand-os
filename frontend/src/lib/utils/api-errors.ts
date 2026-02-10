/**
 * @module lib/utils/api-errors
 * Centralizes shared API error codes and common error messages.
 */

/**
 * Canonical error codes shared by API routes.
 */
export const API_ERROR_CODE = {
  badRequest: "bad_request",
  forbidden: "forbidden",
  internal: "internal_error",
  invalidJson: "invalid_json",
  invalidOrigin: "invalid_origin",
  invalidPayload: "invalid_payload",
  invalidSignature: "invalid_signature",
  malformedRequest: "malformed_request",
  missingHeader: "missing_header",
  notFound: "not_found",
  rateLimited: "rate_limited",
  replayDetected: "replay_detected",
  unauthorized: "unauthorized",
} as const;

/**
 * Reusable error messages for shared API failure conditions.
 */
export const API_ERROR_MESSAGE = {
  forbidden: "Forbidden",
  internal: "Internal server error",
  invalidJson: "Malformed JSON body.",
  invalidOrigin: "Invalid request origin",
  unauthorized: "Unauthorized",
} as const;
