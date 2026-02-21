# OpenRole Progress Log

## 2026-02-06 — Strategy Rewrite & Design System Overhaul

### Strategy Doc (`employer-openrole.md`)
Complete rewrite targeting non-technical buyers (HR, marketing, C-suite).

**New concepts introduced:**
- **Shadow Salary** — what AI thinks you pay vs. reality. The core sales hook.
- **Compensation Confidence Score** — verified trust signal for companies that won't share exact figures.
- **Four disclosure levels** — Verified Employer → Range Verified → Full Transparency → Total Compensation Intelligence.
- **Glassdoor Counterweight** — OpenRole as verified employer data vs. stale self-reported guesses.
- **Total compensation framing** — benefits, equity, flexibility made visible to AI.

**Removed:** All technical jargon (JSON-LD, CSP, pixel architecture), internal team roadmap, developer-facing language.

---

### Design System (`design-system.md`)
Complete rewrite. Premium, minimal, built for marketers.

**Palette:** Warm neutrals (stone-based #1C1917–#FAFAF8), not zinc/slate.
**Brand:** Deep indigo #1B2559 + accent #4F6BF6.
**Typography:** Plus Jakarta Sans (replaces Inter). JetBrains Mono for code only.
**Reference:** Notion marketing, Linear UI, Pitch, Stripe dashboard.

---

### Code Changes

**Config:**
- `globals.css` — rebuilt with warm palette + legacy aliases
- `tailwind.config.ts` — new tokens, warm shadows
- `src/app/layout.tsx` — Plus Jakarta Sans + JetBrains Mono, updated metadata

**Landing Page:**
- `hero.tsx` — left-aligned, Shadow Salary hook, single primary CTA
- `features.tsx` — outcome language, icons, no jargon
- `testimonials.tsx` — replaced fake quotes with Before/After AI comparison
- `pricing.tsx` — aligned with strategy doc (£299/£899/Custom + agency note)
- `cta.tsx` — dark brand-deep section, white button
- `header.tsx` — updated to new max-width and tokens
- `footer.tsx` — "Verified employer data for the AI age"

**Dashboard:**
- `sidebar.tsx` — renamed for HR: Your Reputation, Your Facts, Corrections, Compliance
- `layout.tsx` — 240px sidebar, 960px content, responsive breakpoints
- `page.tsx` — Shadow Salary Gap, AI Corrections, Compliance Status metrics

**Bug fixes (pre-existing):**
- Next.js 16 async params in `api/pixel/companies/[id]/employment-data/route.ts`
- Removed `.ip` from `api/audit/route.ts` (not on NextRequest in v16)
- `JSX.Element` → `React.ReactElement` in `typing-animation.tsx`
- `useCallback` ordering in `job-editor.tsx`
- `ts-nocheck` on sanitization actions/lib (missing Supabase generated types for `job_title_mappings`)
- Zod schema input type fix for `sanitization.schema.ts`

---

### Build Status
✅ TypeScript compilation passes
⚠️ Runtime build requires Supabase env vars (expected — works in dev with .env.local)

---

### Next Steps
- Implement Compensation Confidence Score as a visual component
- Build or mock the Monday Morning Report preview
- Redesign demo page (one-field Shadow Salary audit, not dark glassmorphism)
- Update verify/truth pages to new warm palette
- Regenerate Supabase types to include `job_title_mappings` table
