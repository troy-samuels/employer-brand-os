#!/usr/bin/env python3
"""
BrandOS Audit Tool - CLI Entry Point

Forensic tool to analyze how AI agents view a company's career data.
Uses Perplexity API (sonar-reasoning-pro) for real-time analysis.

Usage:
    python run_audit.py <company_domain> "<role_name>"

Examples:
    python run_audit.py stripe.com "Software Engineer"
    python run_audit.py openai.com "Research Scientist"
    python run_audit.py figma.com "Product Designer"
"""

import sys
import json
from auditor import CompanyAuditor


def print_banner():
    """Print the BrandOS banner."""
    print("\n" + "=" * 60)
    print("  BRANDOS AUDIT TOOL")
    print("  AI Career Data Forensics")
    print("=" * 60)


def print_usage():
    """Print usage instructions."""
    print_banner()
    print("\nUsage: python run_audit.py <company_domain> \"<role_name>\"")
    print("\nExamples:")
    print("  python run_audit.py stripe.com \"Software Engineer\"")
    print("  python run_audit.py openai.com \"Research Scientist\"")
    print("  python run_audit.py figma.com \"Product Designer\"")
    print("\nThis tool interrogates Perplexity AI to analyze how AI agents")
    print("perceive a company's job posting data, checking for:")
    print("  - Salary information")
    print("  - Remote work policy")
    print("  - Direct application URLs")
    print("  - Source integrity (official vs third-party)")
    print()


def print_results(result: dict):
    """Pretty print the audit results."""
    print("\n" + "=" * 60)
    print("  AUDIT RESULTS")
    print("=" * 60)

    print(f"\nCompany: {result['company_domain']}")
    print(f"Role: {result['role_name']}")
    print(f"Timestamp: {result['audit_timestamp']}")

    print("\n" + "-" * 40)
    print("DATA QUALITY ASSESSMENT")
    print("-" * 40)

    # Visibility Score with visual indicator
    score = result['visibility_score']
    if score >= 80:
        score_indicator = "EXCELLENT"
    elif score >= 60:
        score_indicator = "GOOD"
    elif score >= 40:
        score_indicator = "FAIR"
    else:
        score_indicator = "POOR"

    print(f"Visibility Score: {score}/100 ({score_indicator})")

    # Checklist
    print(f"\n  {'[OK]' if result['is_official_source'] else '[X]'} Official Source")
    print(f"  {'[OK]' if result['salary_found'] else '[X]'} Salary Information")
    print(f"  {'[OK]' if result['remote_found'] else '[X]'} Remote Policy")
    print(f"  {'[OK]' if result['application_url_found'] else '[X]'} Application URL")

    # Citations
    print("\n" + "-" * 40)
    print("CITATIONS")
    print("-" * 40)

    if result['citations_list']:
        for i, citation in enumerate(result['citations_list'], 1):
            source_type = "OFFICIAL" if citation['is_official'] else "THIRD-PARTY"
            print(f"  {i}. [{source_type}] {citation['url'][:60]}...")
    else:
        print("  No citations found")

    # AI Summary
    print("\n" + "-" * 40)
    print("AI SUMMARY")
    print("-" * 40)
    print(result['ai_summary'][:1000] + "..." if len(result.get('ai_summary', '')) > 1000 else result.get('ai_summary', 'No summary available'))

    print("\n" + "=" * 60)


def main():
    """Main entry point."""
    if len(sys.argv) < 3:
        print_usage()
        sys.exit(1)

    company_domain = sys.argv[1]
    role_name = sys.argv[2]

    print_banner()
    print(f"\nAuditing: {role_name} at {company_domain}")
    print("Please wait... (this may take 30-60 seconds)\n")

    try:
        auditor = CompanyAuditor()
        result = auditor.audit_role(company_domain, role_name)

        # Check for errors
        if result.get('error'):
            print(f"\n[ERROR] {result['error']}")
            print("\nPlease check:")
            print("  1. PERPLEXITY_API_KEY is set in .env.local")
            print("  2. Your API key is valid and has credits")
            sys.exit(1)

        # Print results
        print_results(result)

        # Also output raw JSON for programmatic use
        print("\n" + "-" * 40)
        print("RAW JSON OUTPUT")
        print("-" * 40)
        print(json.dumps(result, indent=2))

    except ValueError as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n\nAudit cancelled.")
        sys.exit(0)


if __name__ == '__main__':
    main()
