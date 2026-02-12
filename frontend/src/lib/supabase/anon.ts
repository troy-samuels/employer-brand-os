/**
 * @module lib/supabase/anon
 * Lightweight Supabase client using the anon key for public read-only queries.
 * Safe for use in API routes that don't require elevated privileges.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

/**
 * Anon Supabase client — respects Row Level Security.
 * Use for public-facing queries that don't need admin privileges.
 */
export const supabaseAnon = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
