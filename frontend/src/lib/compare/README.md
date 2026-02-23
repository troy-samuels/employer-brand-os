# Competitor Displacement Reports

Actionable intelligence showing employers exactly what content to publish to beat competitors in AI responses.

## What This Is

Traditional competitor analysis tells you **where** you're losing. Displacement reports tell you **what to do about it**.

For each dimension where a competitor outperforms:
1. Show the score gap and what AI currently says
2. Generate specific content brief (title, format, placement)
3. Provide ready-to-publish template
4. Estimate impact timeline

## Files

### `displacement.ts`
Core displacement analysis library:
- `generateDisplacementReport(companySlug, competitorSlug)` - Main function
- Fetches audit data from Supabase
- Compares scores across all dimensions
- Ranks opportunities by ROI (gap size / effort)
- Returns structured displacement report

### `content-briefs.ts`
Content recommendation engine:
- Maps each audit dimension to specific content actions
- Generates templates ready to publish
- Includes case study evidence and timelines
- Covers: salary transparency, careers page, JSON-LD, robots.txt, llms.txt, content format, brand reputation

## API

**Endpoint:** `POST /api/compare/displacement`

**Request:**
```json
{
  "companySlug": "revolut",
  "competitorSlug": "monzo"
}
```

**Response:**
```typescript
{
  company: { name, slug, score },
  competitor: { name, slug, score },
  overallGap: number,
  opportunities: DisplacementOpportunity[],
  quickWins: DisplacementOpportunity[],  // Top 3
  generatedAt: string
}
```

**Rate limit:** 20 requests/hour per IP  
**Cache:** 24 hours in Supabase

## UI Integration

**Component:** `<DisplacementPlaybook />`  
**Location:** `/compare/[slugs]/page.tsx`

Displays as expandable cards below the comparison verdict:
- Quick wins highlighted with ⚡ badge
- Priority levels (critical/high/medium/low)
- Score gap visualization
- Expandable content briefs with templates
- Free tier: shows first 2 opportunities, blur rest with upgrade prompt

## Database

**Table:** `public.displacement_reports`

```sql
CREATE TABLE displacement_reports (
  id uuid PRIMARY KEY,
  company_slug text NOT NULL,
  competitor_slug text NOT NULL,
  report jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  UNIQUE(company_slug, competitor_slug)
);
```

**TTL:** 24 hours (reports expire and regenerate)

**Run migration:**
```bash
# Option 1: Supabase SQL editor
# Paste contents of src/lib/supabase/migrations/002_displacement_reports.sql

# Option 2: CLI (if you have write access)
supabase db push
```

## Quality Standards

✅ **Real utility:** Templates are ready to adapt, not generic fluff  
✅ **Evidence-based:** Each brief includes case study timing  
✅ **Actionable:** Clear format, placement, and word count guidance  
✅ **ROI-ranked:** Quick wins (high impact, low effort) surfaced first  

## Monetization

- **Free tier:** First 2 opportunities visible, rest blurred
- **Growth plan:** Full displacement report with all opportunities + templates
- **CTA:** "Unlock X more opportunities" → /pricing

## Performance

- **Cache hit:** ~5ms (read from Supabase)
- **Cache miss:** ~400-600ms (generate + write to Supabase)
- **Expiry:** Auto-expires after 24h to keep data fresh

## Example Output

**Dimension:** Salary Transparency  
**Gap:** -12 points  
**Priority:** Critical  
**Content Brief:** "Publish Salary Ranges on Your Careers Page"  
**Format:** Careers page section (300-500 words)  
**Timeline:** "Could shift AI response within 3-7 days"  
**Template:**  
```
## Our Approach to Compensation

At [Company], we believe in transparent, fair pay.

### Salary Bands by Role
- Software Engineer (Junior): £40k - £55k
- Software Engineer (Mid): £55k - £75k
...
```

## Future Enhancements

- [ ] Track actual impact (measure AI response changes post-publish)
- [ ] A/B test different content formats
- [ ] Generate PRDs for engineering tasks (e.g., "add JSON-LD")
- [ ] Email digest: "New displacement opportunities detected"
- [ ] Historical tracking: "Your gap narrowed by 8 points this month"
