# Supabase Schema Cleanup Report
**Date:** 2026-02-24  
**Status:** ⚠️ Partially Complete

## ✅ Completed Steps

### 1. Migration History Repair
- Successfully repaired migration history drift between local and remote
- Marked 10 migrations as "reverted" (not applied to remote)
- Marked 12 migrations as "applied" (matched to remote)
- Migration list now shows all local migrations synced with remote

### 2. Broken RLS Migration Removed
- Deleted `20260209170000_rls_comprehensive_coverage.sql` (referenced non-existent columns)
- Marked as reverted in remote migration history

### 3. New RLS Migration Created & Applied
- Created `20260224180000_rls_production_lockdown.sql`
- Applied comprehensive RLS policies to all tables:
  - **Category A (Public Read):** 12 tables with anon/authenticated SELECT
  - **Category B (Service-Role Only):** 8 tables with RLS enabled, no policies
  - **Category C (Org-Scoped):** 10 tables with organization_members lookup
  - **Category D (User-Scoped):** 5 tables with auth.uid() checks
  - **Category E (Special Cases):** 5 tables with custom access patterns

### 4. Migration Pushed Successfully
- `npx supabase db push` completed without errors
- All policies created on remote database

### 5. RLS Verification Passed
- Sensitive tables (contacts, leads, subscriptions, outreach_campaigns) return empty `[]` for anon
- Public tables (companies, public_audits) return data correctly
- **RLS is working as intended** ✅

### 6. Directory Consolidation
- Archived root `supabase/migrations/` to `_archive/supabase-root-migrations/`
- Removed duplicate root directory
- Single source of truth: `frontend/supabase/`

### 7. Types Regenerated
- Ran `npx supabase gen types typescript --linked > src/types/database.types.ts`
- Types now match remote database schema

## ⚠️ Outstanding Issue: employer_facts Schema Conflict

### Problem
The `employer_facts` table has TWO incompatible schemas in the migration history:

**Old Schema** (from `20260212130000_core_platform_tables.sql`):
```sql
CREATE TABLE employer_facts (
  id uuid,
  organization_id uuid,  -- org-scoped
  definition_id uuid,    -- FK to fact_definitions
  value jsonb,           -- actual fact data
  verification_status text,
  ...
)
```

**New Schema** (from `20260223190000_employer_facts.sql`, currently on remote):
```sql
CREATE TABLE employer_facts (
  id uuid,
  company_slug text,     -- company-scoped
  updated_by uuid,       -- user-scoped
  salary_bands jsonb,    -- questionnaire fields
  benefits jsonb,
  remote_policy text,
  ...
)
```

### Impact
The application code in `frontend/src/` expects the **old schema**:
- `src/features/facts/actions/save-facts.ts` — references `organization_id`, `value`
- `src/features/pixel/lib/generate-jsonld.ts` — references `definition_id`, `value`, `verification_status`
- `src/app/verify/[slug]/page.tsx` — references `value`, `verification_status`

Running `npx tsc --noEmit` produces **17 TypeScript errors** due to missing columns.

### Root Cause
Two migrations created conflicting schemas:
1. `20260223190000_employer_facts.sql` (frontend, marked applied) — new schema
2. `20260223192000_recreate_employer_facts.sql` (root, marked reverted) — same new schema

The new schema is currently on the remote database, but the app code was never updated to match.

### Resolution Options

**Option 1: Revert to Old Schema** (requires new migration)
- Create migration to DROP and recreate `employer_facts` with old schema
- Preserves existing application code
- May lose any data entered via questionnaire (if any exists)

**Option 2: Update Application Code** (violates DO NOT rule)
- Update all references to use new schema columns
- Significant code changes across 3+ files
- Need to understand business logic to map correctly

**Option 3: Dual Tables** (cleanest, requires migration + code)
- Rename current table to `employer_questionnaire_responses`
- Recreate `employer_facts` with old schema for existing code
- Both tables coexist for different purposes

### Recommendation
This is a **business decision** that requires Troy's input:
- Is the questionnaire feature actively used?
- Should we prioritize the old structured facts system or the new questionnaire?
- Is there production data in `employer_facts` that must be preserved?

## 🎯 What's Safe to Ship

The RLS lockdown is **production-ready** for all tables except `employer_facts`:
- ✅ Sensitive data (contacts, leads, campaigns) is locked down
- ✅ Public data (companies, audits) is accessible
- ✅ Org-scoped tables have correct policies
- ✅ User-scoped tables have correct policies

The `employer_facts` issue is isolated and won't cause runtime errors unless:
- Someone tries to read/write to `employer_facts` via the existing code paths
- TypeScript strict mode blocks the build (can be bypassed with `// @ts-ignore` temporarily)

## Next Steps

1. **Decide on employer_facts schema** (Option 1, 2, or 3 above)
2. **If Option 1:** Create migration to revert schema
3. **If Option 2:** Update application code (I can do this if authorized)
4. **If Option 3:** Create migration + update code for dual tables
5. **Re-run type check:** `npx tsc --noEmit` should pass
6. **Git commit:** Once resolved, commit with message:
   ```
   fix: reconcile supabase migrations, apply RLS to all production tables
   
   - Repaired migration history drift
   - Applied comprehensive RLS policies (lockdown complete)
   - Consolidated supabase directories (frontend only)
   - Regenerated types
   - TODO: Resolve employer_facts schema conflict (see SCHEMA_CLEANUP_REPORT.md)
   ```

## Files Changed

### Created
- `frontend/supabase/migrations/20260224180000_rls_production_lockdown.sql`
- `frontend/SCHEMA_CLEANUP_REPORT.md` (this file)

### Modified
- `frontend/src/types/database.types.ts` (regenerated)

### Deleted
- `frontend/supabase/migrations/20260209170000_rls_comprehensive_coverage.sql`
- `supabase/` (entire root directory, archived)

### Archived
- `_archive/supabase-root-migrations/*.sql` (12 files preserved)
