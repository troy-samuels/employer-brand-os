# ATS Detection & Job Board Scraping Engine

Auto-detect which ATS a company uses, scrape public job postings, and generate structured Facts content.

## Components

### 1. ATS Detection (`detect.ts`)
Detects ATS provider from careers page URL/HTML patterns.

```typescript
import { detectATS, isReliableDetection } from "@/lib/ats/detect";

const result = await detectATS("https://monzo.com/careers");
// => { provider: "greenhouse", boardToken: "monzo", confidence: 1.0 }

if (isReliableDetection(result)) {
  // Confidence >= 0.6, safe to use
}
```

**Supported ATS:**
- Greenhouse (`boards.greenhouse.io`)
- Lever (`jobs.lever.co`)
- Ashby (`jobs.ashbyhq.com`)
- Workable (`apply.workable.com`)
- Teamtailor (`career.teamtailor.com`)
- SmartRecruiters (`jobs.smartrecruiters.com`)
- BambooHR (`*.bamboohr.com/jobs`)

### 2. Job Board API Clients (`providers/`)
Fetch public job postings from detected ATS.

```typescript
import { fetchJobsFromProvider } from "@/lib/ats/providers";

const jobs = await fetchJobsFromProvider("greenhouse", "monzo");
// => [{ id, title, location, department, description, url, source, rawData }]
```

**Implemented:**
- ✅ Greenhouse (`providers/greenhouse.ts`)
- ✅ Lever (`providers/lever.ts`)
- ✅ Ashby (`providers/ashby.ts`)
- ❌ Workable, Teamtailor, SmartRecruiters, BambooHR (not yet)

### 3. Job Analysis Engine (`analyse.ts`)
Extract AI readiness signals from job descriptions.

```typescript
import { analyseJobs } from "@/lib/ats/analyse";

const analysis = analyseJobs(jobs);
```

**Analysis Output:**
```typescript
{
  totalJobs: 47,
  salaryTransparency: {
    count: 12,
    percentage: 25,
    examples: ["£40,000 - £60,000", "$80K-$120K"]
  },
  benefitsMentioned: {
    count: 35,
    percentage: 74,
    topBenefits: ["healthcare", "pension", "equity", "flexible", "remote"]
  },
  remotePolicy: {
    mentioned: true,
    policy: "hybrid"
  },
  techStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
  departments: ["Engineering", "Product", "Design", "Operations"],
  locations: ["London", "Remote", "New York"],
  interviewProcess: {
    mentioned: true,
    stages: ["phone screen", "technical test", "onsite", "culture fit"]
  },
  diversityInfo: { mentioned: true },
  aiReadinessScore: 72 // 0-100
}
```

### 4. Facts Generator (`generate-facts.ts`)
Convert analysis into structured Facts content.

```typescript
import { generateFacts, hasSubstantialFacts } from "@/lib/ats/generate-facts";

const facts = generateFacts(jobs, analysis, "Greenhouse");

if (hasSubstantialFacts(facts)) {
  // Display on employer page
}
```

**Facts Output:**
```typescript
{
  salaryRanges: [
    { role: "Senior Engineer", range: "£70,000 - £90,000", source: "..." }
  ],
  benefits: [
    { category: "Healthcare", details: "Comprehensive health, dental, vision" },
    { category: "Equity", details: "Employee stock options or equity ownership" }
  ],
  techStack: ["React", "TypeScript", "PostgreSQL", ...],
  workPolicy: "Hybrid working model — mix of remote and office-based work",
  interviewProcess: ["Phone screen", "Technical test", "Onsite", ...],
  departments: [
    { name: "Engineering", openRoles: 23 },
    { name: "Product", openRoles: 8 }
  ],
  lastUpdated: "2026-02-23T17:00:00Z",
  source: "Extracted from Greenhouse job postings"
}
```

## API Endpoint

### `POST /api/ats`

**Request:**
```json
{
  "careersUrl": "https://monzo.com/careers"
}
```

**Response:**
```json
{
  "provider": "greenhouse",
  "boardToken": "monzo",
  "confidence": 1.0,
  "jobCount": 47,
  "analysis": { ... },
  "facts": { ... },
  "cached": false,
  "timestamp": "2026-02-23T17:00:00Z"
}
```

**Rate Limits:**
- 10 requests/hour per IP
- Results cached for 1 hour
- CSRF protection required

## Integration with Audit Flow

ATS detection runs automatically during website audits:

1. After careers page is found
2. Detects ATS provider (8s timeout)
3. Fetches jobs if reliable detection
4. Analyses jobs and generates facts
5. Stores in `WebsiteCheckResult`

**New audit result fields:**
- `atsProvider` - Detected provider name
- `atsBoardToken` - Board identifier
- `atsJobCount` - Number of jobs found
- `atsAnalysis` - Full analysis object
- `atsGeneratedFacts` - Structured facts

**Graceful fallbacks:**
- If detection fails → basic hostname detection only
- If API call times out → skip gracefully
- Never crashes the audit pipeline

## Database Schema

### New Columns (via migration `20260223170000`)

**`companies` table:**
```sql
ats_provider text
ats_board_token text
ats_job_count integer
ats_analysis jsonb
ats_facts jsonb
ats_last_synced timestamptz
```

**`audit_website_checks` table:**
```sql
ats_provider text
ats_board_token text
ats_job_count integer
ats_analysis jsonb
ats_facts jsonb
```

**`public_audits` table:**
```sql
ats_provider text
ats_board_token text
ats_job_count integer
ats_analysis jsonb
ats_facts jsonb
```

## Testing

Try with real companies:
- Monzo (Greenhouse): `https://monzo.com/careers`
- Revolut (Ashby): `https://www.revolut.com/careers/`
- Deliveroo (Lever): `https://careers.deliveroo.co.uk/`

## Future Extensions

1. **Implement remaining providers:**
   - Workable
   - Teamtailor
   - SmartRecruiters
   - BambooHR

2. **Scheduled syncing:**
   - Cron job to refresh ATS data for active companies
   - Weekly job count updates
   - Notify on significant changes

3. **Enhanced analysis:**
   - Detect equity ranges
   - Parse interview timeline (e.g., "2-3 weeks")
   - Extract tech seniority levels
   - Identify remote-first vs hybrid vs office

4. **UI integration:**
   - Display facts on company pages
   - Show job count badge
   - Highlight salary transparency %
   - Compare with industry averages

## Notes

- **Zero npm dependencies** - Uses native `fetch()` only
- **Rate limited** - 1 request/second to ATS APIs
- **Privacy-first** - No PII stored from job postings
- **Graceful errors** - Never breaks audit pipeline
- **TypeScript strict** - Full type safety, no `any`
