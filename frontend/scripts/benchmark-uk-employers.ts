/**
 * @module scripts/benchmark-uk-employers
 * Benchmarks 100 major UK employers using the Rankwell audit engine.
 *
 * Usage:
 *   npx tsx scripts/benchmark-uk-employers.ts [--force] [--limit=N] [--offset=N]
 *
 * Flags:
 *   --force   Re-audit companies even if audited in the last 7 days
 *   --limit   Only audit the first N companies
 *   --offset  Start from company N (0-indexed)
 *
 * Results are:
 *   1. Stored in Supabase (audit_website_checks + public_audits)
 *   2. Written to scripts/output/benchmark-results.json
 *   3. Summarised to scripts/output/benchmark-summary.csv
 */

import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------- Bootstrap env before any @/ imports ----------
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "..");
const ENV_PATH = resolve(PROJECT_ROOT, ".env.local");

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  const file = readFileSync(path, "utf8");
  for (const rawLine of file.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equalsIdx = line.indexOf("=");
    if (equalsIdx < 1) continue;
    const key = line.slice(0, equalsIdx).trim();
    let value = line.slice(equalsIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(ENV_PATH);

// ---------- Imports that depend on env ----------
// These use @/ path aliases resolved via tsx
import { runWebsiteChecks, type WebsiteCheckResult } from "@/lib/audit/website-checks";
import { persistAuditResult } from "@/lib/audit/audit-persistence";
import { untypedTable } from "@/lib/supabase/untyped-table";

// ---------- Config ----------
const DELAY_BETWEEN_AUDITS_MS = 3_000;
const SKIP_IF_AUDITED_WITHIN_DAYS = 7;
const OUTPUT_DIR = resolve(SCRIPT_DIR, "output");

// ---------- UK Employers list ----------
interface Employer {
  name: string;
  domain: string;
  sector: string;
}

const UK_EMPLOYERS: Employer[] = [
  // ── FTSE 100 / Blue Chips ──────────────────────
  { name: "HSBC", domain: "hsbc.co.uk", sector: "Banking" },
  { name: "Barclays", domain: "barclays.co.uk", sector: "Banking" },
  { name: "Lloyds Banking Group", domain: "lloydsbankinggroup.com", sector: "Banking" },
  { name: "NatWest Group", domain: "natwestgroup.com", sector: "Banking" },
  { name: "Standard Chartered", domain: "sc.com", sector: "Banking" },
  { name: "Aviva", domain: "aviva.co.uk", sector: "Insurance" },
  { name: "Legal & General", domain: "legalandgeneral.com", sector: "Insurance" },
  { name: "Prudential", domain: "prudential.co.uk", sector: "Insurance" },
  { name: "AstraZeneca", domain: "astrazeneca.com", sector: "Pharma" },
  { name: "GSK", domain: "gsk.com", sector: "Pharma" },
  { name: "Unilever", domain: "unilever.com", sector: "FMCG" },
  { name: "Reckitt", domain: "reckitt.com", sector: "FMCG" },
  { name: "Diageo", domain: "diageo.com", sector: "FMCG" },
  { name: "BAE Systems", domain: "baesystems.com", sector: "Defence" },
  { name: "Rolls-Royce", domain: "rolls-royce.com", sector: "Aerospace" },
  { name: "BP", domain: "bp.com", sector: "Energy" },
  { name: "Shell", domain: "shell.com", sector: "Energy" },
  { name: "Rio Tinto", domain: "riotinto.com", sector: "Mining" },
  { name: "Anglo American", domain: "angloamerican.com", sector: "Mining" },
  { name: "BT Group", domain: "bt.com", sector: "Telecoms" },
  { name: "Vodafone", domain: "vodafone.co.uk", sector: "Telecoms" },
  { name: "Tesco", domain: "tesco.com", sector: "Retail" },
  { name: "Sainsbury's", domain: "sainsburys.co.uk", sector: "Retail" },
  { name: "Marks & Spencer", domain: "marksandspencer.com", sector: "Retail" },
  { name: "Next", domain: "next.co.uk", sector: "Retail" },
  { name: "WPP", domain: "wpp.com", sector: "Advertising" },
  { name: "Compass Group", domain: "compass-group.com", sector: "Catering" },
  { name: "Experian", domain: "experian.co.uk", sector: "Data" },
  { name: "RELX", domain: "relx.com", sector: "Publishing" },
  { name: "London Stock Exchange Group", domain: "lseg.com", sector: "Financial Services" },

  // ── Tech & Digital ─────────────────────────────
  { name: "Arm", domain: "arm.com", sector: "Technology" },
  { name: "Revolut", domain: "revolut.com", sector: "Fintech" },
  { name: "Wise", domain: "wise.com", sector: "Fintech" },
  { name: "Monzo", domain: "monzo.com", sector: "Fintech" },
  { name: "Starling Bank", domain: "starlingbank.com", sector: "Fintech" },
  { name: "Deliveroo", domain: "deliveroo.co.uk", sector: "Technology" },
  { name: "Darktrace", domain: "darktrace.com", sector: "Cybersecurity" },
  { name: "Ocado", domain: "ocado.com", sector: "Technology" },
  { name: "Sage", domain: "sage.com", sector: "Technology" },
  { name: "Sophos", domain: "sophos.com", sector: "Cybersecurity" },
  { name: "Checkout.com", domain: "checkout.com", sector: "Fintech" },
  { name: "GoCardless", domain: "gocardless.com", sector: "Fintech" },
  { name: "Thought Machine", domain: "thoughtmachine.net", sector: "Fintech" },
  { name: "Improbable", domain: "improbable.io", sector: "Technology" },
  { name: "Sky", domain: "sky.com", sector: "Media" },

  // ── Professional Services ──────────────────────
  { name: "Deloitte UK", domain: "deloitte.co.uk", sector: "Consulting" },
  { name: "PwC UK", domain: "pwc.co.uk", sector: "Consulting" },
  { name: "EY UK", domain: "ey.com", sector: "Consulting" },
  { name: "KPMG UK", domain: "kpmg.co.uk", sector: "Consulting" },
  { name: "McKinsey UK", domain: "mckinsey.com", sector: "Consulting" },
  { name: "Accenture UK", domain: "accenture.com", sector: "Consulting" },
  { name: "Capgemini UK", domain: "capgemini.com", sector: "Consulting" },
  { name: "Clifford Chance", domain: "cliffordchance.com", sector: "Legal" },
  { name: "Linklaters", domain: "linklaters.com", sector: "Legal" },
  { name: "Allen & Overy", domain: "allenovery.com", sector: "Legal" },
  { name: "Freshfields", domain: "freshfields.com", sector: "Legal" },

  // ── Healthcare / Public Sector ─────────────────
  { name: "NHS England", domain: "england.nhs.uk", sector: "Healthcare" },
  { name: "NHS Scotland", domain: "nhs.scot", sector: "Healthcare" },
  { name: "Civil Service", domain: "civilservice.gov.uk", sector: "Government" },
  { name: "BBC", domain: "bbc.co.uk", sector: "Media" },
  { name: "Channel 4", domain: "channel4.com", sector: "Media" },
  { name: "Network Rail", domain: "networkrail.co.uk", sector: "Infrastructure" },
  { name: "Transport for London", domain: "tfl.gov.uk", sector: "Transport" },
  { name: "John Lewis Partnership", domain: "johnlewispartnership.co.uk", sector: "Retail" },

  // ── Universities ───────────────────────────────
  { name: "University of Oxford", domain: "ox.ac.uk", sector: "Education" },
  { name: "University of Cambridge", domain: "cam.ac.uk", sector: "Education" },
  { name: "Imperial College London", domain: "imperial.ac.uk", sector: "Education" },
  { name: "UCL", domain: "ucl.ac.uk", sector: "Education" },
  { name: "London School of Economics", domain: "lse.ac.uk", sector: "Education" },
  { name: "University of Edinburgh", domain: "ed.ac.uk", sector: "Education" },
  { name: "King's College London", domain: "kcl.ac.uk", sector: "Education" },
  { name: "University of Manchester", domain: "manchester.ac.uk", sector: "Education" },
  { name: "University of Bristol", domain: "bristol.ac.uk", sector: "Education" },
  { name: "University of Warwick", domain: "warwick.ac.uk", sector: "Education" },

  // ── Consumer Brands ────────────────────────────
  { name: "JD Sports", domain: "jdsports.co.uk", sector: "Retail" },
  { name: "Burberry", domain: "burberry.com", sector: "Luxury" },
  { name: "ASOS", domain: "asos.com", sector: "Retail" },
  { name: "Dyson", domain: "dyson.co.uk", sector: "Manufacturing" },
  { name: "Virgin Group", domain: "virgin.com", sector: "Conglomerate" },
  { name: "easyJet", domain: "easyjet.com", sector: "Aviation" },
  { name: "British Airways", domain: "britishairways.com", sector: "Aviation" },
  { name: "Boots", domain: "boots.com", sector: "Retail" },
  { name: "Primark", domain: "primark.com", sector: "Retail" },
  { name: "Costa Coffee", domain: "costa.co.uk", sector: "Hospitality" },
  { name: "Greggs", domain: "greggs.co.uk", sector: "Food & Beverage" },
  { name: "Nandos", domain: "nandos.co.uk", sector: "Hospitality" },

  // ── Construction / Property ────────────────────
  { name: "Balfour Beatty", domain: "balfourbeatty.com", sector: "Construction" },
  { name: "Taylor Wimpey", domain: "taylorwimpey.co.uk", sector: "Construction" },
  { name: "Barratt Developments", domain: "barrattdevelopments.co.uk", sector: "Construction" },
  { name: "Land Securities", domain: "landsec.com", sector: "Property" },

  // ── Utilities / Energy ─────────────────────────
  { name: "National Grid", domain: "nationalgrid.com", sector: "Utilities" },
  { name: "SSE", domain: "sse.com", sector: "Energy" },
  { name: "Centrica", domain: "centrica.com", sector: "Energy" },
  { name: "Severn Trent", domain: "severntrent.com", sector: "Utilities" },
  { name: "Thames Water", domain: "thameswater.co.uk", sector: "Utilities" },

  // ── Automotive / Industrial ────────────────────
  { name: "Jaguar Land Rover", domain: "jaguarlandrover.com", sector: "Automotive" },
  { name: "McLaren", domain: "mclaren.com", sector: "Automotive" },
  { name: "Aston Martin", domain: "astonmartin.com", sector: "Automotive" },
  { name: "Bentley Motors", domain: "bentleymotors.com", sector: "Automotive" },
];

// ---------- Helpers ----------

function createCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "company";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function wasRecentlyAudited(companySlug: string): Promise<boolean> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - SKIP_IF_AUDITED_WITHIN_DAYS);

  const { data, error } = await untypedTable("audit_website_checks")
    .select("id")
    .eq("company_slug", companySlug)
    .gte("created_at", cutoff.toISOString())
    .limit(1);

  if (error) {
    console.warn(`  ⚠ Could not check recent audits for ${companySlug}:`, error.message);
    return false;
  }

  return Array.isArray(data) && data.length > 0;
}

// ---------- CLI args ----------

const args = process.argv.slice(2);
const forceReaudit = args.includes("--force");
const limitArg = args.find((a) => a.startsWith("--limit="));
const offsetArg = args.find((a) => a.startsWith("--offset="));
const limit = limitArg ? parseInt(limitArg.split("=")[1]!, 10) : UK_EMPLOYERS.length;
const offset = offsetArg ? parseInt(offsetArg.split("=")[1]!, 10) : 0;

// ---------- Main ----------

interface BenchmarkResult {
  name: string;
  domain: string;
  sector: string;
  slug: string;
  score: number;
  hasLlmsTxt: boolean;
  hasJsonld: boolean;
  hasSalaryData: boolean;
  careersPageStatus: string;
  robotsTxtStatus: string;
  atsDetected: string | null;
  auditedAt: string;
  error?: string;
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   Rankwell UK Employer Benchmark                       ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log();

  const employers = UK_EMPLOYERS.slice(offset, offset + limit);
  console.log(`Auditing ${employers.length} employers (offset: ${offset}, limit: ${limit})`);
  console.log(`Force re-audit: ${forceReaudit}`);
  console.log(`Delay between audits: ${DELAY_BETWEEN_AUDITS_MS}ms`);
  console.log();

  const results: BenchmarkResult[] = [];
  let skipped = 0;
  let failed = 0;
  let completed = 0;

  for (let i = 0; i < employers.length; i++) {
    const employer = employers[i]!;
    const slug = createCompanySlug(employer.name);
    const progress = `[${i + 1}/${employers.length}]`;

    // Idempotency: skip if recently audited
    if (!forceReaudit) {
      const recent = await wasRecentlyAudited(slug);
      if (recent) {
        console.log(`${progress} ⏭  ${employer.name} — skipped (audited recently)`);
        skipped++;
        continue;
      }
    }

    process.stdout.write(`${progress} 🔍 ${employer.name} (${employer.domain})... `);

    try {
      const result: WebsiteCheckResult = await runWebsiteChecks(
        employer.domain,
        employer.name,
      );

      // Persist to Supabase (fire-and-forget)
      void persistAuditResult(result, "benchmark-script");

      results.push({
        name: employer.name,
        domain: employer.domain,
        sector: employer.sector,
        slug: result.companySlug,
        score: result.score,
        hasLlmsTxt: result.hasLlmsTxt,
        hasJsonld: result.hasJsonld,
        hasSalaryData: result.hasSalaryData,
        careersPageStatus: result.careersPageStatus,
        robotsTxtStatus: result.robotsTxtStatus,
        atsDetected: result.atsDetected,
        auditedAt: new Date().toISOString(),
      });

      completed++;
      console.log(`score: ${result.score}/100`);
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`❌ failed: ${message}`);

      results.push({
        name: employer.name,
        domain: employer.domain,
        sector: employer.sector,
        slug,
        score: 0,
        hasLlmsTxt: false,
        hasJsonld: false,
        hasSalaryData: false,
        careersPageStatus: "not_found",
        robotsTxtStatus: "not_found",
        atsDetected: null,
        auditedAt: new Date().toISOString(),
        error: message,
      });
    }

    // Rate limiting delay
    if (i < employers.length - 1) {
      await sleep(DELAY_BETWEEN_AUDITS_MS);
    }
  }

  // ---------- Output ----------
  console.log();
  console.log("════════════════════════════════════════════════════════════");
  console.log(`  Completed: ${completed}  |  Skipped: ${skipped}  |  Failed: ${failed}`);
  console.log("════════════════════════════════════════════════════════════");

  if (results.length === 0) {
    console.log("No new results to write.");
    return;
  }

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write JSON
  const jsonPath = resolve(OUTPUT_DIR, "benchmark-results.json");
  writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 JSON: ${jsonPath}`);

  // Write CSV
  const csvHeader = "Company,Domain,Sector,Score,llms.txt,JSON-LD,Salary Data,Careers Page,robots.txt,ATS,Audited At";
  const csvRows = results.map((r) =>
    [
      `"${r.name}"`,
      r.domain,
      r.sector,
      r.score,
      r.hasLlmsTxt ? "Yes" : "No",
      r.hasJsonld ? "Yes" : "No",
      r.hasSalaryData ? "Yes" : "No",
      r.careersPageStatus,
      r.robotsTxtStatus,
      r.atsDetected || "None",
      r.auditedAt,
    ].join(","),
  );
  const csvPath = resolve(OUTPUT_DIR, "benchmark-summary.csv");
  writeFileSync(csvPath, [csvHeader, ...csvRows].join("\n"));
  console.log(`📊 CSV:  ${csvPath}`);

  // Print top-10 and bottom-10
  const sorted = [...results].sort((a, b) => b.score - a.score);
  console.log("\n🏆 Top 10:");
  for (const r of sorted.slice(0, 10)) {
    console.log(`  ${r.score.toString().padStart(3)}/100  ${r.name}`);
  }

  console.log("\n⚠️  Bottom 10:");
  for (const r of sorted.slice(-10).reverse()) {
    console.log(`  ${r.score.toString().padStart(3)}/100  ${r.name}`);
  }

  // Summary stats
  const scores = results.filter((r) => !r.error).map((r) => r.score);
  if (scores.length > 0) {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const median = scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)]!;
    const withLlms = results.filter((r) => r.hasLlmsTxt).length;
    const withJsonld = results.filter((r) => r.hasJsonld).length;
    const withSalary = results.filter((r) => r.hasSalaryData).length;

    console.log(`\n📈 Summary (${scores.length} employers audited):`);
    console.log(`  Average score:    ${avg}/100`);
    console.log(`  Median score:     ${median}/100`);
    console.log(`  With llms.txt:    ${withLlms} (${Math.round((withLlms / scores.length) * 100)}%)`);
    console.log(`  With JSON-LD:     ${withJsonld} (${Math.round((withJsonld / scores.length) * 100)}%)`);
    console.log(`  With salary data: ${withSalary} (${Math.round((withSalary / scores.length) * 100)}%)`);
  }

  // Wait for fire-and-forget persistence to complete
  console.log("\nWaiting for Supabase writes to settle...");
  await sleep(5_000);
  console.log("Done ✅");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
