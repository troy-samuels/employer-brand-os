# Auth, Dashboard & Email Integration Log

**Date:** 2025-07-12
**Status:** ✅ Complete — all checks passing (lint ✅, typecheck ✅, 339 tests ✅)

---

## What Was Built

### 1. Middleware Activation
- **Created** `src/middleware.ts` — re-exports the existing `proxy.ts` as Next.js middleware
- **Updated** `src/proxy.ts` — added `?redirect=` query param to login redirects from protected `/dashboard` routes
- Added `/api/email` to CSRF-exempt routes (server-to-server calls)

The proxy already had auth checks for `/dashboard` routes — it just wasn't wired up as middleware. Now it is.

### 2. Login Page (`src/app/(auth)/login/page.tsx`)
- Email + password form with Supabase `signInWithPassword`
- "Sign in with Google" OAuth button
- Forgot password link
- Accepts `?redirect=` query param, redirects there after login
- Error state handling (form errors + URL error param from callback)
- Matches existing design system (slate palette, rounded-xl inputs, teal accents)

### 3. Signup Page (`src/app/(auth)/signup/page.tsx`)
- Email + password + company name form
- "Sign up with Google" OAuth button
- Password minimum 8 characters validation
- Post-submit: shows "Check your email" confirmation screen with retry option
- Terms/Privacy links
- Company name stored in Supabase `user_metadata`

### 4. Dashboard Layout (`src/app/dashboard/layout.tsx`)
- Removed the redirect-to-home
- Server component that checks Supabase session
- Renders `<DashboardShell>` with user email and plan

### 5. Dashboard Shell (`src/components/dashboard/dashboard-shell.tsx`)
- Full sidebar with 9 nav items: Dashboard, AI Intelligence, Compliance, Analytics, Facts, Jobs, Pixel, Integration, Settings
- Active state highlighting on current route
- User info: email, avatar initial, plan badge (Free/Pro/Enterprise)
- "Upgrade" CTA button for free plan users
- Logout button (Supabase `signOut`)
- Mobile responsive: hamburger menu + slide-out sidebar with backdrop overlay
- Desktop: fixed 256px sidebar with scrollable main content area

### 6. Resend Email Client (`src/lib/email/resend.ts`)
- Wraps Resend SDK with graceful fallback when no API key set
- Default from: `OpenRole <hello@mail.openrole.co.uk>`
- Returns `{ success, id?, error? }` — never throws

### 7. Audit Report Email Template (`src/lib/email/templates/audit-report.tsx`)
- HTML email with inline styles (email-safe)
- OpenRole branded header (dark)
- Score with color coding: green >60, amber 31-60, red ≤30
- Findings table (5 areas: structured data, content, careers, reputation, salary)
- Top 3 recommendations
- Two CTAs: "See your full report" → `/company/{slug}`, "Fix your employer brand" → `/fix/{slug}`
- Footer with unsubscribe + privacy links

### 8. Welcome Email Template (`src/lib/email/templates/welcome.tsx`)
- HTML email for post-signup/post-checkout
- 3-step quick start guide
- Dashboard CTA
- Support contact

### 9. Email Send API Route (`src/app/api/email/audit-report/route.ts`)
- POST endpoint protected by `CRON_SECRET` or `INTERNAL_API_SECRET` Bearer token
- Validates payload with Zod (email, companySlug, companyName, score)
- Sends via Resend, logs to `email_sends` table (graceful if table doesn't exist)

### 10. Audit Leads → Email Wiring
- **Updated** `src/app/api/audit/leads/route.ts` — after lead capture, fires off audit report email (fire-and-forget via `void`)
- **Created** `src/lib/email/send-audit-report.ts` — standalone helper that renders template, sends via Resend, and logs the attempt

### 11. Environment Config
- **Updated** `.env.example` with:
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `NEXT_PUBLIC_SUPABASE_REDIRECT_URL`
  - `INTERNAL_API_SECRET`

---

## Files Created
```
src/middleware.ts                              (new)
src/components/dashboard/dashboard-shell.tsx   (new)
src/lib/email/resend.ts                        (new)
src/lib/email/send-audit-report.ts             (new)
src/lib/email/templates/audit-report.tsx        (new)
src/lib/email/templates/welcome.tsx             (new)
src/app/api/email/audit-report/route.ts        (new)
```

## Files Modified
```
src/proxy.ts                                   (redirect param + CSRF exempt)
src/app/(auth)/login/page.tsx                  (replaced redirect stub)
src/app/(auth)/signup/page.tsx                 (replaced redirect stub)
src/app/dashboard/layout.tsx                   (replaced redirect stub)
src/app/api/audit/leads/route.ts               (added email trigger)
.env.example                                   (added email + auth vars)
```

---

## What's Needed to Go Live
1. **RESEND_API_KEY** — sign up at resend.com, verify `mail.openrole.co.uk` domain
2. **INTERNAL_API_SECRET** — generate any secure random string for env
3. **Google OAuth** — configure in Supabase dashboard (Authentication → Providers → Google)
4. **`email_sends` table** — create in Supabase (optional, logging gracefully fails without it)
5. **`NEXT_PUBLIC_SUPABASE_REDIRECT_URL`** — set in Vercel env vars for production
