# ATS Integration Research — OpenRole
> Researched 2026-02-23

## Executive Summary

ATS integration is **feasible but requires a strategic approach**. The good news: every major ATS has comprehensive APIs. The challenge: most require a formal partnership application, and OpenRole's integration model is unusual (we're not sourcing candidates, we're providing employer brand intelligence).

**Recommendation:** Start with Greenhouse (most open API, developer-friendly, strong UK presence) or Ashby (modern, actively seeking partners, growing fast in the UK tech market). Build a lightweight integration first, then pursue formal partnerships.

---

## Major ATS Platforms — API Assessment

### Tier 1: Best Integration Candidates

#### 🟢 Greenhouse
- **API:** Harvest API (REST, JSON, Basic Auth) — very comprehensive
- **Access:** Customer-generated API keys (no partnership required for basic access)
- **Rate Limits:** 50 requests/10 seconds
- **Key Endpoints:**
  - `GET /v1/jobs` — List all jobs with descriptions, departments, offices
  - `GET /v1/candidates` — Candidate data (need this for reporting)
  - `GET /v1/custom_fields` — Company-specific metadata
  - **Job Board API** (public, no auth needed!) — Lists published jobs with full descriptions, salary ranges, departments, offices
- **Partner Program:** Yes — formal application process through Dev Center
- **UK Market:** Very strong — used by Monzo, Deliveroo, Revolut, and many UK scale-ups
- **OpenRole Fit:** ⭐⭐⭐⭐⭐
  - The **Job Board API is public and requires NO authentication** for reading job postings
  - We could scrape job descriptions from any Greenhouse customer to enhance our audits
  - For deeper integration, we'd need to become a formal partner
  - Integration type: "Employer Branding" or "Reporting & Analytics"

#### 🟢 Ashby
- **API:** REST API with comprehensive documentation
- **Access:** Open API with partner program
- **Partner Program:** Active and welcoming — "We move quickly, helping partners go to market in weeks, not months"
- **Process:** Intro call → Agreement → Build → Validation → Marketplace listing
- **Integration Depth:** Unifies ATS, CRM, scheduling, and analytics — integration can span multiple workflows
- **UK Market:** Growing fast — popular with UK tech companies (seed to series C)
- **OpenRole Fit:** ⭐⭐⭐⭐⭐
  - They explicitly invite partner applications
  - Modern API, developer-friendly documentation
  - "Build deeper connections" is their pitch — fits perfectly with employer brand intelligence

#### 🟢 Lever
- **API:** Full REST API with OAuth 2.0 or Basic Auth
- **Access:** OAuth for third-party apps, Basic Auth for customer integrations
- **OAuth Scopes:** Granular (e.g., `opportunities:read:admin`, `postings:read:admin`)
- **Key Endpoints:** Postings, opportunities, users, custom fields
- **Partner Program:** Via partnership application
- **UK Market:** Strong in UK mid-market (Series B+ companies)
- **OpenRole Fit:** ⭐⭐⭐⭐
  - OAuth support means we can build a proper "Connect your Lever" integration
  - Need to register as an application with Lever first

### Tier 2: Worth Exploring

#### 🟡 Workable
- **API:** REST API available
- **Partner Program:** Formal partnership application at workable.com/partnership-program/apply
- **Categories:** Sourcing, Assessments, Video interviews, Background checks, HRIS
- **UK Market:** Very popular with UK SMBs (1,000+ companies)
- **OpenRole Fit:** ⭐⭐⭐⭐
  - They have a structured partner program
  - OpenRole would fit "Sourcing" or possibly a new "Employer Branding" category
  - 290+ existing integrations — mature ecosystem

#### 🟡 Teamtailor
- **API:** Exists at docs.teamtailor.com (sparse public docs)
- **Integrations:** 200+ integration partners listed
- **UK Market:** Growing, especially in EU/UK mid-market
- **OpenRole Fit:** ⭐⭐⭐
  - Less documentation available
  - Would need to apply through their partnership program

#### 🟡 SmartRecruiters
- **API:** Available (dev.smartrecruiters.com)
- **UK Market:** Enterprise-focused, strong in UK corporates
- **OpenRole Fit:** ⭐⭐⭐
  - Enterprise = higher deal sizes
  - API access may be more restricted

### Tier 3: Future Consideration

- **BambooHR** — HR suite with ATS, big in UK SMB market
- **Personio** — EU/UK focused, popular with German and UK companies
- **Pinpoint** — UK-based ATS, growing fast
- **iCIMS** — Enterprise, mainly US but UK presence
- **Oracle Taleo / SAP SuccessFactors** — Enterprise only, complex integration

---

## Integration Model Options

### Option A: "Read-Only Job Board Scraper" (No Partnership Needed)
**Effort: 2-3 days | Zero dependency on ATS partnerships**

Many ATS platforms have **public, unauthenticated Job Board APIs**:
- **Greenhouse:** `boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true`
- **Lever:** `api.lever.co/v0/postings/{company}` (public postings API)

We could:
1. Detect which ATS a company uses (from careers page HTML patterns)
2. Pull their published job descriptions via public APIs
3. Analyse job content for AI readiness signals (salary data, structured benefits, etc.)
4. Add ATS detection and job content scoring to our audit methodology

**Pros:** No partnership needed, can start immediately, enhances audit quality
**Cons:** Read-only, limited to public job data, no dashboard integration

### Option B: "Lightweight Chrome Extension" (No Partnership Needed)
**Effort: 5-7 days**

Build a browser extension that:
1. Detects when a recruiter is viewing their ATS dashboard
2. Shows a sidebar widget with the company's OpenRole score
3. Highlights information gaps relevant to the job posting being edited
4. Suggests content additions (e.g., "Add salary range — AI models can't find this")

**Pros:** No API access needed, works with ANY ATS, immediate value
**Cons:** Not an "official" integration, requires manual installation

### Option C: "Formal Partner Integration" (Requires Partnership)
**Effort: 15-20 days + 2-4 weeks partnership process**

Full OAuth integration where customers:
1. Connect their ATS account to OpenRole dashboard
2. OpenRole pulls job descriptions and careers content
3. Dashboard shows per-job AI readiness scores
4. Inline suggestions for improving job descriptions
5. Score appears in ATS as a custom field or widget

**Pros:** Deepest integration, most value, listed in ATS marketplace
**Cons:** Requires formal partnership approval, longer timeline

### Option D: "Zapier/Make Integration" (Low Effort)
**Effort: 1-2 days**

Use Zapier/Make as middleware:
- Trigger: New job posted in ATS
- Action: Run OpenRole audit on the job description
- Result: Score posted back as a comment/note

**Pros:** Works with 50+ ATS platforms via Zapier, quick to build
**Cons:** Indirect, requires customer Zapier account, less polished

---

## Recommended Strategy

### Phase 1: Immediate (This Sprint)
**Option A — Public Job Board API scraping**
- Add ATS detection to audit pipeline (detect Greenhouse, Lever, Ashby from careers page HTML)
- Pull published jobs via public APIs for companies being audited
- Add job description analysis to scoring (salary transparency, benefits format, etc.)
- Enhances audit value immediately with zero dependencies

### Phase 2: Near-Term (Next 2-4 Weeks)
**Option B — Chrome Extension**
- Build a lightweight extension showing OpenRole score inside any ATS
- Target Greenhouse users first (largest UK tech market share)
- Use this as a lead generation tool (extension users → paid customers)

### Phase 3: Medium-Term (1-2 Months)
**Option C — Formal Ashby Partnership**
- Apply to Ashby's partner program (most welcoming, modern API)
- Build OAuth integration
- Get listed in Ashby Marketplace
- Use as template for Greenhouse and Lever partnerships

### Phase 4: Scale (3+ Months)
- Replicate integration across Greenhouse, Lever, Workable
- Build Zapier integration for long-tail ATS coverage

---

## Technical Notes

### ATS Detection (for Phase 1)
Common patterns to detect ATS from a company's careers page:
```
Greenhouse: boards.greenhouse.io, lever=greenhouse in HTML
Lever: jobs.lever.co, lever.co in careers page
Ashby: jobs.ashbyhq.com, ashby in HTML
Workable: apply.workable.com, workable in HTML
Teamtailor: career.teamtailor.com
SmartRecruiters: jobs.smartrecruiters.com
BambooHR: bamboohr.com/jobs
```

### Public APIs (No Auth Needed)
```
Greenhouse Job Board:
GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true

Lever Postings:
GET https://api.lever.co/v0/postings/{company}

Ashby Job Board:
GET https://jobs.ashbyhq.com/api/non-user-graphql (GraphQL)
```

### Key Data Points We Can Extract
- Number of published jobs
- Salary ranges in job descriptions
- Benefits mentioned
- Remote/hybrid/office policy
- Department structure
- Office locations
- Application questions (GDPR compliance)
