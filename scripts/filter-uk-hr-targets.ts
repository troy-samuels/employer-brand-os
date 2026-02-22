/**
 * OpenRole: Filter UK HR/TA/People/EB Targets
 *
 * Queries the leads table for UK-based contacts with HR-relevant titles,
 * outputs count & seniority breakdown, and updates matching leads to
 * status = 'target'.
 *
 * Usage:
 *   npx tsx scripts/filter-uk-hr-targets.ts              # preview only
 *   npx tsx scripts/filter-uk-hr-targets.ts --apply       # update status
 */

import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../frontend/.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Seniority classification
// ---------------------------------------------------------------------------

type Seniority = 'c-suite' | 'vp' | 'director' | 'head-of' | 'manager' | 'specialist' | 'other';

function classifySeniority(title: string): Seniority {
  const t = title.toLowerCase();

  if (/\b(ceo|cfo|cto|coo|cpo|chro|chief)\b/.test(t)) return 'c-suite';
  if (/\b(vp|vice president|svp|evp)\b/.test(t)) return 'vp';
  if (/\bdirector\b/.test(t)) return 'director';
  if (/\b(head of|head,)\b/.test(t)) return 'head-of';
  if (/\b(manager|lead|team lead|supervisor)\b/.test(t)) return 'manager';
  if (/\b(specialist|coordinator|advisor|analyst|officer|assistant|associate|partner|consultant|generalist|administrator|executive)\b/.test(t)) return 'specialist';

  return 'other';
}

// ---------------------------------------------------------------------------
// HR/TA/People/EB title keywords (case-insensitive ILIKE patterns)
// ---------------------------------------------------------------------------

const HR_TITLE_PATTERNS = [
  '%human resource%',
  '%HR %',
  '% HR',
  'HR%',
  '%talent acquisition%',
  '%talent manage%',
  '%talent partner%',
  '%talent lead%',
  '%talent director%',
  '%talent team%',
  '%recruiter%',
  '%recruiting%',
  '%recruitment%',
  '%people %',
  '%people&%',
  '%people operations%',
  '%people partner%',
  '%employer brand%',
  '%employer branding%',
  '%EVP %',
  '%employee value proposition%',
  '%workforce%',
  '%HRBP%',
  '%HR business partner%',
  '%chief people%',
  '%chief human%',
  '%VP People%',
  '%VP HR%',
  '%VP Human%',
  '%VP Talent%',
  '%head of people%',
  '%head of HR%',
  '%head of human%',
  '%head of talent%',
  '%head of recruitment%',
  '%head of recruiting%',
  '%director of people%',
  '%director of HR%',
  '%director of human%',
  '%director of talent%',
  '%director, people%',
  '%director, HR%',
  '%director, human%',
  '%director, talent%',
  '%culture %',
  '%organisational development%',
  '%organizational development%',
  '%org development%',
  '%learning & development%',
  '%learning and development%',
  '%L&D%',
  '%total rewards%',
  '%compensation %',
  '%benefits %',
  '%DEIB%',
  '%DEI %',
  '%diversity%inclusion%',
  '%diversity%equity%',
];

// UK country variants
const UK_COUNTRIES = ['UK', 'GB', 'United Kingdom', 'England', 'Scotland', 'Wales', 'Northern Ireland'];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const applyUpdate = process.argv.includes('--apply');

  console.log('═'.repeat(72));
  console.log('  OpenRole — UK HR Target Filter');
  console.log('═'.repeat(72));
  console.log(`  Mode: ${applyUpdate ? '🔴 APPLY (will update status)' : '👀 PREVIEW (read-only)'}`);
  console.log('═'.repeat(72));
  console.log('');

  // Build OR filter for title patterns using Supabase PostgREST
  // PostgREST doesn't support OR across ILIKE natively,
  // so we use an RPC or raw filter. Let's use .or() with ilike.
  // Actually, the cleanest approach: query with a server-side function,
  // but we don't want to add a migration just for this. Instead we'll
  // paginate through UK leads and filter in-app.

  console.log('🔍 Querying UK leads with email...');

  // Count total UK leads
  const { count: ukTotal } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .in('address_country', UK_COUNTRIES)
    .not('contact_email', 'is', null);

  console.log(`   UK leads with email: ${(ukTotal ?? 0).toLocaleString()}`);

  // Paginate and filter by title
  const PAGE_SIZE = 1000;
  let offset = 0;
  let hasMore = true;

  const seniorityBreakdown: Record<Seniority, number> = {
    'c-suite': 0,
    'vp': 0,
    'director': 0,
    'head-of': 0,
    'manager': 0,
    'specialist': 0,
    'other': 0,
  };

  const matchingIds: string[] = [];
  const samplesByLevel: Record<Seniority, string[]> = {
    'c-suite': [], 'vp': [], 'director': [], 'head-of': [],
    'manager': [], 'specialist': [], 'other': [],
  };

  // Build a regex from HR patterns for client-side matching
  const hrPatterns = HR_TITLE_PATTERNS.map(p => {
    // Convert SQL ILIKE pattern to regex
    return p.replace(/%/g, '.*');
  });
  const hrRegex = new RegExp(hrPatterns.map(p => `(${p})`).join('|'), 'i');

  console.log('🔍 Scanning titles for HR/TA/People/EB keywords...');

  while (hasMore) {
    const { data, error } = await supabase
      .from('leads')
      .select('id, contact_title, contact_email, first_name, last_name, company_name')
      .in('address_country', UK_COUNTRIES)
      .not('contact_email', 'is', null)
      .not('contact_title', 'is', null)
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error('❌ Query error:', error.message);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    for (const row of data) {
      const title = row.contact_title;
      if (!title) continue;

      if (hrRegex.test(title)) {
        const seniority = classifySeniority(title);
        seniorityBreakdown[seniority]++;
        matchingIds.push(row.id);

        // Collect samples (up to 5 per level)
        if (samplesByLevel[seniority].length < 5) {
          const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || '?';
          samplesByLevel[seniority].push(
            `${name} — ${title} @ ${row.company_name || '?'}`
          );
        }
      }
    }

    offset += PAGE_SIZE;

    if (offset % 10_000 === 0) {
      console.log(`   Scanned ${offset.toLocaleString()} rows, ${matchingIds.length.toLocaleString()} matches so far...`);
    }

    if (data.length < PAGE_SIZE) hasMore = false;
  }

  // Results
  const totalMatches = matchingIds.length;

  console.log('');
  console.log('═'.repeat(72));
  console.log(`  📊 RESULTS: ${totalMatches.toLocaleString()} UK HR/TA/People/EB targets`);
  console.log('═'.repeat(72));
  console.log('');
  console.log('  Seniority Breakdown:');
  console.log('  ─'.repeat(36));

  const order: Seniority[] = ['c-suite', 'vp', 'director', 'head-of', 'manager', 'specialist', 'other'];
  for (const level of order) {
    const count = seniorityBreakdown[level];
    const pct = totalMatches > 0 ? ((count / totalMatches) * 100).toFixed(1) : '0.0';
    const bar = '█'.repeat(Math.round(count / Math.max(totalMatches, 1) * 40));
    console.log(`  ${level.padEnd(12)} ${String(count).padStart(6)} (${pct.padStart(5)}%)  ${bar}`);
  }

  console.log('');
  console.log('  Sample Matches by Level:');
  console.log('  ─'.repeat(36));
  for (const level of order) {
    if (samplesByLevel[level].length > 0) {
      console.log(`\n  [${level.toUpperCase()}]`);
      for (const s of samplesByLevel[level]) {
        console.log(`    • ${s}`);
      }
    }
  }

  // Apply update
  if (applyUpdate && matchingIds.length > 0) {
    console.log('');
    console.log('🔄 Updating matching leads to status = "target"...');

    // Supabase has a limit on IN clause size, so batch the updates
    const UPDATE_BATCH = 500;
    let updated = 0;

    for (let i = 0; i < matchingIds.length; i += UPDATE_BATCH) {
      const chunk = matchingIds.slice(i, i + UPDATE_BATCH);
      const { error: updateErr, count } = await supabase
        .from('leads')
        .update({ status: 'target' })
        .in('id', chunk);

      if (updateErr) {
        console.error(`   ❌ Update batch error: ${updateErr.message}`);
      } else {
        updated += chunk.length;
      }
    }

    console.log(`✅ Updated ${updated.toLocaleString()} leads to status = 'target'`);
  } else if (!applyUpdate && matchingIds.length > 0) {
    console.log('');
    console.log('💡 Run with --apply to update these leads to status = "target"');
    console.log('   npx tsx scripts/filter-uk-hr-targets.ts --apply');
  }

  console.log('');
  console.log('═'.repeat(72));
  console.log('  Done.');
  console.log('═'.repeat(72));
}

main().catch(err => {
  console.error('💥 Fatal:', err);
  process.exit(1);
});
