# Security Fixes Log

**Date:** 2025-07-15  
**Applied by:** Malcolm (automated security hardening)

---

## CRIT-02: RLS on all unprotected tables + organization_members table

**File:** `frontend/supabase/migrations/20260223120000_security_rls_hardening.sql`

**Changes:**
1. **Created `organization_members` table** — links users to organizations with role-based access (`owner`, `admin`, `member`, `viewer`). Has unique constraint on `(organization_id, user_id)` and indexes on both FKs.

2. **Enabled RLS on 19 tables:**
   - `organizations`, `users`, `locations`, `api_keys`, `pixel_events`, `fact_categories`, `fact_definitions`, `employer_facts`, `job_title_mappings`
   - `audit_website_checks`, `audit_ai_responses`, `audit_leads`, `monitor_checks`, `crawler_visits`, `audit_logs`
   - `score_history`, `nominations`, `rate_limits`, `organization_members`

3. **Added RLS policies by access pattern:**
   - **Public read:** `fact_categories`, `fact_definitions` — SELECT for anon + authenticated
   - **Org-scoped:** `organizations`, `locations`, `api_keys`, `employer_facts`, `pixel_events`, `job_title_mappings` — SELECT/INSERT/UPDATE/DELETE gated by `organization_members` membership, with admin/owner restrictions for writes
   - **Service-role only (no policies):** `audit_website_checks`, `audit_ai_responses`, `audit_leads`, `audit_logs`, `rate_limits`, `monitor_checks`, `crawler_visits` — RLS enabled with no anon/authenticated policies means only service_role can access
   - **Public write:** `nominations` — INSERT only for anon (no SELECT/UPDATE/DELETE)
   - **User-scoped:** `users` — SELECT/UPDATE own row only (matched on `auth_id = auth.uid()`)
   - **Public read, service write:** `score_history` — SELECT for anon, no INSERT/UPDATE policies
   - **Self-read + admin-managed:** `organization_members` — users see own memberships, owners/admins manage members, bootstrap INSERT for first owner

---

## CRIT-03: Secure the /api/nominate endpoint

**File:** `frontend/src/app/api/nominate/route.ts`

**Changes:**
- Added **Zod validation schema** for request body: `domain` (string, 1-255 chars required), `nominatorEmail` (optional valid email, max 255)
- Added **CSRF validation** via `validateCsrf()` — returns 403 on cross-origin requests
- Added **rate limiting** via `RateLimiter` — 10 requests per hour per IP
- Added `resolveRequestActor()` for rate limit key extraction
- Switched to `apiErrorResponse`/`apiSuccessResponse` patterns matching other routes
- Changed handler signature from `(request: Request)` to `(request: NextRequest)` for proper header access
- Proper JSON parse error handling with structured error response

---

## HIGH-01: Reduce audit rate limit

**File:** `frontend/src/app/api/audit/route.ts`

**Change:** `AUDIT_RATE_LIMIT_LIMIT` reduced from `500` to `20` (requests per hour per IP).

---

## HIGH-05: Fix SVG XSS in badge generator

**File:** `frontend/src/app/tools/badge/page.tsx`

**Changes:**
- Added `escapeXml()` function that escapes `&`, `<`, `>`, `"` to their XML entity equivalents
- Applied `escapeXml(company)` → `safeCompany` before SVG text interpolation in all badge styles
- Applied `escapeXml(String(score))` → `safeScore` for defense-in-depth (score should be numeric but escaped anyway)
- All three badge styles (compact, minimal, detailed) now use escaped values in SVG text elements

---

## HIGH-07: Replace regex HTML sanitiser

**File:** `frontend/src/lib/utils/sanitize-html.ts`

**Changes:**
- **`sanitizeHtml()` (default):** Now strips ALL tags and returns plain text only. Removes dangerous tag content first (script, style, iframe, etc.), then strips all remaining tags with `/<[^>]*>/g`, decodes common HTML entities, and collapses whitespace. This is the safest default.
- **`sanitizeHtmlBasicFormatting()` (new export):** Whitelist-based approach allowing only `p`, `br`, `strong`, `em`, `b`, `i`, `a` tags. For `<a>` tags: only `href` and `title` attributes are kept, href is validated (only http/https/mailto/relative allowed, javascript:/data:/vbscript: blocked), and `rel="noopener noreferrer"` is auto-added. All event handler attributes (`on*`) are stripped. All non-whitelisted tags are removed but their text content is preserved.
- Removed the old regex-based approach that tried to preserve "safe" tags via blocklist (which was bypassable).

---

## MED-03: Add nosniff to badge API

**File:** `frontend/src/app/api/badge/[slug]/route.ts`

**Change:** Added `"X-Content-Type-Options": "nosniff"` to the SVG response headers. Prevents browsers from MIME-sniffing the SVG response as something else (e.g., HTML), which could enable XSS.

---

## MED-07: Validate auth callback redirect

**File:** `frontend/src/app/auth/callback/route.ts`

**Changes:**
- Added `getSafeRedirectBase()` function that validates the request origin against `NEXT_PUBLIC_APP_URL`
- If origins match: uses request origin (normal flow)
- If origins don't match: uses the configured `NEXT_PUBLIC_APP_URL` origin (prevents open-redirect attacks via crafted callback URLs)
- If `NEXT_PUBLIC_APP_URL` is not configured or invalid: falls back to relative redirects (`/dashboard`, `/login?error=...`)

---

## Additional Fix: Company search route type errors

**Files:**
- `frontend/src/app/api/companies/search/route.ts` — Added `offset` field to Zod schema (with `z.coerce.number()`) and `offset`/`hasMore` to `CompanySearchResponse` interface to match the existing `.range()` pagination implementation
- `frontend/src/__tests__/app/api/companies/search/route.test.ts` — Updated mock chain from `.limit()` to `.range()` to match the route's actual Supabase query chain

**Note:** These were pre-existing type/test errors unrelated to security, but fixed to ensure the full test suite and typecheck pass.

---

## Verification Results

```
✅ npm run lint     — 0 errors (3 pre-existing warnings in logger.ts)
✅ npm run typecheck — 0 errors
✅ npm run test     — 35 test files, 339 tests, all passing
```
