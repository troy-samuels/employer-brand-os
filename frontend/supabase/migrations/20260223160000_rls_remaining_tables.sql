-- Enable RLS on remaining unprotected tables
-- All are service-role-only (no anon/authenticated policies)
-- unless noted otherwise. This locks out direct PostgREST access via
-- anon/authenticated keys while service_role bypasses RLS.

ALTER TABLE ai_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_metrics_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hallucination_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosted_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE jsonld_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_location_access ENABLE ROW LEVEL SECURITY;

-- Public read policies for data that appears on public pages
-- (brand_metrics_history powers trendlines on company pages)
CREATE POLICY "anon_select_brand_metrics_history"
  ON brand_metrics_history FOR SELECT
  TO anon, authenticated
  USING (true);

-- compliance_checks appear on public company pages
CREATE POLICY "anon_select_compliance_checks"
  ON compliance_checks FOR SELECT
  TO anon, authenticated
  USING (true);

-- hallucination_flags appear on public company pages
CREATE POLICY "anon_select_hallucination_flags"
  ON hallucination_flags FOR SELECT
  TO anon, authenticated
  USING (true);

-- ai_mentions appear on public company pages
CREATE POLICY "anon_select_ai_mentions"
  ON ai_mentions FOR SELECT
  TO anon, authenticated
  USING (true);

-- hosted_pages are public company data
CREATE POLICY "anon_select_hosted_pages"
  ON hosted_pages FOR SELECT
  TO anon, authenticated
  USING (true);

-- fact_versions are public audit data
CREATE POLICY "anon_select_fact_versions"
  ON fact_versions FOR SELECT
  TO anon, authenticated
  USING (true);

-- jsonld_exports are public tool output
CREATE POLICY "anon_select_jsonld_exports"
  ON jsonld_exports FOR SELECT
  TO anon, authenticated
  USING (true);

-- campaigns: service-role only (uses tenant_id, not org-scoped yet)
-- RLS enabled, no policies = locked to service_role

-- user_location_access
CREATE POLICY "user_select_own_location_access"
  ON user_location_access FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- contacts, contact_segments, leads, tenants: service-role only
-- RLS enabled, no policies = locked to service_role
