-- Security hardening: RLS on all tables + organization_members table
-- Ticket: CRIT-02

-- ===================================================================
-- 1. Create organization_members table
-- ===================================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- ===================================================================
-- 2. Enable RLS on ALL tables
-- ===================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_title_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_website_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitor_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawler_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 3. RLS Policies
-- ===================================================================

-- -------------------------------------------------------------------
-- Public read tables: fact_categories, fact_definitions
-- (companies already has RLS + public read from 20260212090000)
-- -------------------------------------------------------------------
CREATE POLICY "anon_select_fact_categories"
  ON fact_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "anon_select_fact_definitions"
  ON fact_definitions FOR SELECT
  TO anon, authenticated
  USING (true);

-- -------------------------------------------------------------------
-- Org-scoped tables: authenticated users who are members of the org
-- -------------------------------------------------------------------

-- Helper: check membership via a sub-select
-- organizations
CREATE POLICY "org_member_select_organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_admin_insert_organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- any authenticated user can create an org (they become owner)

CREATE POLICY "org_admin_update_organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- locations
CREATE POLICY "org_member_select_locations"
  ON locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = locations.organization_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_admin_insert_locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = locations.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_admin_update_locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = locations.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_admin_delete_locations"
  ON locations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = locations.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- api_keys
CREATE POLICY "org_member_select_api_keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_admin_insert_api_keys"
  ON api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_admin_update_api_keys"
  ON api_keys FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_admin_delete_api_keys"
  ON api_keys FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = api_keys.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- employer_facts
CREATE POLICY "org_member_select_employer_facts"
  ON employer_facts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = employer_facts.organization_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_admin_insert_employer_facts"
  ON employer_facts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = employer_facts.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "org_admin_update_employer_facts"
  ON employer_facts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = employer_facts.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'member')
    )
  );

-- pixel_events
CREATE POLICY "org_member_select_pixel_events"
  ON pixel_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = pixel_events.organization_id
        AND om.user_id = auth.uid()
    )
  );

-- pixel_events INSERT is service-role only (written by the pixel API)

-- job_title_mappings
CREATE POLICY "org_member_select_job_title_mappings"
  ON job_title_mappings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = job_title_mappings.organization_id
        AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "org_admin_insert_job_title_mappings"
  ON job_title_mappings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = job_title_mappings.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'member')
    )
  );

CREATE POLICY "org_admin_update_job_title_mappings"
  ON job_title_mappings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = job_title_mappings.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin', 'member')
    )
  );

-- -------------------------------------------------------------------
-- Audit tables: service role only (no policies = denied for anon/authenticated)
-- audit_website_checks, audit_ai_responses, audit_leads, audit_logs
-- These tables have RLS enabled but NO policies for anon/authenticated,
-- which means only the service_role (which bypasses RLS) can access them.
-- -------------------------------------------------------------------

-- -------------------------------------------------------------------
-- Public write with limits: nominations
-- Allow INSERT for anon (anyone can nominate), no SELECT/UPDATE/DELETE
-- -------------------------------------------------------------------
CREATE POLICY "anon_insert_nominations"
  ON nominations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- -------------------------------------------------------------------
-- User tables: users can read/update their own row only
-- -------------------------------------------------------------------
CREATE POLICY "user_select_own"
  ON users FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "user_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- -------------------------------------------------------------------
-- score_history: public read, service-role-only write
-- -------------------------------------------------------------------
CREATE POLICY "anon_select_score_history"
  ON score_history FOR SELECT
  TO anon, authenticated
  USING (true);

-- No INSERT/UPDATE policies → only service_role can write

-- -------------------------------------------------------------------
-- rate_limits: service role only (no policies = denied)
-- -------------------------------------------------------------------
-- RLS enabled above, no policies → only service_role can access

-- -------------------------------------------------------------------
-- monitor_checks, crawler_visits: service role only (no policies = denied)
-- -------------------------------------------------------------------
-- RLS enabled above, no policies → only service_role can access

-- -------------------------------------------------------------------
-- organization_members: users can read their own memberships
-- -------------------------------------------------------------------
CREATE POLICY "user_select_own_memberships"
  ON organization_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Org owners/admins can manage members
CREATE POLICY "org_admin_insert_members"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
    -- OR the user is creating their own membership as owner (bootstrap)
    OR (
      user_id = auth.uid()
      AND role = 'owner'
      AND NOT EXISTS (
        SELECT 1 FROM organization_members om
        WHERE om.organization_id = organization_members.organization_id
      )
    )
  );

CREATE POLICY "org_admin_update_members"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "org_owner_delete_members"
  ON organization_members FOR DELETE
  TO authenticated
  USING (
    -- Owners can remove members
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role = 'owner'
    )
    -- Users can remove themselves
    OR user_id = auth.uid()
  );
