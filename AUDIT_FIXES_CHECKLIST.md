# OpenRole Audit Fixes Checklist

**Generated:** 2026-02-23  
**Source:** ENTERPRISE_AUDIT_2026-02-23.md  

---

## 🔴 CRITICAL (Must Fix Before Launch)

- [ ] **CRIT-01:** Rotate all compromised Supabase credentials (service role key, anon key)
- [ ] **CRIT-01:** Regenerate Brave Search API key
- [ ] **CRIT-01:** Invalidate `sb_publishable` and `sb_secret` keys from initial commit
- [ ] **CRIT-01:** Run `git filter-repo` or BFG to strip secrets from git history
- [ ] **CRIT-01:** Force-push cleaned history to origin
- [x] **CRIT-02:** Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` to all 33 tables ✅ (20260223120000 + 20260223160000)
- [x] **CRIT-02:** Create `organization_members` table migration ✅ (20260223120000)
- [x] **CRIT-02:** All RLS policies active — pushed to remote ✅
- [ ] **CRIT-02:** Test that anon key cannot read `api_keys`, `audit_leads`, `users`, `audit_logs`
- [x] **CRIT-03:** Add CSRF validation to `/api/nominate` ✅
- [x] **CRIT-03:** Add rate limiting to `/api/nominate` (10/hour per IP) ✅
- [x] **CRIT-03:** Add Zod schema validation with email format check and max length ✅
- [x] **CRIT-03:** Add `resolveRequestActor` for rate limit key ✅

## 🟠 HIGH (Fix Soon)

- [x] **HIGH-01:** Reduce audit rate limit from 500 → 20/hour per IP ✅
- [ ] **HIGH-02:** Refactor homepage (`src/app/page.tsx`) from `"use client"` to server component with client islands
- [x] **HIGH-03:** Add Sentry (`@sentry/nextjs`) for error monitoring ✅ (268a4e0)
- [ ] **HIGH-03:** Configure Vercel Analytics
- [ ] **HIGH-04:** Consolidate all migrations under `frontend/supabase/migrations/` (timestamped)
- [ ] **HIGH-04:** Delete `src/lib/db/migrations/` directory
- [ ] **HIGH-04:** Delete `src/lib/supabase/migrations/` directory
- [ ] **HIGH-04:** Run `supabase db diff` to verify schema consistency
- [x] **HIGH-05:** Escape company name in SVG generation ✅ (`escapeXml` function added)
- [x] **HIGH-05:** Add XML entity escaping function for `&`, `<`, `>`, `"` ✅
- [ ] **HIGH-06:** Replace in-memory rate limiter in proxy with Upstash Redis or Supabase-backed limiter
- [ ] **HIGH-07:** Replace regex-based HTML sanitizer with `isomorphic-dompurify` (`src/lib/utils/sanitize-html.ts`)

## 🟡 MEDIUM (Fix When Able)

- [ ] **MED-01:** Move `@sparticuz/chromium` and `playwright-core` to a separate function or external service
- [ ] **MED-02:** Set `NEXT_PUBLIC_APP_URL=https://openrole.co.uk` in Vercel production env vars
- [ ] **MED-03:** Add `X-Content-Type-Options: nosniff` to badge API response headers
- [ ] **MED-04:** Create structured logger utility (`lib/utils/logger.ts`) to replace 73 `console.error` calls
- [ ] **MED-05:** Regenerate Supabase types and replace `untypedTable` calls with typed queries
- [ ] **MED-06:** Remove or clarify root `vercel.json` (conflicts with Next.js app in `frontend/`)
- [ ] **MED-07:** Validate auth callback redirect origin against `NEXT_PUBLIC_APP_URL`
- [ ] **MED-08:** Add pagination to company search endpoint

## 🟢 LOW (Nice-to-Have)

- [ ] **LOW-01:** Document scoring weights on `/how-we-score` page (verify max is 100)
- [ ] **LOW-02:** Verify CSP nonce is consumed by Next.js script tags
- [ ] **LOW-03:** Replace `<img>` tags with `next/image` in verify page
- [ ] **LOW-04:** Add custom `not-found.tsx` at app root
- [ ] **LOW-05:** Remove hardcoded blog slugs from sitemap that don't have matching content
- [ ] **LOW-06:** Lazy-import `playwright-core` to avoid bundle inclusion in non-headless routes

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 3 issues (13 tasks) | Must fix before launch |
| 🟠 High | 7 issues (12 tasks) | Fix within 1 week |
| 🟡 Medium | 8 issues (8 tasks) | Fix within 1 month |
| 🟢 Low | 6 issues (6 tasks) | Backlog |
| **Total** | **24 issues (39 tasks)** | |
