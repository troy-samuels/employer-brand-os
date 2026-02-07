import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type JsonRecord = Record<string, unknown>;

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, '..');
const MIGRATION_PATH = resolve(
  PROJECT_ROOT,
  'src/lib/supabase/migrations/001_audit_tables.sql'
);
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

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function postExecSql(
  supabaseUrl: string,
  serviceRoleKey: string,
  body: JsonRecord
) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  return { ok: response.ok, status: response.status, text };
}

async function verifyTable(
  supabaseUrl: string,
  serviceRoleKey: string,
  tableName: string
): Promise<void> {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${tableName}?select=id&limit=1`,
    {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Verification failed for table "${tableName}" (${response.status}): ${text}`
    );
  }
}

async function main(): Promise<void> {
  loadEnvFile(ENV_PATH);

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) environment variable'
    );
  }

  if (!existsSync(MIGRATION_PATH)) {
    throw new Error(`Migration file not found: ${MIGRATION_PATH}`);
  }

  const sql = readFileSync(MIGRATION_PATH, 'utf8').trim();
  if (!sql) {
    throw new Error(`Migration file is empty: ${MIGRATION_PATH}`);
  }

  const payloads: JsonRecord[] = [{ sql }, { query: sql }, { sql_query: sql }];
  const errors: Array<{ status: number; text: string; payload: string[] }> = [];
  let executed = false;

  for (const payload of payloads) {
    const result = await postExecSql(supabaseUrl, serviceRoleKey, payload);
    if (result.ok) {
      executed = true;
      break;
    }
    errors.push({
      status: result.status,
      text: result.text,
      payload: Object.keys(payload),
    });
  }

  if (!executed) {
    const detail = errors
      .map(
        (error) =>
          `payload=[${error.payload.join(',')}] status=${error.status} body=${error.text}`
      )
      .join('\n');

    throw new Error(`Failed to execute migration via rpc/exec_sql.\n${detail}`);
  }

  await verifyTable(supabaseUrl, serviceRoleKey, 'audit_website_checks');
  await verifyTable(supabaseUrl, serviceRoleKey, 'audit_ai_responses');

  console.log('Audit tables created and verified successfully.');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
