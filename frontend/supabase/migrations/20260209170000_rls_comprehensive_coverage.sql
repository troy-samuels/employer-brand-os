-- Comprehensive RLS policies for all remaining tables
-- Ensures complete row-level security coverage across the platform

-- ===================================================================
-- 1. User-scoped tables (user_id)
-- ===================================================================

-- subscriptions: users can manage their own subscriptions
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_own_subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_insert_own_subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_update_own_subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- audit_logs: users can view their own audit logs
-- (already enabled in 20260223120000, adding authenticated user policies)
DROP POLICY IF EXISTS "user_select_own_audit_logs" ON audit_logs;
CREATE POLICY "user_select_own_audit_logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can write audit logs (no INSERT/UPDATE policies for authenticated)

-- ===================================================================
-- 2. Org-scoped tables (organization_id)
-- ===================================================================

-- displacement_reports: org members can view, admins can manage
ALTER TABLE IF EXISTS displacement_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_member_select_displacement_reports"
  ON displacement_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = displacement_reports.organization_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_admin_insert_displacement_reports"
  ON displacement_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = displacement_reports.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- outreach_campaigns: org members can view, admins can manage
ALTER TABLE IF EXISTS outreach_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_member_select_outreach_campaigns"
  ON outreach_campaigns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = outreach_campaigns.organization_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_admin_insert_outreach_campaigns"
  ON outreach_campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = outreach_campaigns.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "org_admin_update_outreach_campaigns"
  ON outreach_campaigns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = outreach_campaigns.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "org_admin_delete_outreach_campaigns"
  ON outreach_campaigns FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = outreach_campaigns.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- outreach_messages: org members can view, admins can manage
ALTER TABLE IF EXISTS outreach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_member_select_outreach_messages"
  ON outreach_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = outreach_messages.organization_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_admin_insert_outreach_messages"
  ON outreach_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = outreach_messages.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'member')
    )
  );

-- proof_milestones: org members can view, service role writes
ALTER TABLE IF EXISTS proof_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_member_select_proof_milestones"
  ON proof_milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = proof_milestones.organization_id
        AND om.user_id = auth.uid()
    )
  );

-- Service role writes proof_milestones (no INSERT policy for authenticated)

-- snippet_installs: org members can view, admins can manage
ALTER TABLE IF EXISTS snippet_installs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_member_select_snippet_installs"
  ON snippet_installs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = snippet_installs.organization_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_admin_insert_snippet_installs"
  ON snippet_installs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = snippet_installs.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_admin_update_snippet_installs"
  ON snippet_installs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = snippet_installs.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- ===================================================================
-- 3. Public read tables (anyone can SELECT)
-- ===================================================================

-- ai_snapshots: public read (audit results shown on company pages)
ALTER TABLE IF EXISTS ai_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_ai_snapshots"
  ON ai_snapshots FOR SELECT
  TO anon, authenticated
  USING (true);

-- public_audits: public read by definition
ALTER TABLE IF EXISTS public_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_public_audits"
  ON public_audits FOR SELECT
  TO anon, authenticated
  USING (true);

-- audit_ai_responses: currently service-role only, making public read for audit tool
-- (already enabled in 20260223120000)
DROP POLICY IF EXISTS "anon_select_audit_ai_responses" ON audit_ai_responses;
CREATE POLICY "anon_select_audit_ai_responses"
  ON audit_ai_responses FOR SELECT
  TO anon, authenticated
  USING (true);

-- audit_website_checks: currently service-role only, making public read for audit tool
-- (already enabled in 20260223120000)
DROP POLICY IF EXISTS "anon_select_audit_website_checks" ON audit_website_checks;
CREATE POLICY "anon_select_audit_website_checks"
  ON audit_website_checks FOR SELECT
  TO anon, authenticated
  USING (true);

-- ===================================================================
-- 4. Special cases
-- ===================================================================

-- crawler_visits: public INSERT (pixel tracking), org read
-- (already enabled in 20260223120000, adding public INSERT)
DROP POLICY IF EXISTS "anon_insert_crawler_visits" ON crawler_visits;
CREATE POLICY "anon_insert_crawler_visits"
  ON crawler_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "org_member_select_crawler_visits" ON crawler_visits;
CREATE POLICY "org_member_select_crawler_visits"
  ON crawler_visits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      JOIN api_keys ak ON ak.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
        AND ak.key_hash = crawler_visits.api_key_hash
    )
  );

-- ===================================================================
-- NOTES
-- ===================================================================
-- Tables NOT in this migration (already fully covered):
--   - organizations, organization_members (20260223120000)
--   - locations, api_keys, employer_facts (20260223120000)
--   - pixel_events, job_title_mappings (20260223120000)
--   - users, score_history (20260223120000)
--   - nominations, rate_limits (20260223120000)
--   - monitor_checks (20260223120000, service-role only)
--   - ai_mentions, brand_metrics_history (20260223160000, public read)
--   - campaigns, contact_segments, contacts (20260223160000, service-role only)
--   - compliance_checks, hallucination_flags (20260223160000, public read)
--   - hosted_pages, fact_versions (20260223160000, public read)
--   - jsonld_exports (20260223160000, public read)
--   - leads, tenants (20260223160000, service-role only)
--   - user_location_access (20260223160000, user select)
--   - fact_categories, fact_definitions (20260223120000, public read)
--   - companies (20260212090000, public read)
--   - audit_leads (20260223120000, service-role only for write)
--
-- Service role bypasses RLS by default in Supabase.
-- Tables with RLS enabled but no policies are inaccessible to anon/authenticated roles.
