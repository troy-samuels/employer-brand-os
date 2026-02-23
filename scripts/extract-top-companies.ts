/**
 * OpenRole: Extract Top 500 UK Employers
 *
 * Connects to Supabase, aggregates contacts per company,
 * filters to UK-relevant employers with ≥3 contacts,
 * and outputs the top 500 as JSON for batch auditing.
 *
 * Usage:
 *   npx tsx scripts/extract-top-companies.ts
 *   npx tsx scripts/extract-top-companies.ts --limit 100
 *   npx tsx scripts/extract-top-companies.ts --min-contacts 5
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

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

let OUTPUT_LIMIT = 500;
const limitIdx = args.indexOf("--limit");
if (limitIdx !== -1 && args[limitIdx + 1]) {
  OUTPUT_LIMIT = parseInt(args[limitIdx + 1], 10);
  if (isNaN(OUTPUT_LIMIT)) {
    console.error("❌  --limit requires a number");
    process.exit(1);
  }
}

let MIN_CONTACTS = 3;
const minIdx = args.indexOf("--min-contacts");
if (minIdx !== -1 && args[minIdx + 1]) {
  MIN_CONTACTS = parseInt(args[minIdx + 1], 10);
  if (isNaN(MIN_CONTACTS)) {
    console.error("❌  --min-contacts requires a number");
    process.exit(1);
  }
}

const OUTPUT_PATH = path.join(__dirname, "../data/top-500-uk-employers.json");

// ---------------------------------------------------------------------------
// UK domain detection
// ---------------------------------------------------------------------------

const UK_DOMAIN_SUFFIXES = [
  ".co.uk",
  ".org.uk",
  ".gov.uk",
  ".nhs.uk",
  ".ac.uk",
  ".net.uk",
  ".me.uk",
  ".ltd.uk",
  ".plc.uk",
  ".sch.uk",
  ".police.uk",
  ".mod.uk",
];

const FREEMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "hotmail.com", "hotmail.co.uk", "hotmail.fr",
  "yahoo.com", "yahoo.co.uk", "outlook.com", "outlook.co.uk", "aol.com",
  "aol.co.uk", "icloud.com", "live.com", "live.co.uk", "me.com", "mail.com",
  "protonmail.com", "proton.me", "msn.com", "ymail.com", "rocketmail.com",
  "btinternet.com", "sky.com", "virgin.net", "virginmedia.com", "talktalk.net",
  "ntlworld.com", "blueyonder.co.uk", "btopenworld.com", "tiscali.co.uk",
  "inbox.com", "fastmail.com", "zoho.com", "gmx.com", "gmx.co.uk",
  "rediffmail.com", "yandex.com", "qq.com", "163.com", "126.com",
  "tutanota.com", "tuta.io", "pm.me", "hotmail.de", "hotmail.it", "hotmail.es",
  "yahoo.fr", "yahoo.de", "yahoo.it", "yahoo.es",
]);

function isFreemailDomain(domain: string): boolean {
  return FREEMAIL_DOMAINS.has(domain.toLowerCase());
}

function isUkDomain(domain: string): boolean {
  if (!domain) return false;
  const d = domain.toLowerCase();
  return UK_DOMAIN_SUFFIXES.some((suffix) => d.endsWith(suffix));
}

// ---------------------------------------------------------------------------
// Domain-to-name corrections for known mismatches in source data
// ---------------------------------------------------------------------------

const DOMAIN_NAME_OVERRIDES: Record<string, string> = {
  "unilever.com": "Unilever",
  "hays.com": "Hays Recruitment",
  "reedglobal.com": "Reed",
  "gsk.com": "GSK",
  "bp.com": "BP",
  "willis.com": "Willis Towers Watson",
  "capita.co.uk": "Capita",
  "sainsburys.co.uk": "Sainsbury's",
  "diageo.com": "Diageo",
  "pearson.com": "Pearson",
  "deloitte.co.uk": "Deloitte",
  "kpmg.co.uk": "KPMG",
  "pwc.com": "PwC",
  "ey.com": "EY",
  "accenture.com": "Accenture",
  "ibm.com": "IBM",
  "microsoft.com": "Microsoft",
  "google.com": "Google",
  "amazon.co.uk": "Amazon",
  "tfl.gov.uk": "Transport for London",
  "nhs.net": "NHS",
  "shell.com": "Shell",
  "hsbc.com": "HSBC",
  "barclays.com": "Barclays",
  "lloydsbanking.com": "Lloyds Banking Group",
  "natwestgroup.com": "NatWest Group",
  "vodafone.com": "Vodafone",
  "bt.com": "BT Group",
  "bbc.co.uk": "BBC",
  "rolls-royce.com": "Rolls-Royce",
  "baesystems.com": "BAE Systems",
  "astrazeneca.com": "AstraZeneca",
  "sky.uk": "Sky",
  "tesco.com": "Tesco",
};

/**
 * Pick the best company name: use a domain override if available,
 * otherwise pick the most frequently occurring name from contacts.
 */
function resolveBestName(domain: string, names: Map<string, number>): string {
  const domainLower = domain.toLowerCase();
  if (DOMAIN_NAME_OVERRIDES[domainLower]) {
    return DOMAIN_NAME_OVERRIDES[domainLower];
  }
  // Pick the most common name
  const best = Array.from(names.entries()).sort((a, b) => b[1] - a[1])[0];
  return best?.[0] || domain;
}

// ---------------------------------------------------------------------------
// Decision-maker title patterns
// ---------------------------------------------------------------------------

const DECISION_MAKER_TITLES = [
  /\b(chief|ceo|cfo|coo|cto|cio|cmo|chro|cdo|cpo)\b/i,
  /\bvice\s*president\b/i,
  /\bvp\b/i,
  /\bpresident\b/i,
  /\bmanaging\s*director\b/i,
  /\bdirector\b/i,
  /\bhead\s+of\b/i,
  /\bpartner\b/i,
];

function isDecisionMakerTitle(title: string): boolean {
  return DECISION_MAKER_TITLES.some((re) => re.test(title));
}

// ---------------------------------------------------------------------------
// Fetch companies with contact counts via pagination
// ---------------------------------------------------------------------------

interface CompanyRow {
  id: string;
  name: string;
  domain: string;
}

interface ContactRow {
  company_id: string;
  title: string | null;
  is_decision_maker: boolean;
  mailing_country: string | null;
}

interface CompanyAggregate {
  names: Map<string, number>; // name → count (to pick the best name)
  domain: string;
  contactCount: number;
  titles: Map<string, number>;
  hasDecisionMakers: boolean;
  hasUkContacts: boolean;
}

async function fetchAllCompanies(): Promise<Map<string, CompanyRow>> {
  const companies = new Map<string, CompanyRow>();
  const PAGE_SIZE = 1000;
  let offset = 0;
  let fetched = 0;

  console.log("📊 Fetching companies...");

  while (true) {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, domain")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error(`❌  Error fetching companies at offset ${offset}: ${error.message}`);
      break;
    }

    if (!data || data.length === 0) break;

    for (const row of data as CompanyRow[]) {
      companies.set(row.id, row);
    }

    fetched += data.length;
    if (fetched % 10000 === 0) {
      console.log(`   ...loaded ${fetched.toLocaleString()} companies`);
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  console.log(`   ✅ Loaded ${companies.size.toLocaleString()} companies`);
  return companies;
}

async function aggregateContacts(
  companies: Map<string, CompanyRow>
): Promise<Map<string, CompanyAggregate>> {
  // Aggregate by domain (not company_id) to handle multiple company records per domain
  const aggregatesByDomain = new Map<string, CompanyAggregate>();
  const PAGE_SIZE = 1000;
  let offset = 0;
  let totalFetched = 0;

  console.log("📊 Aggregating contacts per domain...");

  while (true) {
    const { data, error } = await supabase
      .from("contacts")
      .select("company_id, title, is_decision_maker, mailing_country")
      .not("company_id", "is", null)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error(`❌  Error fetching contacts at offset ${offset}: ${error.message}`);
      break;
    }

    if (!data || data.length === 0) break;

    for (const row of data as ContactRow[]) {
      const company = companies.get(row.company_id);
      if (!company || !company.domain) continue;

      const domain = company.domain.toLowerCase();
      let agg = aggregatesByDomain.get(domain);
      if (!agg) {
        agg = {
          names: new Map(),
          domain: company.domain,
          contactCount: 0,
          titles: new Map(),
          hasDecisionMakers: false,
          hasUkContacts: false,
        };
        aggregatesByDomain.set(domain, agg);
      }

      // Track which company name this contact belongs to
      agg.names.set(company.name, (agg.names.get(company.name) || 0) + 1);
      agg.contactCount++;

      if (row.title) {
        const titleLower = row.title.toLowerCase().trim();
        agg.titles.set(titleLower, (agg.titles.get(titleLower) || 0) + 1);
      }

      if (row.is_decision_maker || (row.title && isDecisionMakerTitle(row.title))) {
        agg.hasDecisionMakers = true;
      }

      if (
        row.mailing_country === "GB" ||
        row.mailing_country === "UK" ||
        row.mailing_country === "United Kingdom"
      ) {
        agg.hasUkContacts = true;
      }
    }

    totalFetched += data.length;
    if (totalFetched % 50000 === 0) {
      console.log(`   ...processed ${totalFetched.toLocaleString()} contacts`);
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  console.log(`   ✅ Processed ${totalFetched.toLocaleString()} contacts across ${aggregatesByDomain.size.toLocaleString()} domains`);
  return aggregatesByDomain;
}

// ---------------------------------------------------------------------------
// Filter & rank
// ---------------------------------------------------------------------------

interface TopCompanyEntry {
  name: string;
  domain: string;
  contactCount: number;
  topTitles: string[];
  hasDecisionMakers: boolean;
}

function filterAndRank(
  aggregates: Map<string, CompanyAggregate>,
  minContacts: number,
  limit: number
): TopCompanyEntry[] {
  const candidates: CompanyAggregate[] = [];

  for (const agg of aggregates.values()) {
    // Must have minimum contacts
    if (agg.contactCount < minContacts) continue;

    // Filter out freemail domains
    if (isFreemailDomain(agg.domain)) continue;

    // Pick the best company name
    const bestName = resolveBestName(agg.domain, agg.names);

    // Filter out junk/placeholder names
    const nameLower = bestName.toLowerCase();
    if (
      nameLower.includes("do not use") ||
      nameLower.includes("self serve") ||
      nameLower.includes("test account") ||
      nameLower.includes("placeholder") ||
      nameLower === "unknown" ||
      nameLower === "other" ||
      nameLower === "n/a"
    ) continue;

    // Must be UK-relevant: UK domain OR .com with UK contacts
    const ukDomain = isUkDomain(agg.domain);
    const comWithUk = agg.domain?.endsWith(".com") && agg.hasUkContacts;

    if (!ukDomain && !comWithUk) continue;

    candidates.push(agg);
  }

  // Sort by contact count descending
  candidates.sort((a, b) => b.contactCount - a.contactCount);

  // Take top N
  return candidates.slice(0, limit).map((agg) => {
    const bestName = resolveBestName(agg.domain, agg.names);
    // Get top 5 most common titles (case-preserved from first occurrence)
    const titleEntries = Array.from(agg.titles.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Title-case the titles
    const topTitles = titleEntries.map(([title]) =>
      title
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );

    return {
      name: bestName,
      domain: agg.domain,
      contactCount: agg.contactCount,
      topTitles,
      hasDecisionMakers: agg.hasDecisionMakers,
    };
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const startMs = Date.now();

  console.log("═".repeat(72));
  console.log("  OpenRole — Extract Top UK Employers");
  console.log("═".repeat(72));
  console.log(`  Supabase:      ${SUPABASE_URL}`);
  console.log(`  Min contacts:  ${MIN_CONTACTS}`);
  console.log(`  Output limit:  ${OUTPUT_LIMIT}`);
  console.log(`  Output path:   ${OUTPUT_PATH}`);
  console.log("═".repeat(72));
  console.log("");

  // Step 1: Load all companies
  const companies = await fetchAllCompanies();

  // Step 2: Aggregate contacts per company
  const aggregates = await aggregateContacts(companies);

  // Step 3: Filter & rank
  console.log("\n🔍 Filtering to UK employers...");
  const topCompanies = filterAndRank(aggregates, MIN_CONTACTS, OUTPUT_LIMIT);

  // Step 4: Write output
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(topCompanies, null, 2));

  const elapsed = ((Date.now() - startMs) / 1000).toFixed(1);

  // Stats
  const totalContacts = topCompanies.reduce((sum, c) => sum + c.contactCount, 0);
  const withDecisionMakers = topCompanies.filter((c) => c.hasDecisionMakers).length;
  const ukDomainCount = topCompanies.filter((c) => isUkDomain(c.domain)).length;
  const comDomainCount = topCompanies.filter((c) => c.domain?.endsWith(".com")).length;

  console.log("");
  console.log("═".repeat(72));
  console.log("  ✅ EXTRACTION COMPLETE");
  console.log("═".repeat(72));
  console.log(`  ⏱️  Duration:              ${elapsed}s`);
  console.log(`  🏢 Total companies found:  ${topCompanies.length.toLocaleString()}`);
  console.log(`  👥 Total contacts:         ${totalContacts.toLocaleString()}`);
  console.log(`  🎯 With decision makers:   ${withDecisionMakers.toLocaleString()} (${((withDecisionMakers / topCompanies.length) * 100).toFixed(0)}%)`);
  console.log(`  🇬🇧 UK domains (.co.uk etc): ${ukDomainCount.toLocaleString()}`);
  console.log(`  🌐 .com with UK contacts:  ${comDomainCount.toLocaleString()}`);
  console.log(`  📄 Output:                 ${OUTPUT_PATH}`);
  console.log("");

  // Show top 10
  console.log("  📊 Top 10:");
  for (let i = 0; i < Math.min(10, topCompanies.length); i++) {
    const c = topCompanies[i];
    console.log(
      `     ${(i + 1).toString().padStart(3)}. ${c.name.padEnd(40)} ${c.domain.padEnd(30)} ${c.contactCount} contacts`
    );
  }

  console.log("═".repeat(72));
}

main().catch((err) => {
  console.error("💥 Fatal error:", err);
  process.exit(1);
});
