/**
 * OpenRole: Batch Audit Runner
 *
 * Reads the top 500 UK employers JSON and audits each one via the
 * OpenRole audit API. Rate-limited, resumable, with dry-run support.
 *
 * Usage:
 *   npx tsx scripts/batch-audit.ts --dry-run --limit 10     # preview
 *   npx tsx scripts/batch-audit.ts --limit 50               # audit 50
 *   npx tsx scripts/batch-audit.ts                           # audit all
 *   npx tsx scripts/batch-audit.ts --resume                  # resume interrupted
 *   npx tsx scripts/batch-audit.ts --delay 10                # 10s between audits
 */

import fs from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

dotenv.config({ path: path.join(__dirname, "../frontend/.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local"
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const AUDIT_API_URL = "https://openrole.co.uk/api/audit";
const INPUT_PATH = path.join(__dirname, "../data/top-500-uk-employers.json");
const STATE_FILE = path.join(__dirname, ".batch-audit-state.json");

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const RESUME = args.includes("--resume");
const SKIP_EXISTING = !args.includes("--no-skip");

let MAX_AUDITS: number | undefined;
const limitIdx = args.indexOf("--limit");
if (limitIdx !== -1 && args[limitIdx + 1]) {
  MAX_AUDITS = parseInt(args[limitIdx + 1], 10);
  if (isNaN(MAX_AUDITS)) {
    console.error("❌  --limit requires a number");
    process.exit(1);
  }
}

let DELAY_SECONDS = 5;
const delayIdx = args.indexOf("--delay");
if (delayIdx !== -1 && args[delayIdx + 1]) {
  DELAY_SECONDS = parseInt(args[delayIdx + 1], 10);
  if (isNaN(DELAY_SECONDS)) {
    console.error("❌  --delay requires a number");
    process.exit(1);
  }
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: npx tsx scripts/batch-audit.ts [OPTIONS]

Options:
  --dry-run       List what would be audited without running audits
  --limit N       Audit only the first N companies
  --delay N       Seconds between audits (default: 5)
  --resume        Resume from last checkpoint
  --no-skip       Don't skip companies already in public_audits
  --help          Show this help

Examples:
  npx tsx scripts/batch-audit.ts --dry-run --limit 10
  npx tsx scripts/batch-audit.ts --limit 50
  npx tsx scripts/batch-audit.ts --resume
`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CompanyEntry {
  name: string;
  domain: string;
  contactCount: number;
  topTitles: string[];
  hasDecisionMakers: boolean;
}

interface AuditState {
  completedDomains: string[];
  failedDomains: string[];
  lastIndex: number;
  timestamp: string;
}

interface AuditResult {
  domain: string;
  companyName: string;
  companySlug: string;
  score: number;
  scoreBreakdown: Record<string, unknown>;
  hasLlmsTxt: boolean;
  hasJsonld: boolean;
  hasSalaryData: boolean;
  careersPageStatus: string;
  robotsTxtStatus: string;
  atsDetected: string | null;
}

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------

function loadState(): AuditState {
  if (RESUME && fs.existsSync(STATE_FILE)) {
    try {
      const raw = fs.readFileSync(STATE_FILE, "utf-8");
      const state = JSON.parse(raw) as AuditState;
      console.log(
        `📂 Resuming from index ${state.lastIndex}, ${state.completedDomains.length} already done`
      );
      return state;
    } catch {
      console.warn("⚠️  Could not read resume state, starting fresh");
    }
  }
  return {
    completedDomains: [],
    failedDomains: [],
    lastIndex: 0,
    timestamp: new Date().toISOString(),
  };
}

function saveState(state: AuditState): void {
  if (DRY_RUN) return;
  state.timestamp = new Date().toISOString();
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {
    // Non-fatal
  }
}

// ---------------------------------------------------------------------------
// Check existing audits
// ---------------------------------------------------------------------------

async function getExistingAuditDomains(): Promise<Set<string>> {
  const domains = new Set<string>();
  const PAGE_SIZE = 1000;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("public_audits")
      .select("company_domain")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) break;

    for (const row of data) {
      if (row.company_domain) {
        domains.add(row.company_domain.toLowerCase());
      }
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return domains;
}

// ---------------------------------------------------------------------------
// Audit API call
// ---------------------------------------------------------------------------

async function callAuditApi(domain: string): Promise<AuditResult | null> {
  try {
    const response = await fetch(AUDIT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://openrole.co.uk",
        Referer: "https://openrole.co.uk/",
      },
      body: JSON.stringify({ url: domain }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`   ❌ HTTP ${response.status}: ${text.slice(0, 200)}`);
      return null;
    }

    const json = await response.json();

    // The API wraps in { data: ... } via apiSuccessResponse
    const result = json.data || json;

    return result as AuditResult;
  } catch (err) {
    console.error(`   ❌ Network error: ${(err as Error).message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Sleep
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const startMs = Date.now();

  // Load input
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`❌  Input file not found: ${INPUT_PATH}`);
    console.error(`   Run 'npx tsx scripts/extract-top-companies.ts' first.`);
    process.exit(1);
  }

  const companies: CompanyEntry[] = JSON.parse(
    fs.readFileSync(INPUT_PATH, "utf-8")
  );

  console.log("═".repeat(72));
  console.log(`  OpenRole — Batch Audit Runner${DRY_RUN ? " (DRY RUN)" : ""}`);
  console.log("═".repeat(72));
  console.log(`  API:           ${AUDIT_API_URL}`);
  console.log(`  Input:         ${INPUT_PATH}`);
  console.log(`  Companies:     ${companies.length.toLocaleString()}`);
  console.log(`  Limit:         ${MAX_AUDITS ?? "ALL"}`);
  console.log(`  Delay:         ${DELAY_SECONDS}s between audits`);
  console.log(`  Skip existing: ${SKIP_EXISTING}`);
  console.log(`  Dry run:       ${DRY_RUN}`);
  console.log(`  Resume:        ${RESUME}`);
  console.log("═".repeat(72));
  console.log("");

  // Load state
  const state = loadState();
  const completedSet = new Set(state.completedDomains);

  // Check existing audits in DB
  let existingDomains = new Set<string>();
  if (SKIP_EXISTING) {
    console.log("🔍 Checking existing audits in public_audits...");
    existingDomains = await getExistingAuditDomains();
    console.log(`   Found ${existingDomains.size} existing audits`);
  }

  // Build audit queue
  const queue: { index: number; company: CompanyEntry }[] = [];
  let skippedExisting = 0;
  let skippedCompleted = 0;

  for (let i = 0; i < companies.length; i++) {
    if (MAX_AUDITS && queue.length >= MAX_AUDITS) break;

    const company = companies[i];
    const domainLower = company.domain.toLowerCase();

    // Skip already completed in this run
    if (completedSet.has(domainLower)) {
      skippedCompleted++;
      continue;
    }

    // Skip already in DB
    if (SKIP_EXISTING && existingDomains.has(domainLower)) {
      skippedExisting++;
      continue;
    }

    queue.push({ index: i, company });
  }

  console.log(`\n📋 Audit queue: ${queue.length} companies`);
  if (skippedExisting > 0) {
    console.log(`   ⏭️  Skipped (already audited): ${skippedExisting}`);
  }
  if (skippedCompleted > 0) {
    console.log(`   ⏭️  Skipped (completed this run): ${skippedCompleted}`);
  }

  // Dry run: just list
  if (DRY_RUN) {
    console.log(`\n📝 Would audit these ${queue.length} companies:\n`);
    for (let i = 0; i < queue.length; i++) {
      const { index, company } = queue[i];
      const dm = company.hasDecisionMakers ? "🎯" : "  ";
      console.log(
        `  ${(i + 1).toString().padStart(4)}. ${dm} ${company.name.padEnd(45)} ${company.domain.padEnd(30)} (${company.contactCount} contacts)`
      );
    }

    const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);
    const estTime = (queue.length * DELAY_SECONDS) / 60;
    console.log(`\n  ⏱️  Estimated real run time: ~${estTime.toFixed(0)} minutes`);
    console.log(`  ⏱️  Dry run completed in ${elapsed}s`);
    console.log("═".repeat(72));
    return;
  }

  // Real audit run
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const { index, company } = queue[i];
    const progress = `[${i + 1}/${queue.length}]`;

    console.log(
      `\n${progress} Auditing: ${company.name} (${company.domain})...`
    );

    const result = await callAuditApi(company.domain);

    if (result) {
      successCount++;
      state.completedDomains.push(company.domain.toLowerCase());
      console.log(
        `   ✅ Score: ${result.score}/100 | ` +
          `Careers: ${result.careersPageStatus} | ` +
          `ATS: ${result.atsDetected || "none"} | ` +
          `llms.txt: ${result.hasLlmsTxt ? "yes" : "no"}`
      );
    } else {
      failCount++;
      state.failedDomains.push(company.domain.toLowerCase());
      console.log(`   ❌ Failed — will retry on next run`);
    }

    state.lastIndex = index;
    saveState(state);

    // Rate limit (skip delay after last item)
    if (i < queue.length - 1) {
      process.stdout.write(`   ⏳ Waiting ${DELAY_SECONDS}s...`);
      await sleep(DELAY_SECONDS * 1000);
      process.stdout.write(" done\n");
    }
  }

  // Clean up state on completion
  if (failCount === 0 && fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);

  console.log("");
  console.log("═".repeat(72));
  console.log("  ✅ BATCH AUDIT COMPLETE");
  console.log("═".repeat(72));
  console.log(`  ⏱️  Duration:     ${elapsed}s`);
  console.log(`  ✅ Successful:   ${successCount}`);
  console.log(`  ❌ Failed:       ${failCount}`);
  console.log(
    `  ⏭️  Skipped:     ${skippedExisting + skippedCompleted}`
  );
  if (failCount > 0) {
    console.log(`\n  💡 Re-run with --resume to retry failed audits`);
    console.log(`  Failed domains:`);
    for (const d of state.failedDomains) {
      console.log(`     - ${d}`);
    }
  }
  console.log("═".repeat(72));
}

main().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
