/**
 * @module lib/utils/csrf
 * Module implementation for csrf.ts.
 */

import { type NextRequest } from "next/server";

/**
 * Executes validateCsrf.
 * @param request - request input.
 * @returns The resulting value.
 */
export function validateCsrf(request: NextRequest): boolean {
  const host = request.headers.get("host");
  if (!host) return false;

  const origin = request.headers.get("origin");
  if (!origin) {
    // Some same-origin browser requests (notably GET) may omit `Origin`.
    // In that case, only trust explicit same-site/same-origin fetch metadata.
    const fetchSite = request.headers.get("sec-fetch-site");
    return fetchSite === "same-origin" || fetchSite === "same-site";
  }

  try {
    const originUrl = new URL(origin);
    if (originUrl.host === host) {
      return true;
    }

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
