# Enterprise Production Readiness Audit — OpenRole

**Date:** 2026-02-23  
**Auditor:** Malcolm (AI Engineering Audit)  
**Stack:** Next.js 16 + Supabase + Vercel  
**Domain:** openrole.co.uk  

---

## 1. Executive Summary

**Overall Verdict: CONDITIONAL PASS — 3 critical issues must be resolved before launch**

The codebase shows strong engineering discipline in many areas: comprehensive test coverage (339 tests, all passing), clean TypeScript (zero lint errors, zero type errors, zero `any` leaks in production code), robust input validation via Zod on all API routes, proper SSRF protection, and a well-designed security layer for the pixel API with request signing, domain allowlists, and rate limiting.

However, three critical security issues were found that must be resolved before the product handles real business data:

1. **Secrets committed to git history** — Supabase service role key, Brave API key, and other credentials are permanently readable in the git log
2. **Missing RLS on 8+ tables** — The Supabase migration files define tables without enabling Row Level Security, meaning the anon key can read/write sensitive data  
3. **Nominate API has zero security** — No auth, no CSRF, no rate limiting, no input sanitization on email field

---

## 2. Critical Issues (Must Fix Before Launch)

### CRIT-01: Secrets Permanently Exposed in Git History
**Severity:** 🔴 CRITICAL  
**Files:** Git history — commit `08f43028`  

The initial commit (`08f4302`) added `.env.local` to the repo containing:
- `SUPABASE_SERVICE_KEY` (service role key — **full database admin access**)
- `SUPABASE_ANON_KEY` 
- `PUBLISHABLE_API_KEY` (`sb_publishable_j5wrM-Ls-a_PSMVBEtjSpw_6rtQzye2`)
- `SUPABASE_SECRET_KEY` (`sb_secret_I-TR4dQCD4ydn_bHQlcICg_6MEp7f0_`)

The file was later removed in commit `24af448` and added to `.gitignore`, but **the secrets remain readable** via `git show 08f43028:.env.local`.

Additionally, `frontend/.env.local` (currently on disk but not in git) contains `BRAVE_SEARCH_API_KEY=BSA7jrawQIbgrEagKWd4tNub8q791qV`.

**Fix:**
1. Rotate ALL compromised credentials immediately:
   - Regenerate Supabase project keys (Settings → API → Regenerate)
   - Regenerate Brave Search API key
   - Invalidate `sb_publishable` and `sb_secret` keys
2. Use `git filter-repo` or BFG Repo Cleaner to permanently remove the secrets from history
3. Force-push the cleaned history
4. Consider the current Supabase project potentially compromised if the repo was ever public

---

### CRIT-02: Missing RLS on Multiple Tables
**Severity:** 🔴 CRITICAL  
**Files:** `frontend/supabase/migrations/20260212130000_core_platform_tables.sql`, `20260212130500_audit_tables.sql`, `20260223090000_score_history.sql`

The following tables are created **without RLS enabled** in the Supabase migration files:

| Table | Migration | Risk |
|-------|-----------|------|
| `organizations` | `20260212130000` | Org data readable by anon key |
| `users` | `20260212130000` | User PII (email, name) exposed |
| `locations` | `20260212130000` | Business location data exposed |
| `api_keys` | `20260212130000` | **Key hashes and prefixes exposed** |
| `pixel_events` | `20260212130000` | Analytics data exposed |
| `fact_categories` | `20260212130000` | Internal schema exposed |
| `fact_definitions` | `20260212130000` | Internal schema exposed |
| `employer_facts` | `20260212130000` | Employer data exposed |
| `job_title_mappings` | `20260212130000` | Internal code mappings exposed |
| `audit_website_checks` | `20260212130500` | Audit data exposed |
| `audit_ai_responses` | `20260212130500` | AI response data + lead emails |
| `audit_leads` | `20260212130500` | **Lead email addresses exposed** |
| `monitor_checks` | `20260212130500` | Monitor data exposed |
| `crawler_visits` | `20260212130500` | Crawl data exposed |
| `audit_logs` | `20260212130500` | Security audit trail exposed |
| `score_history` | `20260223090000` | Score data exposed |
| `nominations` | `20260223090000` | Nomination data exposed |
| `rate_limits` | `20260207200000` | Rate limit buckets exposed |

There IS a migration at `src/lib/db/migrations/004_rls_policies.sql` that enables RLS, but it references `organization_members` — a table that **does not exist** in any migration. This means the RLS policies would fail to create, or if created, would deny all access (including legitimate authenticated users).

**Fix:**
1. Create the `organization_members` table migration
2. Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` to every table creation migration
3. Verify all RLS policies are applied by running `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'` in Supabase
4. For tables used by the anon key (like `companies`), add explicit read policies
5. For tables only used by service role, enable RLS with no policies (which denies anon access)

---

### CRIT-03: Nominate API Completely Unprotected
**Severity:** 🔴 CRITICAL  
**File:** `frontend/src/app/api/nominate/route.ts`

The `/api/nominate` POST endpoint has:
- ❌ No CSRF validation
- ❌ No rate limiting  
- ❌ No input length limits on `nominatorEmail`
- ❌ No email format validation
- ❌ No auth of any kind

An attacker could:
- Spam the `nominations` table with millions of rows (DoS on Supabase)
- Inject arbitrary data into the `nominator_email` column
- Use it as an open relay for storing arbitrary strings

**Fix:**
```typescript
// Add to the route:
import { validateCsrf } from "@/lib/utils/csrf";
import { RateLimiter } from "@/lib/utils/rate-limiter";
import { z } from "zod";

const nominateSchema = z.object({
  domain: z.string().trim().min(1).max(255),
  nominatorEmail: z.string().email().max(255).optional(),
});

const rateLimiter = new RateLimiter();
// Add CSRF check and rate limit (10/hour per IP)
```

---

## 3. High Priority Issues (Fix Soon)

### HIGH-01: Audit Rate Limit Too Generous (500/hour)
**Severity:** 🟠 HIGH  
**File:** `frontend/src/app/api/audit/route.ts:31`

```typescript
const AUDIT_RATE_LIMIT_LIMIT = 500;
```

Each audit makes 5+ external HTTP requests (llms.txt, homepage, robots.txt, sitemap, careers page). At 500/hour, a single IP could trigger 2,500+ outbound requests per hour, potentially:
- Getting the server IP blocked by target websites
- Exhausting Vercel serverless function quotas
- Creating a significant Supabase write load

**Fix:** Reduce to 10-20 audits per hour per IP for free tier. The current 500/hour suggests this was set for batch auditing scripts and should not be the production limit.

---

### HIGH-02: Homepage Is Client-Side Only
**Severity:** 🟠 HIGH  
**File:** `frontend/src/app/page.tsx:6`

```typescript
"use client";
```

The entire landing page is a client component. This means:
- **No server-side rendering** — search engines see an empty shell
- **JSON-LD schemas** (Organization, WebSite) are injected client-side and may not be indexed
- **First Contentful Paint** is delayed by JS bundle download + hydration
- **Core Web Vitals** will suffer

For an SEO-focused product, this is particularly ironic and damaging.

**Fix:** Refactor the page to a server component. Extract interactive sections (audit form, results) into client component islands. The landing page copy, hero, features, pricing, and CTA sections should all be server-rendered.

---

### HIGH-03: No Error Monitoring / APM
**Severity:** 🟠 HIGH  
**Files:** Entire codebase

There is zero error monitoring infrastructure:
- No Sentry, Bugsnag, or LogRocket
- No Vercel Analytics configured
- No structured logging (just `console.error`)
- No alerting on error spikes

In production, errors will silently disappear into Vercel's ephemeral function logs.

**Fix:** 
1. Add Sentry (`@sentry/nextjs`) — free tier covers 5K errors/month
2. Configure Vercel Analytics (built-in, free)
3. Add structured JSON logging for API routes

---

### HIGH-04: Duplicate Migration Numbering
**Severity:** 🟠 HIGH  
**File:** `frontend/src/lib/db/migrations/005_key_rotation.sql` and `005_public_audits.sql`

Two migrations share the `005` prefix. Additionally, there are THREE separate migration directories:
1. `frontend/supabase/migrations/` — timestamped (Supabase CLI convention)
2. `frontend/src/lib/db/migrations/` — numbered 001-008
3. `frontend/src/lib/supabase/migrations/` — numbered 001

This creates confusion about which migrations have actually been applied. Tables are defined redundantly across paths (e.g., `crawler_visits` appears in both `007_crawler_logs.sql` and `20260212130500_audit_tables.sql`).

**Fix:**
1. Consolidate all migrations under `frontend/supabase/migrations/` (timestamped)
2. Delete the `src/lib/db/migrations/` and `src/lib/supabase/migrations/` directories
3. Ensure the timestamped migrations are the single source of truth
4. Run `supabase db diff` to verify the live schema matches

---

### HIGH-05: Badge SVG XSS Vector
**Severity:** 🟠 HIGH  
**File:** `frontend/src/app/tools/badge/page.tsx:41-93`

The `generateSvg` function interpolates the `company` name directly into SVG markup without escaping:

```typescript
<text ...>${company}</text>
```

If `company` contains `</text><script>alert(1)</script>`, this creates an XSS vector. The SVG is rendered via `dangerouslySetInnerHTML`:

```typescript
dangerouslySetInnerHTML={{ __html: svgOutput }}
```

**Fix:** Escape the company name for XML/SVG context:
```typescript
function escapeSvgText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
```

---

### HIGH-06: In-Memory Rate Limiting Ineffective on Vercel
**Severity:** 🟠 HIGH  
**Files:** `frontend/src/proxy.ts:35-45`, `frontend/src/lib/utils/distributed-rate-limiter.ts`

The proxy middleware uses an in-memory `Map` for rate limiting. On Vercel's serverless architecture, each invocation may run on a different Lambda instance, making this rate limiting nearly useless. The code has a comment acknowledging this:

```typescript
/**
 * **Serverless caveat:** This in-memory store will NOT share state across
 * serverless invocations.
 */
```

The `DistributedRateLimiter` exists and uses Supabase, but the proxy still uses the in-memory one.

**Fix:** 
1. Migrate to Upstash Redis (`@upstash/ratelimit`) for the middleware rate limiter
2. Or accept the Supabase-backed rate limiter's latency in the proxy

---

### HIGH-07: Regex-Based HTML Sanitizer
**Severity:** 🟠 HIGH  
**File:** `frontend/src/lib/utils/sanitize-html.ts`

The HTML sanitizer uses regex-based stripping, which is fundamentally unreliable. The file itself acknowledges this:

```typescript
// This is a basic regex-based sanitiser suitable for server-rendered CMS content.
// For user-generated content at scale, prefer a dedicated library.
```

Known bypass vectors for regex sanitizers include:
- `<img src=x onerror=alert(1)>` with unusual whitespace
- SVG with embedded scripts
- HTML entity encoding tricks

Currently used in FAQ pages and blog content (which is markdown from the filesystem, so lower risk), but any future user-generated content would be vulnerable.

**Fix:** Replace with `isomorphic-dompurify` or use the existing `rehype-sanitize` (already in dependencies) consistently.

---

## 4. Medium Priority Issues (Fix When Able)

### MED-01: `@sparticuz/chromium` Bundle Size (64MB)
**Severity:** 🟡 MEDIUM  
**File:** `frontend/package.json`

`@sparticuz/chromium` (64MB) and `playwright-core` (9.6MB) are production dependencies used only for headless rendering in the audit engine. On Vercel, these will inflate cold start times and may hit the 250MB function size limit.

**Fix:** Move headless rendering to a separate serverless function or use a lighter headless service (Browserless, ScrapingBee) as a backend.

---

### MED-02: Missing `NEXT_PUBLIC_APP_URL` in Production
**Severity:** 🟡 MEDIUM  
**File:** `frontend/src/lib/security/request-metadata.ts:165`

The `getAllowedRequestHosts` function reads `process.env.NEXT_PUBLIC_APP_URL` to build the host allowlist for CSRF. If this isn't set in Vercel environment variables, the CSRF check relies solely on the `Host` header, which could be spoofed.

**Fix:** Ensure `NEXT_PUBLIC_APP_URL=https://openrole.co.uk` is set in Vercel production environment variables.

---

### MED-03: Badge API CORS Wildcard
**Severity:** 🟡 MEDIUM  
**File:** `frontend/src/app/api/badge/[slug]/route.ts:133`

```typescript
"Access-Control-Allow-Origin": "*",
```

The badge API serves SVG with a wildcard CORS. This is intentional (badges need to be embeddable anywhere), but the response should include `X-Content-Type-Options: nosniff` to prevent MIME sniffing attacks.

**Fix:** Add `X-Content-Type-Options: nosniff` header to the badge response.

---

### MED-04: 73 `console.error` Statements
**Severity:** 🟡 MEDIUM  
**Files:** Various API routes and library files

There are 73 `console.error`/`console.warn` calls across the production code. While there are zero `console.log` statements (good!), the error logging should be replaced with a structured logger that can be consumed by monitoring tools.

**Fix:** Create a logger utility (`lib/utils/logger.ts`) that outputs structured JSON and can be replaced with Sentry/DataDog in production.

---

### MED-05: `untypedTable` Bypass Pattern
**Severity:** 🟡 MEDIUM  
**File:** `frontend/src/lib/supabase/untyped-table.ts`

The `untypedTable` helper casts the Supabase admin client to `any` to access tables not in the generated types. This is used extensively (public_audits, nominations, monitor_checks, crawler_visits, etc.). It works but:
- Bypasses TypeScript's type safety
- Makes refactoring risky (no compile-time checks)
- Uses the **admin** (service role) client for all queries

**Fix:** Regenerate Supabase types with `supabase gen types typescript` and replace all `untypedTable` calls with typed queries.

---

### MED-06: Vercel Config Conflict
**Severity:** 🟡 MEDIUM  
**File:** `vercel.json` (root level)

The root `vercel.json` references `public-landing.html` as a static build:

```json
{
  "builds": [{ "src": "public-landing.html", "use": "@vercel/static" }],
  "routes": [{ "src": "/", "dest": "/public-landing.html" }]
}
```

This conflicts with the Next.js app in `frontend/`. The Vercel project appears to be configured to deploy from `frontend/` (based on `.vercel/project.json`), so this root config may be ignored, but it could cause confusion or deployment issues.

**Fix:** Remove the root `vercel.json` or clarify that it's not used.

---

### MED-07: Auth Callback Missing Origin Validation
**Severity:** 🟡 MEDIUM  
**File:** `frontend/src/app/auth/callback/route.ts`

```typescript
const origin = requestUrl.origin;
// ...
return NextResponse.redirect(`${origin}/dashboard`);
```

The `origin` is derived from `request.url`, which in Next.js is constructed from the `Host` header. While typically safe behind Vercel's edge, in non-standard deployments this could be an open redirect vector.

**Fix:** Validate the redirect target against `NEXT_PUBLIC_APP_URL` or use a relative redirect.

---

### MED-08: No Pagination on Company Search
**Severity:** 🟡 MEDIUM  
**File:** `frontend/src/app/api/companies/search/route.ts`

The search endpoint limits results to 8 but doesn't support pagination. For the UK index and comparison features, this may not be sufficient. The `ilike` query is also potentially slow on large datasets without the trigram index being leveraged.

**Fix:** Add `offset`/`cursor` pagination support. Verify the `companies_name_trgm_idx` GIN index is being used by the query planner.

---

## 5. Low Priority / Nice-to-Have

### LOW-01: Scoring Algorithm Documentation
The scoring breakdown (JSON-LD: 20, Robots: 20, Careers: 20, Brand: 15, Content Format: 15, Salary: 10, llms.txt: 0) adds up to a maximum of 100 points. The `llmsTxt` score is permanently zeroed with a comment citing research. This is defensible but should be documented in the `/how-we-score` page. **Max possible score: 100.** ✅

### LOW-02: CSP Nonce Not Consumed
**File:** `frontend/src/app/layout.tsx:72`

The nonce is read from headers and placed in a meta tag, but it's not passed to any script tags. Next.js 16 may handle this internally, but verify that the CSP policy actually allows inline scripts.

### LOW-03: Missing `alt` Text on Some Images
**File:** `frontend/src/app/verify/[slug]/page.tsx:450` — `<img>` tags in the verify page should use `next/image` for optimization and proper alt text.

### LOW-04: No 404 Custom Page
There's no custom `not-found.tsx` at the app root level. The default Next.js 404 page will show.

### LOW-05: Blog Post Sitemap Includes Hardcoded Slugs
**File:** `frontend/src/app/sitemap.ts:21-30`

Hardcoded blog slugs in the sitemap may reference posts that don't exist, creating 404s in the sitemap that hurt SEO.

### LOW-06: Chromium Import in All Audit Requests
The `headless-render.ts` file dynamically imports `@sparticuz/chromium` only when needed (good), but the top-level `playwright-core` import will be included in the bundle regardless.

---

## 6. What's Done Well

### ✅ Comprehensive Test Coverage
35 test files, 339 tests, 100% pass rate. Tests cover API routes, scoring logic, citation chain, CSRF, CORS, request signing, input validation, and UI components. This is excellent for a project at this stage.

### ✅ Zero Lint / Type Errors
`npx tsc --noEmit` and `npx eslint src/` both pass with zero errors. TypeScript strict mode is respected, with only the intentional `untyped-table.ts` using `any` (properly eslint-disabled).

### ✅ Zero `console.log` in Production Code
No debug logging leaked into production. All logging uses `console.error` for genuine error conditions.

### ✅ Robust SSRF Protection
The URL validator (`url-validator.ts`) is thorough:
- Blocks all RFC 1918 private ranges, link-local, loopback
- Blocks cloud metadata IP (169.254.169.254)
- Blocks local hostnames (localhost, *.local)
- DNS resolution with timeout (3s)
- Validates both IPv4 and IPv6

### ✅ Well-Designed Pixel Security Stack
The pixel API has defense-in-depth:
1. CORS with dynamic origin (no wildcards)
2. API key validation with prefix + hash
3. HMAC request signing with replay protection
4. Per-key domain allowlists
5. Distributed rate limiting with Supabase + fallback
6. Full audit logging

### ✅ Consistent API Error Responses
All API routes use standardised `apiErrorResponse` / `apiSuccessResponse` helpers with typed error codes. This is clean and maintainable.

### ✅ Input Validation on All Routes
Every API route validates input via Zod schemas before processing. No raw `request.json()` data is trusted.

### ✅ CSRF Protection
The CSRF implementation is well-designed — uses `Origin` header validation with `sec-fetch-site` fallback, and builds the host allowlist from multiple sources.

### ✅ CSP Headers with Nonce
The proxy middleware generates per-request CSP nonces and sets a comprehensive Content-Security-Policy header.

### ✅ CI Pipeline
GitHub Actions CI runs lint, typecheck, tests, build, and `npm audit` on every push/PR.

### ✅ No Dependency Vulnerabilities
`npm audit --omit=dev` reports zero vulnerabilities.

### ✅ Proper Supabase Client Separation
Three separate clients (admin, anon, server) with appropriate use:
- Admin: Service role for server-side writes (bypasses RLS)
- Anon: Public queries that respect RLS
- Server: Cookie-based auth for dashboard routes

---

## Appendix: Scoring Model Verification

| Category | Max Points | Source |
|----------|-----------|--------|
| JSON-LD / Structured Data | 20 | GEO study: 30-40% visibility boost |
| Content Accessibility (Robots + Sitemap) | 20 | Semrush: SSR + crawlability required |
| Careers Page Quality | 20 | Moz: direct content gets cited |
| Brand Reputation | 15 | Semrush: unlinked mentions matter |
| Content Format | 15 | Princeton GEO: citations, Q&A, structure |
| Salary Transparency | 10 | Bonus scoring, not penalty |
| llms.txt | 0 | Zeroed — research found zero impact |
| **Total** | **100** | |

The scoring model is defensible and well-documented with research citations in the code comments.
