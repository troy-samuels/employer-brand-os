# Overnight Build Plan — 10 Feb 2026

## Wave 1: Homepage + Landing Page (Codex, 20min)
- Add Header + Footer to homepage
- Wire existing landing components below the audit: features, pricing, testimonials, CTA
- Make sure audit flow still works with header/footer present
- Mobile responsive
- Must pass tsc, vitest, build

## Wave 2: Codebase Refactor (Codex, 20min)
- Audit every file for dead code, unused imports, inconsistent naming
- Enforce consistent patterns: error handling, response shapes, file structure
- Move any misplaced files to correct locations
- Add JSDoc comments to all public exports
- Ensure all API routes have consistent error response shape: { error: string, code?: string }
- Must pass tsc, vitest, build

## Wave 3: Pixel Bulletproofing (Codex, 20min)
- Test pixel script serves correctly from /api/pixel/v1/script
- Ensure CORS works for any customer domain
- Handle edge cases: missing API key, expired key, invalid domain, malformed requests
- Pixel script must: zero cookies, zero PII, zero third-party requests
- Add error boundaries so pixel never breaks customer's site (try/catch everything, fail silently)
- Verify SRI hash matches served script
- Must pass tsc, vitest, build

## Wave 4: Surprise Feature (Codex, 20min)
- Build a "Competitor Benchmark" feature
- After audit completes, show: "See how you compare to [industry] average"
- Pull from aggregated audit data to show percentile ranking
- Visual comparison chart (your score vs industry average vs top 10%)
- This differentiates Rankwell from any manual audit tool

## Wave 5: Marketing GTM (Sub-agent, 30min)
- Research: Who are the first 100 customers? Specific niche, specific titles, specific companies
- 30-day playbook: Week 1-4 actions, channels, expected results
- Start with easiest niche (recruitment agencies? HR consultancies? Employer brand agencies?)
- Outreach templates: cold email, LinkedIn DM, Reddit/community posts
- Content calendar: 30 days of posts
- Pricing validation: what do competitors charge, what's the right entry point
- Write to: /employer-brand-os/GTM_30_DAY_PLAN.md

## Wave 6: Final Polish (Codex, 15min)
- Full build verification
- Screenshot every page
- Git commit with clean message
- List any remaining issues in REMAINING_ISSUES.md
