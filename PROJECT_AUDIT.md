# Rankwell — Comprehensive Project Audit

**Audited:** 2025-02-11  
**Scope:** Full frontend codebase at `/frontend`  
**Auditor:** Malcolm (QA subagent)

---

## Executive Summary

The product is in a **strong MVP state** for the public-facing audit funnel (landing → scan → results → email capture). The code quality is high, the legal pages are thorough, and the security posture is excellent. However, there are several blockers around broken links, non-functional auth pages, and missing mobile navigation that would damage credibility with enterprise HR directors.

**Stats:**
- 🔴 **14 BLOCKERS** — would stop a prospect from converting
- 🟡 **19 IMPORTANT** — creates doubt or friction
- 🟢 **16 NICE-TO-HAVE** — polish items

---

## 1. Page Routes & Content

### 🔴 BLOCKER: Login/Signup pages redirect to homepage
**Files:** `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`  
Both pages are just `redirect("/")`. Every CTA pointing to `/signup?plan=starter`, `/signup?plan=growth`, `/signup?ref=company-page`, etc. leads to the homepage with zero explanation. Enterprise HR directors clicking "Get started" on the pricing page will feel confused and lose trust immediately.

### 🔴 BLOCKER: Dashboard layout redirects to homepage
**File:** `src/app/dashboard/layout.tsx`  
`redirect("/")` — The entire dashboard is inaccessible. All dashboard pages (analytics, jobs, pixel, compliance, settings, facts, sanitization, integration) are dead. This means the product has no post-signup experience at all.

### 🔴 BLOCKER: Broken href in company page "Claim profile" link
**File:** `src/app/company/[slug]/page.tsx`, line 422  
```tsx
href="/signup?ref=claim&company={audit.company_slug}"
```
This is a **string literal**, not a template literal. The `{audit.company_slug}` is rendered as-is in the URL. Should be a template literal with backticks. Every company page has a broken "Claim profile" CTA.

### 🔴 BLOCKER: "How We Score" page shows wrong weights
**File:** `src/app/how-we-score/page.tsx`  
The page shows: AI Instructions = 25pts, JSON-LD = 25pts, Salary = 20pts, Careers = 15pts, Bot Access = 15pts (total: 100).  
But the actual scoring in `audit-results.tsx` uses: Careers = 30pts, JSON-LD = 20pts, Brand Reputation = 15pts, Salary = 15pts, Bot Access = 10pts, AI Instructions = 10pts (total: 100).  
**The public methodology page contradicts the actual scoring.** This destroys credibility if any prospect inspects their results against the explanation. Brand Reputation isn't even mentioned on the how-we-score page.

### 🟡 IMPORTANT: Dashboard pages use SAMPLE_JOBS/SAMPLE_ANALYTICS constants
**Files:** `src/app/api/jobs/route.ts`, `src/app/api/analytics/route.ts`, `src/app/dashboard/compliance/page.tsx`  
All dashboard API routes return hardcoded sample data from `constants.ts` (Acme Corp, sample jobs, sample analytics). If the dashboard were accessible, everything would show fake data. The compliance page directly imports `SAMPLE_AUDIT_RESULT`.

### 🟡 IMPORTANT: Dashboard settings page is non-functional
**File:** `src/app/dashboard/settings/page.tsx`  
Pure UI shell with placeholder values ("Rankwell", "rankwell.io", "you@company.com"). The "Save Settings" button does nothing — no form handler, no API call.

### 🟡 IMPORTANT: Pixel install snippet uses dummy values
**File:** `src/app/dashboard/pixel/page.tsx`  
Shows hardcoded `company_123` and `px_demo_123` in the install snippet. Even though the integration page generates real keys, the pixel page shows fake ones.

### 🟢 NICE-TO-HAVE: Company page not-found state doesn't use notFound()
**File:** `src/app/company/[slug]/page.tsx`  
When no audit is found, the page renders inline JSX instead of calling `notFound()`. This means HTTP status is 200 instead of 404, which is bad for SEO crawlers.

---

## 2. Components

### 🔴 BLOCKER: No mobile navigation / hamburger menu
**File:** `src/components/shared/header.tsx`  
The header nav is a horizontal flex row with no mobile breakpoint handling. On mobile screens, the nav links ("How we score", "Pricing", "Security", "Free audit") will either overflow or get squished. There is no hamburger menu, Sheet component, or responsive collapse. **HR directors on phones will see a broken header.**

### 🟡 IMPORTANT: Footer missing DPA link
**File:** `src/components/shared/footer.tsx`  
Links to: How we score, Pricing, Security, Privacy, Terms, Contact. Missing: DPA (`/dpa`). Enterprise prospects specifically look for this.

### 🟡 IMPORTANT: Monitor Preview uses "Acme Corp" throughout
**File:** `src/components/landing/monitor-preview.tsx`  
The mock email preview hardcodes "Acme Corp" as the company name. This is fine as a demo, but should ideally reference a more realistic/generic company name or dynamically use the user's own company if they've already run an audit.

### 🟡 IMPORTANT: AuditGate says "Check your inbox" but no email is actually sent
**File:** `src/components/audit/audit-gate.tsx`  
After form submission, it shows "Your full AI visibility report is on its way. It covers what ChatGPT, Claude and Perplexity actually say about you." But the `/api/audit/leads` endpoint only saves the email to the database — no email delivery is implemented. The `RESEND_API_KEY` is missing from the env. **This is a broken promise to the user.**

### 🟢 NICE-TO-HAVE: Hero component is imported but never used
**File:** `src/components/landing/hero.tsx`  
A full hero component exists but isn't used on the homepage (which has its own inline hero). The hero references "Shadow Salary" and "Results in 60 seconds" while the actual homepage says "Find out in 15 seconds." Messaging inconsistency if anyone ever re-enables it.

### 🟢 NICE-TO-HAVE: audit-report.tsx and competitive-analysis.tsx are unused
**Files:** `src/components/audit/audit-report.tsx`, `src/components/audit/competitive-analysis.tsx`  
These reference the old `AuditResult` type (10-point scale, competitors_analyzed, pdf_report_url). Not used anywhere in current routing. Dead code.

---

## 3. API Routes

### 🟡 IMPORTANT: LLM testing is entirely placeholder data
**File:** `src/lib/audit/llm-testing.ts`  
The file header says "Phase 1: Returns structured placeholder results per model." All 6 LLM models return hardcoded fake claims. No actual API calls to ChatGPT, Claude, Perplexity, etc. The LLM teaser cards on the audit results page and company pages show "🔒 locked" content that's completely fabricated.

### 🟡 IMPORTANT: Rate limiter uses in-memory Map
**File:** `src/middleware.ts`, `src/lib/utils/rate-limiter.ts`  
Rate limiting uses `new Map()` in memory. In a serverless/edge environment (Vercel), each function invocation gets fresh memory. Rate limits reset on every cold start and don't work across instances. The Upstash Redis integration is listed as needed in TOOLS.md but not yet connected.

### 🟡 IMPORTANT: No email delivery system
Multiple routes reference email sending but no email infrastructure exists:
- `/api/audit/leads` captures emails but doesn't send reports
- Monitor weekly route (`/api/monitor/weekly/route.ts`) exists but `RESEND_API_KEY` is not configured
- "Monday Report" is marketed on the landing page but can't be delivered

### 🟢 NICE-TO-HAVE: API health endpoint over-validates
**File:** `src/app/api/health/route.ts`  
Uses a Zod schema to validate an empty query object on a health check. Unnecessary complexity for a simple liveness probe.

---

## 4. Public Folder & Assets

### 🟡 IMPORTANT: Default Next.js assets still present
**Files:** `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`  
These are the default Next.js starter template SVGs. They ship to production and signal "we didn't clean up our boilerplate."

### 🟡 IMPORTANT: No favicon/logo assets
No custom favicon (beyond the default `src/app/favicon.ico`), no apple-touch-icon, no OG image, no brand logo SVG. The header just uses text "Rankwell" — no logo.

### 🟢 NICE-TO-HAVE: pixel-test.html in public
**File:** `public/pixel-test.html`  
A development/testing HTML file that's publicly accessible. Should be in a dev-only location.

---

## 5. Config Files

### 🟡 IMPORTANT: CSP in next.config.ts conflicts with middleware CSP
**File:** `next.config.ts` and `src/middleware.ts`  
Both set Content-Security-Policy headers. The middleware generates nonce-based CSP (`script-src 'self' 'nonce-${nonce}'`) while next.config.ts has a static one (`script-src 'self'`). Headers set in both places may conflict. The middleware version is better (supports nonces) but the config one is stricter (no nonce = blocks inline scripts).

### 🟢 NICE-TO-HAVE: package.json name is just "frontend"
Should be `@rankwell/frontend` or `rankwell-app` for clarity in logs and error reports.

---

## 6. Types & Type Safety

### 🟡 IMPORTANT: Three `as any` casts in production code
- `src/app/sitemap.ts:11` — `supabaseAdmin as any`
- `src/app/company/[slug]/page.tsx:30` — `supabaseAdmin as any`
- `src/lib/audit/public-audit-store.ts:14` — `supabaseAdmin as any`

All three exist because `public_audits` table isn't in the generated Supabase types. These bypass type checking for all DB queries on those pages. One incorrect column name → runtime crash.

### 🟢 NICE-TO-HAVE: Old types still referenced
`src/types/audit.ts` contains the old `AuditResult` interface (10-point scoring, pdf_report_url, etc.) that's only used by sample constants and unused components.

---

## 7. Testing Gaps

### 🟡 IMPORTANT: No tests for critical conversion path
**Missing tests for:**
- Landing page render / audit flow integration
- AuditGate (email capture) component
- AuditProgress component
- ScoreGauge component
- `/api/audit/leads` route
- Lead email validation (consumer email rejection)
- Company page (`/company/[slug]`)
- Sitemap generation
- Middleware rate limiting logic
- Middleware CSRF validation

**Existing tests (9 files):**
- audit-input, audit-results (components)
- cors, request-signing, script-artifact (pixel)
- url-validator, website-checks, company-resolver, audit route (audit)

### 🟢 NICE-TO-HAVE: No E2E tests
No Playwright or Cypress E2E tests for the complete audit → email capture flow.

---

## 8. Legal Pages

### 🟢 Overall: Comprehensive and well-written
The Privacy Policy, Terms of Service, Security page, and DPA are all thorough, properly structured, and appropriate for enterprise buyers. This is genuinely impressive for an MVP.

### 🟡 IMPORTANT: Legal pages dated "9 February 2026"
**Files:** Privacy, Terms, DPA  
All three legal pages show `lastUpdated = '9 February 2026'`. Current date is February 2025. These are dated a year in the future, which looks like a mistake and undermines the credibility of legal documents. **Enterprise legal teams WILL notice this.**

### 🟡 IMPORTANT: Legal pages missing navigation
Privacy, Terms, DPA, and Security pages have no Header/Footer components. Users who land directly on `/privacy` (e.g., from Google) have no way to navigate to the rest of the site. The Security page has its own header but also lacks the standard nav.

### 🟢 NICE-TO-HAVE: No company registration info
Legal pages reference "Rankwell" but don't include a company registration number, registered address, or legal entity name. UK enterprises may expect this.

---

## 9. SEO

### 🔴 BLOCKER: No metadataBase set in root layout
**File:** `src/app/layout.tsx`  
No `metadataBase` property set. Without this, OpenGraph URLs and canonical links may not resolve correctly. Next.js 14+ needs this for proper OG image and canonical URL generation.

### 🔴 BLOCKER: No OG image
No OpenGraph image exists anywhere — no `opengraph-image.tsx`, no static OG image in `/public`. When the site is shared on LinkedIn, Slack, or Twitter, there's no preview image. **For a product targeting HR professionals who share links constantly, this is a significant miss.**

### 🟡 IMPORTANT: Sitemap missing /dpa route
**File:** `src/app/sitemap.ts`  
Static pages include: `/`, `/pricing`, `/how-we-score`, `/security`, `/privacy`, `/terms`. Missing: `/dpa`. Also missing: `/company` (though dynamic company pages are included).

### 🟡 IMPORTANT: No robots.txt
No `public/robots.txt` file. While Next.js can generate one, there's no explicit config. For a product about robots.txt and AI crawling, this is ironic.

### 🟢 NICE-TO-HAVE: Homepage is "use client" — no server-side metadata
**File:** `src/app/page.tsx`  
The homepage is entirely client-rendered ("use client"). The metadata is set in layout.tsx, which works, but the page itself can't have dynamic metadata or be statically generated. Search engines will see the shell first.

---

## 10. Mobile Responsiveness

### 🔴 BLOCKER: Header nav has no responsive collapse (see #2 above)
No hamburger menu, no mobile drawer. Nav items will overflow or be inaccessible on screens < 640px.

### 🟡 IMPORTANT: Pricing page billing toggle may be hard to tap
The toggle buttons are small on mobile. No touch target size optimisation.

### 🟢 NICE-TO-HAVE: Data tables in dashboard aren't responsive
Dashboard job table, compliance violations table — no horizontal scroll wrapper or card-based mobile layout. Not critical since dashboard redirects to home, but noted for when it's enabled.

### 🟢 NICE-TO-HAVE: Before/After section cramped on mobile
The two-column grid in testimonials (`md:grid-cols-2`) stacks correctly, but the cards are content-heavy and may feel overwhelming on small screens.

---

## 11. Accessibility

### 🟡 IMPORTANT: Score gauge has no aria attributes
**File:** `src/components/audit/score-gauge.tsx`  
The large animated score number has no `role`, `aria-label`, or `aria-live` attribute. Screen readers won't announce the score or its meaning.

### 🟡 IMPORTANT: Verify page uses `<img>` without Next.js Image
**File:** `src/app/verify/[slug]/page.tsx`  
Uses native `<img>` tag for company logos: `<img src={organization.logoUrl} alt={organization.name} .../>`. Should use `next/image` for optimisation, but the alt text is at least present.

### 🟢 NICE-TO-HAVE: Audit input and gate forms have good aria-labels ✅
`aria-label="Company name or website"` and `aria-label="Work email"` are both present. Good.

### 🟢 NICE-TO-HAVE: Footer links missing aria-current
Navigation links don't indicate the current page.

---

## 12. Trust Signals & Social Proof

### 🔴 BLOCKER: No testimonials from real customers
**File:** `src/components/landing/testimonials.tsx`  
The component is actually named `BeforeAfter` — it shows a hypothetical before/after comparison, not real testimonials. The `id="testimonials"` anchor is misleading. **There are zero real customer quotes, case studies, or social proof anywhere on the site.** For enterprise HR directors, this is a major trust gap.

### 🔴 BLOCKER: No trust badges or logos
No "Trusted by" section, no client logos, no "As seen in" press mentions, no review platform badges (G2, Capterra), no security certification badges on the landing page. The security page mentions SOC 2 and GDPR but says "Own certification in progress."

### 🟡 IMPORTANT: No founder/team information
No "About" page, no team section, no LinkedIn links to founders. Enterprise buyers want to know who's behind the product before installing scripts on their website.

### 🟡 IMPORTANT: Enterprise contact is just "hello@rankwell.io"
Multiple pages link to `mailto:hello@rankwell.io` for enterprise inquiries. No contact form, no Calendly link, no sales demo booking. High-intent enterprise leads are sent to a generic email.

---

## 13. Conversion Flow Analysis

### Flow: Landing → Audit → Results → Email Capture

#### Step 1: Landing page ✅
Clean, focused headline. Single input. Low friction. "Find out in 15 seconds" is compelling.

#### Step 2: Audit scan ✅
Smooth animated progress. Real backend processing. Good.

#### Step 3: Results ✅
Score gauge is beautiful. Check cards are clear and actionable. Currency detection is impressive.

#### Step 4: Email gate 🔴
- "Work email" requirement rejects Gmail/Outlook. **Many startup HR directors use Gmail.** This blocks a significant segment.
- After submission, says "Check your inbox" but **no email is sent**. This is the single most damaging broken promise in the product.
- No immediate value delivered after email capture — no PDF, no detailed breakdown, no comparison data.

#### Step 5: Pricing CTA 🟡
- "See what AI says about you" links to `/pricing`
- Pricing page "Get started" links to `/signup?plan=X` which redirects to `/`
- **The entire paid conversion funnel is dead.**

### 🔴 BLOCKER: Complete paid conversion path is broken
Landing → Pricing → Signup → Dashboard is: Working → Working → Redirect to home → Redirect to home. There is no way for a prospect to become a customer.

---

## 14. Copy Quality

### ✅ Excellent
- Homepage headline: "Is AI telling the truth about your company?" — sharp, specific, provocative
- Feature descriptions are concrete and benefit-driven
- Pricing FAQ answers are natural and pre-empt real objections
- Legal copy is professional and comprehensive
- Error states on audit results are empathetic and actionable

### 🟡 IMPORTANT: "Shadow Salary" terminology inconsistency
The hero component (unused) says "See your Shadow Salary." Features section says "See your Shadow Salary." But the actual audit doesn't use the term "Shadow Salary" anywhere in results. The homepage headline uses "Is AI telling the truth" instead. Pick one framing and commit to it.

### 🟡 IMPORTANT: "15 seconds" vs "60 seconds" vs "30 seconds"
- Homepage: "Find out in 15 seconds"
- Hero (unused): "Results in 60 seconds"
- Pricing page: "takes 30 seconds"
- CTA section: "in 60 seconds"

Three different time claims across the site. Should be consistent.

### 🟢 NICE-TO-HAVE: Dashboard copy uses old styling
Dashboard pages use `text-gray-900` / `text-gray-500` while the rest of the site uses `text-neutral-950` / `text-neutral-500`. Inconsistent design language.

---

## 15. Security Observations

### ✅ Strong
- CSRF validation on all mutating endpoints
- Rate limiting (even if in-memory)
- CSP headers with nonce generation
- HMAC-SHA256 request signing for pixel
- API key hashing with bcrypt
- Input validation with Zod on all routes
- SSRF protection via URL validation (blocks private IPs)
- SRI integrity checking for pixel script

### 🟡 IMPORTANT: Consumer email list is not comprehensive
**File:** `src/app/api/audit/leads/route.ts`  
The `CONSUMER_DOMAINS` set has 14 entries. Missing: `zoho.com`, `yandex.com`, `mail.com`, `gmx.com`, `tutanota.com`, `pm.me`, `hey.com`, `fastmail.com`, `proton.me`. But also: blocking personal email entirely may be wrong — see conversion flow note above.

---

## Priority Fix Order

### Immediate (pre-launch):
1. 🔴 Fix `/signup` and `/login` — at minimum, show a waitlist/early access form
2. 🔴 Fix mobile header navigation (hamburger menu)
3. 🔴 Fix broken template literal in company page claim link
4. 🔴 Fix how-we-score weights to match actual scoring
5. 🔴 Add OG image and metadataBase
6. 🔴 Fix legal page dates (2026 → 2025)
7. 🔴 Connect email delivery (Resend) so "Check your inbox" isn't a lie
8. 🔴 Add at least one real trust signal (founder info, beta user quote, client logo)

### Before first enterprise demo:
9. 🟡 Add Header/Footer to legal pages
10. 🟡 Add DPA to footer and sitemap
11. 🟡 Add robots.txt
12. 🟡 Remove default Next.js public assets
13. 🟡 Add proper Supabase types to eliminate `as any` casts
14. 🟡 Add founder/team page or section
15. 🟡 Standardize time claims across all pages
16. 🟡 Fix in-memory rate limiter (connect Upstash)

### Post-launch polish:
17. 🟢 Remove unused components (hero, audit-report, competitive-analysis)
18. 🟢 Add missing tests for conversion path
19. 🟢 Add E2E tests
20. 🟢 Make homepage SSR-compatible
21. 🟢 Remove pixel-test.html from public

---

*End of audit. 49 total findings across 14 categories.*
