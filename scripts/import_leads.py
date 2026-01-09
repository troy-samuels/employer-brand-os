#!/usr/bin/env python3
"""
BrandOS: Import 2.5M Leads CSV to Supabase
Processes CSV in chunks and batch inserts to avoid timeouts.
"""

import csv
import os
import sys
import time
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Try to import supabase
try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase package not installed.")
    print("Run: pip install supabase")
    sys.exit(1)

# Configuration
CSV_PATH = "/Users/troysamuels/Glassdoor 2.0/report1754063479110.csv"
BATCH_SIZE = 1000  # Rows per insert (Supabase limit is ~1000)
PROGRESS_INTERVAL = 10000  # Report progress every N rows

# Column mapping: CSV column -> Database column
COLUMN_MAP = {
    "Salutation": "salutation",
    "First Name": "first_name",
    "Last Name": "last_name",
    "Title": "contact_title",
    "Email": "contact_email",
    "Phone": "contact_phone",
    "Mobile": "contact_mobile",
    "Account Name": "company_name",
    "Mailing Street": "address_street",
    "Mailing City": "address_city",
    "Mailing State/Province": "address_state",
    "Mailing Zip/Postal Code": "address_zip",
    "Mailing Country": "address_country",
    "Account Owner": "source",
}

def create_supabase_client() -> Client:
    """Create Supabase client with service key for full access."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env.local")
        sys.exit(1)

    return create_client(url, key)

def map_row(csv_row: dict, import_batch: str) -> dict:
    """Map CSV row to database columns."""
    db_row = {
        "import_batch": import_batch,
        "status": "new",
        "audit_status": "pending",
    }

    for csv_col, db_col in COLUMN_MAP.items():
        value = csv_row.get(csv_col, "").strip()
        # Convert empty strings to None
        db_row[db_col] = value if value else None

    return db_row

def count_csv_rows(filepath: str) -> int:
    """Count total rows in CSV (excluding header)."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        return sum(1 for _ in f) - 1  # Subtract header

def import_leads():
    """Main import function."""
    print("=" * 60)
    print("BrandOS: Leads Import to Supabase")
    print("=" * 60)

    # Check if CSV exists
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV file not found at {CSV_PATH}")
        sys.exit(1)

    # Count total rows
    print(f"\nCounting rows in CSV...")
    total_rows = count_csv_rows(CSV_PATH)
    print(f"Total rows to import: {total_rows:,}")

    # Create Supabase client
    print("\nConnecting to Supabase...")
    supabase = create_supabase_client()
    print("Connected!")

    # Generate import batch ID
    import_batch = f"import_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    print(f"Import batch: {import_batch}")

    # Start import
    print(f"\nStarting import (batch size: {BATCH_SIZE})...")
    print("-" * 60)

    start_time = time.time()
    rows_imported = 0
    rows_failed = 0
    batch = []

    with open(CSV_PATH, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)

        for row in reader:
            # Map row to database format
            db_row = map_row(row, import_batch)
            batch.append(db_row)

            # Insert batch when full
            if len(batch) >= BATCH_SIZE:
                try:
                    supabase.table("leads").insert(batch).execute()
                    rows_imported += len(batch)
                except Exception as e:
                    rows_failed += len(batch)
                    print(f"\nError inserting batch: {e}")

                batch = []

                # Progress report
                if rows_imported % PROGRESS_INTERVAL == 0:
                    elapsed = time.time() - start_time
                    rate = rows_imported / elapsed if elapsed > 0 else 0
                    pct = (rows_imported / total_rows) * 100
                    eta_seconds = (total_rows - rows_imported) / rate if rate > 0 else 0
                    eta_minutes = eta_seconds / 60

                    print(f"Progress: {rows_imported:,} / {total_rows:,} ({pct:.1f}%) | "
                          f"Rate: {rate:.0f} rows/sec | ETA: {eta_minutes:.1f} min")

        # Insert remaining rows
        if batch:
            try:
                supabase.table("leads").insert(batch).execute()
                rows_imported += len(batch)
            except Exception as e:
                rows_failed += len(batch)
                print(f"\nError inserting final batch: {e}")

    # Summary
    elapsed = time.time() - start_time
    print("-" * 60)
    print(f"\nImport Complete!")
    print(f"  Rows imported: {rows_imported:,}")
    print(f"  Rows failed: {rows_failed:,}")
    print(f"  Total time: {elapsed/60:.1f} minutes")
    print(f"  Average rate: {rows_imported/elapsed:.0f} rows/sec")
    print(f"\nImport batch ID: {import_batch}")
    print("=" * 60)

if __name__ == "__main__":
    import_leads()
