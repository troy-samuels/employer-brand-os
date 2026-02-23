# Monitoring & Quality Fixes Log

**Date:** 2025-07-17
**Branch:** main

---

## HIGH-03: Sentry Error Monitoring ✅

- Installed `@sentry/nextjs` (191 packages added)
- Created `sentry.client.config.ts` — client-side init with replay-on-error (1.0 sample rate)
- Created `sentry.server.config.ts` — server-side init with 0.1 traces sample rate
- Created `sentry.edge.config.ts` — edge runtime init (same as server)
- Updated `next.config.ts` — wrapped export with `withSentryConfig(nextConfig, { silent: true, disableLogger: true })`
- Added `NEXT_PUBLIC_SENTRY_DSN` to `.env.example`
- **Status:** DSN not yet configured (set env var to activate)

## MED-01: Document Chromium Concern ✅

- Added `PERF NOTE` comment at top of `src/lib/audit/headless-render.ts`
- Documents the 64MB cold start penalty from `@sparticuz/chromium`
- Recommends migration to Browserless/ScrapingBee or isolated Vercel function

## MED-05: Supabase Types ✅

- Ran `supabase gen types typescript --project-id gkjhglqaodxzcqbccybc`
- Types were already up-to-date (regenerated file identical to committed version)
- Added TODO comment to `src/lib/supabase/untyped-table.ts` for future cleanup
- Pre-existing type errors in `generate-key.ts`, `key-rotation.ts`, `sanitize.ts`, and `sitemap.ts` — unrelated to this change (Supabase PostgREST select query inference issues + unstaged local changes)

## LOW-01: Verify Scoring Documentation ✅

- Compared `how-we-score/page.tsx` CHECKS array against `website-checks.ts` scoring functions
- All weights match:
  | Category | Page Weight | Engine Weight |
  |----------|-------------|---------------|
  | Content Accessibility | 20 | 20 (scoreRobotsCheck) |
  | Structured Data | 20 | 20 (scoreJsonLdCheck) |
  | Careers Content | 20 | 20 (scoreCareersCheck) |
  | Content Format | 15 | 15 (scoreContentFormat) |
  | Brand Presence | 15 | 15 (scoreBrandReputation) |
  | Salary Transparency | 10 | 10 (analyzeSalaryTransparency) |
  | llms.txt | 0 | 0 (scoreLlmsCheck) |
- **No changes needed** — documentation is accurate

## LOW-02: CSP Nonce Flow ✅

- Verified nonce flow: `proxy.ts` → `createNonce()` → sets `x-openrole-csp-nonce` header + CSP `script-src 'nonce-...'` → `layout.tsx` reads header → injects `<meta name="csp-nonce">` tag
- Next.js 15+ auto-reads CSP header and applies nonce to its own inline scripts
- Added detailed comment block in `layout.tsx` documenting the full flow
- **No functional issues** — nonce properly consumed

## LOW-03: Fix img Tags in Verify Page ✅

- Replaced `<img>` tag in `src/app/verify/[slug]/page.tsx` with `next/image` `<Image>` component
- Added proper alt text: `${organization.name} logo`
- Used `unoptimized` prop since logos are user-provided URLs from arbitrary domains
- Added `remotePatterns` in `next.config.ts` for Supabase storage (`*.supabase.co`, `*.supabase.in`)
- Removed `eslint-disable-next-line @next/next/no-img-element` comment

## LOW-06: Lazy Import playwright-core ✅

- Removed top-level `import { chromium } from "playwright-core"` in `headless-render.ts`
- Created async `getPlaywrightChromium()` wrapper that uses `await import("playwright-core")`
- Updated both `renderPage()` and `renderPageStealth()` to call the lazy loader
- **Impact:** Routes that don't use headless rendering no longer pay the import cost at cold start

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ Clean (0 warnings, 0 errors) |
| `npm run typecheck` | ⚠️ Pre-existing errors only (none in changed files) |
| `npm run test` | ✅ 35 files, 339 tests passed |

### Pre-existing typecheck errors (not introduced by these changes):
- `src/features/api-keys/actions/generate-key.ts` — Supabase select query type inference issue
- `src/lib/auth/key-rotation.ts` — Same Supabase type issue
- `src/features/sanitization/lib/sanitize.ts` — Json type narrowing
- `src/app/sitemap.ts` — Missing `BASE_URL` variable (unstaged local changes)
