-- ============================================================
-- OpenRole: Database Schema for Smart Pixel Infrastructure
-- Multi-tenant, RLS-enabled, Pay Transparency Compliant
-- Version: 2.0 (2026 Strategic Pivot)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ORGANIZATION LAYER (Core Multi-Tenant Foundation)
-- ============================================================

-- Organizations (Tenants / Companies)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
    industry TEXT, -- tech, healthcare, retail, hospitality, etc.
    logo_url TEXT,
    website TEXT,

    -- Company size (for "3-Star Purgatory" targeting)
    employee_count INTEGER,
    glassdoor_rating NUMERIC(2,1), -- 1.0 to 5.0

    -- Subscription tier
    tier TEXT DEFAULT 'verify', -- verify, control, command

    -- Trust Score (computed, cached)
    trust_score NUMERIC(3,2) DEFAULT 0, -- 0.00 to 1.00
    trust_score_updated_at TIMESTAMPTZ,

    -- Metadata
    settings JSONB DEFAULT '{}', -- org-specific config
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations (Flat structure - offices, stores, franchises)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    name TEXT NOT NULL, -- "Downtown Office", "Store #1234"
    location_type TEXT DEFAULT 'office', -- office, store, warehouse, remote

    -- Address
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'US',

    -- Pay Transparency jurisdiction
    pay_transparency_jurisdiction TEXT, -- 'NY', 'CA', 'CO', 'EU', null

    -- Location-specific settings
    settings JSONB DEFAULT '{}',
    is_headquarters BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- Supabase Auth user ID
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,

    -- Role-based access
    role TEXT NOT NULL DEFAULT 'viewer', -- admin, hr_manager, location_manager, viewer

    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Location Mappings (for location-level access control)
CREATE TABLE user_location_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,

    -- Granular permissions
    can_view_facts BOOLEAN DEFAULT TRUE,
    can_edit_facts BOOLEAN DEFAULT FALSE,
    can_verify_facts BOOLEAN DEFAULT FALSE,

    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),

    UNIQUE(user_id, location_id)
);

-- ============================================================
-- BRANDCORE: Smart Pixel & API Keys
-- ============================================================

-- API Keys (for Smart Pixel authentication)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    key_hash TEXT NOT NULL, -- hashed API key (never store plaintext)
    key_prefix TEXT NOT NULL, -- deterministic prefix for indexed lookup
    allowed_domains TEXT[] NOT NULL DEFAULT '{}', -- explicit origin allowlist for this key
    name TEXT, -- friendly name: "Production Pixel", "Staging"

    -- Permissions
    scopes JSONB DEFAULT '["read:facts"]', -- read:facts, read:schema

    -- Rate limiting
    rate_limit_per_minute INTEGER DEFAULT 100,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,

    -- Expiration (optional)
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Pixel Events (track Smart Pixel activity)
CREATE TABLE pixel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,

    -- Event details
    event_type TEXT NOT NULL, -- 'page_load', 'schema_inject', 'error'
    page_url TEXT,

    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    referer TEXT,

    -- Response
    facts_returned INTEGER DEFAULT 0,
    response_time_ms INTEGER,

    -- Error tracking
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMPLOYER FACTS: Flexible Data with Pay Transparency
-- ============================================================

-- Fact Categories (system-level, shared across orgs)
CREATE TABLE fact_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL, -- compensation, benefits, culture, policies, perks
    display_name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Lucide icon name for UI
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO fact_categories (name, display_name, description, icon, sort_order) VALUES
    ('compensation', 'Compensation', 'Salary, equity, bonuses, and pay structure', 'DollarSign', 1),
    ('benefits', 'Benefits', 'Health, retirement, and insurance offerings', 'Heart', 2),
    ('time_off', 'Time Off', 'PTO, holidays, leave policies', 'Calendar', 3),
    ('work_style', 'Work Style', 'Remote, hybrid, flexible scheduling', 'Home', 4),
    ('culture', 'Culture', 'Values, mission, team dynamics', 'Users', 5),
    ('growth', 'Growth', 'Career development, training, promotions', 'TrendingUp', 6),
    ('perks', 'Perks', 'Additional benefits and amenities', 'Gift', 7);

-- Fact Definitions (org-configurable vocabulary)
CREATE TABLE fact_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES fact_categories(id) ON DELETE SET NULL,

    name TEXT NOT NULL, -- internal key: 'base_salary', 'remote_policy'
    display_name TEXT NOT NULL, -- UI label: 'Base Salary', 'Remote Policy'
    description TEXT, -- Help text for data entry

    -- Data type constraints
    data_type TEXT NOT NULL DEFAULT 'text', -- text, number, boolean, range, enum, list
    validation_rules JSONB DEFAULT '{}', -- min, max, options, regex

    -- Pay Transparency compliance
    is_salary_data BOOLEAN DEFAULT FALSE, -- triggers Pay Transparency requirements
    requires_location BOOLEAN DEFAULT FALSE, -- must be set per-location
    requires_job_role BOOLEAN DEFAULT FALSE, -- must be set per-role

    -- JSON-LD mapping
    schema_property TEXT, -- schema.org property: 'baseSalary', 'employmentType'
    schema_type TEXT, -- schema.org type: 'MonetaryAmount', 'Text'
    include_in_jsonld BOOLEAN DEFAULT TRUE,

    is_required BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE, -- show on public profile?
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, name)
);

-- Employer Facts (the actual verified data)
CREATE TABLE employer_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE, -- NULL = org-wide
    definition_id UUID REFERENCES fact_definitions(id) ON DELETE CASCADE,

    -- Flexible value storage
    value JSONB NOT NULL, -- stores any data type

    -- Pay Transparency: Job role targeting
    job_roles JSONB DEFAULT '[]', -- ["Software Engineer", "Product Manager"]

    -- Pay Transparency: Effective dates
    effective_date TIMESTAMPTZ, -- when this fact became valid
    effective_end_date TIMESTAMPTZ, -- NULL = still current

    -- Compliance tracking
    compliance_tags JSONB DEFAULT '[]', -- ["pay_transparency_NY", "pay_transparency_CA"]

    -- Verification status
    verification_status TEXT DEFAULT 'unverified', -- unverified, pending, verified
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    verification_source TEXT, -- 'manual', 'hris_sync', 'document'

    -- JSON-LD export control
    include_in_jsonld BOOLEAN DEFAULT TRUE, -- should this be in schema exports?

    -- Version tracking
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Fact Versions (historical audit trail)
CREATE TABLE fact_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fact_id UUID REFERENCES employer_facts(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,

    value JSONB NOT NULL,
    job_roles JSONB,
    verification_status TEXT,

    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by UUID REFERENCES users(id),
    change_reason TEXT
);

-- ============================================================
-- JSON-LD EXPORTS: Track Schema Generation
-- ============================================================

-- JSON-LD Exports (track what was exported and when)
CREATE TABLE jsonld_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- What was exported
    fact_ids UUID[], -- array of fact IDs included

    -- Schema metadata
    schema_version TEXT DEFAULT 'v1', -- for versioning
    schema_type TEXT DEFAULT 'Organization', -- schema.org type

    -- The actual payload
    jsonld_payload JSONB NOT NULL, -- the generated JSON-LD
    content_hash TEXT, -- for change detection

    -- Where it was served
    served_to TEXT, -- 'pixel', 'api', 'hosted_page'
    page_url TEXT, -- the page it was injected into

    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRANDSHIELD: AI Monitoring & Hallucination Detection
-- ============================================================

-- AI Mentions (what AI agents say about the brand)
CREATE TABLE ai_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Source info
    source TEXT NOT NULL, -- 'chatgpt', 'claude', 'perplexity', 'gemini'
    source_model TEXT, -- 'gpt-4', 'claude-3-sonnet', etc.
    query TEXT, -- The question that was asked
    response_text TEXT NOT NULL, -- What the AI said

    -- Analysis
    sentiment TEXT, -- positive, neutral, negative
    accuracy_score NUMERIC(3,2), -- 0.00 to 1.00
    topics JSONB DEFAULT '[]', -- extracted topics

    -- Hallucination detection
    has_inaccuracies BOOLEAN DEFAULT FALSE,

    detected_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ
);

-- Hallucination Flags (flagged inaccuracies needing attention)
CREATE TABLE hallucination_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    mention_id UUID REFERENCES ai_mentions(id) ON DELETE CASCADE,

    -- The inaccuracy
    claim TEXT NOT NULL, -- The false claim
    fact_id UUID REFERENCES employer_facts(id), -- Related correct fact
    correct_value TEXT, -- What should have been said

    -- Root cause analysis
    source_origin TEXT, -- 'glassdoor', 'indeed', 'old_website', 'unknown'
    source_date DATE, -- approximate date of source data

    -- Impact estimation
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    estimated_impact INTEGER, -- estimated candidates who saw this

    -- Status
    status TEXT DEFAULT 'open', -- open, acknowledged, corrected, dismissed

    -- Resolution
    flagged_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    auto_resolved_at TIMESTAMPTZ, -- if fact correction auto-closed this
    resolution_notes TEXT
);

-- ============================================================
-- TRUST INFRASTRUCTURE: Audit & Compliance
-- ============================================================

-- Audit Logs (every data change)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- What happened
    action TEXT NOT NULL, -- create, update, delete, verify, export
    table_name TEXT NOT NULL,
    record_id UUID,

    -- Change details
    old_values JSONB,
    new_values JSONB,

    -- Context
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance Checks (Pay Transparency audits)
CREATE TABLE compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

    -- What was checked
    jurisdiction TEXT NOT NULL, -- 'NY', 'CA', 'CO', 'EU'
    check_type TEXT NOT NULL, -- 'salary_range_present', 'job_role_specified'

    -- Result
    is_compliant BOOLEAN NOT NULL,
    details JSONB, -- specific issues found

    -- Which facts were checked
    fact_ids UUID[],

    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HOSTED TRUTH PAGES (for Verify tier - franchises)
-- ============================================================

-- Hosted Pages (openrole.com/verify/[slug])
CREATE TABLE hosted_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    slug TEXT UNIQUE NOT NULL, -- URL slug: 'acme-corp'

    -- Page configuration
    title TEXT,
    description TEXT,
    logo_url TEXT,

    -- Which facts to show
    visible_categories JSONB DEFAULT '[]', -- empty = show all

    -- Customization
    theme JSONB DEFAULT '{}', -- colors, fonts

    -- Status
    is_published BOOLEAN DEFAULT TRUE,

    -- Analytics
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_location_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE jsonld_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hallucination_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosted_pages ENABLE ROW LEVEL SECURITY;

-- Basic org-level policies (users see only their org's data)
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (
        id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "Users can view own org locations" ON locations
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "Users can view own org users" ON users
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "Users can view own org facts" ON employer_facts
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "Users can view own org api keys" ON api_keys
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid())
    );

CREATE POLICY "Users can view own org hallucinations" ON hallucination_flags
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM users WHERE auth_id = auth.uid())
    );

-- Public access for hosted pages (no auth required)
CREATE POLICY "Anyone can view published hosted pages" ON hosted_pages
    FOR SELECT USING (is_published = TRUE);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_locations_org ON locations(organization_id);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_auth ON users(auth_id);
CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_pixel_events_org ON pixel_events(organization_id);
CREATE INDEX idx_pixel_events_created ON pixel_events(created_at);
CREATE INDEX idx_employer_facts_org ON employer_facts(organization_id);
CREATE INDEX idx_employer_facts_definition ON employer_facts(definition_id);
CREATE INDEX idx_employer_facts_location ON employer_facts(location_id);
CREATE INDEX idx_employer_facts_jsonld ON employer_facts(include_in_jsonld) WHERE include_in_jsonld = TRUE;
CREATE INDEX idx_ai_mentions_org ON ai_mentions(organization_id);
CREATE INDEX idx_hallucination_flags_org ON hallucination_flags(organization_id);
CREATE INDEX idx_hallucination_flags_status ON hallucination_flags(status);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_hosted_pages_slug ON hosted_pages(slug);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_fact_definitions_updated_at BEFORE UPDATE ON fact_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_employer_facts_updated_at BEFORE UPDATE ON employer_facts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_hosted_pages_updated_at BEFORE UPDATE ON hosted_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create audit log and version on fact changes
CREATE OR REPLACE FUNCTION audit_fact_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (organization_id, action, table_name, record_id, new_values)
        VALUES (NEW.organization_id, 'create', 'employer_facts', NEW.id, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        -- Create audit log
        INSERT INTO audit_logs (organization_id, action, table_name, record_id, old_values, new_values)
        VALUES (NEW.organization_id, 'update', 'employer_facts', NEW.id, to_jsonb(OLD), to_jsonb(NEW));

        -- Create version record
        INSERT INTO fact_versions (fact_id, version, value, job_roles, verification_status, changed_by)
        VALUES (NEW.id, OLD.version, OLD.value, OLD.job_roles, OLD.verification_status, NEW.updated_by);

        -- Increment version
        NEW.version = OLD.version + 1;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (organization_id, action, table_name, record_id, old_values)
        VALUES (OLD.organization_id, 'delete', 'employer_facts', OLD.id, to_jsonb(OLD));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_employer_facts BEFORE INSERT OR UPDATE OR DELETE ON employer_facts
    FOR EACH ROW EXECUTE FUNCTION audit_fact_change();

-- Function to generate JSON-LD for an organization
CREATE OR REPLACE FUNCTION generate_jsonld(org_id UUID)
RETURNS JSONB AS $$
DECLARE
    org RECORD;
    facts JSONB;
    result JSONB;
BEGIN
    -- Get organization
    SELECT * INTO org FROM organizations WHERE id = org_id;

    -- Get all facts marked for JSON-LD
    SELECT jsonb_agg(
        jsonb_build_object(
            'name', fd.display_name,
            'value', ef.value,
            'verified', ef.verification_status = 'verified'
        )
    ) INTO facts
    FROM employer_facts ef
    JOIN fact_definitions fd ON ef.definition_id = fd.id
    WHERE ef.organization_id = org_id
    AND ef.include_in_jsonld = TRUE
    AND ef.is_current = TRUE;

    -- Build JSON-LD
    result = jsonb_build_object(
        '@context', 'https://schema.org',
        '@type', 'Organization',
        'name', org.name,
        'url', org.website,
        'logo', org.logo_url,
        'employerOverview', facts
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- PHASE 2 TABLES (Commented out - not needed yet)
-- ============================================================

-- Employee Content (BrandVoice) - DEFERRED
-- CREATE TABLE employee_content (...);

-- Referral Campaigns (BrandReferral) - DEFERRED
-- CREATE TABLE referral_campaigns (...);

-- Integrations (Merge.dev/Rutter) - DEFERRED
-- CREATE TABLE integrations (...);
