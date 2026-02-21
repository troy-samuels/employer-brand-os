/**
 * @module lib/utils/csrf
 * Module implementation for csrf.ts.
 */

import { type NextRequest } from "next/server";

/**
 * Executes validateCsrf.
 * @param request - request input.
 * @returns The resulting value.
 * 
 * SECURITY: Stricter CSRF validation - only allows same-origin, not same-site.
 * This prevents subdomain attacks (e.g., attacker.openrole.co.uk → api.openrole.co.uk).
 */
export function validateCsrf(request: NextRequest): boolean {
  const host = request.headers.get("host");
  if (!host) return false;

  const origin = request.headers.get("origin");
  if (!origin) {
    // Some same-origin browser requests (notably GET) may omit `Origin`.
    // In that case, only trust explicit same-origin fetch metadata.
    // SECURITY: Changed from accepting "same-site" to only "same-origin"
    const fetchSite = request.headers.get("sec-fetch-site");
    return fetchSite === "same-origin";
  }

  try {
    const originUrl = new URL(origin);
    
    // Strict host matching (includes port if specified)
    if (originUrl.host === host) {
      return true;
    }

    // Fallback to NEXT_PUBLIC_APP_URL for cases where host might be proxied
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return false;
    }

    const appUrlHost = new URL(appUrl).host;
    return originUrl.host === appUrlHost;
  } catch {
    return false;
  }
}
