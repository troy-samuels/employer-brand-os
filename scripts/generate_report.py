#!/usr/bin/env python3
"""
BrandOS Report Generator - Board-Level Infrastructure Audit

Generates a Professional Diagnostic PDF using WeasyPrint and an HTML/CSS template,
embodying the "Tech Luxury" design system.

Usage:
    python generate_report.py <audit_json_file>
    python generate_report.py --stdin
"""

import sys
import json
import os
from datetime import datetime
from urllib.parse import urlparse
from collections import Counter
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML, CSS

# ============================================================================
# Helper Functions (Data Processing)
# ============================================================================

def extract_domain_from_url(url: str) -> str:
    """Extract clean domain from URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith('www.'):
            domain = domain[4:]
        parts = domain.split('.')
        if len(parts) > 2:
            domain = '.'.join(parts[-2:])
        return domain
    except Exception:
        return 'unknown'

def group_citations_by_domain(citations: list, company_domain: str) -> dict:
    """Group citations by their source domain, excluding official sources."""
    domain_counts = Counter()
    normalized_company = company_domain.lower().replace('www.', '')

    for citation in citations:
        url = citation.get('url', '')
        domain = extract_domain_from_url(url)
        if normalized_company in domain or domain in normalized_company:
            continue
        if domain and domain != 'unknown':
            domain_counts[domain] += 1
    return dict(domain_counts.most_common(6))

def calculate_leak_percentage(citations: list, company_domain: str) -> int:
    """Calculate percentage of citations from non-official sources."""
    if not citations:
        return 100
    normalized_company = company_domain.lower().replace('www.', '')
    leaked = 0
    for citation in citations:
        url = citation.get('url', '')
        domain = extract_domain_from_url(url)
        if normalized_company not in domain and domain not in normalized_company:
            leaked += 1
    return int((leaked / len(citations)) * 100) if citations else 100

def calculate_ad_waste(score: int) -> int:
    """Estimate annual ad waste based on visibility score."""
    return (100 - score) * 500

# ============================================================================
# PDF Generation
# ============================================================================

def generate_report(audit_data: dict, output_path: str = None) -> str:
    """Generate board-level infrastructure audit PDF from an HTML template."""

    script_dir = Path(__file__).parent
    
    # 1. Set up Jinja2 environment
    env = Environment(loader=FileSystemLoader(script_dir))
    template = env.get_template("report_template.html")

    # 2. Prepare data context for the template
    company = audit_data.get('company_domain', 'Unknown')
    score = audit_data.get('visibility_score', 0)
    citations = audit_data.get('citations_list', [])
    timestamp = audit_data.get('audit_timestamp', datetime.now().isoformat())

    try:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        date_str = dt.strftime('%B %d, %Y')
    except Exception:
        date_str = datetime.now().strftime('%B %d, %Y')

    leak_percentage = calculate_leak_percentage(citations, company)
    ad_waste = calculate_ad_waste(score)
    hijacker_domains = group_citations_by_domain(citations, company)

    if score < 50:
        recommendation = (
            'IMMEDIATE ACTION REQUIRED. Your employer brand infrastructure is critically exposed. '
            'AI agents are unable to find structured career data on your domain, resulting in '
            'candidate traffic being redirected to third-party platforms. Deploy BrandOS Smart Pixel '
            'to establish data sovereignty and reclaim your employer brand narrative.'
        )
    elif score < 80:
        recommendation = (
            'ACTION RECOMMENDED. Your employer brand has partial visibility to AI agents. '
            'Missing structured data is causing traffic leakage to competitors and job boards. '
            'Deploy BrandOS Smart Pixel to complete your employer data infrastructure.'
        )
    else:
        recommendation = (
            'MAINTAIN VIGILANCE. Your employer brand infrastructure meets baseline requirements. '
            'Continue monitoring for data drift and third-party hijacking. Consider BrandOS '
            'BrandShield for automated compliance and hallucination detection.'
        )
        
    data_rows_raw = [
        ('Salary Structure', audit_data.get('salary_found', False), 'Legal Risk', 'Conversion Drop'),
        ('Remote Policy', audit_data.get('remote_found', False), 'Candidate Loss', 'Search Visibility'),
        ('Apply Link', audit_data.get('application_url_found', False), 'Conversion Drop', 'Traffic Loss'),
        ('Official Source', audit_data.get('is_official_source', False), 'Brand Risk', 'Trust Deficit'),
    ]

    data_rows_template = [
        {
            "label": label,
            "status": status,
            "impact_text": pass_impact if status else fail_impact,
        }
        for label, status, fail_impact, pass_impact in data_rows_raw
    ]

    context = {
        "company": company.upper(),
        "date_str": date_str,
        "score": score,
        "leak_percentage": leak_percentage,
        "ad_waste_str": f"{ad_waste:,}",
        "hijacker_domains": hijacker_domains,
        "data_rows": data_rows_template,
        "recommendation": recommendation
    }

    # 3. Render HTML
    html_string = template.render(context)

    # 4. Generate PDF using WeasyPrint
    if not output_path:
        safe_company = company.replace('.', '_').replace('/', '_').replace(' ', '_')
        timestamp_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = f'brandos_audit_{safe_company}_{timestamp_str}.pdf'
        
    css_path = script_dir / 'report_style.css'
    
    html = HTML(string=html_string, base_url=str(script_dir))
    css = CSS(filename=css_path)
    html.write_pdf(output_path, stylesheets=[css])
    
    return output_path

def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python generate_report.py <audit_json_file>")
        print("       python generate_report.py --stdin")
        print("\nExample:")
        print("  python run_audit.py stripe.com \"Engineer\" | python generate_report.py --stdin")
        sys.exit(1)

    if sys.argv[1] == '--stdin':
        input_text = sys.stdin.read()
        if 'RAW JSON OUTPUT' in input_text:
            json_start = input_text.find('{', input_text.find('RAW JSON OUTPUT'))
            json_end = input_text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                input_text = input_text[json_start:json_end]
        try:
            audit_data = json.loads(input_text)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        json_file = sys.argv[1]
        if not os.path.exists(json_file):
            print(f"Error: File not found: {json_file}", file=sys.stderr)
            sys.exit(1)
        with open(json_file, 'r') as f:
            audit_data = json.load(f)

    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    print("\n" + "=" * 50)
    print("  BRANDOS INFRASTRUCTURE AUDIT (v2)")
    print("=" * 50)
    print(f"\n  Company:  {audit_data.get('company_domain', 'Unknown')}")
    print(f"  Score:    {audit_data.get('visibility_score', 0)}/100")
    print("\n  Generating audit report with WeasyPrint...")

    try:
        report_path = generate_report(audit_data, output_path)
        print(f"\n  [OK] Report saved: {report_path}")
        print(f"  To open, run: open \"{os.path.abspath(report_path)}\"")
    except Exception as e:
        print(f"\n  [ERROR] Could not generate PDF: {e}", file=sys.stderr)
        print("  Please ensure WeasyPrint and its dependencies (Pango, Cairo) are installed.", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
