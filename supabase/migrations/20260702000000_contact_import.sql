-- ============================================================
-- OpenRole: Contact Import Infrastructure
-- Migration: 20260702000000_contact_import.sql
-- 
-- Adds:
--   1. Indexes on leads table (email unique, company, country, etc.)
--   2. company_id FK column on leads → companies
--   3. outreach_campaigns table
--   4. outreach_messages table
--   5. RLS policies for service role access
--
-- Safe to re-run (IF NOT EXISTS / DO blocks throughout)
-- ============================================================

-- ============================================================
-- 0. ENSURE companies.name HAS UNIQUE CONSTRAINT
--    (required for ON CONFLICT during import)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'companies'::regclass
      AND contype = 'u'
      AND conname LIKE '%name%'
  ) THEN
    -- Check if a unique index exists instead
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE tablename = 'companies'
        AND indexdef LIKE '%UNIQUE%'
        AND indexdef LIKE '%name%'
    ) THEN
      ALTER TABLE companies ADD CONSTRAINT companies_name_unique UNIQUE (name);
    END IF;
  END IF;
END $$;


-- ============================================================
-- 1. INDEXES ON LEADS TABLE
-- ============================================================

-- Unique index on email (prevents duplicate imports)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_email_unique'
  ) THEN
    -- First: remove any existing non-unique email index
    DROP INDEX IF EXISTS idx_leads_email;
    -- Create unique index (NULLs are allowed, only non-null emails must be unique)
    CREATE UNIQUE INDEX idx_leads_email_unique ON leads (contact_email)
      WHERE contact_email IS NOT NULL;
  END IF;
END $$;

-- Company name index (for aggregation queries)
CREATE INDEX IF NOT EXISTS idx_leads_company_name ON leads (company_name);

-- Country index (for geographic filtering)
CREATE INDEX IF NOT EXISTS idx_leads_country ON leads (address_country);

-- Title index (for role-based targeting)
CREATE INDEX IF NOT EXISTS idx_leads_contact_title ON leads (contact_title);

-- Status index (for pipeline queries)
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);

-- Import batch index (for tracking import cohorts)
CREATE INDEX IF NOT EXISTS idx_leads_import_batch ON leads (import_batch);

-- Composite index for UK HR targeting queries
CREATE INDEX IF NOT EXISTS idx_leads_country_title_status
  ON leads (address_country, contact_title, status)
  WHERE contact_email IS NOT NULL;


-- ============================================================
-- 2. ADD company_id FK TO LEADS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE leads
      ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index on company_id for join performance
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads (company_id);


-- ============================================================
-- 3. OUTREACH_CAMPAIGNS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Campaign identity
  name TEXT NOT NULL,
  description TEXT,

  -- Email template
  template_subject TEXT,
  template_body TEXT,

  -- Targeting: JSONB filter spec for flexible querying
  -- e.g. {"country": ["UK","GB"], "title_keywords": ["HR","People"], "status": ["target"]}
  target_filter JSONB DEFAULT '{}',

  -- Campaign lifecycle
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'completed')),

  -- Aggregate counters (updated by triggers or application code)
  sent_count INTEGER NOT NULL DEFAULT 0,
  replied_count INTEGER NOT NULL DEFAULT 0,
  converted_count INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for campaigns
CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_status
  ON outreach_campaigns (status);
CREATE INDEX IF NOT EXISTS idx_outreach_campaigns_created
  ON outreach_campaigns (created_at);


-- ============================================================
-- 4. OUTREACH_MESSAGES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS outreach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  campaign_id UUID NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  -- Delivery timestamps
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,

  -- Reply analysis
  reply_sentiment TEXT
    CHECK (reply_sentiment IS NULL OR reply_sentiment IN ('positive', 'negative', 'neutral')),

  -- Message lifecycle
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'opened', 'replied', 'bounced')),

  -- Personalised audit link for this lead
  audit_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_outreach_messages_campaign
  ON outreach_messages (campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_lead
  ON outreach_messages (lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_status
  ON outreach_messages (status);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_sent
  ON outreach_messages (sent_at)
  WHERE sent_at IS NOT NULL;


-- ============================================================
-- 5. TRIGGERS: auto-update updated_at
-- ============================================================

-- Reuse existing function if available, otherwise create
CREATE OR REPLACE FUNCTION update_updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to outreach_campaigns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_outreach_campaigns_updated_at'
  ) THEN
    CREATE TRIGGER trg_outreach_campaigns_updated_at
      BEFORE UPDATE ON outreach_campaigns
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_trigger();
  END IF;
END $$;


-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;

-- Service role full access policies
DO $$
BEGIN
  -- outreach_campaigns
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'outreach_campaigns'
      AND policyname = 'Service role full access on outreach_campaigns'
  ) THEN
    CREATE POLICY "Service role full access on outreach_campaigns"
      ON outreach_campaigns FOR ALL
      USING (auth.role() = 'service_role');
  END IF;

  -- outreach_messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'outreach_messages'
      AND policyname = 'Service role full access on outreach_messages'
  ) THEN
    CREATE POLICY "Service role full access on outreach_messages"
      ON outreach_messages FOR ALL
      USING (auth.role() = 'service_role');
  END IF;

  -- leads (ensure it has a service role policy)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads'
      AND policyname = 'Service role full access on leads'
  ) THEN
    CREATE POLICY "Service role full access on leads"
      ON leads FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;


-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE outreach_campaigns IS 'Email campaign definitions with targeting filters and aggregate metrics';
COMMENT ON TABLE outreach_messages IS 'Individual outreach messages sent to leads, with delivery and engagement tracking';
COMMENT ON COLUMN leads.company_id IS 'FK to companies table — linked during import by extracting domain from email';

-- ============================================================
-- END OF MIGRATION
-- ============================================================
