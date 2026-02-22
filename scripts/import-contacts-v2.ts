/**
 * OpenRole: CSV Contact Import → leads table
 * 
 * Reads a 2.5M-row CSV in streaming chunks and inserts into the
 * `leads` table, deduplicating on email.  Simultaneously extracts
 * unique companies into the `companies` table and links via company_id.
 *
 * Usage:
 *   npx tsx scripts/import-contacts-v2.ts                         # full import
 *   npx tsx scripts/import-contacts-v2.ts /path/to/file.csv       # custom CSV
 *   npx tsx scripts/import-contacts-v2.ts "" 5000                 # first 5K rows
 *   npx tsx scripts/import-contacts-v2.ts --dry-run               # validate only
 */

import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

dotenv.config({ path: path.join(__dirname, '../frontend/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BATCH_SIZE = 1000;
const LOG_EVERY = 10_000;
const SOURCE = 'csv_import_2026';
const IMPORT_BATCH = 'initial_2.5m';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CsvRow {
  salutation: string;
  firstName: string;
  lastName: string;
  title: string;
  accountName: string;
  mailingStreet: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  mailingCountry: string;
  phone: string;
  fax: string;
  mobile: string;
  email: string;
  accountOwner: string;
}

interface LeadRecord {
  salutation?: string;
  first_name?: string;
  last_name?: string;
  contact_title?: string;
  company_name?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  contact_phone?: string;
  contact_mobile?: string;
  contact_email: string;
  source: string;
  status: string;
  import_batch: string;
  company_id?: string;
}

interface Stats {
  totalRows: number;
  inserted: number;
  skippedDuplicate: number;
  skippedNoEmail: number;
  skippedInvalidEmail: number;
  companiesCreated: number;
  errorRows: number;
  startMs: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }  // escaped quote
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(e: string): boolean {
  return !!e && EMAIL_RE.test(e.trim());
}

function clean(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t && t.length > 0 ? t : undefined;
}

function extractDomain(email: string): string | undefined {
  const at = email.lastIndexOf('@');
  return at > 0 ? email.slice(at + 1).toLowerCase() : undefined;
}

function mapRow(row: CsvRow): LeadRecord | null {
  const email = row.email?.trim().toLowerCase();
  if (!email || !isValidEmail(email)) return null;

  return {
    contact_email: email,
    salutation: clean(row.salutation),
    first_name: clean(row.firstName),
    last_name: clean(row.lastName),
    contact_title: clean(row.title),
    company_name: clean(row.accountName),
    address_street: clean(row.mailingStreet),
    address_city: clean(row.mailingCity),
    address_state: clean(row.mailingState),
    address_zip: clean(row.mailingZip),
    address_country: clean(row.mailingCountry),
    contact_phone: clean(row.phone),
    contact_mobile: clean(row.mobile),
    source: SOURCE,
    status: 'new',
    import_batch: IMPORT_BATCH,
  };
}

// ---------------------------------------------------------------------------
// Company cache & batch insert
// ---------------------------------------------------------------------------

const companyIdCache = new Map<string, string>();   // domain → company UUID
const pendingCompanies = new Map<string, { name: string; domain: string }>(); // domain → record

async function ensureCompanies(supabase: SupabaseClient): Promise<void> {
  if (pendingCompanies.size === 0) return;

  const batch = Array.from(pendingCompanies.values());
  pendingCompanies.clear();

  // Upsert by name (companies has UNIQUE on name)
  const { data, error } = await supabase
    .from('companies')
    .upsert(batch, { onConflict: 'name', ignoreDuplicates: true })
    .select('id, name, domain');

  if (error) {
    console.error('⚠️  Company upsert error:', error.message);
    // Fall back: query for the names we tried to insert
    const names = batch.map(b => b.name);
    const { data: existing } = await supabase
      .from('companies')
      .select('id, name, domain')
      .in('name', names);
    if (existing) existing.forEach(c => {
      if (c.domain) companyIdCache.set(c.domain, c.id);
    });
    return;
  }

  if (data) data.forEach((c: any) => {
    if (c.domain) companyIdCache.set(c.domain, c.id);
  });

  // Also fetch any that existed already (upsert may not return them)
  const missingDomains = batch
    .filter(b => b.domain && !companyIdCache.has(b.domain))
    .map(b => b.name);

  if (missingDomains.length > 0) {
    const { data: existing } = await supabase
      .from('companies')
      .select('id, name, domain')
      .in('name', missingDomains);
    if (existing) existing.forEach((c: any) => {
      if (c.domain) companyIdCache.set(c.domain, c.id);
    });
  }
}

function queueCompany(companyName: string, domain: string): void {
  if (!pendingCompanies.has(domain) && !companyIdCache.has(domain)) {
    pendingCompanies.set(domain, { name: companyName, domain });
  }
}

// ---------------------------------------------------------------------------
// Batch insert leads
// ---------------------------------------------------------------------------

async function insertLeadsBatch(
  supabase: SupabaseClient,
  leads: LeadRecord[],
  stats: Stats,
  dryRun: boolean,
): Promise<void> {
  if (leads.length === 0) return;

  // Resolve company_id from cache
  for (const lead of leads) {
    if (lead.contact_email) {
      const domain = extractDomain(lead.contact_email);
      if (domain && companyIdCache.has(domain)) {
        lead.company_id = companyIdCache.get(domain);
      }
    }
  }

  if (dryRun) {
    stats.inserted += leads.length;
    return;
  }

  // Use ON CONFLICT (contact_email) DO NOTHING to skip existing
  const { data, error, count } = await supabase
    .from('leads')
    .upsert(leads, { onConflict: 'contact_email', ignoreDuplicates: true, count: 'exact' })
    .select('id');

  if (error) {
    // If the batch fails, try row-by-row fallback
    console.error(`⚠️  Batch insert error (${leads.length} rows): ${error.message}`);
    let recovered = 0;
    for (const lead of leads) {
      const { error: rowErr } = await supabase.from('leads').upsert(lead, {
        onConflict: 'contact_email',
        ignoreDuplicates: true,
      });
      if (rowErr) {
        stats.errorRows++;
        if (stats.errorRows <= 20) {
          console.error(`   ❌ ${lead.contact_email}: ${rowErr.message}`);
        }
      } else {
        recovered++;
      }
    }
    stats.inserted += recovered;
    return;
  }

  stats.inserted += data?.length ?? 0;
}

// ---------------------------------------------------------------------------
// Progress logging
// ---------------------------------------------------------------------------

function logProgress(stats: Stats, currentRow: number, total?: number): void {
  const elapsed = (Date.now() - stats.startMs) / 1000;
  const rate = stats.totalRows / elapsed;
  const eta = total
    ? ((total - currentRow) / rate / 60).toFixed(1)
    : '?';

  console.log(
    `📊 Row ${currentRow.toLocaleString()} | ` +
    `Inserted: ${stats.inserted.toLocaleString()} | ` +
    `Dupes: ${stats.skippedDuplicate.toLocaleString()} | ` +
    `No-email: ${stats.skippedNoEmail.toLocaleString()} | ` +
    `Companies: ${companyIdCache.size.toLocaleString()} | ` +
    `${rate.toFixed(0)}/s | ` +
    `ETA: ${eta}m`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const positional = args.filter(a => !a.startsWith('--'));
  const csvPath = positional[0] || path.join(process.env.HOME!, 'Downloads', 'report1754063479110.csv');
  const maxRows = positional[1] ? parseInt(positional[1], 10) : undefined;

  if (args.includes('--help')) {
    console.log(`
Usage: npx tsx scripts/import-contacts-v2.ts [CSV_PATH] [MAX_ROWS] [--dry-run]

  CSV_PATH   Path to CSV (default: ~/Downloads/report1754063479110.csv)
  MAX_ROWS   Limit rows processed (default: all)
  --dry-run  Validate & map only, don't write to Supabase
`);
    process.exit(0);
  }

  // Verify CSV exists
  if (!fs.existsSync(csvPath)) {
    console.error(`❌  CSV not found: ${csvPath}`);
    process.exit(1);
  }

  console.log('═'.repeat(72));
  console.log('  OpenRole — Contact Import v2');
  console.log('═'.repeat(72));
  console.log(`  CSV:       ${csvPath}`);
  console.log(`  Target:    ${SUPABASE_URL}`);
  console.log(`  Batch:     ${BATCH_SIZE.toLocaleString()} rows`);
  console.log(`  Source:    ${SOURCE}`);
  console.log(`  Max rows:  ${maxRows?.toLocaleString() ?? 'ALL'}`);
  console.log(`  Dry run:   ${dryRun}`);
  console.log('═'.repeat(72));
  console.log('');

  const stats: Stats = {
    totalRows: 0,
    inserted: 0,
    skippedDuplicate: 0,
    skippedNoEmail: 0,
    skippedInvalidEmail: 0,
    companiesCreated: 0,
    errorRows: 0,
    startMs: Date.now(),
  };

  // In-memory email set for dedup within this import run
  const seenEmails = new Set<string>();
  let batch: LeadRecord[] = [];
  let rowNum = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(csvPath),
    crlfDelay: Infinity,
  });

  let isHeader = true;

  for await (const line of rl) {
    if (isHeader) { isHeader = false; continue; }

    rowNum++;
    if (maxRows && rowNum > maxRows) break;

    stats.totalRows++;

    const vals = parseCSVLine(line);
    if (vals.length < 15) {
      stats.errorRows++;
      continue;
    }

    const row: CsvRow = {
      salutation: vals[0],
      firstName: vals[1],
      lastName: vals[2],
      title: vals[3],
      accountName: vals[4],
      mailingStreet: vals[5],
      mailingCity: vals[6],
      mailingState: vals[7],
      mailingZip: vals[8],
      mailingCountry: vals[9],
      phone: vals[10],
      fax: vals[11],
      mobile: vals[12],
      email: vals[13],
      accountOwner: vals[14],
    };

    const lead = mapRow(row);
    if (!lead) {
      if (!row.email || row.email.trim() === '') stats.skippedNoEmail++;
      else stats.skippedInvalidEmail++;
      continue;
    }

    // Dedup within this run
    if (seenEmails.has(lead.contact_email)) {
      stats.skippedDuplicate++;
      continue;
    }
    seenEmails.add(lead.contact_email);

    // Queue company extraction
    if (lead.company_name && lead.contact_email) {
      const domain = extractDomain(lead.contact_email);
      if (domain) queueCompany(lead.company_name, domain);
    }

    batch.push(lead);

    // Flush when batch is full
    if (batch.length >= BATCH_SIZE) {
      // Flush companies first so IDs are available
      await ensureCompanies(supabase);
      await insertLeadsBatch(supabase, batch, stats, dryRun);
      batch = [];

      // Periodic progress
      if (stats.totalRows % LOG_EVERY === 0) {
        logProgress(stats, rowNum, maxRows);
      }
    }
  }

  // Flush remainder
  if (pendingCompanies.size > 0) await ensureCompanies(supabase);
  if (batch.length > 0) await insertLeadsBatch(supabase, batch, stats, dryRun);

  // Final report
  const elapsed = (Date.now() - stats.startMs) / 1000;

  console.log('');
  console.log('═'.repeat(72));
  console.log('  ✅ IMPORT COMPLETE');
  console.log('═'.repeat(72));
  console.log(`  ⏱️  Duration:          ${(elapsed / 60).toFixed(2)} minutes`);
  console.log(`  📊 Total rows:         ${stats.totalRows.toLocaleString()}`);
  console.log(`  💾 Inserted:           ${stats.inserted.toLocaleString()}`);
  console.log(`  🔁 Skipped (dupe):     ${stats.skippedDuplicate.toLocaleString()}`);
  console.log(`  📭 Skipped (no email): ${stats.skippedNoEmail.toLocaleString()}`);
  console.log(`  ❌ Skipped (bad email): ${stats.skippedInvalidEmail.toLocaleString()}`);
  console.log(`  🏢 Companies cached:   ${companyIdCache.size.toLocaleString()}`);
  console.log(`  💥 Error rows:         ${stats.errorRows.toLocaleString()}`);
  console.log('═'.repeat(72));
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
