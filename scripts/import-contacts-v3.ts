/**
 * OpenRole: CSV Contact Import v3 → contacts table
 *
 * Production-grade streaming import of UK contacts CSV into the
 * `contacts` table with full enrichment: seniority classification,
 * department detection, country normalisation, company extraction,
 * free-email filtering, and data completeness scoring.
 *
 * Usage:
 *   npx tsx scripts/import-contacts-v3.ts                         # full import
 *   npx tsx scripts/import-contacts-v3.ts --dry-run               # validate only
 *   npx tsx scripts/import-contacts-v3.ts --limit 5000            # first 5K rows
 *   npx tsx scripts/import-contacts-v3.ts --dry-run --limit 1000  # validate first 1K
 *   npx tsx scripts/import-contacts-v3.ts --resume                # resume from last checkpoint
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

const BATCH_SIZE = 500;
const LOG_EVERY = 10_000;
const STATE_FILE = path.join(__dirname, '.import-v3-state.json');
const CSV_PATH = path.join(__dirname, 'uk-contacts.csv');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const RESUME = args.includes('--resume');

let MAX_ROWS: number | undefined;
const limitIdx = args.indexOf('--limit');
if (limitIdx !== -1 && args[limitIdx + 1]) {
  MAX_ROWS = parseInt(args[limitIdx + 1], 10);
  if (isNaN(MAX_ROWS)) {
    console.error('❌  --limit requires a number');
    process.exit(1);
  }
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: npx tsx scripts/import-contacts-v3.ts [OPTIONS]

Options:
  --dry-run   Validate and report without writing to DB
  --limit N   Process only the first N rows
  --resume    Resume from last checkpoint
  --help      Show this help

Examples:
  npx tsx scripts/import-contacts-v3.ts                         # full import
  npx tsx scripts/import-contacts-v3.ts --dry-run               # validate only
  npx tsx scripts/import-contacts-v3.ts --dry-run --limit 1000  # validate first 1K
  npx tsx scripts/import-contacts-v3.ts --resume                # resume interrupted import
`);
  process.exit(0);
}

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

interface ContactRecord {
  email: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  company_id?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  mailing_street?: string;
  mailing_city?: string;
  mailing_state?: string;
  mailing_postal_code?: string;
  mailing_country?: string;
  seniority_level: string;
  department: string;
  is_decision_maker: boolean;
  account_owner?: string;
  data_completeness_score: number;
  outreach_status: string;
}

interface Stats {
  totalRows: number;
  inserted: number;
  skippedNoEmail: number;
  skippedInvalidEmail: number;
  skippedFreemail: number;
  skippedDuplicate: number;
  companiesCreated: number;
  errorRows: number;
  startMs: number;
  seniorityDist: Record<string, number>;
  departmentDist: Record<string, number>;
  countryNormalisations: number;
  postcodeCountryFixes: number;
  domainCountryInferences: number;
}

interface ResumeState {
  lastProcessedRow: number;
  stats: Stats;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Free email domains
// ---------------------------------------------------------------------------

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.fr', 'hotmail.de', 'hotmail.it', 'hotmail.es',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de', 'yahoo.it', 'yahoo.es',
  'outlook.com', 'outlook.co.uk',
  'aol.com', 'aol.co.uk',
  'icloud.com',
  'live.com', 'live.co.uk',
  'me.com',
  'mail.com',
  'protonmail.com', 'proton.me',
  'msn.com',
  'ymail.com',
  'rocketmail.com',
  'btinternet.com',
  'sky.com',
  'virgin.net', 'virginmedia.com',
  'talktalk.net',
  'ntlworld.com',
  'blueyonder.co.uk',
  'btopenworld.com',
  'tiscali.co.uk',
  'inbox.com',
  'fastmail.com',
  'zoho.com',
  'gmx.com', 'gmx.co.uk',
  'rediffmail.com',
  'yandex.com',
  'qq.com', '163.com', '126.com',
  'tutanota.com', 'tuta.io',
  'pm.me',
]);

// ---------------------------------------------------------------------------
// CSV Parser (RFC 4180 compliant)
// ---------------------------------------------------------------------------

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped double-quote inside quoted field
        cur += '"';
        i++;
      } else {
        // Toggle quoted mode
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }

  result.push(cur);
  return result;
}

// ---------------------------------------------------------------------------
// Email validation
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isValidEmail(e: string): boolean {
  return !!e && e.length <= 254 && EMAIL_RE.test(e);
}

function extractDomain(email: string): string | undefined {
  const at = email.lastIndexOf('@');
  return at > 0 ? email.slice(at + 1).toLowerCase() : undefined;
}

function isFreemailDomain(domain: string): boolean {
  return FREE_EMAIL_DOMAINS.has(domain);
}

// ---------------------------------------------------------------------------
// Country normalisation
// ---------------------------------------------------------------------------

// UK postcode pattern: 1-2 letters, 1-2 digits, optional space, digit + 2 letters
// Also partial postcodes (outward code only)
const UK_POSTCODE_RE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d?[A-Za-z]{0,2}$/;

const COUNTRY_MAP: Record<string, string> = {
  'uk': 'GB',
  'gb': 'GB',
  'united kingdom': 'GB',
  'eng': 'GB',
  'england': 'GB',
  'scotland': 'GB',
  'wales': 'GB',
  'northern ireland': 'GB',
  'great britain': 'GB',
  'britain': 'GB',
};

const UK_EMAIL_TLDS = ['.co.uk', '.org.uk', '.gov.uk', '.nhs.uk', '.ac.uk', '.net.uk', '.me.uk', '.ltd.uk', '.plc.uk', '.sch.uk', '.police.uk', '.mod.uk'];

function normaliseCountry(raw: string, email?: string): { country: string; method: 'direct' | 'postcode' | 'domain' | 'original' } {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  // Direct mapping
  if (COUNTRY_MAP[lower]) {
    return { country: 'GB', method: 'direct' };
  }

  // Check if it looks like a UK postcode leaked into the country field
  if (trimmed && UK_POSTCODE_RE.test(trimmed)) {
    return { country: 'GB', method: 'postcode' };
  }

  // Known UK cities/regions that sometimes appear in country field
  const ukPlaces = new Set([
    'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'edinburgh',
    'liverpool', 'bristol', 'cardiff', 'belfast', 'nottingham', 'sheffield',
    'greater london', 'surrey', 'west yorkshire', 'south yorkshire',
    'kent', 'essex', 'hampshire', 'lancashire', 'middlesex', 'berkshire',
    'hertfordshire', 'suffolk', 'norfolk', 'devon', 'somerset', 'dorset',
    'oxfordshire', 'cambridgeshire', 'warwickshire', 'staffordshire',
    'buckinghamshire', 'gloucestershire', 'wiltshire', 'derbyshire',
    'leicestershire', 'lincolnshire', 'northamptonshire', 'cornwall',
    'cheshire', 'merseyside', 'tyne and wear', 'west midlands',
    'east sussex', 'west sussex',
  ]);

  if (ukPlaces.has(lower)) {
    return { country: 'GB', method: 'direct' };
  }

  // If country is empty or clearly junk, try to infer from email domain
  if (!trimmed || trimmed.length <= 2 || isJunkCountry(lower)) {
    if (email) {
      const domain = extractDomain(email);
      if (domain) {
        for (const tld of UK_EMAIL_TLDS) {
          if (domain.endsWith(tld)) {
            return { country: 'GB', method: 'domain' };
          }
        }
      }
    }
  }

  // If empty, return empty
  if (!trimmed) {
    // Still try domain inference
    if (email) {
      const domain = extractDomain(email);
      if (domain) {
        for (const tld of UK_EMAIL_TLDS) {
          if (domain.endsWith(tld)) {
            return { country: 'GB', method: 'domain' };
          }
        }
      }
    }
    return { country: '', method: 'original' };
  }

  return { country: trimmed, method: 'original' };
}

function isJunkCountry(s: string): boolean {
  // Known junk values that appear in the country field
  const junkPatterns = [
    'placeholder', 'unmapped', 'other', 'n/a', 'na', 'none', '-', '.',
  ];
  for (const p of junkPatterns) {
    if (s.includes(p)) return true;
  }
  // People's names (contain spaces, no country-like chars)
  if (/^[a-z]+ [a-z]+$/.test(s) && !s.includes('kingdom') && !s.includes('ireland')) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Seniority classification
// ---------------------------------------------------------------------------

function classifySeniority(title: string): string {
  if (!title) return 'other';
  const t = title.toLowerCase().trim();

  // Executive level
  if (/\b(chief|ceo|cfo|coo|cto|cio|cmo|chro|cdo|cpo|cco)\b/.test(t)) return 'executive';
  if (/\bvice\s*president\b/.test(t) || /\bvp\b/.test(t)) return 'executive';
  if (/\bpresident\b/.test(t)) return 'executive';
  if (/\bowner\b/.test(t)) return 'executive';
  if (/\bfounder\b/.test(t) || /\bco-founder\b/.test(t)) return 'executive';
  if (/\bmanaging\s*director\b/.test(t)) return 'executive';
  if (/\bpartner\b/.test(t) && !/\bbusiness\s*partner\b/.test(t)) return 'executive';
  // "MD" as standalone — careful not to match "admin" etc
  if (/(?:^|\b)md(?:\b|$)/.test(t) && !/admin/.test(t)) return 'executive';

  // Director level
  if (/\bdirector\b/.test(t)) return 'director';
  if (/\bhead\s+of\b/.test(t)) return 'director';

  // Manager level
  if (/\bmanager\b/.test(t)) return 'manager';
  if (/\bteam\s+lead\b/.test(t)) return 'manager';
  if (/\blead\b/.test(t) && !/\bleader\b/.test(t)) return 'manager';
  if (/\bsupervisor\b/.test(t)) return 'manager';

  // Specialist level
  if (/\bspecialist\b/.test(t)) return 'specialist';
  if (/\bcoordinator\b/.test(t)) return 'specialist';
  if (/\badvisor\b/.test(t) || /\badviser\b/.test(t)) return 'specialist';
  if (/\banalyst\b/.test(t)) return 'specialist';
  if (/\bofficer\b/.test(t)) return 'specialist';
  if (/\badministrator\b/.test(t)) return 'specialist';
  if (/\bassistant\b/.test(t)) return 'specialist';
  if (/\bassociate\b/.test(t)) return 'specialist';
  if (/\bgeneralist\b/.test(t)) return 'specialist';
  if (/\bbusiness\s*partner\b/.test(t)) return 'specialist';
  if (/\bconsultant\b/.test(t)) return 'specialist';
  if (/\bexecutive\b/.test(t) && !/chief/.test(t)) return 'specialist'; // "Marketing Executive" etc.
  if (/\brecruiter\b/.test(t)) return 'specialist';

  return 'other';
}

// ---------------------------------------------------------------------------
// Department classification
// ---------------------------------------------------------------------------

function classifyDepartment(title: string): string {
  if (!title) return 'other';
  const t = title.toLowerCase().trim();

  // Order matters: more specific matches first

  // Recruiting / Talent Acquisition
  if (/\brecruit/i.test(t)) return 'recruiting';
  if (/\btalent\s+acquisition\b/.test(t)) return 'recruiting';
  if (/\b(ta)\b/.test(t) && /\b(manager|director|lead|head|specialist|partner|coordinator)\b/.test(t)) return 'recruiting';
  if (/\bresourcing\b/.test(t)) return 'recruiting';
  if (/\bstaffing\b/.test(t)) return 'recruiting';
  if (/\bsourcing\b/.test(t)) return 'recruiting';

  // Talent (not Talent Acquisition)
  if (/\btalent\s+management\b/.test(t)) return 'talent';
  if (/\btalent\s+development\b/.test(t)) return 'talent';
  if (/\bl\s*&\s*d\b/.test(t)) return 'talent';
  if (/\blearning\s+(&|and)\s+development\b/.test(t)) return 'talent';
  if (/\btalent\b/.test(t) && !/acquisition/.test(t)) return 'talent';

  // People (check before HR since "People" is more specific)
  if (/\bpeople\b/.test(t)) return 'people';

  // HR
  if (/\bhr\b/.test(t) || /\bhr:/.test(t)) return 'hr';
  if (/\bhuman\s+resource/.test(t)) return 'hr';
  if (/\bhuman\s+capital\b/.test(t)) return 'hr';
  if (/\bpeople\s+operations\b/.test(t)) return 'hr';
  if (/\bpeople\s*&\s*culture\b/.test(t)) return 'hr';
  if (/\bemployee\s+relations\b/.test(t)) return 'hr';
  if (/\bworkforce\b/.test(t)) return 'hr';
  if (/\borganisational\s+development\b/.test(t) || /\borganizational\s+development\b/.test(t)) return 'hr';
  if (/\bod\b/.test(t) && /\b(director|manager|head|lead)\b/.test(t)) return 'hr';

  return 'other';
}

// ---------------------------------------------------------------------------
// Data completeness score
// ---------------------------------------------------------------------------

function calculateCompleteness(contact: ContactRecord): number {
  let score = 0;
  const totalFields = 11;

  if (contact.first_name) score++;
  if (contact.last_name) score++;
  if (contact.title) score++;
  if (contact.company_id) score++;
  if (contact.phone) score++;
  if (contact.mobile) score++;
  if (contact.mailing_city) score++;
  if (contact.mailing_state) score++;
  if (contact.mailing_country) score++;
  if (contact.seniority_level && contact.seniority_level !== 'other') score++;
  if (contact.department && contact.department !== 'other') score++;

  return Math.round((score / totalFields) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clean(s: string | undefined): string | undefined {
  const t = s?.trim();
  return t && t.length > 0 ? t : undefined;
}

// ---------------------------------------------------------------------------
// Company cache & batch management
// ---------------------------------------------------------------------------

const companyIdCache = new Map<string, string>();  // domain → company UUID
const companyNameCache = new Map<string, string>(); // name → company UUID
const pendingCompanies = new Map<string, { name: string; domain: string }>();

async function flushCompanies(stats: Stats): Promise<void> {
  if (pendingCompanies.size === 0) return;

  const batch = Array.from(pendingCompanies.values());
  pendingCompanies.clear();

  if (DRY_RUN) {
    for (const c of batch) {
      if (!companyIdCache.has(c.domain) && !companyNameCache.has(c.name)) {
        const fakeId = `dry-run-${stats.companiesCreated++}`;
        companyIdCache.set(c.domain, fakeId);
        companyNameCache.set(c.name, fakeId);
      }
    }
    return;
  }

  // Upsert companies — ON CONFLICT (name) DO UPDATE to get back the ID and update domain
  const { data, error } = await supabase
    .from('companies')
    .upsert(
      batch.map(c => ({ name: c.name, domain: c.domain })),
      { onConflict: 'name', ignoreDuplicates: false }
    )
    .select('id, name, domain');

  if (error) {
    console.error(`⚠️  Company upsert error: ${error.message}`);
    // Fallback: try to fetch existing by name
    const names = batch.map(b => b.name);
    const { data: existing } = await supabase
      .from('companies')
      .select('id, name, domain')
      .in('name', names);
    if (existing) {
      for (const c of existing) {
        if (c.domain) companyIdCache.set(c.domain, c.id);
        companyNameCache.set(c.name, c.id);
      }
    }
    return;
  }

  if (data) {
    for (const c of data as any[]) {
      if (c.domain) companyIdCache.set(c.domain, c.id);
      companyNameCache.set(c.name, c.id);
      stats.companiesCreated++;
    }
  }

  // Fetch any we missed (already existed and ignoreDuplicates swallowed them)
  const missingDomains = batch.filter(
    b => b.domain && !companyIdCache.has(b.domain) && !companyNameCache.has(b.name)
  );
  if (missingDomains.length > 0) {
    const { data: existing } = await supabase
      .from('companies')
      .select('id, name, domain')
      .in('name', missingDomains.map(b => b.name));
    if (existing) {
      for (const c of existing as any[]) {
        if (c.domain) companyIdCache.set(c.domain, c.id);
        companyNameCache.set(c.name, c.id);
      }
    }
  }
}

function queueCompany(companyName: string, domain: string): void {
  if (!companyIdCache.has(domain) && !companyNameCache.has(companyName)) {
    if (!pendingCompanies.has(domain)) {
      pendingCompanies.set(domain, { name: companyName, domain });
    }
  }
}

function resolveCompanyId(email: string, companyName?: string): string | undefined {
  const domain = extractDomain(email);
  if (domain && companyIdCache.has(domain)) return companyIdCache.get(domain);
  if (companyName && companyNameCache.has(companyName)) return companyNameCache.get(companyName);
  return undefined;
}

// ---------------------------------------------------------------------------
// Batch insert contacts
// ---------------------------------------------------------------------------

async function insertContactsBatch(
  contacts: ContactRecord[],
  stats: Stats,
): Promise<void> {
  if (contacts.length === 0) return;

  if (DRY_RUN) {
    stats.inserted += contacts.length;
    return;
  }

  // ON CONFLICT (email) DO NOTHING — skip duplicates that exist in DB
  const { data, error } = await supabase
    .from('contacts')
    .upsert(contacts, { onConflict: 'email', ignoreDuplicates: true, count: 'exact' })
    .select('id');

  if (error) {
    // Row-by-row fallback
    console.error(`⚠️  Batch insert error (${contacts.length} rows): ${error.message}`);
    let recovered = 0;
    for (const contact of contacts) {
      const { error: rowErr } = await supabase
        .from('contacts')
        .upsert(contact, { onConflict: 'email', ignoreDuplicates: true });
      if (rowErr) {
        stats.errorRows++;
        if (stats.errorRows <= 20) {
          console.error(`   ❌ ${contact.email}: ${rowErr.message}`);
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
// Row mapping
// ---------------------------------------------------------------------------

function mapRow(row: CsvRow, stats: Stats): ContactRecord | null {
  const email = row.email?.trim().toLowerCase();
  if (!email || !isValidEmail(email)) return null;

  // Check freemail
  const domain = extractDomain(email);
  if (domain && isFreemailDomain(domain)) {
    stats.skippedFreemail++;
    return null;
  }

  // Normalise country
  const { country, method } = normaliseCountry(row.mailingCountry, email);
  if (method === 'direct') stats.countryNormalisations++;
  else if (method === 'postcode') stats.postcodeCountryFixes++;
  else if (method === 'domain') stats.domainCountryInferences++;

  const title = clean(row.title);
  const seniority = classifySeniority(title || '');
  const dept = classifyDepartment(title || '');

  stats.seniorityDist[seniority] = (stats.seniorityDist[seniority] || 0) + 1;
  stats.departmentDist[dept] = (stats.departmentDist[dept] || 0) + 1;

  const contact: ContactRecord = {
    email,
    salutation: clean(row.salutation),
    first_name: clean(row.firstName),
    last_name: clean(row.lastName),
    title,
    phone: clean(row.phone),
    mobile: clean(row.mobile),
    fax: clean(row.fax),
    mailing_street: clean(row.mailingStreet),
    mailing_city: clean(row.mailingCity),
    mailing_state: clean(row.mailingState),
    mailing_postal_code: clean(row.mailingZip),
    mailing_country: country || undefined,
    seniority_level: seniority,
    department: dept,
    is_decision_maker: seniority === 'executive' || seniority === 'director',
    account_owner: clean(row.accountOwner),
    data_completeness_score: 0, // calculated after company_id resolution
    outreach_status: 'new',
  };

  return contact;
}

// ---------------------------------------------------------------------------
// Resume state
// ---------------------------------------------------------------------------

function loadResumeState(): ResumeState | null {
  if (!RESUME) return null;
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf-8');
      const state = JSON.parse(raw) as ResumeState;
      console.log(`📂 Resuming from row ${state.lastProcessedRow.toLocaleString()} (saved ${state.timestamp})`);
      return state;
    }
  } catch {
    console.warn('⚠️  Could not read resume state, starting fresh');
  }
  return null;
}

function saveResumeState(rowNum: number, stats: Stats): void {
  if (DRY_RUN) return;
  const state: ResumeState = {
    lastProcessedRow: rowNum,
    stats: { ...stats },
    timestamp: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch {
    // Non-fatal
  }
}

// ---------------------------------------------------------------------------
// Progress logging
// ---------------------------------------------------------------------------

function logProgress(stats: Stats, currentRow: number): void {
  const elapsed = (Date.now() - stats.startMs) / 1000;
  const rate = stats.totalRows / elapsed;
  const totalEst = MAX_ROWS || 253982;
  const remaining = totalEst - currentRow;
  const eta = rate > 0 ? (remaining / rate / 60).toFixed(1) : '?';

  console.log(
    `📊 Row ${currentRow.toLocaleString()} | ` +
    `Processed: ${stats.totalRows.toLocaleString()} | ` +
    `Queued: ${stats.inserted.toLocaleString()} | ` +
    `Freemail: ${stats.skippedFreemail.toLocaleString()} | ` +
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
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌  CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const resumeState = loadResumeState();
  const skipToRow = resumeState?.lastProcessedRow ?? 0;

  console.log('═'.repeat(72));
  console.log('  OpenRole — Contact Import v3 → contacts table');
  console.log('═'.repeat(72));
  console.log(`  CSV:       ${CSV_PATH}`);
  console.log(`  Target:    ${SUPABASE_URL}`);
  console.log(`  Table:     contacts`);
  console.log(`  Batch:     ${BATCH_SIZE.toLocaleString()} rows`);
  console.log(`  Max rows:  ${MAX_ROWS?.toLocaleString() ?? 'ALL'}`);
  console.log(`  Dry run:   ${DRY_RUN}`);
  console.log(`  Resume:    ${RESUME ? `from row ${skipToRow}` : 'no'}`);
  console.log('═'.repeat(72));
  console.log('');

  const stats: Stats = resumeState?.stats ?? {
    totalRows: 0,
    inserted: 0,
    skippedNoEmail: 0,
    skippedInvalidEmail: 0,
    skippedFreemail: 0,
    skippedDuplicate: 0,
    companiesCreated: 0,
    errorRows: 0,
    startMs: Date.now(),
    seniorityDist: {},
    departmentDist: {},
    countryNormalisations: 0,
    postcodeCountryFixes: 0,
    domainCountryInferences: 0,
  };

  if (resumeState) {
    stats.startMs = Date.now(); // reset timer for resumed run
  }

  const seenEmails = new Set<string>();
  let batch: { contact: ContactRecord; companyName?: string }[] = [];
  let rowNum = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(CSV_PATH),
    crlfDelay: Infinity,
  });

  let isHeader = true;
  let pendingLine = ''; // Buffer for multi-line quoted fields

  for await (const rawLine of rl) {
    // Handle multi-line quoted fields: if we have a pending line with an
    // unclosed quote, append this line to it
    let line: string;
    if (pendingLine) {
      pendingLine += '\n' + rawLine;
      // Check if quotes are now balanced
      let quoteCount = 0;
      for (let i = 0; i < pendingLine.length; i++) {
        if (pendingLine[i] === '"') quoteCount++;
      }
      if (quoteCount % 2 !== 0) {
        // Still unbalanced, keep buffering
        continue;
      }
      line = pendingLine;
      pendingLine = '';
    } else {
      // Check if this line has an unbalanced quote (start of multi-line field)
      let quoteCount = 0;
      for (let i = 0; i < rawLine.length; i++) {
        if (rawLine[i] === '"') quoteCount++;
      }
      if (quoteCount % 2 !== 0) {
        pendingLine = rawLine;
        continue;
      }
      line = rawLine;
    }

    if (isHeader) { isHeader = false; continue; }

    rowNum++;

    // Skip rows if resuming
    if (rowNum <= skipToRow) continue;

    // Check limit
    if (MAX_ROWS && stats.totalRows >= MAX_ROWS) break;

    stats.totalRows++;

    // Parse CSV line
    const vals = parseCSVLine(line);
    if (vals.length < 14) {
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
      accountOwner: vals[14] ?? '',
    };

    // Skip rows without email
    const emailRaw = row.email?.trim().toLowerCase();
    if (!emailRaw) {
      stats.skippedNoEmail++;
      continue;
    }

    if (!isValidEmail(emailRaw)) {
      stats.skippedInvalidEmail++;
      continue;
    }

    // Map row (includes freemail check — stats updated inside mapRow)
    const freemailBefore = stats.skippedFreemail;
    const contact = mapRow(row, stats);
    if (!contact) {
      // mapRow already incremented the relevant skip counter
      // If freemail count didn't change, the email was invalid (shouldn't happen
      // since we already validated above, but guard anyway)
      if (stats.skippedFreemail === freemailBefore) {
        stats.skippedInvalidEmail++;
      }
      continue;
    }

    // Deduplicate on email within this import run
    if (seenEmails.has(contact.email)) {
      stats.skippedDuplicate++;
      continue;
    }
    seenEmails.add(contact.email);

    // Queue company if we have a company name and email domain
    const companyName = clean(row.accountName);
    const domain = extractDomain(contact.email);
    if (companyName && domain) {
      queueCompany(companyName, domain);
    }

    batch.push({ contact, companyName });

    // Flush when batch is full
    if (batch.length >= BATCH_SIZE) {
      // Flush companies first so IDs are available
      await flushCompanies(stats);

      // Resolve company_id and recalculate completeness for each contact
      const contacts: ContactRecord[] = [];
      for (const { contact: c, companyName: cn } of batch) {
        c.company_id = resolveCompanyId(c.email, cn);
        c.data_completeness_score = calculateCompleteness(c);
        contacts.push(c);
      }

      await insertContactsBatch(contacts, stats);
      batch = [];

      // Progress logging
      if (stats.totalRows % LOG_EVERY === 0) {
        logProgress(stats, rowNum);
        saveResumeState(rowNum, stats);
      }
    }
  }

  // Flush remaining
  if (pendingCompanies.size > 0) await flushCompanies(stats);

  // Resolve company IDs for remaining batch
  if (batch.length > 0) {
    const contacts: ContactRecord[] = [];
    for (const { contact: c, companyName: cn } of batch) {
      c.company_id = resolveCompanyId(c.email, cn);
      c.data_completeness_score = calculateCompleteness(c);
      contacts.push(c);
    }
    await insertContactsBatch(contacts, stats);
  }

  // Clean up state file on successful completion
  if (!DRY_RUN && fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }

  // Final report
  const elapsed = (Date.now() - stats.startMs) / 1000;

  console.log('');
  console.log('═'.repeat(72));
  console.log(`  ✅ IMPORT ${DRY_RUN ? 'DRY RUN' : ''} COMPLETE`);
  console.log('═'.repeat(72));
  console.log(`  ⏱️  Duration:              ${(elapsed / 60).toFixed(2)} minutes (${elapsed.toFixed(1)}s)`);
  console.log(`  📊 Total rows processed:   ${stats.totalRows.toLocaleString()}`);
  console.log(`  💾 Inserted/queued:        ${stats.inserted.toLocaleString()}`);
  console.log(`  🔁 Skipped (duplicate):    ${stats.skippedDuplicate.toLocaleString()}`);
  console.log(`  📭 Skipped (no email):     ${stats.skippedNoEmail.toLocaleString()}`);
  console.log(`  ❌ Skipped (bad email):     ${stats.skippedInvalidEmail.toLocaleString()}`);
  console.log(`  📧 Skipped (freemail):     ${stats.skippedFreemail.toLocaleString()}`);
  console.log(`  🏢 Companies created:      ${stats.companiesCreated.toLocaleString()}`);
  console.log(`  🏢 Companies cached:       ${companyIdCache.size.toLocaleString()}`);
  console.log(`  💥 Error rows:             ${stats.errorRows.toLocaleString()}`);
  console.log('');
  console.log('  🌍 Country normalisation:');
  console.log(`     Direct mappings:        ${stats.countryNormalisations.toLocaleString()}`);
  console.log(`     Postcode fixes:         ${stats.postcodeCountryFixes.toLocaleString()}`);
  console.log(`     Domain inferences:      ${stats.domainCountryInferences.toLocaleString()}`);
  console.log('');
  console.log('  📊 Seniority distribution:');
  for (const [level, count] of Object.entries(stats.seniorityDist).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / stats.inserted) * 100).toFixed(1);
    console.log(`     ${level.padEnd(15)} ${count.toLocaleString().padStart(8)}  (${pct}%)`);
  }
  console.log('');
  console.log('  🏷️  Department distribution:');
  for (const [dept, count] of Object.entries(stats.departmentDist).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / stats.inserted) * 100).toFixed(1);
    console.log(`     ${dept.padEnd(15)} ${count.toLocaleString().padStart(8)}  (${pct}%)`);
  }

  const execCount = stats.seniorityDist['executive'] || 0;
  const dirCount = stats.seniorityDist['director'] || 0;
  const decisionMakers = execCount + dirCount;
  const dmPct = stats.inserted > 0 ? ((decisionMakers / stats.inserted) * 100).toFixed(1) : '0';

  console.log('');
  console.log(`  🎯 Decision makers:        ${decisionMakers.toLocaleString()} (${dmPct}%)`);
  console.log('═'.repeat(72));
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});