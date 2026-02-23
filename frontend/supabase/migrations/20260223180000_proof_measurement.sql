-- Proof Measurement System
-- Tracks AI response changes over time to prove OpenRole's value proposition

-- AI response snapshots
CREATE TABLE IF NOT EXISTS ai_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug text NOT NULL,
  captured_at timestamptz DEFAULT now(),
  overall_score numeric(5,2),
  dimension_scores jsonb,
  queries jsonb, -- Array of QuerySnapshot
  is_baseline boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_snapshots_company ON ai_snapshots(company_slug);
CREATE INDEX idx_snapshots_date ON ai_snapshots(captured_at);
CREATE INDEX idx_snapshots_baseline ON ai_snapshots(company_slug, is_baseline) WHERE is_baseline = true;

-- Milestones detected
CREATE TABLE IF NOT EXISTS proof_milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug text NOT NULL,
  milestone_type text NOT NULL,
  dimension text,
  description text,
  before_score numeric(5,2),
  after_score numeric(5,2),
  snapshot_id uuid REFERENCES ai_snapshots(id) ON DELETE CASCADE,
  detected_at timestamptz DEFAULT now()
);

CREATE INDEX idx_milestones_company ON proof_milestones(company_slug);
CREATE INDEX idx_milestones_type ON proof_milestones(milestone_type);
CREATE INDEX idx_milestones_date ON proof_milestones(detected_at);

-- RLS policies for ai_snapshots
ALTER TABLE ai_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) full access
CREATE POLICY "Service role full access on ai_snapshots" 
  ON ai_snapshots 
  FOR ALL 
  TO service_role 
  USING (true);

-- Allow authenticated users to read their own company's snapshots
-- Note: This uses auth.jwt() ->> 'company_slug' from user metadata
-- If you have a profiles table with company_slug, you can reference that instead
CREATE POLICY "Users can read own company snapshots" 
  ON ai_snapshots 
  FOR SELECT 
  TO authenticated 
  USING (
    company_slug = COALESCE(
      auth.jwt() ->> 'company_slug',
      LOWER(TRIM(REPLACE(auth.jwt() ->> 'company_name', ' ', '-')))
    )
  );

-- RLS policies for proof_milestones
ALTER TABLE proof_milestones ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) full access
CREATE POLICY "Service role full access on proof_milestones" 
  ON proof_milestones 
  FOR ALL 
  TO service_role 
  USING (true);

-- Allow authenticated users to read their own company's milestones
-- Note: This uses auth.jwt() ->> 'company_slug' from user metadata
-- If you have a profiles table with company_slug, you can reference that instead
CREATE POLICY "Users can read own company milestones" 
  ON proof_milestones 
  FOR SELECT 
  TO authenticated 
  USING (
    company_slug = COALESCE(
      auth.jwt() ->> 'company_slug',
      LOWER(TRIM(REPLACE(auth.jwt() ->> 'company_name', ' ', '-')))
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_snapshots TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON proof_milestones TO service_role;
GRANT SELECT ON ai_snapshots TO authenticated;
GRANT SELECT ON proof_milestones TO authenticated;
