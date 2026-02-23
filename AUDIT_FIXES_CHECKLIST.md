# OpenRole — Technical Debt & Security Checklist

**Updated:** 23 February 2026

---

## 🔴 CRITICAL

- [x] ~~RLS on all tables~~ — ✅ All 33 tables secured (3 migrations)
- [x] ~~CSRF + rate limiting on /api/nominate~~ — ✅ Zod, CSRF, 10/hr limit
- [x] ~~Audit rate limit too high~~ — ✅ Reduced 500 → 20/hr
- [ ] **Git history scrub** — Old commits contain rotated Supabase keys. Run BFG or `git filter-repo` + force-push. Keys are already rotated so exposure is mitigated, but history should be cleaned.
- [ ] **Verify RLS blocks anon access** — Test that anon key cannot read `api_keys`, `audit_leads`, `users`, `audit_logs`

## 🟠 HIGH

- [x] ~~Sentry error monitoring~~ — ✅ Added
- [x] ~~SVG injection in badge tool~~ — ✅ XML entity escaping added
- [ ] **Homepage as server component** — Refactor `page.tsx` from `"use client"` to server component with client islands
- [ ] **Vercel Analytics** — Configure for traffic/conversion tracking
- [ ] **Migration consolidation** — Delete old `src/lib/db/migrations/` and `src/lib/supabase/migrations/` dirs
- [ ] **HTML sanitiser** — Replace regex-based `sanitize-html.ts` with `isomorphic-dompurify`

## 🟡 MEDIUM

- [ ] **Playwright isolation** — Move `@sparticuz/chromium` + `playwright-core` to separate function/service
- [ ] **Typed Supabase queries** — Regenerate types, replace `untypedTable` calls
- [ ] **Structured logger** — Replace 73 `console.error` calls with proper logging utility
- [ ] **Company search pagination** — Add limit/offset to `/api/companies/search`
- [ ] **Root vercel.json** — Remove or clarify (conflicts with `frontend/` app)

## 🟢 LOW

- [ ] Custom `not-found.tsx` at app root
- [ ] Replace `<img>` with `next/image` in verify page
- [ ] Lazy-import `playwright-core` in non-headless routes
- [ ] Verify CSP nonce consumed by Next.js script tags

---

**Done: 8/21** — All critical security items resolved except git history scrub.
