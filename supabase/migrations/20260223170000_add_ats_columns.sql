-- Migration: Add ATS detection and job analysis columns
-- Created: 2026-02-23 17:00:00
-- Description: Store ATS provider, board token, job count, analysis, and generated facts

-- Add ATS columns to companies table (if it exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS ats_provider text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS ats_board_token text;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS ats_job_count integer;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS ats_analysis jsonb;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS ats_facts jsonb;
    ALTER TABLE companies ADD COLUMN IF NOT EXISTS ats_last_synced timestamptz;
    
    CREATE INDEX IF NOT EXISTS idx_companies_ats_provider ON companies(ats_provider) WHERE ats_provider IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_companies_ats_last_synced ON companies(ats_last_synced) WHERE ats_last_synced IS NOT NULL;
    
    COMMENT ON COLUMN companies.ats_provider IS 'Detected ATS provider name (e.g., greenhouse, lever, ashby)';
    COMMENT ON COLUMN companies.ats_board_token IS 'ATS board token/company identifier for API access';
    COMMENT ON COLUMN companies.ats_job_count IS 'Number of active job postings from ATS';
    COMMENT ON COLUMN companies.ats_analysis IS 'Job analysis results: salary transparency, benefits, tech stack, etc.';
    COMMENT ON COLUMN companies.ats_facts IS 'Auto-generated Facts content from job postings';
    COMMENT ON COLUMN companies.ats_last_synced IS 'Last time ATS data was fetched and updated';
  END IF;
END $$;

-- Add ATS columns to audit_website_checks table
ALTER TABLE audit_website_checks ADD COLUMN IF NOT EXISTS ats_provider text;
ALTER TABLE audit_website_checks ADD COLUMN IF NOT EXISTS ats_board_token text;
ALTER TABLE audit_website_checks ADD COLUMN IF NOT EXISTS ats_job_count integer;
ALTER TABLE audit_website_checks ADD COLUMN IF NOT EXISTS ats_analysis jsonb;
ALTER TABLE audit_website_checks ADD COLUMN IF NOT EXISTS ats_facts jsonb;

-- Add ATS columns to public_audits table
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS ats_provider text;
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS ats_board_token text;
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS ats_job_count integer;
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS ats_analysis jsonb;
ALTER TABLE public_audits ADD COLUMN IF NOT EXISTS ats_facts jsonb;

-- Add indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_audit_website_checks_ats_provider ON audit_website_checks(ats_provider) WHERE ats_provider IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_public_audits_ats_provider ON public_audits(ats_provider) WHERE ats_provider IS NOT NULL;

-- Add comments
COMMENT ON COLUMN audit_website_checks.ats_provider IS 'Detected ATS provider name (e.g., greenhouse, lever, ashby)';
COMMENT ON COLUMN audit_website_checks.ats_board_token IS 'ATS board token/company identifier for API access';
COMMENT ON COLUMN audit_website_checks.ats_job_count IS 'Number of active job postings from ATS';
COMMENT ON COLUMN audit_website_checks.ats_analysis IS 'Job analysis results: salary transparency, benefits, tech stack, etc.';
COMMENT ON COLUMN audit_website_checks.ats_facts IS 'Auto-generated Facts content from job postings';

COMMENT ON COLUMN public_audits.ats_provider IS 'Detected ATS provider name (e.g., greenhouse, lever, ashby)';
COMMENT ON COLUMN public_audits.ats_board_token IS 'ATS board token/company identifier for API access';
COMMENT ON COLUMN public_audits.ats_job_count IS 'Number of active job postings from ATS';
COMMENT ON COLUMN public_audits.ats_analysis IS 'Job analysis results: salary transparency, benefits, tech stack, etc.';
COMMENT ON COLUMN public_audits.ats_facts IS 'Auto-generated Facts content from job postings';
