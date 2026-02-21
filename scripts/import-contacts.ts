import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../frontend/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in frontend/.env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface ContactRow {
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

interface ProcessedContact {
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
  seniority_level?: string;
  department?: string;
  is_decision_maker: boolean;
  account_owner?: string;
}

interface ImportStats {
  totalRows: number;
  validRows: number;
  skippedRows: number;
  duplicateEmails: number;
  invalidEmails: number;
  companiesCreated: number;
  contactsInserted: number;
  errors: number;
  startTime: Date;
  lastProcessedRow: number;
}

interface CompanyRecord {
  name: string;
  country?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  street?: string;
}

// In-memory caches
const companyCache = new Map<string, string>(); // company name -> company id
const processedEmails = new Set<string>(); // dedupe by email
const companyBatch = new Map<string, CompanyRecord>(); // pending companies to insert

// CSV Parsing
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

// Data Validation & Cleaning
function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function cleanText(text: string): string | undefined {
  const cleaned = text?.trim();
  return cleaned && cleaned !== '' ? cleaned : undefined;
}

function normalizeCountry(country: string): string {
  const normalized = country.trim().toUpperCase();
  // Normalize variations
  if (normalized === 'GB') return 'UK';
  if (normalized === 'UNITED STATES') return 'US';
  return normalized;
}

function extractDomain(email: string): string | undefined {
  const match = email.match(/@(.+)$/);
  return match ? match[1].toLowerCase() : undefined;
}

// Segmentation Logic
function categorizeSeniority(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (/(^|\s)(ceo|cfo|cto|coo|chief|president|vp|vice president|svp|evp|c-level)/i.test(titleLower)) {
    return 'executive';
  }
  
  if (/(^|\s)(director|head of|associate director)/i.test(titleLower)) {
    return 'director';
  }
  
  if (/(^|\s)(manager|lead|supervisor|team lead)/i.test(titleLower)) {
    return 'manager';
  }
  
  if (/(^|\s)(specialist|analyst|coordinator|associate|assistant|officer|representative)/i.test(titleLower)) {
    return 'specialist';
  }
  
  return 'other';
}

function categorizeDepartment(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (/\b(hr|human resources)\b/i.test(titleLower)) {
    return 'hr';
  }
  
  if (/\b(recruit|talent acquisition|ta)\b/i.test(titleLower)) {
    return 'recruiting';
  }
  
  if (/\b(talent)\b/i.test(titleLower)) {
    return 'talent';
  }
  
  if (/\b(people|culture)\b/i.test(titleLower)) {
    return 'people';
  }
  
  return 'other';
}

function isDecisionMaker(seniority: string): boolean {
  return seniority === 'executive' || seniority === 'director';
}

// Company Management
async function getOrCreateCompany(companyName: string, row: ContactRow): Promise<string | undefined> {
  if (!companyName || companyName.trim() === '') return undefined;
  
  const cleanCompanyName = companyName.trim();
  
  // Check cache first
  if (companyCache.has(cleanCompanyName)) {
    return companyCache.get(cleanCompanyName);
  }
  
  // Add to pending batch
  if (!companyBatch.has(cleanCompanyName)) {
    const country = row.mailingCountry ? normalizeCountry(row.mailingCountry) : undefined;
    
    companyBatch.set(cleanCompanyName, {
      name: cleanCompanyName,
      country,
      city: cleanText(row.mailingCity),
      state: cleanText(row.mailingState),
      postal_code: cleanText(row.mailingZip),
      street: cleanText(row.mailingStreet),
    });
  }
  
  // Flush batch if it's getting large
  if (companyBatch.size >= 500) {
    await flushCompanyBatch();
  }
  
  return undefined; // Will be resolved after batch insert
}

async function flushCompanyBatch(): Promise<void> {
  if (companyBatch.size === 0) return;
  
  const companies = Array.from(companyBatch.values());
  
  try {
    // Insert companies (on conflict do nothing to handle duplicates)
    const { data, error } = await supabase
      .from('companies')
      .upsert(companies, { 
        onConflict: 'name',
        ignoreDuplicates: true 
      })
      .select('id, name');
    
    if (error) {
      console.error('❌ Error inserting companies batch:', error);
      return;
    }
    
    // Update cache with newly created companies
    if (data) {
      data.forEach((company: any) => {
        companyCache.set(company.name, company.id);
      });
    }
    
    // Also query for companies that already existed (weren't returned by insert)
    const existingNames = companies
      .map(c => c.name)
      .filter(name => !companyCache.has(name));
    
    if (existingNames.length > 0) {
      const { data: existing } = await supabase
        .from('companies')
        .select('id, name')
        .in('name', existingNames);
      
      if (existing) {
        existing.forEach((company: any) => {
          companyCache.set(company.name, company.id);
        });
      }
    }
    
  } catch (err) {
    console.error('❌ Exception during company batch insert:', err);
  } finally {
    companyBatch.clear();
  }
}

// Contact Processing
function processContactRow(row: ContactRow): ProcessedContact | null {
  // Validate email
  if (!isValidEmail(row.email)) {
    return null;
  }
  
  const email = normalizeEmail(row.email);
  
  // Check for duplicate
  if (processedEmails.has(email)) {
    return null; // Skip duplicate
  }
  
  processedEmails.add(email);
  
  // Determine segmentation
  const title = cleanText(row.title);
  const seniority = title ? categorizeSeniority(title) : 'other';
  const department = title ? categorizeDepartment(title) : 'other';
  const isDecision = isDecisionMaker(seniority);
  
  // Build contact record
  const contact: ProcessedContact = {
    email,
    salutation: cleanText(row.salutation),
    first_name: cleanText(row.firstName),
    last_name: cleanText(row.lastName),
    title,
    phone: cleanText(row.phone),
    mobile: cleanText(row.mobile),
    fax: cleanText(row.fax),
    mailing_street: cleanText(row.mailingStreet),
    mailing_city: cleanText(row.mailingCity),
    mailing_state: cleanText(row.mailingState),
    mailing_postal_code: cleanText(row.mailingZip),
    mailing_country: row.mailingCountry ? normalizeCountry(row.mailingCountry) : undefined,
    seniority_level: seniority,
    department,
    is_decision_maker: isDecision,
    account_owner: cleanText(row.accountOwner),
  };
  
  return contact;
}

// Batch Insert Contacts
async function insertContactBatch(contacts: ProcessedContact[], stats: ImportStats): Promise<void> {
  try {
    // Resolve company IDs before inserting
    for (const contact of contacts) {
      if (contact.company_id === undefined) {
        // Try to get from cache (after companies have been flushed)
        const companyName = contact.account_owner; // We'll store this temporarily
        if (companyName && companyCache.has(companyName)) {
          contact.company_id = companyCache.get(companyName);
        }
      }
    }
    
    const { data, error } = await supabase
      .from('contacts')
      .insert(contacts)
      .select('id');
    
    if (error) {
      console.error('❌ Error inserting contacts batch:', error.message);
      stats.errors++;
      return;
    }
    
    if (data) {
      stats.contactsInserted += data.length;
    }
    
  } catch (err) {
    console.error('❌ Exception during contact batch insert:', err);
    stats.errors++;
  }
}

// State Management (for resume capability)
interface ImportState {
  lastProcessedRow: number;
  timestamp: string;
}

function loadState(filePath: string): ImportState | null {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('⚠️  Could not load state file:', err);
  }
  return null;
}

function saveState(filePath: string, state: ImportState): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('❌ Error saving state:', err);
  }
}

// Main Import Function
async function importContacts(
  csvPath: string, 
  options: {
    batchSize?: number;
    startRow?: number;
    maxRows?: number;
    stateFile?: string;
  } = {}
): Promise<void> {
  const { 
    batchSize = 1000, 
    startRow = 0,
    maxRows,
    stateFile = path.join(__dirname, 'import-state.json')
  } = options;
  
  console.log('🚀 Starting OpenRole Contacts Import');
  console.log('=' .repeat(80));
  console.log(`📂 Source: ${csvPath}`);
  console.log(`📊 Batch size: ${batchSize.toLocaleString()}`);
  console.log(`🎯 Supabase URL: ${SUPABASE_URL}`);
  
  // Check for existing state
  const savedState = loadState(stateFile);
  const resumeFrom = savedState ? savedState.lastProcessedRow : startRow;
  
  if (savedState) {
    console.log(`\n⏭️  Resuming from row ${resumeFrom.toLocaleString()} (saved ${savedState.timestamp})`);
  }
  
  console.log('=' .repeat(80) + '\n');
  
  const stats: ImportStats = {
    totalRows: 0,
    validRows: 0,
    skippedRows: 0,
    duplicateEmails: 0,
    invalidEmails: 0,
    companiesCreated: 0,
    contactsInserted: 0,
    errors: 0,
    startTime: new Date(),
    lastProcessedRow: resumeFrom,
  };
  
  let contactBatch: ProcessedContact[] = [];
  let companyNamesForBatch: string[] = [];
  
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  
  let isFirstLine = true;
  let headers: string[] = [];
  let currentRow = 0;
  
  for await (const line of rl) {
    // Parse header
    if (isFirstLine) {
      headers = parseCSVLine(line);
      isFirstLine = false;
      continue;
    }
    
    currentRow++;
    
    // Skip rows until we reach resume point
    if (currentRow < resumeFrom) {
      continue;
    }
    
    // Stop if we've hit max rows
    if (maxRows && (currentRow - resumeFrom) >= maxRows) {
      console.log(`\n✋ Reached max rows limit (${maxRows.toLocaleString()})`);
      break;
    }
    
    stats.totalRows++;
    
    // Parse row
    const values = parseCSVLine(line);
    
    if (values.length !== headers.length) {
      stats.skippedRows++;
      continue;
    }
    
    const row: ContactRow = {
      salutation: values[0] || '',
      firstName: values[1] || '',
      lastName: values[2] || '',
      title: values[3] || '',
      accountName: values[4] || '',
      mailingStreet: values[5] || '',
      mailingCity: values[6] || '',
      mailingState: values[7] || '',
      mailingZip: values[8] || '',
      mailingCountry: values[9] || '',
      phone: values[10] || '',
      fax: values[11] || '',
      mobile: values[12] || '',
      email: values[13] || '',
      accountOwner: values[14] || '',
    };
    
    // Process contact
    const contact = processContactRow(row);
    
    if (!contact) {
      if (row.email.trim() === '') {
        stats.invalidEmails++;
      } else if (processedEmails.has(normalizeEmail(row.email))) {
        stats.duplicateEmails++;
      } else {
        stats.invalidEmails++;
      }
      stats.skippedRows++;
      continue;
    }
    
    stats.validRows++;
    
    // Queue company for batch processing
    if (row.accountName && row.accountName.trim() !== '') {
      const companyName = row.accountName.trim();
      companyNamesForBatch.push(companyName);
      contact.account_owner = companyName; // Store temporarily for later lookup
      await getOrCreateCompany(companyName, row);
    }
    
    contactBatch.push(contact);
    
    // Flush batches when full
    if (contactBatch.length >= batchSize) {
      // First flush companies
      await flushCompanyBatch();
      
      // Then insert contacts (companies are now in cache)
      await insertContactBatch(contactBatch, stats);
      
      contactBatch = [];
      companyNamesForBatch = [];
      
      // Save progress
      stats.lastProcessedRow = currentRow;
      saveState(stateFile, {
        lastProcessedRow: currentRow,
        timestamp: new Date().toISOString(),
      });
      
      // Progress report
      const elapsed = (Date.now() - stats.startTime.getTime()) / 1000;
      const rowsPerSec = stats.totalRows / elapsed;
      const eta = maxRows 
        ? ((maxRows - stats.totalRows) / rowsPerSec / 60).toFixed(1)
        : ((2500000 - currentRow) / rowsPerSec / 60).toFixed(1);
      
      console.log(
        `✅ Row ${currentRow.toLocaleString()} | ` +
        `Inserted: ${stats.contactsInserted.toLocaleString()} | ` +
        `Duplicates: ${stats.duplicateEmails.toLocaleString()} | ` +
        `Invalid: ${stats.invalidEmails.toLocaleString()} | ` +
        `Speed: ${rowsPerSec.toFixed(0)}/sec | ` +
        `ETA: ${eta}min`
      );
    }
  }
  
  // Flush remaining batches
  if (companyBatch.size > 0) {
    await flushCompanyBatch();
  }
  
  if (contactBatch.length > 0) {
    await insertContactBatch(contactBatch, stats);
  }
  
  // Final stats
  const elapsed = (Date.now() - stats.startTime.getTime()) / 1000;
  
  console.log('\n' + '=' .repeat(80));
  console.log('✅ IMPORT COMPLETE');
  console.log('=' .repeat(80));
  console.log(`⏱️  Time elapsed: ${(elapsed / 60).toFixed(2)} minutes`);
  console.log(`📊 Total rows processed: ${stats.totalRows.toLocaleString()}`);
  console.log(`✅ Valid contacts: ${stats.validRows.toLocaleString()}`);
  console.log(`💾 Contacts inserted: ${stats.contactsInserted.toLocaleString()}`);
  console.log(`🏢 Companies in cache: ${companyCache.size.toLocaleString()}`);
  console.log(`⚠️  Skipped (format issues): ${stats.skippedRows.toLocaleString()}`);
  console.log(`🔁 Duplicate emails: ${stats.duplicateEmails.toLocaleString()}`);
  console.log(`❌ Invalid emails: ${stats.invalidEmails.toLocaleString()}`);
  console.log(`💥 Errors: ${stats.errors}`);
  console.log('=' .repeat(80) + '\n');
  
  // Clean up state file on successful completion
  if (!maxRows) {
    try {
      fs.unlinkSync(stateFile);
      console.log('🗑️  Cleaned up state file (import complete)');
    } catch (err) {
      // Ignore
    }
  }
}

// CLI Interface
const args = process.argv.slice(2);
const csvPath = args[0] || path.join(process.env.HOME!, 'Downloads', 'report1754063479110.csv');
const maxRows = args[1] ? parseInt(args[1]) : undefined;

if (args.includes('--help')) {
  console.log(`
Usage: npx tsx scripts/import-contacts.ts [CSV_PATH] [MAX_ROWS]

Arguments:
  CSV_PATH   Path to CSV file (default: ~/Downloads/report1754063479110.csv)
  MAX_ROWS   Limit number of rows to import (default: all rows)

Examples:
  npx tsx scripts/import-contacts.ts                    # Import all rows
  npx tsx scripts/import-contacts.ts path/to/file.csv   # Import from custom path
  npx tsx scripts/import-contacts.ts "" 100             # Test with first 100 rows
  npx tsx scripts/import-contacts.ts "" 10000           # Import first 10K rows

The script will:
  - Stream the CSV (memory-efficient)
  - Deduplicate by email
  - Clean and validate data
  - Extract and deduplicate companies
  - Segment contacts by seniority and department
  - Batch insert to Supabase
  - Save progress (can resume if interrupted)
  `);
  process.exit(0);
}

console.log(`\n📁 CSV Path: ${csvPath}`);
if (maxRows) {
  console.log(`🔢 Max Rows: ${maxRows.toLocaleString()}\n`);
} else {
  console.log(`🔢 Max Rows: ALL (full import)\n`);
}

// Run import
importContacts(csvPath, { maxRows })
  .then(() => {
    console.log('🎉 Import script finished successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Fatal error during import:', err);
    process.exit(1);
  });
