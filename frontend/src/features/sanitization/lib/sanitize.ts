/**
 * @module features/sanitization/lib/sanitize
 * Resolves internal job codes into public-facing job metadata.
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { SanitizationResult } from "../types/sanitization.types";

/**
 * Sanitize a job code by looking up the mapping
 * Checks both exact matches and aliases
 * @param params - Organization scope and internal code to sanitize.
 * @returns A normalized sanitization result.
 */
export async function sanitizeJobCode(params: {
  organizationId: string;
  internalCode: string;
}): Promise<SanitizationResult> {
  const { organizationId, internalCode } = params;

  try {
    // First try exact match
    const { data: exactMatch } = await supabaseAdmin
      .from("job_title_mappings")
      .select("public_title, job_family, level_indicator")
      .eq("organization_id", organizationId)
      .eq("internal_code", internalCode)
      .eq("is_active", true)
      .single();

    if (exactMatch) {
      return {
        originalCode: internalCode,
        publicTitle: exactMatch.public_title,
        jobFamily: exactMatch.job_family,
        levelIndicator: exactMatch.level_indicator,
        sanitized: true,
      };
    }

    // Try alias match - check if code exists in any aliases array
    const { data: aliasMatch } = await supabaseAdmin
      .from("job_title_mappings")
      .select("public_title, job_family, level_indicator, aliases")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .contains("aliases", [internalCode]);

    if (aliasMatch && aliasMatch.length > 0) {
      const match = aliasMatch[0];
      return {
        originalCode: internalCode,
        publicTitle: match.public_title,
        jobFamily: match.job_family,
        levelIndicator: match.level_indicator,
        sanitized: true,
      };
    }

    // No match found
    return {
      originalCode: internalCode,
      publicTitle: null,
      jobFamily: null,
      levelIndicator: null,
      sanitized: false,
    };
  } catch (error) {
    console.error("Error sanitizing job code:", error);
    return {
      originalCode: internalCode,
      publicTitle: null,
      jobFamily: null,
      levelIndicator: null,
      sanitized: false,
    };
  }
}

/**
 * Batch sanitize multiple job codes
 * @param params - Organization scope and list of internal codes.
 * @returns Sanitization results for each requested code.
 */
export async function sanitizeJobCodes(params: {
  organizationId: string;
  internalCodes: string[];
}): Promise<SanitizationResult[]> {
  const { organizationId, internalCodes } = params;

  // Get all mappings for this org in one query
  const { data: mappings } = await supabaseAdmin
    .from("job_title_mappings")
    .select("internal_code, public_title, job_family, level_indicator, aliases")
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  if (!mappings || mappings.length === 0) {
    return internalCodes.map((code) => ({
      originalCode: code,
      publicTitle: null,
      jobFamily: null,
      levelIndicator: null,
      sanitized: false,
    }));
  }

  // Build lookup maps for fast matching
  const exactMap = new Map<string, typeof mappings[0]>();
  const aliasMap = new Map<string, typeof mappings[0]>();

  for (const mapping of mappings) {
    exactMap.set(mapping.internal_code, mapping);
    if (mapping.aliases && Array.isArray(mapping.aliases)) {
      for (const alias of mapping.aliases) {
        aliasMap.set(alias, mapping);
      }
    }
  }

  // Sanitize each code
  return internalCodes.map((code) => {
    const match = exactMap.get(code) || aliasMap.get(code);
    if (match) {
      return {
        originalCode: code,
        publicTitle: match.public_title,
        jobFamily: match.job_family,
        levelIndicator: match.level_indicator,
        sanitized: true,
      };
    }
    return {
      originalCode: code,
      publicTitle: null,
      jobFamily: null,
      levelIndicator: null,
      sanitized: false,
    };
  });
}
