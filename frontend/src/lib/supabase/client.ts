/**
 * @module lib/supabase/client
 * Module implementation for client.ts.
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Executes createClient.
 * @returns The resulting value.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
