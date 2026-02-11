/**
 * @module lib/supabase/untyped-table
 * Provides a type-safe helper for querying Supabase tables that are not
 * yet included in the generated `Database` types.
 *
 * Instead of casting `supabaseAdmin as any`, we centralise the `any` escape
 * hatch here so callers retain chain-method IntelliSense while
 * acknowledging the table is not statically typed.
 *
 * Usage:
 * ```ts
 * const { data, error } = await untypedTable("public_audits")
 *   .select("company_slug, updated_at")
 *   .order("score", { ascending: false })
 *   .limit(100);
 * ```
 */

import { supabaseAdmin } from "@/lib/supabase/admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQueryBuilder = any;

/**
 * Returns a Supabase query builder for a table whose name is not (yet)
 * in the generated `Database` type.
 *
 * This avoids `as any` casts across the codebase while keeping the table
 * name explicit — making it easy to search for when types are regenerated.
 *
 * @param tableName - Name of the untyped table.
 * @returns A Supabase `PostgrestQueryBuilder` for the given table.
 */
export function untypedTable(tableName: string): AnyQueryBuilder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabaseAdmin as any).from(tableName);
}

/**
 * Fire-and-forget helper for Supabase RPC calls on functions that are
 * not yet represented in the generated types.
 *
 * @param fnName - Name of the database function.
 * @param args - Arguments to pass to the function.
 * @returns The Supabase RPC response.
 */
export async function untypedRpc(
  fnName: string,
  args?: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ data: any; error: any }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabaseAdmin as any).rpc(fnName, args);
}
