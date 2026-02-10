/**
 * @module lib/utils/api-response
 * Provides typed helpers for consistent API success and error responses.
 */

import { NextResponse } from "next/server";

/**
 * Standard error payload returned by API routes.
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  status: number;
  retryAfter?: number;
  details?: unknown;
}

/**
 * Configures the fields and response metadata for an API error payload.
 */
export interface ApiErrorResponseOptions {
  error: string;
  code?: string;
  status: number;
  retryAfter?: number;
  details?: unknown;
  headers?: HeadersInit;
}

/**
 * Builds a standard API error response body and HTTP status.
 * @param options - Error payload fields and optional response headers.
 * @returns A typed `NextResponse` with the standard error shape.
 */
export function apiErrorResponse(
  options: ApiErrorResponseOptions,
): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    error: options.error,
    status: options.status,
    ...(options.code ? { code: options.code } : {}),
    ...(options.retryAfter !== undefined ? { retryAfter: options.retryAfter } : {}),
    ...(options.details !== undefined ? { details: options.details } : {}),
  };

  return NextResponse.json(body, {
    status: options.status,
    headers: options.headers,
  });
}

/**
 * Builds a typed API success response.
 * @param body - The success payload body to serialize as JSON.
 * @param init - Optional response init overrides.
 * @returns A typed `NextResponse` containing the provided payload.
 */
export function apiSuccessResponse<T>(
  body: T,
  init?: ResponseInit,
): NextResponse<T> {
  return NextResponse.json(body, init);
}
