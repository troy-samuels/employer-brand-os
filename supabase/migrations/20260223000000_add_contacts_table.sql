-- =====================================================
-- ADD CONTACTS TABLE (safe — skips if exists)
-- Migration: 20260223000000_add_contacts_table.sql
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Expand companies table with missing columns
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='employee_count_estimate') THEN
    ALTER TABLE companies ADD COLUMN employee_count_estimate INT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='country') THEN
    ALTER TABLE companies ADD COLUMN country TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='city') THEN
    ALTER TABLE companies ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='state') THEN
    ALTER TABLE companies ADD COLUMN state TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='postal_code') THEN
    ALTER TABLE companies ADD COLUMN postal_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='street') THEN
    ALTER TABLE companies ADD COLUMN street TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='linkedin_url') THEN
    ALTER TABLE companies ADD COLUMN linkedin_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='website') THEN
    ALTER TABLE companies ADD COLUMN website TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='company_size_tier') THEN
    ALTER TABLE companies ADD COLUMN company_size_tier TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='contact_count') THEN
    ALTER TABLE companies ADD COLUMN contact_count INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='updated_at') THEN
    ALTER TABLE companies ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Ensure companies.name has unique constraint (needed for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'companies'::regclass AND contype = 'u'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE tablename = 'companies' AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE '%name%'
    ) THEN
      -- name may already have unique from table definition; add if missing
      BEGIN
        ALTER TABLE companies ADD CONSTRAINT companies_name_unique UNIQUE (name);
      EXCEPTION WHEN duplicate_object THEN
        NULL;
      END;
    END IF;
  END IF;
END $$;

-- =====================================================
-- CONTACTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Personal info
  email TEXT NOT NULL UNIQUE,
  salutation TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,

  -- Job info
  title TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

  -- Contact info
  phone TEXT,
  mobile TEXT,
  fax TEXT,

  -- Address
  mailing_street TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_postal_code TEXT,
  mailing_country TEXT,

  -- Segmentation
  seniority_level TEXT,
  department TEXT,
  is_decision_maker BOOLEAN DEFAULT FALSE,

  -- Original data
  account_owner TEXT,

  -- Outreach tracking
  outreach_status TEXT DEFAULT 'new',
  last_contacted_at TIMESTAMPTZ,
  times_contacted INT DEFAULT 0,

  -- Email engagement
  email_opens INT DEFAULT 0,
  email_clicks INT DEFAULT 0,
  last_opened_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,

  -- Conversion tracking
  audit_completed BOOLEAN DEFAULT FALSE,
  audit_completed_at TIMESTAMPTZ,
  signup_completed BOOLEAN DEFAULT FALSE,
  signup_completed_at TIMESTAMPTZ,

  -- GDPR & Compliance
  consent_given BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  unsubscribed BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,

  -- Data quality
  email_verified BOOLEAN DEFAULT FALSE,
  email_bounced BOOLEAN DEFAULT FALSE,
  data_completeness_score FLOAT,

  -- Metadata
  source TEXT,
  import_batch TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_country ON contacts(mailing_country);
CREATE INDEX IF NOT EXISTS idx_contacts_seniority ON contacts(seniority_level);
CREATE INDEX IF NOT EXISTS idx_contacts_department ON contacts(department);
CREATE INDEX IF NOT EXISTS idx_contacts_decision_maker ON contacts(is_decision_maker) WHERE is_decision_maker = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_outreach_status ON contacts(outreach_status);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_import_batch ON contacts(import_batch);

-- Composite index for UK HR targeting
CREATE INDEX IF NOT EXISTS idx_contacts_country_seniority_dept
  ON contacts(mailing_country, seniority_level, department)
  WHERE email IS NOT NULL;

-- =====================================================
-- CONTACT SEGMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB DEFAULT '{}',
  contact_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'Service role full access on contacts'
  ) THEN
    CREATE POLICY "Service role full access on contacts"
      ON contacts FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END $$;

-- =====================================================
-- Seed segments
-- =====================================================
INSERT INTO contact_segments (name, description, criteria)
VALUES
  ('UK Decision Makers - Executive', 'UK-based C-level and VP contacts in HR/Recruiting/Talent',
   '{"country": ["GB"], "seniority": ["executive"], "department": ["hr", "recruiting", "talent", "people"]}'::jsonb),
  ('UK Decision Makers - Director', 'UK-based Directors in HR/Recruiting/Talent',
   '{"country": ["GB"], "seniority": ["director"], "department": ["hr", "recruiting", "talent", "people"]}'::jsonb),
  ('All UK Contacts', 'All UK-based contacts',
   '{"country": ["GB"]}'::jsonb),
  ('Global Decision Makers - HR', 'Executive and Director level HR contacts globally',
   '{"seniority": ["executive", "director"], "department": ["hr", "people"]}'::jsonb)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contacts_updated_at') THEN
    CREATE TRIGGER trg_contacts_updated_at
      BEFORE UPDATE ON contacts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_trigger();
  END IF;
END $$;

COMMENT ON TABLE contacts IS 'Main contacts database — UK HR/recruiting contacts for outreach';
