-- ============================================================
-- BrandOS: Leads Table for CRM
-- 2.5M contacts import
-- ============================================================

-- Drop table if exists (for fresh import)
DROP TABLE IF EXISTS leads;

-- Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Contact data
    salutation TEXT,
    first_name TEXT,
    last_name TEXT,
    contact_title TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_mobile TEXT,

    -- Company data
    company_name TEXT,

    -- Address
    address_street TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    address_country TEXT,

    -- CRM fields
    status TEXT DEFAULT 'new', -- new, contacted, responded, qualified, closed, unsubscribed
    audit_status TEXT DEFAULT 'pending', -- pending, audited, has_issues, clean
    audit_result JSONB,
    notes TEXT,

    -- Tracking
    source TEXT, -- Account Owner from CSV
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Import tracking
    import_batch TEXT
);

-- Indexes for common queries
CREATE INDEX idx_leads_company ON leads(company_name);
CREATE INDEX idx_leads_email ON leads(contact_email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_audit_status ON leads(audit_status);
CREATE INDEX idx_leads_title ON leads(contact_title);
CREATE INDEX idx_leads_country ON leads(address_country);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated service role
CREATE POLICY "Service role has full access" ON leads
    FOR ALL USING (true);

-- Comment
COMMENT ON TABLE leads IS 'CRM leads table - 2.5M contacts imported from Glassdoor export';
