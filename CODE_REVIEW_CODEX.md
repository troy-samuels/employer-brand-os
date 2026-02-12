# Codex Code Review — Last 3 Commits (Phase 4)

**Date:** 2026-02-12
**Reviewer:** Codex (gpt-5.2-codex)
**Scope:** 35 files, 6,512 insertions across commits b44d947, 8b14edf, 63fe639
**Grade: C+**

---

## Findings (ordered by severity)

### 1. [CRITICAL] Security — Service-role key on public endpoint
**Files:** `frontend/src/app/api/companies/search/route.ts:9, :89, :105`
Public autocomplete endpoint uses admin Supabase client (service-role) without auth/rate-limit safeguards.
**Impact:** Enables high-volume enumeration through privileged backend access.
**Fix:** Use anon+RLS for read access or require auth + endpoint rate limiting.

---

### 2. [MAJOR] Architecture — Trust delta compares AI vs AI
**Files:** `frontend/src/lib/citation-chain/trust-delta.ts:380, :389, :406`
`trust-delta` compares AI output against AI-derived "reality" rather than canonical first-party truth.
**Impact:** Trust delta / hallucination metrics are not defensible as factual comparison.

### 3. [MAJOR] Logic — Entity confusion counts infra failures
**Files:** `frontend/src/lib/citation-chain/engine.ts:93, :150` → `frontend/src/lib/citation-chain/entity-detection.ts:149, :193`
Entity confusion scoring includes failed/timeout model responses in identification denominator.
**Impact:** Infra failures can be reported as brand-entity confusion.

### 4. [MAJOR] Security — Rate-limit identity is spoofable
**Files:** `frontend/src/app/api/audit/citation-chain/route.ts:57, :63, :68`
Rate-limit identity parsing is weak (spoofable forwarded header + shared "anonymous" bucket).
**Impact:** Bypass risk and potential over-throttling of legitimate traffic.

### 5. [MAJOR] Performance/UX — Fixed 15s minimum load
**Files:** `frontend/src/app/audit/[slug]/page.tsx:14, :81, :102`
Audit page imposes fixed 15s minimum load on success/failure.
**Impact:** Avoidable latency and poor retry experience.

### 6. [MAJOR] TypeScript — API contract drift
**Files:** `frontend/src/app/api/audit/citation-chain/route.ts:28, :209`
Response type omits `meta`, but implementation always returns it.
**Impact:** Contract mismatch weakens compile-time safety and downstream expectations.

### 7. [MAJOR] Performance — Unbounded citation engine fan-out
**Files:** `frontend/src/lib/citation-chain/engine.ts:65, :84, :105`
Citation engine fan-out is unbounded.
**Impact:** Burst timeouts/throttling under provider load.

### 8. [MAJOR] Testing gap — No tests for company search route
**Files:** `frontend/src/app/api/companies/search/route.ts` (no test file)
Missing cases: wildcard escaping, sanitization, DB error handling, abuse/rate-limit assumptions.

### 9. [MAJOR] Testing gap — Citation-chain route tests incomplete
**Files:** `frontend/src/__tests__/app/api/audit/citation-chain/route.test.ts:156`
Missing: CSRF rejection, invalid JSON body, hard engine failure path.

---

### 10. [MINOR] Accessibility — Combobox pattern inconsistent
**Files:** `frontend/src/components/audit/company-search.tsx:323, :335, :339`
Combobox uses focusable `button` options inside `role="listbox"`; pattern can be inconsistent for AT.

### 11. [MINOR] Code smell — Duplicated metadata
**Files:** `route.ts:226`, `[slug]/page.tsx:194`, `audit-report.tsx:286`, `gap-analysis.ts:115`, `source-gap-matrix.tsx:45`
Repeated domain normalization and duplicated category maps across modules.

### 12. [NIT] Performance — Timeout not cleared on throw
**Files:** `frontend/src/lib/citation-chain/google-search.ts:64, :83`
Google search timeout set but only cleared on success path.

---

## Overall Assessment

**Strong momentum** and generally good modular split in the citation-chain pipeline. Grade pulled down by one critical security issue, several major correctness/security/perf concerns, and missing route-level tests for key new surfaces.

**Token usage:** 154,871
