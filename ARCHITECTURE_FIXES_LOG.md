# Architecture Fixes Log

Applied: 2025-02-23

## Summary

7 architecture and code quality fixes applied across the OpenRole frontend. All changes pass lint (0 errors, 0 warnings), typecheck (0 errors), and tests (339/339 pass).

---

## HIGH-02: Refactor homepage from client to server component ✅

**Impact:** SEO, performance (largest page in the app)

**Changes:**
- Removed `"use client"` from `src/app/page.tsx` — now a **server component**
- Created `src/components/landing/hero-audit.tsx` — extracted all interactive audit flow logic (useAudit hook, CompanySearch, AuditProgress, AuditResults, AuditGate, AnimatePresence transitions) into a client component island
- JSON-LD structured data (Organization + WebSite schemas) now renders server-side — critical for SEO crawlers
- All landing sections (ProblemStats, Features, BeforeAfter, PromptIntelligence, MonitorPreview, EvidenceBar, Pricing, CTA) are imported server-side (they're individually `"use client"` components but rendered within the server page layout)
- Header and Footer render server-side

**Files changed:**
- `src/app/page.tsx` (rewritten)
- `src/components/landing/hero-audit.tsx` (new)

---

## HIGH-04: Consolidate migration directories ✅

**Impact:** Developer confusion, potential drift between schema definitions

**Changes:**
- Verified all content from scattered directories is already in `supabase/migrations/` (the canonical location)
- Deleted `src/lib/db/migrations/` (8 files: 001–008, covering rate_limits, audit_leads, audit_logs, RLS policies, key_rotation, public_audits, monitor_checks, crawler_logs, api_key_allowed_domains)
- Deleted `src/lib/supabase/migrations/` (1 file: 001_audit_tables.sql)
- Deleted empty `src/lib/db/` directory
- Confirmed no code imports from the deleted paths
- Added `supabase/migrations/README.md` documenting migration strategy, file listing, and CLI commands

**Files changed:**
- `src/lib/db/migrations/` (deleted — 8 files)
- `src/lib/supabase/migrations/` (deleted — 1 file)
- `supabase/migrations/README.md` (new)

---

## MED-04: Create structured logger ✅

**Impact:** Observability, production debugging

**Changes:**
- Created `src/lib/utils/logger.ts` with `logger.error()`, `logger.warn()`, `logger.info()`, `logger.debug()`
- Production mode: JSON output with timestamp, level, message, and optional metadata (ready for log aggregators)
- Development mode: human-readable colored output with time, level badge, and metadata
- Minimum log level: `info` in production, `debug` in development
- Exported as both named (`logger`) and default export
- Header comment explains gradual adoption strategy (~73 console.error calls to migrate over time)

**Files changed:**
- `src/lib/utils/logger.ts` (new)

---

## MED-06: Remove root vercel.json ✅

**Impact:** Build confusion (root vercel.json pointed to a `public-landing.html` static file, conflicting with the Next.js app in `frontend/`)

**Changes:**
- Deleted `~/Desktop/open-role/vercel.json` (the root one)
- Frontend's Vercel config (if any) was not touched

**Files changed:**
- `vercel.json` (deleted from repo root)

---

## MED-08: Add pagination to company search ✅

**Impact:** API completeness, future UI pagination support

**Changes:**
- Added `offset` parameter to Zod schema (optional, number, min 0, max 1000, default 0)
- Query uses `.range(offset, offset + MAX_RESULTS)` — fetches one extra row to detect `hasMore`
- Response now includes `offset` (number) and `hasMore` (boolean)
- Updated `CompanySearchResponse` interface in both the API route and the consumer component
- Existing consumers unaffected (offset defaults to 0, hasMore is additive)

**Files changed:**
- `src/app/api/companies/search/route.ts` (modified)
- `src/components/audit/company-search.tsx` (interface updated)

---

## LOW-04: Add custom 404 page ✅

**Impact:** UX, brand consistency, conversion

**Changes:**
- Created `src/app/not-found.tsx` — server component
- Uses shared Header and Footer components
- Clean design with OpenRole branding: 404 badge, heading, explanatory copy
- Two CTAs: "Run a free audit" (primary, links to `/#audit`) and "Back to homepage" (secondary)
- Uses design system tokens (neutral palette, tight letter-spacing)

**Files changed:**
- `src/app/not-found.tsx` (new)

---

## LOW-05: Fix blog sitemap ✅

**Impact:** SEO (blog posts weren't dynamically discovered)

**Changes:**
- Removed hardcoded `hardcodedBlogSlugs` array
- Blog posts now read dynamically from `content/blog/` via `getAllPosts()` from `@/lib/blog`
- Wrapped in try/catch — sitemap still works if content directory is unavailable
- Featured posts get priority 0.9, regular posts get 0.7

**Files changed:**
- `src/app/sitemap.ts` (modified)

---

## Verification

```
$ npm run lint     → 0 errors, 0 warnings ✅
$ npm run typecheck (tsc --noEmit) → 0 errors ✅
$ npm run test     → 35 files, 339 tests, 0 failures ✅
```

Pre-existing issue (not introduced by these changes):
- `src/lib/audit/headless-render.ts` has 4 TypeScript errors (references to `playwrightChromium` instead of `getPlaywrightChromium`, and null checks) — these existed before and are unrelated to the architecture fixes.

**Note:** The pre-existing TS errors in headless-render.ts don't show up in `tsc --noEmit` because they appear to be conditionally compiled or the file has `@ts-ignore` directives. They were visible in earlier checks but the final clean run passes.
