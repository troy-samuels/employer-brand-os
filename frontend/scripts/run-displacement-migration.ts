/**
 * One-off script to run the displacement_reports migration
 */

import { readFileSync } from "fs";
import { join } from "path";
import { supabaseAdmin } from "../src/lib/supabase/admin";

async function runMigration() {
  console.log("Running displacement_reports migration...");

  const migrationSql = readFileSync(
    join(process.cwd(), "src/lib/supabase/migrations/002_displacement_reports.sql"),
    "utf-8"
  );

  try {
    const { error } = await supabaseAdmin.rpc("exec_sql", { sql: migrationSql });
    
    if (error) {
      console.error("Migration failed:", error);
      process.exit(1);
    }

    console.log("✓ Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    
    // Try direct query approach
    console.log("Trying direct query execution...");
    const { error: queryError } = await (supabaseAdmin as any).from("_").select("*").limit(0);
    
    // Just run the SQL statements one by one
    const statements = migrationSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.toLowerCase().startsWith("comment on")) {
        // Skip comments for now
        continue;
      }
      console.log("Executing:", statement.substring(0, 60) + "...");
      // We can't execute raw SQL without a stored procedure, so we'll need to do this manually
    }
    
    console.error("\nPlease run the migration manually in Supabase SQL editor:");
    console.log("\n1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql");
    console.log("2. Paste the contents of src/lib/supabase/migrations/002_displacement_reports.sql");
    console.log("3. Click 'Run'\n");
  }
}

runMigration();
