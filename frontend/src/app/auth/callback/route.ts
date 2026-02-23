/**
 * @module app/auth/callback/route
 * Handles the OAuth/magic-link callback from Supabase Auth.
 *
 * SECURITY: Validates redirect origin against NEXT_PUBLIC_APP_URL to prevent
 * open-redirect attacks via crafted callback URLs.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Returns a safe base URL for redirects.
 * Validates the request origin against NEXT_PUBLIC_APP_URL.
 * Falls back to NEXT_PUBLIC_APP_URL or relative path if origin is untrusted.
 */
function getSafeRedirectBase(requestUrl: URL): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (appUrl) {
    try {
      const trusted = new URL(appUrl);
      // Only allow redirect if the request origin matches the configured app URL
      if (requestUrl.origin === trusted.origin) {
        return requestUrl.origin;
      }
      // Origin mismatch — use the configured app URL instead
      return trusted.origin;
    } catch {
      // Invalid NEXT_PUBLIC_APP_URL — fall through to relative redirect
    }
  }

  // No app URL configured — use relative redirects for safety
  return '';
}

/**
 * Handles GET /auth/callback — exchanges the auth code for a session.
 * @param request - Incoming request with auth code in query params.
 * @returns Redirect to /dashboard on success, /login on failure.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const base = getSafeRedirectBase(requestUrl)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully authenticated, redirect to dashboard
      return NextResponse.redirect(`${base}/dashboard`)
    }
  }

  // If there's no code or an error, redirect to login with error
  return NextResponse.redirect(`${base}/login?error=auth_callback_error`)
}
