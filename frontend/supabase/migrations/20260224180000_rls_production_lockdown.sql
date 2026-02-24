-- RLS Production Lockdown Migration
-- Applied: 2026-02-24
-- Purpose: Comprehensive row-level security for all tables with correct column references

-- =============================================================================
-- CATEGORY A: Public Read Tables (anon + authenticated SELECT)
-- =============================================================================

-- companies: Public company directory
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_public_read" ON companies;
CREATE POLICY "companies_public_read" ON companies
  FOR SELECT TO anon, authenticated
  USING (true);

-- public_audits: Public scorecard pages
ALTER TABLE IF EXISTS public_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_audits_public_read" ON public_audits;
CREATE POLICY "public_audits_public_read" ON public_audits
  FOR SELECT TO anon, authenticated
  USING (true);

-- audit_ai_responses: Audit tool output
ALTER TABLE IF EXISTS audit_ai_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_ai_responses_public_read" ON audit_ai_responses;
CREATE POLICY "audit_ai_responses_public_read" ON audit_ai_responses
  FOR SELECT TO anon, authenticated
  USING (true);

-- audit_website_checks: Audit tool output
ALTER TABLE IF EXISTS audit_website_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_website_checks_public_read" ON audit_website_checks;
CREATE POLICY "audit_website_checks_public_read" ON audit_website_checks
  FOR SELECT TO anon, authenticated
  USING (true);

-- ai_snapshots: Public audit snapshots
ALTER TABLE IF EXISTS ai_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_snapshots_public_read" ON ai_snapshots;
CREATE POLICY "ai_snapshots_public_read" ON ai_snapshots
  FOR SELECT TO anon, authenticated
  USING (true);

-- score_history: Public score trends
ALTER TABLE IF EXISTS score_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "score_history_public_read" ON score_history;
CREATE POLICY "score_history_public_read" ON score_history
  FOR SELECT TO anon, authenticated
  USING (true);

-- fact_categories: Schema reference data
ALTER TABLE IF EXISTS fact_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fact_categories_public_read" ON fact_categories;
CREATE POLICY "fact_categories_public_read" ON fact_categories
  FOR SELECT TO anon, authenticated
  USING (true);

-- fact_definitions: Schema reference data (public ones)
ALTER TABLE IF EXISTS fact_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fact_definitions_public_read" ON fact_definitions;
CREATE POLICY "fact_definitions_public_read" ON fact_definitions
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

-- fact_versions: Public fact history
ALTER TABLE IF EXISTS fact_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fact_versions_public_read" ON fact_versions;
CREATE POLICY "fact_versions_public_read" ON fact_versions
  FOR SELECT TO anon, authenticated
  USING (true);

-- nominations: Public submission form (allow anon INSERT)
ALTER TABLE IF EXISTS nominations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nominations_public_read" ON nominations;
CREATE POLICY "nominations_public_read" ON nominations
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "nominations_public_insert" ON nominations;
CREATE POLICY "nominations_public_insert" ON nominations
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- rate_limits: System table (allow anon read/write for rate limiting)
ALTER TABLE IF EXISTS rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rate_limits_public_all" ON rate_limits;
CREATE POLICY "rate_limits_public_all" ON rate_limits
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- audit_leads: Anon INSERT only (audit form submissions)
ALTER TABLE IF EXISTS audit_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_leads_anon_insert" ON audit_leads;
CREATE POLICY "audit_leads_anon_insert" ON audit_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- =============================================================================
-- CATEGORY B: Service-Role Only (RLS enabled, no policies)
-- =============================================================================

-- contacts: Service-role managed lead data
ALTER TABLE IF EXISTS contacts ENABLE ROW LEVEL SECURITY;

-- leads: Sales pipeline, service-role managed
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;

-- outreach_campaigns: Email campaigns, service-role managed
ALTER TABLE IF EXISTS outreach_campaigns ENABLE ROW LEVEL SECURITY;

-- outreach_messages: Individual emails, service-role managed
ALTER TABLE IF EXISTS outreach_messages ENABLE ROW LEVEL SECURITY;

-- contact_segments: Audience segments, service-role managed
ALTER TABLE IF EXISTS contact_segments ENABLE ROW LEVEL SECURITY;

-- campaigns: Tenant campaigns, service-role managed
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;

-- monitor_checks: Weekly monitoring, service-role writes
ALTER TABLE IF EXISTS monitor_checks ENABLE ROW LEVEL SECURITY;

-- tenants: Multi-tenant config, service-role only
ALTER TABLE IF EXISTS tenants ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CATEGORY C: Org-Scoped Tables (authenticated via organization_members)
-- =============================================================================

-- ai_mentions: Org members SELECT
ALTER TABLE IF EXISTS ai_mentions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_mentions_org_read" ON ai_mentions;
CREATE POLICY "ai_mentions_org_read" ON ai_mentions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = ai_mentions.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- brand_metrics_history: Org members SELECT
ALTER TABLE IF EXISTS brand_metrics_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brand_metrics_history_org_read" ON brand_metrics_history;
CREATE POLICY "brand_metrics_history_org_read" ON brand_metrics_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = brand_metrics_history.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- compliance_checks: Org members SELECT
ALTER TABLE IF EXISTS compliance_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compliance_checks_org_read" ON compliance_checks;
CREATE POLICY "compliance_checks_org_read" ON compliance_checks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = compliance_checks.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- employer_facts: User-scoped via updated_by (already has correct policies from previous migration)
ALTER TABLE IF EXISTS employer_facts ENABLE ROW LEVEL SECURITY;

-- hosted_pages: Org members SELECT + UPDATE
ALTER TABLE IF EXISTS hosted_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hosted_pages_org_read" ON hosted_pages;
CREATE POLICY "hosted_pages_org_read" ON hosted_pages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = hosted_pages.organization_id
      AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "hosted_pages_org_update" ON hosted_pages;
CREATE POLICY "hosted_pages_org_update" ON hosted_pages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = hosted_pages.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- job_title_mappings: Org members SELECT + INSERT + UPDATE
ALTER TABLE IF EXISTS job_title_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_title_mappings_org_read" ON job_title_mappings;
CREATE POLICY "job_title_mappings_org_read" ON job_title_mappings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = job_title_mappings.organization_id
      AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "job_title_mappings_org_insert" ON job_title_mappings;
CREATE POLICY "job_title_mappings_org_insert" ON job_title_mappings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = job_title_mappings.organization_id
      AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "job_title_mappings_org_update" ON job_title_mappings;
CREATE POLICY "job_title_mappings_org_update" ON job_title_mappings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = job_title_mappings.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- jsonld_exports: Org members SELECT
ALTER TABLE IF EXISTS jsonld_exports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jsonld_exports_org_read" ON jsonld_exports;
CREATE POLICY "jsonld_exports_org_read" ON jsonld_exports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = jsonld_exports.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- locations: Org members SELECT + INSERT + UPDATE
ALTER TABLE IF EXISTS locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "locations_org_read" ON locations;
CREATE POLICY "locations_org_read" ON locations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = locations.organization_id
      AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "locations_org_insert" ON locations;
CREATE POLICY "locations_org_insert" ON locations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = locations.organization_id
      AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "locations_org_update" ON locations;
CREATE POLICY "locations_org_update" ON locations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = locations.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- pixel_events: Org members SELECT
ALTER TABLE IF EXISTS pixel_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pixel_events_org_read" ON pixel_events;
CREATE POLICY "pixel_events_org_read" ON pixel_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = pixel_events.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- hallucination_flags: Org members SELECT + UPDATE
ALTER TABLE IF EXISTS hallucination_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hallucination_flags_org_read" ON hallucination_flags;
CREATE POLICY "hallucination_flags_org_read" ON hallucination_flags
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = hallucination_flags.organization_id
      AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "hallucination_flags_org_update" ON hallucination_flags;
CREATE POLICY "hallucination_flags_org_update" ON hallucination_flags
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = hallucination_flags.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- =============================================================================
-- CATEGORY D: User-Scoped Tables
-- =============================================================================

-- subscriptions: user_id = auth.uid() for SELECT/UPDATE
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_user_read" ON subscriptions;
CREATE POLICY "subscriptions_user_read" ON subscriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "subscriptions_user_update" ON subscriptions;
CREATE POLICY "subscriptions_user_update" ON subscriptions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- audit_logs: user_id = auth.uid() for SELECT only
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_user_read" ON audit_logs;
CREATE POLICY "audit_logs_user_read" ON audit_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- users: auth_id = auth.uid() for SELECT/UPDATE own row
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_self_read" ON users;
CREATE POLICY "users_self_read" ON users
  FOR SELECT TO authenticated
  USING (auth_id = auth.uid());

DROP POLICY IF EXISTS "users_self_update" ON users;
CREATE POLICY "users_self_update" ON users
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid());

-- organization_members: user_id = auth.uid() for SELECT own memberships
ALTER TABLE IF EXISTS organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organization_members_self_read" ON organization_members;
CREATE POLICY "organization_members_self_read" ON organization_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- user_location_access: user_id = auth.uid() for SELECT
ALTER TABLE IF EXISTS user_location_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_location_access_self_read" ON user_location_access;
CREATE POLICY "user_location_access_self_read" ON user_location_access
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- =============================================================================
-- CATEGORY E: Special Cases
-- =============================================================================

-- displacement_reports: Public read, service-role write
ALTER TABLE IF EXISTS displacement_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "displacement_reports_public_read" ON displacement_reports;
CREATE POLICY "displacement_reports_public_read" ON displacement_reports
  FOR SELECT TO anon, authenticated
  USING (true);

-- snippet_installs: Public read, service-role write
ALTER TABLE IF EXISTS snippet_installs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "snippet_installs_public_read" ON snippet_installs;
CREATE POLICY "snippet_installs_public_read" ON snippet_installs
  FOR SELECT TO anon, authenticated
  USING (true);

-- proof_milestones: Public read, service-role write
ALTER TABLE IF EXISTS proof_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proof_milestones_public_read" ON proof_milestones;
CREATE POLICY "proof_milestones_public_read" ON proof_milestones
  FOR SELECT TO anon, authenticated
  USING (true);

-- api_keys: Org-scoped via organization_id
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "api_keys_org_read" ON api_keys;
CREATE POLICY "api_keys_org_read" ON api_keys
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
      AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "api_keys_org_insert" ON api_keys;
CREATE POLICY "api_keys_org_insert" ON api_keys
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
      AND om.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "api_keys_org_delete" ON api_keys;
CREATE POLICY "api_keys_org_delete" ON api_keys
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- organizations: Users can read their own orgs
ALTER TABLE IF EXISTS organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_member_read" ON organizations;
CREATE POLICY "organizations_member_read" ON organizations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
      AND om.user_id = auth.uid()
    )
  );

-- crawler_visits: Allow anon INSERT for pixel endpoint, service-role read
ALTER TABLE IF EXISTS crawler_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crawler_visits_anon_insert" ON crawler_visits;
CREATE POLICY "crawler_visits_anon_insert" ON crawler_visits
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- =============================================================================
-- END OF RLS PRODUCTION LOCKDOWN
-- =============================================================================
