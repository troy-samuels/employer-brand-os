-- Drop old employer_facts table (had different schema from earlier build)
-- and recreate with the questionnaire-compatible schema
DROP TABLE IF EXISTS employer_facts CASCADE;

CREATE TABLE employer_facts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug text NOT NULL UNIQUE,
  company_name text NOT NULL,
  salary_bands jsonb,
  bonus_structure text,
  pay_review_cycle text,
  benefits jsonb,
  pension_contribution text,
  healthcare text,
  remote_policy text,
  remote_details text,
  office_locations jsonb,
  flexible_hours boolean DEFAULT false,
  flexible_hours_details text,
  tech_stack jsonb,
  engineering_blog_url text,
  interview_stages jsonb,
  interview_timeline text,
  company_values jsonb,
  culture_description text,
  team_size text,
  founded_year integer,
  dei_statement text,
  dei_initiatives jsonb,
  gender_pay_gap_url text,
  promotion_framework text,
  learning_budget text,
  career_levels jsonb,
  maternity_leave text,
  paternity_leave text,
  parental_leave_details text,
  annual_leave text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_employer_facts_slug ON employer_facts(company_slug);
CREATE INDEX idx_employer_facts_published ON employer_facts(published) WHERE published = true;

ALTER TABLE employer_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on employer_facts" 
  ON employer_facts FOR ALL TO service_role USING (true);

CREATE POLICY "Users can read published facts" 
  ON employer_facts FOR SELECT TO anon 
  USING (published = true);

CREATE POLICY "Authenticated users can manage own company facts"
  ON employer_facts FOR ALL TO authenticated
  USING (true);
