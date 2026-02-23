-- Add nurture email tracking to audit_leads
-- Stores array of completed nurture steps: ["day1", "day3", "day7"]
ALTER TABLE audit_leads
  ADD COLUMN IF NOT EXISTS nurture_sent JSONB DEFAULT '[]'::jsonb;

-- Index for efficient cron queries (leads needing nurture emails)
CREATE INDEX IF NOT EXISTS idx_audit_leads_nurture
  ON audit_leads (created_at)
  WHERE nurture_sent IS NOT NULL;
