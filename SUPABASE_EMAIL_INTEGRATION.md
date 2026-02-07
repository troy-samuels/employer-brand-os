# SUPABASE EMAIL MARKETING INTEGRATION
**Database:** 2.5M Contact Email Marketing System  
**Platform:** Supabase PostgreSQL with Row Level Security  
**Integration:** SendGrid/SES + Custom Analytics  
**Timeline:** 2-week implementation

---

## DATABASE SCHEMA IMPLEMENTATION

### Core Email Marketing Tables

```sql
-- Email Contacts Master Table
CREATE TABLE email_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 for deduplication
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(200),
  job_title VARCHAR(150),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  country VARCHAR(100),
  state VARCHAR(100),
  linkedin_url VARCHAR(300),
  phone VARCHAR(20),
  website VARCHAR(300),
  
  -- Email Marketing Fields
  subscription_status VARCHAR(50) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  bounce_count INTEGER DEFAULT 0,
  complaint_count INTEGER DEFAULT 0,
  last_engagement_date TIMESTAMP,
  
  -- Data Source & Quality
  source VARCHAR(100), -- original_database, website_signup, partner_import
  source_date DATE,
  data_quality_score INTEGER DEFAULT 0, -- 0-100 based on completeness
  
  -- GDPR & Compliance
  gdpr_consent BOOLEAN DEFAULT FALSE,
  gdpr_consent_date TIMESTAMP,
  gdpr_withdrawal_date TIMESTAMP,
  canspam_compliant BOOLEAN DEFAULT TRUE,
  
  -- Lead Scoring & Segmentation
  lead_score INTEGER DEFAULT 0,
  customer_fit_score INTEGER DEFAULT 0, -- 0-100 based on ICP match
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_email_sent TIMESTAMP,
  
  -- Indexes for performance
  CONSTRAINT email_contacts_email_key UNIQUE (email),
  CONSTRAINT email_contacts_email_hash_key UNIQUE (email_hash)
);

-- Create indexes for fast querying
CREATE INDEX idx_email_contacts_subscription_status ON email_contacts(subscription_status);
CREATE INDEX idx_email_contacts_industry ON email_contacts(industry);
CREATE INDEX idx_email_contacts_company_size ON email_contacts(company_size);
CREATE INDEX idx_email_contacts_lead_score ON email_contacts(lead_score DESC);
CREATE INDEX idx_email_contacts_last_engagement ON email_contacts(last_engagement_date DESC);
CREATE INDEX idx_email_contacts_source ON email_contacts(source);

-- Segmentation and Tags
CREATE TABLE email_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES email_contacts(id) ON DELETE CASCADE,
  segment_type VARCHAR(100), -- job_level, industry, company_size, behavior, custom
  segment_name VARCHAR(100),
  segment_value VARCHAR(200),
  auto_assigned BOOLEAN DEFAULT FALSE, -- true if automatically assigned
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(contact_id, segment_type, segment_name)
);

CREATE INDEX idx_email_segments_type_name ON email_segments(segment_type, segment_name);
CREATE INDEX idx_email_segments_contact_id ON email_segments(contact_id);

-- Email Campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name VARCHAR(200) NOT NULL,
  campaign_type VARCHAR(100), -- blast, sequence, behavioral, transactional
  
  -- Content
  subject_line VARCHAR(300),
  preview_text VARCHAR(150),
  template_id UUID,
  
  -- Targeting
  target_segments JSONB, -- Array of segment criteria
  exclude_segments JSONB, -- Array of exclusion criteria
  
  -- Scheduling
  scheduled_send_date TIMESTAMP,
  timezone VARCHAR(50) DEFAULT 'UTC',
  send_status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, sending, sent, paused, cancelled
  
  -- Performance Tracking
  total_targeted INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  total_complained INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  
  -- Revenue Attribution
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  
  -- A/B Testing
  ab_test_enabled BOOLEAN DEFAULT FALSE,
  ab_test_variants JSONB, -- Subject lines, send times, etc.
  ab_test_winner VARCHAR(10), -- A, B, C, etc.
  
  -- Metadata
  created_by UUID, -- User who created campaign
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_email_campaigns_status ON email_campaigns(send_status);
CREATE INDEX idx_email_campaigns_scheduled_date ON email_campaigns(scheduled_send_date);
CREATE INDEX idx_email_campaigns_type ON email_campaigns(campaign_type);

-- Email Events Tracking (High Volume Table)
CREATE TABLE email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES email_contacts(id),
  campaign_id UUID REFERENCES email_campaigns(id),
  
  -- Event Details
  event_type VARCHAR(50) NOT NULL, -- sent, delivered, opened, clicked, bounced, complained, unsubscribed, converted
  event_timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Email Client & Device Info
  email_client VARCHAR(100),
  device_type VARCHAR(50), -- desktop, mobile, tablet
  operating_system VARCHAR(50),
  browser VARCHAR(50),
  
  -- Location Data
  ip_address INET,
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Click Tracking
  clicked_url TEXT,
  link_position INTEGER, -- Which link in email (1st, 2nd, etc.)
  
  -- Conversion Tracking
  conversion_value DECIMAL(10,2),
  conversion_type VARCHAR(100), -- demo_request, trial_signup, purchase
  
  -- A/B Test Tracking
  ab_variant VARCHAR(10), -- A, B, C, etc.
  
  -- External IDs (for integration with ESP)
  sendgrid_message_id VARCHAR(200),
  ses_message_id VARCHAR(200)
);

-- Partition by month for performance with high volume
CREATE INDEX idx_email_events_contact_campaign ON email_events(contact_id, campaign_id);
CREATE INDEX idx_email_events_type_timestamp ON email_events(event_type, event_timestamp);
CREATE INDEX idx_email_events_campaign_timestamp ON email_events(campaign_id, event_timestamp);

-- Email Templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(200) NOT NULL,
  template_type VARCHAR(100), -- blast, sequence, transactional, autoresponder
  
  -- Content
  subject_line VARCHAR(300),
  preview_text VARCHAR(150),
  html_content TEXT,
  text_content TEXT,
  
  -- Template Variables
  merge_fields JSONB, -- Available merge fields like {{first_name}}
  dynamic_sections JSONB, -- Conditional content blocks
  
  -- Design
  template_category VARCHAR(100), -- onboarding, promotional, educational, etc.
  brand_compliant BOOLEAN DEFAULT TRUE,
  
  -- Performance (if used in campaigns)
  times_used INTEGER DEFAULT 0,
  avg_open_rate DECIMAL(5,4) DEFAULT 0,
  avg_click_rate DECIMAL(5,4) DEFAULT 0,
  
  -- Metadata
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_email_templates_type ON email_templates(template_type);
CREATE INDEX idx_email_templates_category ON email_templates(template_category);

-- Email Sequences (Drip Campaigns)
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Triggers
  trigger_type VARCHAR(100), -- signup, download, demo_request, trial_start, behavioral
  trigger_conditions JSONB, -- Conditions that start the sequence
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  max_emails INTEGER DEFAULT 10, -- Maximum emails in sequence
  
  -- Performance
  total_started INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  avg_completion_rate DECIMAL(5,4) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  
  -- Content
  template_id UUID REFERENCES email_templates(id),
  subject_line VARCHAR(300),
  
  -- Timing
  delay_days INTEGER DEFAULT 0,
  delay_hours INTEGER DEFAULT 0,
  send_time TIME DEFAULT '09:00:00', -- Time of day to send
  
  -- Conditions
  send_conditions JSONB, -- Additional conditions to send this step
  
  -- Performance
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(sequence_id, step_number)
);

-- Sequence Subscriptions (Track who's in what sequence)
CREATE TABLE email_sequence_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES email_contacts(id),
  sequence_id UUID REFERENCES email_sequences(id),
  
  -- Status
  subscription_status VARCHAR(50) DEFAULT 'active', -- active, paused, completed, unsubscribed
  current_step INTEGER DEFAULT 1,
  
  -- Timing
  started_at TIMESTAMP DEFAULT NOW(),
  next_send_at TIMESTAMP,
  completed_at TIMESTAMP,
  paused_at TIMESTAMP,
  
  -- Tracking
  total_emails_sent INTEGER DEFAULT 0,
  total_emails_opened INTEGER DEFAULT 0,
  total_emails_clicked INTEGER DEFAULT 0,
  
  UNIQUE(contact_id, sequence_id)
);

CREATE INDEX idx_sequence_subs_status_next_send ON email_sequence_subscriptions(subscription_status, next_send_at);
CREATE INDEX idx_sequence_subs_contact_id ON email_sequence_subscriptions(contact_id);
```

---

## DATA IMPORT & PROCESSING PIPELINE

### CSV Import Function with Data Cleaning

```sql
-- Data Import Processing Function
CREATE OR REPLACE FUNCTION import_email_contacts_batch(
  batch_data JSONB,
  import_source VARCHAR(100) DEFAULT 'bulk_import'
) 
RETURNS TABLE (
  imported INTEGER,
  duplicates INTEGER,
  invalid_emails INTEGER,
  errors TEXT[]
) AS $$
DECLARE
  contact_record JSONB;
  imported_count INTEGER := 0;
  duplicate_count INTEGER := 0;
  invalid_count INTEGER := 0;
  error_list TEXT[] := ARRAY[]::TEXT[];
  email_clean VARCHAR(255);
  email_hash_value VARCHAR(64);
BEGIN
  -- Process each contact in the batch
  FOR contact_record IN SELECT * FROM jsonb_array_elements(batch_data)
  LOOP
    BEGIN
      -- Clean and validate email
      email_clean := LOWER(TRIM(contact_record->>'email'));
      
      -- Validate email format
      IF email_clean !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
        invalid_count := invalid_count + 1;
        error_list := error_list || ('Invalid email format: ' || email_clean);
        CONTINUE;
      END IF;
      
      -- Generate email hash for deduplication
      email_hash_value := encode(sha256(email_clean::bytea), 'hex');
      
      -- Insert or update contact
      INSERT INTO email_contacts (
        email,
        email_hash,
        first_name,
        last_name,
        company_name,
        job_title,
        industry,
        company_size,
        country,
        source,
        source_date,
        data_quality_score
      ) VALUES (
        email_clean,
        email_hash_value,
        TRIM(contact_record->>'first_name'),
        TRIM(contact_record->>'last_name'),
        TRIM(contact_record->>'company_name'),
        TRIM(contact_record->>'job_title'),
        TRIM(contact_record->>'industry'),
        TRIM(contact_record->>'company_size'),
        TRIM(contact_record->>'country'),
        import_source,
        CURRENT_DATE,
        -- Calculate data quality score (0-100)
        (CASE WHEN contact_record->>'first_name' IS NOT NULL AND LENGTH(TRIM(contact_record->>'first_name')) > 0 THEN 20 ELSE 0 END) +
        (CASE WHEN contact_record->>'last_name' IS NOT NULL AND LENGTH(TRIM(contact_record->>'last_name')) > 0 THEN 20 ELSE 0 END) +
        (CASE WHEN contact_record->>'company_name' IS NOT NULL AND LENGTH(TRIM(contact_record->>'company_name')) > 0 THEN 25 ELSE 0 END) +
        (CASE WHEN contact_record->>'job_title' IS NOT NULL AND LENGTH(TRIM(contact_record->>'job_title')) > 0 THEN 25 ELSE 0 END) +
        (CASE WHEN contact_record->>'industry' IS NOT NULL AND LENGTH(TRIM(contact_record->>'industry')) > 0 THEN 10 ELSE 0 END)
      )
      ON CONFLICT (email_hash) DO UPDATE SET
        first_name = COALESCE(EXCLUDED.first_name, email_contacts.first_name),
        last_name = COALESCE(EXCLUDED.last_name, email_contacts.last_name),
        company_name = COALESCE(EXCLUDED.company_name, email_contacts.company_name),
        job_title = COALESCE(EXCLUDED.job_title, email_contacts.job_title),
        industry = COALESCE(EXCLUDED.industry, email_contacts.industry),
        company_size = COALESCE(EXCLUDED.company_size, email_contacts.company_size),
        country = COALESCE(EXCLUDED.country, email_contacts.country),
        updated_at = NOW(),
        data_quality_score = GREATEST(
          email_contacts.data_quality_score,
          (CASE WHEN EXCLUDED.first_name IS NOT NULL AND LENGTH(TRIM(EXCLUDED.first_name)) > 0 THEN 20 ELSE 0 END) +
          (CASE WHEN EXCLUDED.last_name IS NOT NULL AND LENGTH(TRIM(EXCLUDED.last_name)) > 0 THEN 20 ELSE 0 END) +
          (CASE WHEN EXCLUDED.company_name IS NOT NULL AND LENGTH(TRIM(EXCLUDED.company_name)) > 0 THEN 25 ELSE 0 END) +
          (CASE WHEN EXCLUDED.job_title IS NOT NULL AND LENGTH(TRIM(EXCLUDED.job_title)) > 0 THEN 25 ELSE 0 END) +
          (CASE WHEN EXCLUDED.industry IS NOT NULL AND LENGTH(TRIM(EXCLUDED.industry)) > 0 THEN 10 ELSE 0 END)
        );
      
      -- Check if this was an insert or update
      IF NOT FOUND THEN
        imported_count := imported_count + 1;
      ELSE
        duplicate_count := duplicate_count + 1;
      END IF;
      
    EXCEPTION
      WHEN OTHERS THEN
        error_list := error_list || ('Error processing ' || (contact_record->>'email') || ': ' || SQLERRM);
    END;
  END LOOP;
  
  -- Return results
  RETURN QUERY SELECT imported_count, duplicate_count, invalid_count, error_list;
END;
$$ LANGUAGE plpgsql;
```

### Automatic Segmentation Engine

```sql
-- Auto-Segmentation Function (runs after import)
CREATE OR REPLACE FUNCTION auto_segment_contacts()
RETURNS INTEGER AS $$
DECLARE
  contacts_processed INTEGER := 0;
  contact_record RECORD;
BEGIN
  -- Process contacts that don't have auto-segments assigned
  FOR contact_record IN 
    SELECT id, job_title, company_size, industry, country
    FROM email_contacts ec
    WHERE NOT EXISTS (
      SELECT 1 FROM email_segments es 
      WHERE es.contact_id = ec.id AND es.auto_assigned = TRUE
    )
    AND subscription_status = 'active'
  LOOP
    -- Job Level Segmentation
    IF contact_record.job_title ILIKE ANY(ARRAY['%CHRO%', '%Chief Human%', '%VP HR%', '%VP People%']) THEN
      INSERT INTO email_segments (contact_id, segment_type, segment_name, segment_value, auto_assigned)
      VALUES (contact_record.id, 'job_level', 'decision_maker', 'c_suite_hr', TRUE)
      ON CONFLICT (contact_id, segment_type, segment_name) DO NOTHING;
      
    ELSIF contact_record.job_title ILIKE ANY(ARRAY['%Director%', '%Head of HR%', '%Head of People%', '%HR Director%']) THEN
      INSERT INTO email_segments (contact_id, segment_type, segment_name, segment_value, auto_assigned)
      VALUES (contact_record.id, 'job_level', 'decision_maker', 'director_level', TRUE)
      ON CONFLICT (contact_id, segment_type, segment_name) DO NOTHING;
      
    ELSIF contact_record.job_title ILIKE ANY(ARRAY['%HR Manager%', '%People Manager%', '%Talent%', '%Recruiting%']) THEN
      INSERT INTO email_segments (contact_id, segment_type, segment_name, segment_value, auto_assigned)
      VALUES (contact_record.id, 'job_level', 'influencer', 'manager_level', TRUE)
      ON CONFLICT (contact_id, segment_type, segment_name) DO NOTHING;
    END IF;
    
    -- Company Size Segmentation
    INSERT INTO email_segments (contact_id, segment_type, segment_name, segment_value, auto_assigned)
    VALUES (contact_record.id, 'firmographic', 'company_size', COALESCE(contact_record.company_size, 'unknown'), TRUE)
    ON CONFLICT (contact_id, segment_type, segment_name) DO NOTHING;
    
    -- Industry Segmentation
    INSERT INTO email_segments (contact_id, segment_type, segment_name, segment_value, auto_assigned)
    VALUES (contact_record.id, 'firmographic', 'industry', COALESCE(contact_record.industry, 'unknown'), TRUE)
    ON CONFLICT (contact_id, segment_type, segment_name) DO NOTHING;
    
    -- Geographic Segmentation
    INSERT INTO email_segments (contact_id, segment_type, segment_name, segment_value, auto_assigned)
    VALUES (contact_record.id, 'geographic', 'country', COALESCE(contact_record.country, 'unknown'), TRUE)
    ON CONFLICT (contact_id, segment_type, segment_name) DO NOTHING;
    
    contacts_processed := contacts_processed + 1;
  END LOOP;
  
  RETURN contacts_processed;
END;
$$ LANGUAGE plpgsql;
```

---

## EMAIL SERVICE PROVIDER INTEGRATION

### SendGrid Integration Functions

```sql
-- SendGrid Campaign Sync
CREATE OR REPLACE FUNCTION sync_sendgrid_campaign(
  campaign_uuid UUID,
  sendgrid_campaign_id VARCHAR(100)
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update campaign with SendGrid ID
  UPDATE email_campaigns 
  SET 
    sendgrid_campaign_id = sendgrid_campaign_id,
    send_status = 'sending',
    sent_at = NOW()
  WHERE id = campaign_uuid;
  
  -- Create webhook endpoint for tracking
  -- This would be handled by application layer
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Process SendGrid Webhooks
CREATE OR REPLACE FUNCTION process_sendgrid_webhook(
  webhook_data JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  event_record JSONB;
  contact_email VARCHAR(255);
  contact_uuid UUID;
  campaign_uuid UUID;
BEGIN
  -- Process each event in webhook
  FOR event_record IN SELECT * FROM jsonb_array_elements(webhook_data)
  LOOP
    -- Extract email and find contact
    contact_email := event_record->>'email';
    
    SELECT id INTO contact_uuid 
    FROM email_contacts 
    WHERE email = contact_email;
    
    -- Find campaign by SendGrid message ID or campaign ID
    SELECT id INTO campaign_uuid
    FROM email_campaigns
    WHERE sendgrid_campaign_id = event_record->>'sg_campaign_id';
    
    -- Insert event
    INSERT INTO email_events (
      contact_id,
      campaign_id,
      event_type,
      event_timestamp,
      email_client,
      device_type,
      ip_address,
      clicked_url,
      sendgrid_message_id
    ) VALUES (
      contact_uuid,
      campaign_uuid,
      event_record->>'event',
      TO_TIMESTAMP((event_record->>'timestamp')::INTEGER),
      event_record->>'useragent',
      CASE 
        WHEN (event_record->>'useragent') ILIKE '%mobile%' THEN 'mobile'
        WHEN (event_record->>'useragent') ILIKE '%tablet%' THEN 'tablet'
        ELSE 'desktop'
      END,
      (event_record->>'ip')::INET,
      event_record->>'url',
      event_record->>'sg_message_id'
    );
    
    -- Update contact engagement
    UPDATE email_contacts 
    SET 
      last_engagement_date = NOW(),
      bounce_count = CASE 
        WHEN event_record->>'event' IN ('bounce', 'dropped') THEN bounce_count + 1 
        ELSE bounce_count 
      END,
      complaint_count = CASE 
        WHEN event_record->>'event' = 'spamreport' THEN complaint_count + 1 
        ELSE complaint_count 
      END,
      subscription_status = CASE 
        WHEN event_record->>'event' = 'unsubscribe' THEN 'unsubscribed'
        WHEN event_record->>'event' = 'spamreport' THEN 'complained'
        ELSE subscription_status
      END
    WHERE id = contact_uuid;
    
    -- Update campaign statistics
    UPDATE email_campaigns SET
      total_opened = total_opened + CASE WHEN event_record->>'event' = 'open' THEN 1 ELSE 0 END,
      total_clicked = total_clicked + CASE WHEN event_record->>'event' = 'click' THEN 1 ELSE 0 END,
      total_bounced = total_bounced + CASE WHEN event_record->>'event' IN ('bounce', 'dropped') THEN 1 ELSE 0 END,
      total_unsubscribed = total_unsubscribed + CASE WHEN event_record->>'event' = 'unsubscribe' THEN 1 ELSE 0 END,
      total_complained = total_complained + CASE WHEN event_record->>'event' = 'spamreport' THEN 1 ELSE 0 END
    WHERE id = campaign_uuid;
    
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

---

## ANALYTICS & REPORTING VIEWS

### Campaign Performance Dashboard

```sql
-- Campaign Performance Summary View
CREATE VIEW campaign_performance_summary AS
SELECT 
  c.id,
  c.campaign_name,
  c.campaign_type,
  c.sent_at,
  c.total_sent,
  c.total_delivered,
  c.total_opened,
  c.total_clicked,
  c.total_unsubscribed,
  c.total_complained,
  c.total_converted,
  c.revenue_generated,
  
  -- Calculate rates
  ROUND((c.total_delivered::decimal / NULLIF(c.total_sent, 0)) * 100, 2) as delivery_rate,
  ROUND((c.total_opened::decimal / NULLIF(c.total_delivered, 0)) * 100, 2) as open_rate,
  ROUND((c.total_clicked::decimal / NULLIF(c.total_delivered, 0)) * 100, 2) as click_rate,
  ROUND((c.total_converted::decimal / NULLIF(c.total_delivered, 0)) * 100, 2) as conversion_rate,
  ROUND((c.total_unsubscribed::decimal / NULLIF(c.total_delivered, 0)) * 100, 2) as unsubscribe_rate,
  
  -- Revenue metrics
  ROUND(c.revenue_generated / NULLIF(c.total_sent, 0), 2) as revenue_per_email,
  ROUND(c.revenue_generated / NULLIF(c.total_converted, 0), 2) as revenue_per_conversion,
  
  -- Engagement scores
  ROUND((c.total_opened::decimal + (c.total_clicked::decimal * 3)) / NULLIF(c.total_delivered, 0), 2) as engagement_score
  
FROM email_campaigns c
WHERE c.send_status = 'sent'
ORDER BY c.sent_at DESC;

-- Segment Performance Analysis
CREATE VIEW segment_performance AS
SELECT 
  s.segment_type,
  s.segment_name,
  s.segment_value,
  COUNT(DISTINCT s.contact_id) as total_contacts,
  
  -- Email activity (last 90 days)
  COUNT(DISTINCT CASE WHEN e.event_type = 'delivered' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN e.contact_id END) as emails_delivered_90d,
  COUNT(DISTINCT CASE WHEN e.event_type = 'opened' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN e.contact_id END) as unique_openers_90d,
  COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN e.contact_id END) as unique_clickers_90d,
  
  -- Engagement rates
  ROUND((COUNT(DISTINCT CASE WHEN e.event_type = 'opened' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN e.contact_id END)::decimal / 
         NULLIF(COUNT(DISTINCT CASE WHEN e.event_type = 'delivered' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN e.contact_id END), 0)) * 100, 2) as open_rate_90d,
  
  ROUND((COUNT(DISTINCT CASE WHEN e.event_type = 'clicked' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN e.contact_id END)::decimal / 
         NULLIF(COUNT(DISTINCT CASE WHEN e.event_type = 'delivered' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN e.contact_id END), 0)) * 100, 2) as click_rate_90d,
  
  -- Lead quality
  AVG(ec.lead_score) as avg_lead_score,
  AVG(ec.customer_fit_score) as avg_customer_fit_score,
  
  -- Revenue attribution (if available)
  COALESCE(SUM(era.monthly_revenue * 12), 0) as attributed_annual_revenue
  
FROM email_segments s
LEFT JOIN email_contacts ec ON s.contact_id = ec.id
LEFT JOIN email_events e ON s.contact_id = e.contact_id
LEFT JOIN email_revenue_attribution era ON s.contact_id = era.contact_id
GROUP BY s.segment_type, s.segment_name, s.segment_value
ORDER BY attributed_annual_revenue DESC, avg_lead_score DESC;

-- Contact Engagement Scoring
CREATE VIEW contact_engagement_scores AS
SELECT 
  ec.id,
  ec.email,
  ec.first_name,
  ec.last_name,
  ec.company_name,
  ec.job_title,
  ec.lead_score,
  
  -- Email engagement (last 90 days)
  COUNT(CASE WHEN e.event_type = 'opened' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN 1 END) as opens_90d,
  COUNT(CASE WHEN e.event_type = 'clicked' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN 1 END) as clicks_90d,
  MAX(CASE WHEN e.event_type IN ('opened', 'clicked') THEN e.event_timestamp END) as last_engagement,
  
  -- Engagement score calculation
  (COUNT(CASE WHEN e.event_type = 'opened' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN 1 END) * 1) +
  (COUNT(CASE WHEN e.event_type = 'clicked' AND e.event_timestamp > NOW() - INTERVAL '90 days' THEN 1 END) * 3) +
  (CASE WHEN MAX(e.event_timestamp) > NOW() - INTERVAL '7 days' THEN 10 ELSE 0 END) as engagement_score,
  
  -- Health indicators
  CASE 
    WHEN MAX(e.event_timestamp) > NOW() - INTERVAL '30 days' THEN 'active'
    WHEN MAX(e.event_timestamp) > NOW() - INTERVAL '90 days' THEN 'moderate'
    WHEN MAX(e.event_timestamp) > NOW() - INTERVAL '180 days' THEN 'low'
    ELSE 'dormant'
  END as engagement_level
  
FROM email_contacts ec
LEFT JOIN email_events e ON ec.id = e.contact_id
WHERE ec.subscription_status = 'active'
GROUP BY ec.id, ec.email, ec.first_name, ec.last_name, ec.company_name, ec.job_title, ec.lead_score
ORDER BY engagement_score DESC, last_engagement DESC;
```

---

## ROW LEVEL SECURITY (RLS) POLICIES

```sql
-- Enable RLS on all tables
ALTER TABLE email_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy for email marketing team access
CREATE POLICY email_marketing_access ON email_contacts
FOR ALL
TO email_marketing_team
USING (true)
WITH CHECK (true);

-- Policy for sales team (read-only access to qualified leads)
CREATE POLICY sales_team_leads ON email_contacts
FOR SELECT
TO sales_team
USING (lead_score >= 50 OR customer_fit_score >= 70);

-- Policy for compliance team (full read access)
CREATE POLICY compliance_read_access ON email_contacts
FOR SELECT
TO compliance_team
USING (true);

-- Policy for analytics team (events access)
CREATE POLICY analytics_events_access ON email_events
FOR SELECT
TO analytics_team
USING (true);
```

---

## IMPLEMENTATION SCRIPT

```bash
#!/bin/bash
# Supabase Email Marketing Setup Script

echo "Setting up BrandOS Email Marketing Database..."

# 1. Create database schema
supabase db push

# 2. Set up RLS policies
psql $DATABASE_URL -f rls_policies.sql

# 3. Create indexes for performance
psql $DATABASE_URL -f performance_indexes.sql

# 4. Set up webhooks for SendGrid
supabase functions deploy sendgrid-webhook

# 5. Create scheduled functions for automation
supabase functions deploy email-automation

echo "Email marketing database setup complete!"
echo "Ready to import 2.5M contacts"
```

This Supabase integration provides enterprise-grade email marketing infrastructure that can handle the 2.5M contact database with high performance, compliance, and detailed analytics.