# UK Index Data Pipeline

## Current Architecture

The `/uk-index` page (`src/app/uk-index/page.tsx`) reads directly from the `public_audits` table in Supabase:

```
[Audit API] → [public_audits table] → [UK Index page]
```

### How it works:

1. **Data source:** `public_audits` table (upserted by `lib/audit/public-audit-store.ts`)
2. **Query:** `SELECT company_name, company_slug, company_domain, score, ...` ordered by `score DESC`, limited to 500
3. **Deduplication:** By `company_domain` (keeps highest score per domain)
4. **Stats calculated:** Average score, % with llms.txt, % with JSON-LD, % with salary data, info gaps %

### What happens when batch audits populate `public_audits`:

**It will Just Work™** — the UK Index page already:
- Queries `public_audits` with `force-dynamic` rendering (no caching)
- Sorts by score descending
- Deduplicates by domain
- Shows top 3 in a podium layout
- Shows all in a ranked table with check/cross indicators
- Calculates aggregate stats

### No changes needed to the page itself.

## Batch Audit Workflow

```
1. npx tsx scripts/extract-top-companies.ts
   → Produces data/top-500-uk-employers.json

2. npx tsx scripts/batch-audit.ts --dry-run --limit 10
   → Preview what will be audited

3. npx tsx scripts/batch-audit.ts --limit 50
   → Run batch (rate-limited, 1 audit per 5 seconds)
   → Each audit calls POST /api/audit → runs website checks → upserts public_audits

4. Visit /uk-index → sees real company rankings
```

## Schema: `public_audits` table

| Column              | Type      | Description                     |
|---------------------|-----------|---------------------------------|
| id                  | UUID      | Primary key                     |
| company_domain      | TEXT      | e.g., `unilever.com`           |
| company_name        | TEXT      | e.g., `Unilever`               |
| company_slug        | TEXT      | URL-safe slug (unique)          |
| score               | INTEGER   | 0–100 composite score           |
| score_breakdown     | JSONB     | Per-theme score details         |
| has_llms_txt        | BOOLEAN   | Has llms.txt file               |
| has_jsonld          | BOOLEAN   | Has JSON-LD structured data     |
| has_salary_data     | BOOLEAN   | Salary information present      |
| careers_page_status | TEXT      | `full`, `partial`, `none`       |
| robots_txt_status   | TEXT      | `allows`, `blocks`, `none`      |
| ats_detected        | TEXT      | ATS name or null                |
| audit_count         | INTEGER   | Times audited (incremented)     |
| created_at          | TIMESTAMP | First audit                     |
| updated_at          | TIMESTAMP | Latest audit                    |

## Notes

- The audit API has CSRF protection — the batch script sets `Origin: https://openrole.co.uk` and `Referer: https://openrole.co.uk/` to pass validation
- Rate limit is 500 audits per hour per IP
- Each audit takes ~10-30 seconds (website checks, DNS, crawling)
- The batch script supports `--resume` for interrupted runs
- Already-audited companies are skipped by default (check `--no-skip` to re-audit)
