#!/usr/bin/env python3
"""
OpenRole: Execute SQL via Supabase REST API
Uses the pg_meta API endpoint to run raw SQL
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Get the SQL file path
SQL_FILE = os.path.join(os.path.dirname(__file__), 'create_leads_table.sql')

def execute_sql():
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not service_key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found")
        sys.exit(1)

    # Read SQL file
    with open(SQL_FILE, 'r') as f:
        sql = f.read()

    print("=" * 60)
    print("OpenRole: Execute SQL via Supabase")
    print("=" * 60)
    print(f"\nProject URL: {url}")
    print(f"SQL File: {SQL_FILE}")

    # Try the pg_meta endpoint (internal API used by Supabase Studio)
    # This endpoint is available at /pg/query
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json"
    }

    # Try PostgREST RPC endpoint first (if there's an exec_sql function)
    rpc_url = f"{url}/rest/v1/rpc/exec_sql"

    print("\nAttempting to execute SQL...")

    # First, let's try to see if we can at least query the database
    test_url = f"{url}/rest/v1/"
    response = requests.get(test_url, headers=headers)
    print(f"API Connection Test: {response.status_code}")

    if response.status_code == 200:
        print("✓ Connected to Supabase API successfully")

        # Try to list existing tables
        tables_url = f"{url}/rest/v1/"
        response = requests.get(tables_url, headers=headers)
        print(f"\nAvailable endpoints at root: checking...")

        # Check if leads table exists
        leads_url = f"{url}/rest/v1/leads?select=id&limit=1"
        response = requests.get(leads_url, headers=headers)

        if response.status_code == 200:
            print("✓ 'leads' table already exists!")
            return True
        elif response.status_code == 404:
            print("✗ 'leads' table does not exist yet")
        else:
            print(f"  Response: {response.status_code} - {response.text[:200]}")

    print("\n" + "=" * 60)
    print("MANUAL STEP REQUIRED")
    print("=" * 60)
    print("\nThe SQL cannot be executed via the REST API directly.")
    print("Please run the SQL in Supabase Dashboard:")
    print(f"\n1. Go to: {url.replace('.supabase.co', '.supabase.co').replace('https://', 'https://supabase.com/dashboard/project/').split('.')[0]}/sql/new")
    print("   Or: https://supabase.com/dashboard/project/gkjhglqaodxzcqbccybc/sql/new")
    print("\n2. Paste the SQL from: scripts/create_leads_table.sql")
    print("\n3. Click 'Run' to execute")

    return False

if __name__ == "__main__":
    execute_sql()
