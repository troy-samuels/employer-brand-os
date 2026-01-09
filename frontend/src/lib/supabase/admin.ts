/**
 * Supabase Admin Client
 * Uses service role key for server-side operations that bypass RLS
 * SECURITY: Only use in API routes, never expose to client
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Validate environment variables at module load
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
}

/**
 * Create admin Supabase client with service role key
 * This client bypasses Row Level Security - use with caution
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Helper to create a scoped admin client for specific operations
 * Useful for transaction-like patterns
 */
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin configuration missing');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
