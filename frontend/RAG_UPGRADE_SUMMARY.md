# RAG-Optimised AEO Upgrade Summary

**Commit:** `494c97e` - `feat: RAG-optimised AEO output + visible snippet injection`

## Changes Made

### 1. AEO Generator (`src/lib/aeo/generate.ts`)

**Before:** Semi-narrative content with subsections and markdown formatting  
**After:** Dense Q&A format optimised for RAG chunking

#### Key Improvements:
- Every line is now a retrievable fact
- Removed marketing prose and narrative fluff
- Consistent `key: value` format throughout
- All statements end with periods for clean chunking
- Header simplified: `> Source: Verified by employer via OpenRole | Updated: [Month Year]`

#### Example Output:
```
# Monzo — Employer Facts
> Source: Verified by employer via OpenRole | Updated: February 2026

## Salary Bands
Software Engineer: £45,000 - £65,000 + equity.
Senior Engineer: £70,000 - £95,000 + equity.

## Remote Work Policy
Policy: Hybrid.
Office days: 3 per week (Tuesday, Wednesday, Thursday).
Remote days: 2 per week.
```

#### Updated Functions:
- `generateLlmsTxt()` - Dense format, no bullets, pure facts
- `generateMarkdownPage()` - Now reuses llms.txt content for consistency
- `generateFactPageHtml()` - Generates styled HTML with inline CSS for visible injection

### 2. Snippet Route (`src/app/api/snippet/[slug]/route.ts`)

**Before:** Only injected invisible JSON-LD into `<head>`  
**After:** Injects BOTH invisible JSON-LD and visible HTML content

#### New Behaviour:
1. **JSON-LD** (invisible) → Still injected into `<head>` for Google Rich Results
2. **Visible HTML** (NEW) → Injected into `<body>` for RAG crawlers

#### New Functions:
- `generateVisibleHtml()` - Creates semantic HTML section with employer facts
- `escapeHtml()` - Sanitises user content for safe HTML injection

#### Visible HTML Features:
- `<section id="openrole-facts">` container for easy targeting
- Semantic headings (`<h2>`, `<h3>`) for structure
- Inline styles only (no external CSS dependencies)
- Clean typography: system fonts, 14px, 1.6 line-height
- Light gray background (#f8f9fa) for visual separation
- Small footer with "Data verified via OpenRole" link
- Fully parseable by AI/RAG crawlers

#### Updated Functions:
- `generateSnippet()` - Now accepts `visibleHtml` parameter and injects both formats
- GET handler - Fetches facts, generates both JSON-LD and visible HTML

#### Size Target:
- Still under 5KB for the entire snippet (monitored with warning)
- Efficient minification in IIFE wrapper

## Testing Recommendations

### 1. Verify Output Formats
```bash
# Check llms.txt output
curl https://openrole.co.uk/llms/[slug].txt

# Check snippet injection
curl https://openrole.co.uk/api/snippet/[slug]
```

### 2. Test Visible Injection
Add snippet to a test page:
```html
<script src="https://openrole.co.uk/api/snippet/monzo" async></script>
```

Expected result:
- JSON-LD in `<head>`
- Visible `<section id="openrole-facts">` at bottom of `<body>`

### 3. RAG Crawler Test
Use a headless browser or RAG tool to verify:
- Content is visible in DOM
- Semantic structure is preserved
- Facts are easily chunked and retrieved

## Pre-Existing Issue Found

**File:** `src/app/api/facts-page/[slug]/route.ts`  
**Line:** 293  
**Error:** Type mismatch - `Json` type not compatible with `FactWithDefinition[]`

This is **unrelated to the RAG upgrade** and was present before changes. Should be fixed separately by:
1. Adding proper type guards for Json → specific types
2. Updating FactWithDefinition type to accept Json | null
3. Filtering out null values before passing to groupFactsByCategory

## Next Steps

1. ✅ Commit changes (done)
2. ⏳ Fix pre-existing TypeScript error in facts-page route
3. ⏳ Test snippet on staging environment
4. ⏳ Verify RAG crawler can parse visible content
5. ⏳ Monitor snippet size (currently within 5KB target)
6. ⏳ Consider adding structured data markup to visible HTML (microdata/JSON-LD)

## Impact

- **RAG Compatibility:** Significantly improved - visible facts are now crawlable
- **SEO:** Enhanced - both invisible (JSON-LD) and visible (semantic HTML) formats
- **Retrieval Quality:** Better chunking due to dense Q&A format
- **User Experience:** Minimal - content is at bottom of page, visually unobtrusive
- **Performance:** Maintained - still under 5KB target
