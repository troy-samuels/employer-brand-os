# OpenRole Scripts

Scripts for managing the 2.5M contact database, outreach campaigns, and employer brand audits.

## Prerequisites

```bash
cd ~/Desktop/employer-brand-os
npm install          # installs @supabase/supabase-js, dotenv
npm install -D tsx   # TypeScript runner (if not already installed)
```

Supabase credentials are read from `frontend/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Step 1: Run the Migration

Apply the database migration to add indexes, `company_id` FK, and outreach tables.

**Option A — Via Supabase Dashboard:**
1. Go to https://supabase.com/dashboard/project/gkjhglqaodxzcqbccybc/sql
2. Paste the contents of `supabase/migrations/20260702000000_contact_import.sql`
3. Click "Run"

**Option B — Via Supabase CLI:**
```bash
supabase db push --linked
```

**Option C — Via the existing apply script:**
```bash
npx tsx scripts/apply-migration.ts supabase/migrations/20260702000000_contact_import.sql
```

### What the migration does
- Adds a **unique index** on `leads.contact_email` (partial — only non-null)
- Adds indexes on `company_name`, `address_country`, `contact_title`, `status`, `import_batch`
- Adds `company_id` FK column on `leads` → `companies(id)`
- Creates `outreach_campaigns` table (campaign tracking)
- Creates `outreach_messages` table (per-lead sends)
- Enables RLS with service-role policies on all new tables

---

## Step 2: Import Contacts

Stream the 2.5M CSV into the `leads` table with deduplication and company extraction.

```bash
# Full import (all 2.5M rows)
npx tsx scripts/import-contacts-v2.ts

# Custom CSV path
npx tsx scripts/import-contacts-v2.ts /path/to/file.csv

# Test with first 1000 rows
npx tsx scripts/import-contacts-v2.ts "" 1000

# Dry run (validate + map, no writes)
npx tsx scripts/import-contacts-v2.ts --dry-run

# Help
npx tsx scripts/import-contacts-v2.ts --help
```

### What the import does
- Reads CSV line-by-line (memory-efficient streaming)
- Maps CSV columns → `leads` table columns
- Sets `source = 'csv_import_2026'`, `status = 'new'`, `import_batch = 'initial_2.5m'`
- Deduplicates on email (in-memory set + DB unique index)
- Extracts unique companies into `companies` table (domain from email)
- Links leads to companies via `company_id`
- Logs progress every 10,000 rows
- Graceful error handling (logs bad rows, continues)
- Batch size: 1,000 rows per insert

### Expected runtime
- ~2.5M rows at ~500-1000 rows/sec = **40-80 minutes**
- Memory: ~200MB (email dedup set)

---

## Step 3: Filter UK HR Targets

Find and tag UK-based HR/TA/People/Employer Brand contacts.

```bash
# Preview only (read-only scan)
npx tsx scripts/filter-uk-hr-targets.ts

# Apply: update matching leads to status = 'target'
npx tsx scripts/filter-uk-hr-targets.ts --apply
```

### What the filter does
1. Queries leads where `address_country` matches UK variants (`UK`, `GB`, `United Kingdom`, etc.)
2. Matches `contact_title` against 50+ HR/TA/People/EB keyword patterns
3. Outputs:
   - Total match count
   - Seniority breakdown (C-suite, VP, Director, Head-of, Manager, Specialist)
   - Sample matches per seniority level
4. With `--apply`: updates matching leads to `status = 'target'`

### Targeted title keywords
- HR / Human Resources
- Talent Acquisition / Recruiting / Recruitment
- People Operations / People Partner
- Employer Brand / EVP
- HRBP / HR Business Partner
- L&D / Learning & Development
- DEI / DEIB / Diversity & Inclusion
- Total Rewards / Compensation / Benefits
- Workforce / Culture / Organisational Development

---

## File Reference

| File | Purpose |
|------|---------|
| `import-contacts-v2.ts` | CSV → leads table (v2, uses `leads` table) |
| `import-contacts.ts` | CSV → contacts table (v1, uses `contacts` table) |
| `filter-uk-hr-targets.ts` | Find & tag UK HR targets |
| `apply-migration.ts` | Run SQL migrations against Supabase |
| `analyze-contacts.ts` | Analyze contact data quality |
| `seed-audits.ts` | Seed audit data for testing |
| `run-migration.ts` | Alternative migration runner |

---

## Database Tables

### `leads` (CRM contacts)
Core contact table for the 2.5M import. Each row = one person.

### `companies` (deduplicated employers)
Unique companies extracted from contact emails. Linked to leads via `company_id`.

### `outreach_campaigns` (email campaigns)
Campaign definitions with targeting filters, templates, and aggregate metrics.

### `outreach_messages` (individual sends)
Per-lead message tracking: sent/opened/replied timestamps, sentiment, audit URL.
