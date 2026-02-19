-- =====================================================
-- RANKWELL CONTACTS & OUTREACH SYSTEM
-- Migration: 20250218000000_create_contacts_system.sql
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- COMPANIES TABLE
-- Deduplicated company records
-- =====================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  domain TEXT, -- extracted from email domains
  industry TEXT,
  employee_count_estimate INT,
  country TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  street TEXT,
  
  -- Enrichment data (to be added later)
  linkedin_url TEXT,
  website TEXT,
  company_size_tier TEXT, -- 'startup' | 'smb' | 'mid-market' | 'enterprise'
  
  -- Metadata
  contact_count INT DEFAULT 0, -- number of contacts at this company
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for companies
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_country ON companies(country);
CREATE INDEX idx_companies_size_tier ON companies(company_size_tier);

-- =====================================================
-- CONTACTS TABLE
-- Main contacts database (2.5M records)
-- =====================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Personal info
  email TEXT NOT NULL UNIQUE,
  salutation TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (
    TRIM(CONCAT(first_name, ' ', last_name))
  ) STORED,
  
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
  
  -- Segmentation (auto-populated during import)
  seniority_level TEXT, -- 'executive' | 'director' | 'manager' | 'specialist' | 'other'
  department TEXT, -- 'hr' | 'recruiting' | 'talent' | 'people' | 'other'
  is_decision_maker BOOLEAN DEFAULT FALSE, -- executive or director
  
  -- Original data
  account_owner TEXT, -- from source CSV
  
  -- Outreach tracking
  outreach_status TEXT DEFAULT 'new', -- 'new' | 'queued' | 'sent' | 'engaged' | 'converted' | 'unsubscribed' | 'bounced'
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
  data_completeness_score FLOAT, -- 0-1, based on how many fields are filled
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  imported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for contacts
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_country ON contacts(mailing_country);
CREATE INDEX idx_contacts_seniority ON contacts(seniority_level);
CREATE INDEX idx_contacts_department ON contacts(department);
CREATE INDEX idx_contacts_is_decision_maker ON contacts(is_decision_maker);
CREATE INDEX idx_contacts_outreach_status ON contacts(outreach_status);
CREATE INDEX idx_contacts_unsubscribed ON contacts(unsubscribed) WHERE unsubscribed = TRUE;
CREATE INDEX idx_contacts_uk_decision_makers ON contacts(mailing_country, is_decision_maker) 
  WHERE mailing_country IN ('UK', 'GB') AND is_decision_maker = TRUE;

-- Composite index for high-value segments
CREATE INDEX idx_contacts_segments ON contacts(mailing_country, seniority_level, department, outreach_status);

-- =====================================================
-- CONTACT SEGMENTS TABLE
-- Flexible tagging system for segmentation
-- =====================================================
CREATE TABLE contact_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Segment criteria (stored as JSONB for flexibility)
  criteria JSONB NOT NULL,
  -- Example: {"country": ["UK", "GB"], "seniority": ["executive", "director"], "department": ["hr", "recruiting"]}
  
  -- Cached count (updated periodically)
  contact_count INT DEFAULT 0,
  last_count_updated_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for segments
CREATE INDEX idx_contact_segments_name ON contact_segments(name);
CREATE INDEX idx_contact_segments_criteria ON contact_segments USING GIN(criteria);

-- =====================================================
-- CONTACT_SEGMENT_MEMBERS TABLE
-- Many-to-many relationship between contacts and segments
-- =====================================================
CREATE TABLE contact_segment_members (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES contact_segments(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (contact_id, segment_id)
);

-- Indexes for segment members
CREATE INDEX idx_contact_segment_members_contact ON contact_segment_members(contact_id);
CREATE INDEX idx_contact_segment_members_segment ON contact_segment_members(segment_id);

-- =====================================================
-- EMAIL TEMPLATES TABLE
-- Reusable email templates for campaigns
-- =====================================================
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  
  -- Template content (supports variables like {{firstName}}, {{companyName}})
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  
  -- Template metadata
  template_type TEXT, -- 'cold_outreach' | 'follow_up' | 'audit_invite' | 'nurture' | 'promotional'
  intended_segment TEXT, -- which segment this is designed for
  
  -- Performance tracking
  times_sent INT DEFAULT 0,
  avg_open_rate FLOAT,
  avg_click_rate FLOAT,
  avg_reply_rate FLOAT,
  
  -- Version control
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for templates
CREATE INDEX idx_email_templates_name ON email_templates(name);
CREATE INDEX idx_email_templates_type ON email_templates(template_type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active) WHERE is_active = TRUE;

-- =====================================================
-- OUTREACH CAMPAIGNS TABLE
-- Email campaign tracking
-- =====================================================
CREATE TABLE outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Campaign configuration
  segment_id UUID REFERENCES contact_segments(id) ON DELETE SET NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  
  -- Campaign type
  campaign_type TEXT, -- 'one_time' | 'sequence' | 'drip' | 'trigger'
  
  -- Sending schedule
  scheduled_start_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  
  -- Sending limits (for deliverability)
  daily_send_limit INT DEFAULT 500, -- max emails per day
  hourly_send_limit INT DEFAULT 50,  -- max emails per hour
  
  -- Campaign status
  status TEXT DEFAULT 'draft', -- 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'cancelled'
  
  -- Performance metrics
  total_recipients INT DEFAULT 0,
  emails_sent INT DEFAULT 0,
  emails_delivered INT DEFAULT 0,
  emails_bounced INT DEFAULT 0,
  emails_opened INT DEFAULT 0,
  emails_clicked INT DEFAULT 0,
  emails_replied INT DEFAULT 0,
  emails_unsubscribed INT DEFAULT 0,
  
  -- Calculated rates
  delivery_rate FLOAT GENERATED ALWAYS AS (
    CASE WHEN emails_sent > 0 
    THEN (emails_delivered::FLOAT / emails_sent::FLOAT) 
    ELSE 0 END
  ) STORED,
  open_rate FLOAT GENERATED ALWAYS AS (
    CASE WHEN emails_delivered > 0 
    THEN (emails_opened::FLOAT / emails_delivered::FLOAT) 
    ELSE 0 END
  ) STORED,
  click_rate FLOAT GENERATED ALWAYS AS (
    CASE WHEN emails_delivered > 0 
    THEN (emails_clicked::FLOAT / emails_delivered::FLOAT) 
    ELSE 0 END
  ) STORED,
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes for campaigns
CREATE INDEX idx_outreach_campaigns_status ON outreach_campaigns(status);
CREATE INDEX idx_outreach_campaigns_segment ON outreach_campaigns(segment_id);
CREATE INDEX idx_outreach_campaigns_scheduled_start ON outreach_campaigns(scheduled_start_at);

-- =====================================================
-- OUTREACH EVENTS TABLE
-- Individual email events (opens, clicks, replies, etc.)
-- =====================================================
CREATE TABLE outreach_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed' | 'spam_complaint'
  event_data JSONB, -- Additional event metadata (link clicked, bounce reason, etc.)
  
  -- Email provider tracking
  resend_email_id TEXT, -- Resend's email ID
  resend_event_id TEXT, -- Resend's event ID
  
  -- IP & User agent (for opens/clicks)
  ip_address TEXT,
  user_agent TEXT,
  location_country TEXT,
  location_city TEXT,
  
  -- Metadata
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX idx_outreach_events_contact ON outreach_events(contact_id);
CREATE INDEX idx_outreach_events_campaign ON outreach_events(campaign_id);
CREATE INDEX idx_outreach_events_type ON outreach_events(event_type);
CREATE INDEX idx_outreach_events_occurred ON outreach_events(occurred_at);
CREATE INDEX idx_outreach_events_resend_email_id ON outreach_events(resend_email_id);

-- Composite index for event analysis
CREATE INDEX idx_outreach_events_campaign_type_occurred 
  ON outreach_events(campaign_id, event_type, occurred_at);

-- =====================================================
-- TRIGGER FUNCTIONS
-- Auto-update timestamps and derived fields
-- =====================================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_segments_updated_at BEFORE UPDATE ON contact_segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_campaigns_updated_at BEFORE UPDATE ON outreach_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Update contact counts on companies
-- =====================================================
CREATE OR REPLACE FUNCTION update_company_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE companies 
    SET contact_count = contact_count + 1 
    WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE companies 
    SET contact_count = contact_count - 1 
    WHERE id = OLD.company_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.company_id IS DISTINCT FROM NEW.company_id THEN
    UPDATE companies 
    SET contact_count = contact_count - 1 
    WHERE id = OLD.company_id;
    UPDATE companies 
    SET contact_count = contact_count + 1 
    WHERE id = NEW.company_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_contact_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON contacts
FOR EACH ROW EXECUTE FUNCTION update_company_contact_count();

-- =====================================================
-- TRIGGER: Update campaign metrics when events occur
-- =====================================================
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update campaign metrics
  IF NEW.event_type = 'sent' THEN
    UPDATE outreach_campaigns 
    SET emails_sent = emails_sent + 1 
    WHERE id = NEW.campaign_id;
  ELSIF NEW.event_type = 'delivered' THEN
    UPDATE outreach_campaigns 
    SET emails_delivered = emails_delivered + 1 
    WHERE id = NEW.campaign_id;
  ELSIF NEW.event_type = 'bounced' THEN
    UPDATE outreach_campaigns 
    SET emails_bounced = emails_bounced + 1 
    WHERE id = NEW.campaign_id;
    UPDATE contacts 
    SET email_bounced = TRUE, outreach_status = 'bounced'
    WHERE id = NEW.contact_id;
  ELSIF NEW.event_type = 'opened' THEN
    UPDATE outreach_campaigns 
    SET emails_opened = emails_opened + 1 
    WHERE id = NEW.campaign_id;
    UPDATE contacts 
    SET email_opens = email_opens + 1, last_opened_at = NEW.occurred_at
    WHERE id = NEW.contact_id;
  ELSIF NEW.event_type = 'clicked' THEN
    UPDATE outreach_campaigns 
    SET emails_clicked = emails_clicked + 1 
    WHERE id = NEW.campaign_id;
    UPDATE contacts 
    SET email_clicks = email_clicks + 1, last_clicked_at = NEW.occurred_at, outreach_status = 'engaged'
    WHERE id = NEW.contact_id;
  ELSIF NEW.event_type = 'replied' THEN
    UPDATE outreach_campaigns 
    SET emails_replied = emails_replied + 1 
    WHERE id = NEW.campaign_id;
    UPDATE contacts 
    SET outreach_status = 'engaged'
    WHERE id = NEW.contact_id;
  ELSIF NEW.event_type = 'unsubscribed' THEN
    UPDATE outreach_campaigns 
    SET emails_unsubscribed = emails_unsubscribed + 1 
    WHERE id = NEW.campaign_id;
    UPDATE contacts 
    SET unsubscribed = TRUE, unsubscribed_at = NEW.occurred_at, outreach_status = 'unsubscribed'
    WHERE id = NEW.contact_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_metrics_trigger
AFTER INSERT ON outreach_events
FOR EACH ROW EXECUTE FUNCTION update_campaign_metrics();

-- =====================================================
-- VIEWS: Useful analytics views
-- =====================================================

-- View: High-value UK decision makers
CREATE VIEW v_uk_decision_makers AS
SELECT 
  c.*,
  co.name AS company_name,
  co.domain AS company_domain,
  co.employee_count_estimate
FROM contacts c
LEFT JOIN companies co ON c.company_id = co.id
WHERE 
  c.mailing_country IN ('UK', 'GB')
  AND c.is_decision_maker = TRUE
  AND c.unsubscribed = FALSE
  AND c.email_bounced = FALSE
  AND c.outreach_status NOT IN ('unsubscribed', 'bounced');

-- View: Campaign performance summary
CREATE VIEW v_campaign_performance AS
SELECT 
  c.*,
  s.name AS segment_name,
  t.name AS template_name,
  t.template_type,
  ROUND(c.open_rate * 100, 2) AS open_rate_pct,
  ROUND(c.click_rate * 100, 2) AS click_rate_pct,
  ROUND((c.emails_replied::FLOAT / NULLIF(c.emails_delivered, 0)) * 100, 2) AS reply_rate_pct
FROM outreach_campaigns c
LEFT JOIN contact_segments s ON c.segment_id = s.id
LEFT JOIN email_templates t ON c.template_id = t.id;

-- View: Contact engagement summary
CREATE VIEW v_contact_engagement AS
SELECT 
  c.id,
  c.email,
  c.full_name,
  c.title,
  c.mailing_country,
  c.seniority_level,
  c.outreach_status,
  c.times_contacted,
  c.email_opens,
  c.email_clicks,
  c.last_opened_at,
  c.last_clicked_at,
  CASE 
    WHEN c.email_clicks > 0 THEN 'hot'
    WHEN c.email_opens >= 3 THEN 'warm'
    WHEN c.email_opens > 0 THEN 'engaged'
    WHEN c.times_contacted > 0 THEN 'contacted'
    ELSE 'cold'
  END AS engagement_level,
  co.name AS company_name
FROM contacts c
LEFT JOIN companies co ON c.company_id = co.id;

-- =====================================================
-- RLS (Row Level Security) Policies
-- Enable RLS but allow service role full access
-- =====================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_events ENABLE ROW LEVEL SECURITY;

-- Service role has full access (needed for import script)
CREATE POLICY "Service role has full access to companies" ON companies
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to contacts" ON contacts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to segments" ON contact_segments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to segment members" ON contact_segment_members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to templates" ON email_templates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to campaigns" ON outreach_campaigns
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to events" ON outreach_events
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- SEED: Create initial high-value segments
-- =====================================================

INSERT INTO contact_segments (name, description, criteria) VALUES
  (
    'UK Decision Makers - Executive',
    'UK-based C-level and VP contacts in HR/Recruiting/Talent',
    '{"country": ["UK", "GB"], "seniority": ["executive"], "department": ["hr", "recruiting", "talent", "people"]}'::jsonb
  ),
  (
    'UK Decision Makers - Director',
    'UK-based Directors in HR/Recruiting/Talent',
    '{"country": ["UK", "GB"], "seniority": ["director"], "department": ["hr", "recruiting", "talent", "people"]}'::jsonb
  ),
  (
    'US Decision Makers - Enterprise',
    'US-based executive and director level at 500+ employee companies',
    '{"country": ["US", "United States"], "seniority": ["executive", "director"], "company_size": ["enterprise"]}'::jsonb
  ),
  (
    'All UK Contacts',
    'All UK-based contacts regardless of seniority',
    '{"country": ["UK", "GB"]}'::jsonb
  ),
  (
    'Global Decision Makers - HR',
    'Executive and Director level HR contacts globally',
    '{"seniority": ["executive", "director"], "department": ["hr", "people"]}'::jsonb
  );

-- =====================================================
-- FUNCTIONS: Utility functions for data management
-- =====================================================

-- Function: Calculate data completeness score for a contact
CREATE OR REPLACE FUNCTION calculate_contact_completeness(contact_row contacts)
RETURNS FLOAT AS $$
DECLARE
  score FLOAT := 0;
  total_fields FLOAT := 11; -- number of optional fields we check
BEGIN
  -- Required fields (email) is always present, so base score starts at 0
  
  -- Optional fields that add to completeness
  IF contact_row.first_name IS NOT NULL AND contact_row.first_name != '' THEN score := score + 1; END IF;
  IF contact_row.last_name IS NOT NULL AND contact_row.last_name != '' THEN score := score + 1; END IF;
  IF contact_row.title IS NOT NULL AND contact_row.title != '' THEN score := score + 1; END IF;
  IF contact_row.company_id IS NOT NULL THEN score := score + 1; END IF;
  IF contact_row.phone IS NOT NULL AND contact_row.phone != '' THEN score := score + 1; END IF;
  IF contact_row.mobile IS NOT NULL AND contact_row.mobile != '' THEN score := score + 1; END IF;
  IF contact_row.mailing_city IS NOT NULL AND contact_row.mailing_city != '' THEN score := score + 1; END IF;
  IF contact_row.mailing_state IS NOT NULL AND contact_row.mailing_state != '' THEN score := score + 1; END IF;
  IF contact_row.mailing_country IS NOT NULL AND contact_row.mailing_country != '' THEN score := score + 1; END IF;
  IF contact_row.seniority_level IS NOT NULL AND contact_row.seniority_level != 'other' THEN score := score + 1; END IF;
  IF contact_row.department IS NOT NULL AND contact_row.department != 'other' THEN score := score + 1; END IF;
  
  RETURN score / total_fields;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE companies IS 'Deduplicated company records extracted from contacts';
COMMENT ON TABLE contacts IS 'Main contacts database - 2.5M HR/recruiting contacts';
COMMENT ON TABLE contact_segments IS 'Flexible segmentation for targeted outreach';
COMMENT ON TABLE email_templates IS 'Reusable email templates with variable support';
COMMENT ON TABLE outreach_campaigns IS 'Email campaign tracking and metrics';
COMMENT ON TABLE outreach_events IS 'Individual email events (opens, clicks, etc.)';
