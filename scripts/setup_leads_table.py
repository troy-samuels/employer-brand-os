#!/usr/bin/env python3
"""
BrandOS: Create leads table in Supabase
Run this before import_leads.py
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

try:
    from supabase import create_client
except ImportError:
    print("Error: supabase package not installed.")
    sys.exit(1)

# SQL to create leads table
CREATE_TABLE_SQL = """
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
    status TEXT DEFAULT 'new',
    audit_status TEXT DEFAULT 'pending',
    audit_result JSONB,
    notes TEXT,

    -- Tracking
    source TEXT,
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
"""

def main():
    print("=" * 60)
    print("BrandOS: Create Leads Table in Supabase")
    print("=" * 60)

    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found")
        sys.exit(1)

    print(f"\nConnecting to: {url}")

    supabase = create_client(url, key)

    print("\nCreating leads table...")
    print("(Note: This will DROP existing leads table if it exists)")

    try:
        # Execute SQL via RPC or direct query
        # Supabase Python client doesn't support raw SQL directly,
        # so we'll need to use the REST API or create the table manually

        print("\n" + "=" * 60)
        print("MANUAL STEP REQUIRED")
        print("=" * 60)
        print("\nThe Supabase Python client doesn't support raw SQL.")
        print("Please run the following SQL in your Supabase Dashboard:")
        print("\n1. Go to: https://supabase.com/dashboard")
        print("2. Select your project")
        print("3. Go to SQL Editor")
        print("4. Paste and run this SQL:\n")
        print("-" * 60)
        print(CREATE_TABLE_SQL)
        print("-" * 60)
        print("\nAfter running the SQL, you can run import_leads.py")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
