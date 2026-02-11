# Enterprise Code Review — Rankwell (BrandOS) Frontend

**Reviewed:** 2025-07-13  
**Reviewer:** Automated enterprise-grade review  
**Scope:** Full codebase (~29K lines across ~130 source files)  
**Verdict:** ✅ All checks pass — TypeScript clean, 108 tests pass, build succeeds

---

## Summary of Changes Made

### 1. Type Safety — Eliminated All `as any` Casts

**Problem:** 7 files used `supabaseAdmin as any` to query tables not yet in the generated Supabase types. This is a red flag in enterprise security reviews — it bypasses the type system entirely.

**Fix:** Created `src/lib/supabase/untyped-table.ts` — a centralised helper that isolates the `any` escape hatch to one file with full JSDoc documentation. All `as any` casts across the codebase were replaced:

| File | Before | After |
|------|--------|-------|
| `api/pixel/v1/crawl-log/route.ts` | `supabaseAdmin as any` | `untypedTable("crawler_visits")` |
| `lib/audit/public-audit-store.ts` | `supabaseAdmin as any` | `untypedTable("public_audits")` + `untypedRpc()` |
| `app/sitemap.ts` | `supabaseAdmin as any` | `untypedTable("public_audits")` |
| `app/fix/[slug]/page.tsx` | `supabaseAdmin as any` | `untypedTable("public_audits")` |
| `app/index/page.tsx` | `supabaseAdmin as any` | `untypedTable("public_audits")` |
| `app/company/[slug]/page.tsx` | `supabaseAdmin as any` | `untypedTable("public_audits")` |
| `app/company/[slug]/opengraph-image.tsx` | `supabaseAdmin as any` | `untypedTable("public_audits")` |
| `api/monitor/weekly/route.ts` | `supabaseAdmin as unknown as {...}` (27-line chain cast) | `untypedTable("monitor_checks")` |

**Impact:** When Supabase types are regenerated, searching for `untypedTable(` gives an instant inventory of tables to add to the type generation.

---

### 2. Security — XSS Prevention for `dangerouslySetInnerHTML`

**Problem:** 4 files used `dangerouslySetInnerHTML` with content that could contain XSS vectors:
- `blog/[slug]/page.tsx` — blog post content
- `faq/[slug]/page.tsx` — FAQ content
- `verify/[slug]/page.tsx` — JSON-LD injection (already safe via `JSON.stringify`)
- `company/[slug]/page.tsx` — JSON-LD injection (already safe via `JSON.stringify`)

**Fix:** Created `src/lib/utils/sanitize-html.ts` — a server-side HTML sanitiser that:
- Strips `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>`, `<textarea>`, `<select>`, `<button>`, `<applet>`, `<base>`, `<link>`, `<meta>`, `<noscript>` tags
- Removes all `on*` event handler attributes (`onclick`, `onerror`, etc.)
- Removes `javascript:` protocol in href/src
- Removes `data:` protocol in src (prevents `data:text/html` XSS)
- Preserves safe formatting tags (headings, paragraphs, lists, tables, etc.)

Applied to:
- `blog/[slug]/page.tsx` — `sanitizeHtml(post.content)`
- `faq/[slug]/page.tsx` — `sanitizeHtml(faq.content)`

The JSON-LD injections in `verify/` and `company/` pages use `JSON.stringify` with proper `<` / `>` escaping, which is inherently safe.

---

### 3. Security — API Key Format Mismatch Fix

**Problem:** `lib/auth/key-rotation.ts` generated keys with prefix `pk_live_` but `features/pixel/lib/validate-key.ts` validated against the pattern `^bos_(live|test)_`. No rotated key would ever pass validation.

**Fix:** Changed `key-rotation.ts` to generate `bos_live_` prefix, matching the validation regex.

---

### 4. Security — CSP Header Conflict Resolution

**Problem:** Both `next.config.ts` and `middleware.ts` set `Content-Security-Policy` headers, but with different values:
- `next.config.ts`: `script-src 'self'` (no nonce), missing `worker-src`
- `middleware.ts`: `script-src 'self' 'nonce-...'`, includes `worker-src 'self' blob:`

**Fix:** 
- Added `worker-src 'self' blob:` to the `next.config.ts` static CSP
- Renamed the variable from `strictCsp` to `staticCsp` with documentation explaining it's a fallback for static assets that skip middleware
- Added sync comments to both files

---

### 5. Rate Limiting — Serverless Documentation

**Problem:** Both `middleware.ts` and `lib/utils/rate-limiter.ts` use in-memory `Map` stores for rate limiting. On serverless platforms (Vercel), each cold start gets a fresh map — rate limits don't persist across invocations.

**Fix:** Added comprehensive documentation to both files explaining the serverless limitation and referencing Upstash Redis as the production replacement. The Supabase-backed rate limiter in `rate-limiter.ts` already provides a persistent fallback, but its in-memory fallback path has the same issue.

---

### 6. Input Validation — Company Name Length

**Problem:** The `auditFormSchema` in `validation.ts` validated `companyName` with `min(2)` but no maximum length, allowing extremely long strings to flow through the system (database writes, PDF generation, URL slugs, etc.).

**Fix:** Added `.max(200, "Company name is too long")` to the schema.

---

### 7. Error Handling — Date Formatting

**Problem:** `formatDate()` in `formatting.ts` would return `"Invalid Date"` string from `Intl.DateTimeFormat` when passed a malformed date string, which could propagate to the UI.

**Fix:** Added `Number.isNaN(date.getTime())` guard that returns the original string on invalid input.

---

### 8. Code Quality — Unused Imports and Variables

**Fixed:**
- `api/audit/leads/route.ts` — Changed `import { NextRequest, NextResponse }` to `import { NextRequest, type NextResponse }` (NextResponse used only as a type)
- `api/monitor/weekly/route.ts` — Removed unused `_emailHtml` variable assignment

---

## Review Findings — No Fix Required

These were reviewed and confirmed as already correct:

### Error Handling ✅
- Every API route has proper try/catch with typed `ApiErrorResponse` returns
- All fetch calls handle network failures (try/catch with fallbacks)
- Database query failures are caught and logged
- User-facing error messages are specific and helpful

### Input Validation ✅
- All API routes validate inputs with Zod schemas
- URL inputs validated against SSRF via comprehensive `url-validator.ts` (blocks private IPs, cloud metadata, local hostnames, IPv6 ULA ranges)
- Email validation uses Zod's built-in `.email()` validator
- Audit leads route blocks consumer email domains

### Authentication ✅
- Dashboard routes protected by middleware (redirect to `/login`)
- API routes that need auth (`/api/jobs`, `/api/analytics`) check `supabase.auth.getUser()`
- Server actions validate user organization membership and role permissions
- Pixel API routes use HMAC signature verification + API key validation

### CSRF Protection ✅
- Middleware validates CSRF on all mutating methods (POST, PUT, DELETE)
- Origin-based validation compares against host and configured app URL
- Pixel routes exempt by design (cross-origin by nature, use API key auth instead)

### CORS ✅
- Never uses `Access-Control-Allow-Origin: *`
- Dynamic origin reflection with domain allowlist validation
- Wildcard subdomain matching prevents suffix attacks
- `Vary: Origin` header set for CDN cache correctness

### Request Signing ✅
- HMAC-SHA256 signatures with timing-safe comparison
- Replay protection via nonce store with configurable TTL
- Timestamp drift window (5 minutes default)
- Nonce store has size limits to prevent memory exhaustion

### Performance ✅
- Server components used by default (only `"use client"` where needed)
- Hooks use `useCallback` for stable references
- Fetch calls use timeouts (`AbortController` with 5-8s limits)
- Pixel script served with `Cache-Control: immutable` + ETag

### Testing ✅
- 108 tests covering API routes, components, URL validation, CORS, request signing, company resolution
- Test mocks are realistic (fake Supabase, fetch interception)
- Edge cases covered: malformed URLs, private IPs, empty responses

---

## Architecture Assessment

### Strengths
1. **Defense in depth** — Pixel API has 6 security layers (CORS, domain allowlist, API key, HMAC signature, replay protection, rate limiting)
2. **Audit logging** — Every security-relevant action is logged to Supabase with structured metadata
3. **Graceful degradation** — Rate limiter falls back to in-memory when Supabase is unavailable; headless renderer has 3-tier fallback chain
4. **Type safety** — Comprehensive Supabase type generation with proper `Database` type
5. **SSRF prevention** — Thorough URL validation blocking private networks, cloud metadata endpoints, localhost variants

### Recommendations for Future Work
1. **Migrate rate limiting to Upstash Redis** for serverless correctness
2. **Regenerate Supabase types** to include `public_audits`, `monitor_checks`, `crawler_visits` tables — then remove `untypedTable()` calls
3. **Add `isomorphic-dompurify`** for production-grade HTML sanitisation (current regex-based approach handles common vectors but a DOM-based sanitiser is more comprehensive)
4. **Add integration tests** for the full audit flow (audit → store → public page)
5. **Add monitoring** for rate limiter effectiveness (track how often the in-memory fallback is used)

---

## Verification

```
✅ npx tsc --noEmit         — 0 errors
✅ npx vitest run            — 108 tests passed (9 test files)
✅ npm run build             — successful (all routes compiled)
```

Committed as: `Enterprise-grade code hardening — full review and fixes`
