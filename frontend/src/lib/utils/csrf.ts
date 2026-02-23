/**
 * @module lib/utils/csrf
 * Module implementation for csrf.ts.
 */

import { type NextRequest } from "next/server";
import {
  getAllowedRequestHosts,
  getOriginHost,
} from "@/lib/security/request-metadata";

/**
 * Executes validateCsrf.
 * @param request - request input.
 * @returns The resulting value.
 * 
 * SECURITY: Stricter CSRF validation - only allows same-origin, not same-site.
 * This prevents subdomain attacks (e.g., attacker.openrole.co.uk → api.openrole.co.uk).
 */
export function validateCsrf(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Some browser requests omit `Origin`, so we use fetch metadata.
    // Missing fetch metadata is treated as untrusted.
    const fetchSite = request.headers.get("sec-fetch-site");
    return fetchSite === "same-origin";
  }

  const originHost = getOriginHost(origin);
  if (!originHost) {
    return false;
  }

  const allowedHosts = getAllowedRequestHosts(request);
  if (allowedHosts.size === 0) {
    return false;
  }

  return allowedHosts.has(originHost);
}
