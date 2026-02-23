/**
 * @module scripts/seed-score-history
 * Backfill score_history from existing public_audits data.
 * Creates one initial snapshot per company with their current score.
 * 
 * Run: npx tsx scripts/seed-score-history.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seed() {
  console.log("Fetching existing public audits...");

  const { data: audits, error } = await (supabase as ReturnType<typeof createClient>)
    .from("public_audits")
    .select("company_slug, company_domain, score, score_breakdown, has_llms_txt, has_jsonld, has_salary_data, careers_page_status, robots_txt_status, created_at, updated_at")
    .order("score", { ascending: false });

  if (error) {
    console.error("Failed to fetch audits:", error.message);
    process.exit(1);
  }

  if (!audits || audits.length === 0) {
    console.log("No audits found. Nothing to seed.");
    return;
  }

  console.log(`Found ${audits.length} companies. Seeding score history...`);

  let inserted = 0;
  let skipped = 0;

  for (const audit of audits) {
    const { error: insertError } = await (supabase as ReturnType<typeof createClient>)
      .from("score_history")
      .insert({
        company_slug: audit.company_slug,
        company_domain: audit.company_domain,
        score: audit.score,
        score_breakdown: audit.score_breakdown,
        has_llms_txt: audit.has_llms_txt,
        has_jsonld: audit.has_jsonld,
        has_salary_data: audit.has_salary_data,
        careers_page_status: audit.careers_page_status,
        robots_txt_status: audit.robots_txt_status,
        previous_score: null,
        source: "audit",
        created_at: audit.created_at || audit.updated_at,
      });

    if (insertError) {
      console.warn(`  Skipped ${audit.company_slug}: ${insertError.message}`);
      skipped++;
    } else {
      inserted++;
    }
  }

  console.log(`Done! Inserted: ${inserted}, Skipped: ${skipped}`);
}

seed().catch(console.error);
