-- ============================================================
-- SANITIZATION ENGINE: ATS Code Translation
-- Transforms internal job codes (L4-Eng-NY) to public titles (Senior Software Engineer)
-- Part of Layer 1: Infrastructure
-- ============================================================

-- Job Title Mappings table
CREATE TABLE job_title_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- The internal ATS code (what HR systems use)
    internal_code TEXT NOT NULL,  -- e.g., "L4-Eng-NY", "SR-DEV-001"

    -- The public-friendly title (what candidates see)
    public_title TEXT NOT NULL,   -- e.g., "Senior Software Engineer"

    -- Optional job family grouping
    job_family TEXT,              -- e.g., "Engineering", "Sales", "Operations"

    -- Optional level indicator (for salary banding)
    level_indicator TEXT,         -- e.g., "Senior", "Lead", "Staff", "Manager"

    -- Location association (for location-specific mappings)
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

    -- Alternative codes that map to same title (for fuzzy matching)
    aliases JSONB DEFAULT '[]',   -- ["L4ENG", "L4-ENG", "SR-ENG"]

    -- Keywords for search/filtering
    keywords JSONB DEFAULT '[]',  -- ["software", "backend", "python"]

    -- Compliance tagging
    pay_transparency_ready BOOLEAN DEFAULT FALSE,  -- Has salary range attached in employer_facts?

    -- Status and audit
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),

    -- Ensure unique internal codes per org (allow same code in different orgs)
    UNIQUE(organization_id, internal_code)
);

-- Enable RLS
ALTER TABLE job_title_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their org's mappings
CREATE POLICY "Users can view own org mappings" ON job_title_mappings
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

-- RLS Policy: Users can manage their org's mappings (insert, update, delete)
CREATE POLICY "Users can manage own org mappings" ON job_title_mappings
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

-- RLS Policy: Service role can access all (for API endpoints)
CREATE POLICY "Service role has full access to mappings" ON job_title_mappings
    FOR ALL USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_job_title_mappings_org ON job_title_mappings(organization_id);
CREATE INDEX idx_job_title_mappings_lookup ON job_title_mappings(organization_id, internal_code) WHERE is_active = TRUE;
CREATE INDEX idx_job_title_mappings_family ON job_title_mappings(organization_id, job_family) WHERE is_active = TRUE;
CREATE INDEX idx_job_title_mappings_location ON job_title_mappings(location_id) WHERE location_id IS NOT NULL;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_job_title_mappings_updated_at
    BEFORE UPDATE ON job_title_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Audit logging trigger for job title mapping changes
CREATE OR REPLACE FUNCTION audit_job_title_mapping_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (organization_id, action, table_name, record_id, new_values, performed_by)
        VALUES (NEW.organization_id, 'create', 'job_title_mappings', NEW.id, to_jsonb(NEW), NEW.created_by);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (organization_id, action, table_name, record_id, old_values, new_values, performed_by)
        VALUES (NEW.organization_id, 'update', 'job_title_mappings', NEW.id, to_jsonb(OLD), to_jsonb(NEW), NEW.updated_by);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (organization_id, action, table_name, record_id, old_values)
        VALUES (OLD.organization_id, 'delete', 'job_title_mappings', OLD.id, to_jsonb(OLD));
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_job_title_mappings
    AFTER INSERT OR UPDATE OR DELETE ON job_title_mappings
    FOR EACH ROW EXECUTE FUNCTION audit_job_title_mapping_change();

-- ============================================================
-- HELPER FUNCTION: Sanitize a job code
-- Returns the public title for a given internal code
-- ============================================================

CREATE OR REPLACE FUNCTION sanitize_job_code(
    p_organization_id UUID,
    p_internal_code TEXT
) RETURNS TABLE (
    public_title TEXT,
    job_family TEXT,
    level_indicator TEXT,
    sanitized BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.public_title,
        m.job_family,
        m.level_indicator,
        TRUE as sanitized
    FROM job_title_mappings m
    WHERE m.organization_id = p_organization_id
      AND m.is_active = TRUE
      AND (
          m.internal_code = p_internal_code
          OR p_internal_code = ANY(
              SELECT jsonb_array_elements_text(m.aliases)
          )
      )
    LIMIT 1;

    -- If no match found, return null with sanitized = false
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE job_title_mappings IS 'Sanitization Engine: Maps internal ATS job codes to public-friendly titles';
COMMENT ON COLUMN job_title_mappings.internal_code IS 'The internal ATS code used by HR systems (e.g., L4-Eng-NY)';
COMMENT ON COLUMN job_title_mappings.public_title IS 'The public-friendly title shown to candidates (e.g., Senior Software Engineer)';
COMMENT ON COLUMN job_title_mappings.aliases IS 'JSON array of alternative codes that map to the same public title';
COMMENT ON FUNCTION sanitize_job_code IS 'Translates an internal ATS code to a public title, checking aliases';
