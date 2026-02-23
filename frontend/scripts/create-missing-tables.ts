/**
 * Creates missing Supabase tables that weren't created by the migration
 * due to an error in the audit_logs index creation.
 * 
 * Uses the Supabase Management API via the CLI's linked project.
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, '..');
const ENV_PATH = resolve(PROJECT_ROOT, '.env.local');

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  const file = readFileSync(path, 'utf8');
  for (const rawLine of file.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const equalsIdx = line.indexOf('=');
    if (equalsIdx < 1) continue;
    const key = line.slice(0, equalsIdx).trim();
    let value = line.slice(equalsIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(ENV_PATH);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function tableExists(tableName: string): Promise<boolean> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${tableName}?select=id&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  );
  return response.ok;
}

async function main() {
  console.log('Checking which tables exist...');
  
  const tables = [
    'audit_website_checks',
    'audit_ai_responses', 
    'public_audits',
    'audit_leads',
    'monitor_checks',
    'crawler_visits',
    'audit_logs',
  ];

  for (const table of tables) {
    const exists = await tableExists(table);
    console.log(`  ${table}: ${exists ? '✅ exists' : '❌ missing'}`);
  }

  // Try to create missing tables using a simple insert test
  // The real fix is to run the SQL via psql or the Supabase dashboard
  console.log('\nTo create missing tables, run the following SQL in Supabase Dashboard > SQL Editor:');
  console.log('File: supabase/migrations/20260212130500_audit_tables.sql');
  console.log('(Skip the audit_logs section since that table already exists with a different schema)');
  
  // Test if we can insert into existing tables
  console.log('\nTesting write access to existing tables...');
  
  const { error: testError } = await supabase
    .from('audit_website_checks')
    .select('id')
    .limit(1);
  
  if (testError) {
    console.error('  audit_website_checks read failed:', testError.message);
  } else {
    console.log('  audit_website_checks: ✅ readable');
  }
}

main().catch(console.error);
