-- ============================================================
-- Snippet Installs: Track embedded snippet usage
-- ============================================================

CREATE TABLE IF NOT EXISTS snippet_installs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug text NOT NULL,
  referrer_domain text,
  first_seen timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  hit_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_slug, referrer_domain)
);

CREATE INDEX idx_snippet_company ON snippet_installs(company_slug);
CREATE INDEX idx_snippet_last_seen ON snippet_installs(last_seen);

ALTER TABLE snippet_installs ENABLE ROW LEVEL SECURITY;

-- Service role needs full access for tracking
CREATE POLICY "Service role full access" ON snippet_installs 
  FOR ALL TO service_role 
  USING (true);

-- Authenticated users can view install stats for their org
CREATE POLICY "Auth users read own" ON snippet_installs 
  FOR SELECT TO authenticated 
  USING (
    company_slug IN (
      SELECT slug FROM organizations 
      WHERE id IN (
        SELECT organization_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );
