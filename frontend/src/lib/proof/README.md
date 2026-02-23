# Proof Measurement System

"0 to 1" proof infrastructure for OpenRole. Tracks how AI systems describe companies over time to prove our value proposition: **publish the right content → AI starts citing you instead of guessing.**

## Overview

The proof system captures AI response snapshots, tracks score changes, detects milestones, and auto-generates case studies from real data.

## Architecture

```
┌─────────────────┐
│  Audit System   │  ← Existing OpenRole audits
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Snapshots     │  ← Weekly captures via cron
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Tracker       │  ← Compare baseline to current
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Case Study     │  ← Auto-generate compelling narrative
└─────────────────┘
```

## Modules

### `snapshot.ts`
Captures what AI says about a company at a specific point in time.

**Key Functions:**
- `captureSnapshot(companySlug, isBaseline)` — Create new snapshot from latest audit
- `getLatestSnapshot(companySlug)` — Get most recent snapshot
- `getBaselineSnapshot(companySlug)` — Get the baseline for comparison
- `getAllSnapshots(companySlug)` — Get all snapshots ordered by date
- `getTrackedCompanies()` — Get all companies with snapshots (for cron)

**Standard Queries:**
1. What is it like to work at [Company]?
2. What is the salary at [Company]?
3. What benefits does [Company] offer?
4. What is the interview process at [Company]?
5. Does [Company] offer remote work?
6. What tech stack does [Company] use?
7. What is career growth like at [Company]?
8. What do employees say about [Company] culture?

### `tracker.ts`
Compares snapshots over time and detects milestones.

**Key Functions:**
- `compareSnapshots(baseline, current)` — Calculate dimension-level changes
- `generateProofReport(companySlug)` — Complete report with all milestones
- `detectMilestones(changes)` — Identify significant improvements
- `batchGenerateReports(slugs)` — Process multiple companies (for cron)

**Milestone Types:**
- **Zero to One**: dimension goes from 0 to any positive score
- **Score Jump**: improvement ≥20% in any dimension
- **New Citation**: employer's domain starts appearing in AI responses
- **Gap Filled**: information gap that existed is now answered

### `case-study.ts`
Auto-generates compelling case studies from proof reports.

**Key Functions:**
- `generateCaseStudy(report)` — Create narrative from data
- `caseStudyToText(caseStudy)` — Plain text for sharing
- `caseStudyToHTML(caseStudy)` — HTML for email/PDF

**Output Format:**
- Title: "[Company] improved AI visibility by X% in Y days"
- Summary: 2-3 sentence hook
- Challenge: What the problem was
- Action: What they published
- Result: Score changes with numbers
- Timeline: Time elapsed
- Key Metrics: Before/after table
- Quote: Placeholder for customer testimonial

## API Routes

### `POST /api/proof/snapshot`
Capture a new snapshot for a company.

**Request:**
```json
{
  "companySlug": "acme-corp",
  "isBaseline": false
}
```

**Rate Limit:** 5 per hour per company

### `GET /api/proof/report?company=slug`
Get proof report showing all changes.

**Cache:** 1 hour

### `GET /api/proof/case-study?company=slug&format=json|text|html`
Generate case study from proof report.

**Growth+ Feature**

## Cron Job

`/api/cron/snapshots` runs **every Monday at 9am** (UTC).

1. Gets all companies with existing snapshots
2. Captures new snapshot for each
3. Detects milestones
4. Stores results

**Vercel cron config:**
```json
{
  "path": "/api/cron/snapshots",
  "schedule": "0 9 * * 1"
}
```

## Database Schema

### `ai_snapshots`
Stores AI response snapshots at specific points in time.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `company_slug` | text | Company identifier |
| `captured_at` | timestamptz | When snapshot was taken |
| `overall_score` | numeric(5,2) | Overall AI visibility score |
| `dimension_scores` | jsonb | Per-dimension scores |
| `queries` | jsonb | Array of QuerySnapshot objects |
| `is_baseline` | boolean | Whether this is the baseline |
| `created_at` | timestamptz | Row creation time |

### `proof_milestones`
Records significant improvements detected between snapshots.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `company_slug` | text | Company identifier |
| `milestone_type` | text | Type of milestone |
| `dimension` | text | Dimension that improved |
| `description` | text | Human-readable description |
| `before_score` | numeric(5,2) | Score before |
| `after_score` | numeric(5,2) | Score after |
| `snapshot_id` | uuid | Foreign key to ai_snapshots |
| `detected_at` | timestamptz | When detected |

## Dashboard

`/dashboard/proof` shows:
- Overall score change over time
- Dimension-by-dimension tracking with visual indicators
- Milestones timeline with badges
- Next snapshot countdown
- "Generate Case Study" button (Growth+ only)
- Simple bar charts using divs (no chart library)

## Current Limitations

⚠️ **Phase 1 Build — Infrastructure Only**

This build creates the **storage and comparison infrastructure** without actually calling AI APIs (we don't have keys yet).

**What works:**
- ✅ Snapshot storage
- ✅ Score comparison
- ✅ Milestone detection
- ✅ Case study generation
- ✅ Cron scheduling
- ✅ Dashboard visualization

**What's mocked:**
- ⏳ Actual AI query responses (currently derived from audit data)
- ⏳ Real citation detection
- ⏳ Gap-filling detection

**Phase 2 (when API keys are available):**
- Call OpenAI, Anthropic, Perplexity with standard queries
- Parse real AI responses for citations
- Detect information gaps vs actual answers
- Track when employer domains start appearing

## Example Usage

### Create a baseline snapshot
```typescript
import { captureSnapshot } from '@/lib/proof/snapshot';

const snapshot = await captureSnapshot('acme-corp', true);
```

### Generate a proof report
```typescript
import { generateProofReport } from '@/lib/proof/tracker';

const report = await generateProofReport('acme-corp');
console.log(`Overall change: ${report.overallChange} points`);
console.log(`Milestones: ${report.milestones.length}`);
```

### Create a case study
```typescript
import { generateCaseStudy, caseStudyToText } from '@/lib/proof/case-study';

const caseStudy = generateCaseStudy(report);
const text = caseStudyToText(caseStudy);
console.log(text);
```

## Testing

**Manual test flow:**

1. **Capture baseline:**
   ```bash
   curl -X POST https://openrole.co.uk/api/proof/snapshot \
     -H "Content-Type: application/json" \
     -d '{"companySlug": "acme-corp", "isBaseline": true}'
   ```

2. **Wait a week** (or manually create another snapshot)

3. **Get proof report:**
   ```bash
   curl https://openrole.co.uk/api/proof/report?company=acme-corp
   ```

4. **Generate case study:**
   ```bash
   curl https://openrole.co.uk/api/proof/case-study?company=acme-corp&format=text
   ```

## Future Enhancements

- [ ] Real AI API integration (OpenAI, Anthropic, Perplexity)
- [ ] Citation extraction from AI responses
- [ ] Email delivery of proof reports
- [ ] Exportable PDFs
- [ ] Social share cards
- [ ] Comparison mode (your company vs competitor)
- [ ] Historical trend charts with annotations
- [ ] Automated milestone notifications

---

**Built:** February 2026  
**Status:** Phase 1 (Infrastructure) — Ready for Phase 2 (Real AI Queries)
