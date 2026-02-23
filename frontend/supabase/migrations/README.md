# Supabase Migrations

This is the **single canonical directory** for all database migrations.

## Strategy

- **Timestamped files** — Format: `YYYYMMDDHHMMSS_description.sql`
- **Idempotent** — All migrations use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, etc. so they're safe to re-run.
- **Linear ordering** — Supabase CLI runs migrations in filename order. Never reorder or rename existing files.
- **New migrations** — Always append a new timestamped file. Never edit a migration that has already been applied to production.

## Current Migrations

| File | Purpose |
|------|---------|
| `20260207200000_rate_limits.sql` | In-memory rate limiting fallback table |
| `20260211130000_create_companies_table.sql` | Company autocomplete source table |
| `20260212090000_companies_rls.sql` | Public read access for company search |
| `20260212130000_core_platform_tables.sql` | Orgs, users, locations, API keys, pixel events, facts, job title mappings |
| `20260212130500_audit_tables.sql` | Audit checks, AI responses, public audits, leads, monitor checks, crawler visits, audit logs |
| `20260212140000_api_key_allowed_domains.sql` | Per-key domain allowlist for Smart Pixel |
| `20260223090000_score_history.sql` | Score history tracking + nominations |
| `20260223120000_security_rls_hardening.sql` | Organization members table + RLS policies for all tables |

## Previous Migration Directories (Removed)

The following directories contained older, fragmented copies of these migrations and have been consolidated into this directory and deleted:

- `src/lib/db/migrations/` — 8 numbered files (001–008), all content now in canonical migrations
- `src/lib/supabase/migrations/` — 1 file (001_audit_tables.sql), content now in `20260212130500_audit_tables.sql`

## Applying Migrations

```bash
# Link to project (if not already linked)
npx supabase link --project-ref <ref>

# Push pending migrations to remote
npx supabase db push

# Generate a new migration
npx supabase migration new <description>
```
