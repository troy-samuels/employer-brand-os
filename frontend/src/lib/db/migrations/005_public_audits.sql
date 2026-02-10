-- ============================================================
-- 005: Public audit results table
-- Powers the /company/[slug] SEO flywheel pages.
-- Every free audit creates/updates a row here.
-- ============================================================

CREATE TABLE IF NOT EXISTS public_audits (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_domain  TEXT NOT NULL,
  company_name    TEXT NOT NULL,
  company_slug    TEXT NOT NULL UNIQUE,
  score           INTEGER NOT NULL DEFAULT 0,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  has_llms_txt    BOOLEAN NOT NULL DEFAULT false,
  has_jsonld      BOOLEAN NOT NULL DEFAULT false,
  has_salary_data BOOLEAN NOT NULL DEFAULT false,
  careers_page_status TEXT NOT NULL DEFAULT 'none',
  robots_txt_status   TEXT NOT NULL DEFAULT 'not_found',
  ats_detected    TEXT,
  audit_count     INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for slug lookups (page rendering)
CREATE UNIQUE INDEX IF NOT EXISTS idx_public_audits_slug ON public_audits (company_slug);

-- Index for domain lookups (upsert on audit)
CREATE INDEX IF NOT EXISTS idx_public_audits_domain ON public_audits (company_domain);

-- Index for sitemap generation (ordered by score desc)
CREATE INDEX IF NOT EXISTS idx_public_audits_score ON public_audits (score DESC);

-- RLS: public read access (these pages are intentionally public)
ALTER TABLE public_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public audits are readable by everyone"
  ON public_audits FOR SELECT
  USING (true);

-- Only service role can insert/update (from audit API)
CREATE POLICY "Service role can manage public audits"
  ON public_audits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
