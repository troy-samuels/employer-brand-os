-- Employer Facts Table
-- Stores comprehensive employer data for AEO content generation

CREATE TABLE IF NOT EXISTS employer_facts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_slug text NOT NULL UNIQUE,
  company_name text NOT NULL,
  
  -- Salary & Compensation
  salary_bands jsonb, -- [{role, min, max, currency, equity}]
  bonus_structure text,
  pay_review_cycle text,
  
  -- Benefits
  benefits jsonb, -- [{category, name, details}]
  pension_contribution text,
  healthcare text,
  
  -- Work Policy
  remote_policy text, -- 'fully-remote' | 'hybrid' | 'office-first' | 'flexible'
  remote_details text,
  office_locations jsonb, -- [{city, country, address}]
  flexible_hours boolean DEFAULT false,
  flexible_hours_details text,
  
  -- Tech & Tools
  tech_stack jsonb, -- [{category, tools}] e.g. [{category: "Frontend", tools: ["React", "TypeScript"]}]
  engineering_blog_url text,
  
  -- Interview Process
  interview_stages jsonb, -- [{stage, description, duration}]
  interview_timeline text, -- "2-3 weeks typical"
  
  -- Culture & Values
  company_values jsonb, -- [{value, description}]
  culture_description text,
  team_size text,
  founded_year integer,
  
  -- Diversity & Inclusion
  dei_statement text,
  dei_initiatives jsonb, -- [{name, description}]
  gender_pay_gap_url text,
  
  -- Career Growth
  promotion_framework text,
  learning_budget text, -- e.g., "£1,500/year per person"
  career_levels jsonb, -- [{level, title, description}]
  
  -- Parental & Leave
  maternity_leave text,
  paternity_leave text,
  parental_leave_details text,
  annual_leave text, -- e.g., "25 days + bank holidays"
  
  -- Metadata
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  published boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_employer_facts_slug ON employer_facts(company_slug);
CREATE INDEX idx_employer_facts_published ON employer_facts(published) WHERE published = true;
CREATE INDEX idx_employer_facts_updated_by ON employer_facts(updated_by);

-- Row Level Security
ALTER TABLE employer_facts ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access on employer_facts" 
  ON employer_facts FOR ALL TO service_role USING (true);

-- Anyone can read published facts
CREATE POLICY "Users can read published facts" 
  ON employer_facts FOR SELECT TO anon 
  USING (published = true);

-- Authenticated users can read all facts
CREATE POLICY "Authenticated users can read all facts"
  ON employer_facts FOR SELECT TO authenticated
  USING (true);

-- Authenticated users can insert their own company facts
CREATE POLICY "Authenticated users can insert own company facts"
  ON employer_facts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = updated_by);

-- Authenticated users can update their own company facts
CREATE POLICY "Authenticated users can update own company facts"
  ON employer_facts FOR UPDATE TO authenticated
  USING (auth.uid() = updated_by)
  WITH CHECK (auth.uid() = updated_by);

-- Authenticated users can delete their own company facts
CREATE POLICY "Authenticated users can delete own company facts"
  ON employer_facts FOR DELETE TO authenticated
  USING (auth.uid() = updated_by);

-- Update trigger to maintain updated_at
CREATE OR REPLACE FUNCTION update_employer_facts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employer_facts_updated_at
  BEFORE UPDATE ON employer_facts
  FOR EACH ROW
  EXECUTE FUNCTION update_employer_facts_updated_at();

-- Comment
COMMENT ON TABLE employer_facts IS 'Comprehensive employer data for AEO content generation - self-serve questionnaire input';
