-- Row Level Security policies for OpenRole
-- Run with service role (bypasses RLS by default)
-- These policies restrict anon/authenticated access per table

-- Enable RLS on all relevant tables (idempotent)
DO $$ BEGIN
  -- Core tables
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
    ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_leads') THEN
    ALTER TABLE public.audit_leads ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_website_checks') THEN
    ALTER TABLE public.audit_website_checks ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_ai_responses') THEN
    ALTER TABLE public.audit_ai_responses ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pixel_events') THEN
    ALTER TABLE public.pixel_events ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employer_facts') THEN
    ALTER TABLE public.employer_facts ENABLE ROW LEVEL SECURITY;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rate_limits') THEN
    ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================
-- ORGANIZATIONS
-- Users can only see/modify their own organization
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    DROP POLICY IF EXISTS "org_select_own" ON public.organizations;
    CREATE POLICY "org_select_own" ON public.organizations
      FOR SELECT USING (
        id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "org_update_own" ON public.organizations;
    CREATE POLICY "org_update_own" ON public.organizations
      FOR UPDATE USING (
        id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================
-- API_KEYS
-- Owners can CRUD their own keys only
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_keys') THEN
    DROP POLICY IF EXISTS "apikeys_select_own" ON public.api_keys;
    CREATE POLICY "apikeys_select_own" ON public.api_keys
      FOR SELECT USING (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "apikeys_insert_own" ON public.api_keys;
    CREATE POLICY "apikeys_insert_own" ON public.api_keys
      FOR INSERT WITH CHECK (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "apikeys_update_own" ON public.api_keys;
    CREATE POLICY "apikeys_update_own" ON public.api_keys
      FOR UPDATE USING (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "apikeys_delete_own" ON public.api_keys;
    CREATE POLICY "apikeys_delete_own" ON public.api_keys
      FOR DELETE USING (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================
-- AUDIT_LOGS
-- Read-only for authenticated users (own org only)
-- Insert via service role only (no direct user inserts)
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    DROP POLICY IF EXISTS "auditlogs_select_own" ON public.audit_logs;
    CREATE POLICY "auditlogs_select_own" ON public.audit_logs
      FOR SELECT USING (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );
    -- No INSERT/UPDATE/DELETE policies = service role only
  END IF;
END $$;

-- ============================================================
-- AUDIT_WEBSITE_CHECKS (public audit results)
-- Anon can read published results (for verify pages)
-- Authenticated users can read their own org's results
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_website_checks') THEN
    DROP POLICY IF EXISTS "auditchecks_anon_read" ON public.audit_website_checks;
    CREATE POLICY "auditchecks_anon_read" ON public.audit_website_checks
      FOR SELECT TO anon
      USING (true);  -- Audit results are public (verify pages)

    DROP POLICY IF EXISTS "auditchecks_auth_read" ON public.audit_website_checks;
    CREATE POLICY "auditchecks_auth_read" ON public.audit_website_checks
      FOR SELECT TO authenticated
      USING (true);
    -- Insert via service role only (audit engine)
  END IF;
END $$;

-- ============================================================
-- AUDIT_LEADS
-- No public access. Service role only.
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_leads') THEN
    DROP POLICY IF EXISTS "auditleads_deny_all" ON public.audit_leads;
    -- No policies = deny all for anon and authenticated
    -- Service role bypasses RLS
  END IF;
END $$;

-- ============================================================
-- PIXEL_EVENTS
-- Read own org's events only
-- Insert via service role (pixel API)
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pixel_events') THEN
    DROP POLICY IF EXISTS "pixelevents_select_own" ON public.pixel_events;
    CREATE POLICY "pixelevents_select_own" ON public.pixel_events
      FOR SELECT USING (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );
    -- No INSERT/UPDATE/DELETE policies = service role only
  END IF;
END $$;

-- ============================================================
-- EMPLOYER_FACTS
-- Read own org's facts, write own org's facts
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employer_facts') THEN
    DROP POLICY IF EXISTS "facts_select_own" ON public.employer_facts;
    CREATE POLICY "facts_select_own" ON public.employer_facts
      FOR SELECT USING (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "facts_insert_own" ON public.employer_facts;
    CREATE POLICY "facts_insert_own" ON public.employer_facts
      FOR INSERT WITH CHECK (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );

    DROP POLICY IF EXISTS "facts_update_own" ON public.employer_facts;
    CREATE POLICY "facts_update_own" ON public.employer_facts
      FOR UPDATE USING (
        organization_id IN (
          SELECT organization_id FROM public.organization_members
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================
-- RATE_LIMITS
-- Service role only. No user access.
-- ============================================================
-- (No policies needed — RLS enabled with no policies = deny all)
