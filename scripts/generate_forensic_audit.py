#!/usr/bin/env python3
"""
OpenRole Forensic Audit Generator

Complete lead generation tool that:
1. Interrogates Perplexity AI (sonar-reasoning-pro) for career data
2. Analyzes traffic hijacking by third-party job boards
3. Generates a board-level PDF audit report

Usage:
    python generate_forensic_audit.py <domain> "<role>"

Examples:
    python generate_forensic_audit.py buffer.com "Software Engineer"
    python generate_forensic_audit.py stripe.com "Product Designer"
    python generate_forensic_audit.py notion.so "Engineering Manager"

Environment:
    PERPLEXITY_API_KEY - Required. Set in .env.local or environment.
"""

import sys
import os
import re
import json
import requests
from datetime import datetime, timezone
from urllib.parse import urlparse
from collections import Counter
from dotenv import load_dotenv
from fpdf import FPDF
from fpdf.enums import XPos, YPos


# ============================================================================
# CONFIGURATION
# ============================================================================

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Perplexity API
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')
PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions'
PERPLEXITY_MODEL = 'sonar-reasoning-pro'

# Known job board hijackers
KNOWN_HIJACKERS = [
    'indeed.com',
    'glassdoor.com',
    'ziprecruiter.com',
    'linkedin.com',
    'lever.co',
    'greenhouse.io',
    'ashbyhq.com',
    'workday.com',
    'smartrecruiters.com',
    'welcometothejungle.com',
    '4dayweek.io',
    'nodesk.co',
    'remoteok.com',
    'weworkremotely.com',
    'angel.co',
    'wellfound.com',
    'builtin.com',
    'dice.com',
    'monster.com',
    'careerbuilder.com',
]


# ============================================================================
# DESIGN SYSTEM - Silent Luxury / Swiss Style
# ============================================================================

COLORS = {
    'black': (0, 0, 0),
    'white': (255, 255, 255),
    'dark_gray': (51, 53, 51),
    'medium_gray': (107, 114, 128),
    'light_gray': (229, 231, 235),
    'critical_red': (220, 38, 38),
    'pass_green': (5, 150, 105),
}

FONT_FAMILY = 'Helvetica'
LINE_WEIGHT_HEAVY = 1.5
LINE_WEIGHT_LIGHT = 0.5

PAGE_WIDTH = 210
PAGE_HEIGHT = 297
MARGIN_LEFT = 20
MARGIN_RIGHT = 20
CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT


# ============================================================================
# PERPLEXITY API
# ============================================================================

def build_prompt(domain: str, role: str) -> str:
    """Build the forensic audit prompt for Perplexity."""
    return (
        f"Act as a highly qualified job seeker researching {domain}. "
        f"Search specifically for the {role} position. "
        f"Extract and report the following information verbatim:\n\n"
        f"1. SALARY RANGE - The exact compensation or salary band\n"
        f"2. REMOTE POLICY - Remote, Hybrid, On-site, or specific location requirements\n"
        f"3. DIRECT APPLICATION URL - The link to apply for this role\n\n"
        f"IMPORTANT: Provide citations for every piece of information. "
        f"If data is not available on the official {domain} website, "
        f"check third-party sources (Indeed, Glassdoor, LinkedIn) and "
        f"explicitly state which source you used."
    )


def call_perplexity(domain: str, role: str) -> dict:
    """
    Call Perplexity API to gather career data.

    Returns:
        dict with 'content' (AI response) and 'citations' (list of URLs)
    """
    if not PERPLEXITY_API_KEY:
        raise ValueError(
            "PERPLEXITY_API_KEY not found. "
            "Set it in .env.local or as an environment variable."
        )

    headers = {
        'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
        'Content-Type': 'application/json',
    }

    payload = {
        'model': PERPLEXITY_MODEL,
        'messages': [
            {
                'role': 'system',
                'content': build_prompt(domain, role)
            },
            {
                'role': 'user',
                'content': f'Find {role} position details at {domain}'
            }
        ],
        'temperature': 0.2,
        'max_tokens': 1500,
    }

    print(f"  Querying Perplexity AI ({PERPLEXITY_MODEL})...")

    response = requests.post(
        PERPLEXITY_URL,
        headers=headers,
        json=payload,
        timeout=90
    )
    response.raise_for_status()

    data = response.json()

    content = ''
    if data.get('choices'):
        content = data['choices'][0].get('message', {}).get('content', '')

    citations = data.get('citations', [])

    return {
        'content': content,
        'citations': citations
    }


# ============================================================================
# ANALYSIS ENGINE
# ============================================================================

def extract_domain(url: str) -> str:
    """Extract clean base domain from URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith('www.'):
            domain = domain[4:]
        # Simplify to base domain
        parts = domain.split('.')
        if len(parts) > 2:
            domain = '.'.join(parts[-2:])
        return domain
    except Exception:
        return ''


def normalize_domain(domain: str) -> str:
    """Normalize domain for comparison."""
    domain = domain.lower().strip()
    domain = re.sub(r'^https?://', '', domain)
    if domain.startswith('www.'):
        domain = domain[4:]
    return domain.rstrip('/')


def is_official_source(url: str, company_domain: str) -> bool:
    """Check if URL belongs to the company's official domain."""
    url_domain = extract_domain(url)
    normalized_company = normalize_domain(company_domain)

    if url_domain == normalized_company:
        return True
    if url_domain.endswith('.' + normalized_company):
        return True
    if normalized_company in url_domain:
        return True

    return False


def identify_hijackers(citations: list, company_domain: str) -> dict:
    """
    Identify third-party domains hijacking traffic.

    Returns:
        dict mapping domain -> citation count
    """
    hijacker_counts = Counter()
    normalized_company = normalize_domain(company_domain)

    for url in citations:
        domain = extract_domain(url)

        # Skip official sources
        if normalized_company in domain or domain in normalized_company:
            continue

        # Check if it's a known hijacker or any third-party
        if domain:
            hijacker_counts[domain] += 1

    return dict(hijacker_counts.most_common(10))


def detect_salary(text: str) -> bool:
    """Detect if salary information is present."""
    if '$' in text or '£' in text or '€' in text:
        return True

    patterns = [
        r'\b\d{2,3}[kK]\b',
        r'\bsalary\s*:?\s*\d',
        r'\bcompensation\s*:?\s*\d',
        r'\bpay\s+range',
        r'\bbase\s+salary',
        r'\bOTE\b',
    ]

    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


def detect_remote(text: str) -> bool:
    """Detect if remote policy is mentioned."""
    patterns = [
        r'\bremote\b',
        r'\bhybrid\b',
        r'\bon-?site\b',
        r'\bin-?office\b',
        r'\bwork\s+from\s+home\b',
        r'\bWFH\b',
        r'\bfully\s+distributed\b',
    ]

    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False


def detect_apply_url(text: str) -> bool:
    """Detect if application URL is present."""
    url_pattern = r'https?://[^\s<>"\']+(?:apply|job|career|position|opening)[^\s<>"\']*'
    if re.findall(url_pattern, text, re.IGNORECASE):
        return True
    if re.search(r'apply\s+(?:here|now|at|via)', text, re.IGNORECASE):
        return True
    return False


def calculate_visibility_score(
    has_official: bool,
    has_salary: bool,
    has_remote: bool,
    has_apply_url: bool
) -> int:
    """
    Calculate visibility score (0-100).

    Scoring:
        - Official source found: 40 points
        - Salary data found: 20 points
        - Remote policy found: 20 points
        - Apply URL found: 20 points
    """
    score = 0
    if has_official:
        score += 40
    if has_salary:
        score += 20
    if has_remote:
        score += 20
    if has_apply_url:
        score += 20
    return score


def calculate_leak_percentage(citations: list, company_domain: str) -> int:
    """Calculate what percentage of citations are from third parties."""
    if not citations:
        return 100

    leaked = sum(
        1 for url in citations
        if not is_official_source(url, company_domain)
    )

    return int((leaked / len(citations)) * 100)


def calculate_traffic_tax(score: int) -> int:
    """Estimate annual 'traffic tax' based on visibility score."""
    return (100 - score) * 500


def run_analysis(domain: str, role: str) -> dict:
    """
    Run complete forensic analysis.

    Returns:
        dict with all audit data
    """
    # Call Perplexity
    response = call_perplexity(domain, role)
    content = response['content']
    citations = response['citations']

    print(f"  Received {len(citations)} citations")
    print(f"  Analyzing traffic patterns...")

    # Analyze
    has_official = any(is_official_source(url, domain) for url in citations)
    has_salary = detect_salary(content)
    has_remote = detect_remote(content)
    has_apply_url = detect_apply_url(content)

    visibility_score = calculate_visibility_score(
        has_official, has_salary, has_remote, has_apply_url
    )

    leak_percentage = calculate_leak_percentage(citations, domain)
    traffic_tax = calculate_traffic_tax(visibility_score)
    hijackers = identify_hijackers(citations, domain)

    return {
        'domain': domain,
        'role': role,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'ai_summary': content,
        'citations': citations,
        'visibility_score': visibility_score,
        'has_official_source': has_official,
        'has_salary': has_salary,
        'has_remote': has_remote,
        'has_apply_url': has_apply_url,
        'leak_percentage': leak_percentage,
        'traffic_tax': traffic_tax,
        'hijackers': hijackers,
    }


# ============================================================================
# PDF REPORT GENERATOR - Swiss / Financial Audit Style
# ============================================================================

class ForensicAuditPDF(FPDF):
    """Board-level forensic audit PDF."""

    def header(self):
        pass

    def footer(self):
        self.set_y(-20)
        self.set_draw_color(*COLORS['dark_gray'])
        self.set_line_width(LINE_WEIGHT_LIGHT)
        self.line(MARGIN_LEFT, self.get_y(), PAGE_WIDTH - MARGIN_RIGHT, self.get_y())

        self.set_y(-15)
        self.set_font(FONT_FAMILY, '', 8)
        self.set_text_color(*COLORS['medium_gray'])
        self.cell(0, 5, 'Audit generated by OpenRole. Proprietary Analysis.', align='C')


def generate_pdf(audit: dict, output_path: str = None) -> str:
    """Generate the forensic audit PDF."""

    pdf = ForensicAuditPDF()
    pdf.set_auto_page_break(auto=True, margin=25)
    pdf.add_page()

    domain = audit['domain']
    role = audit['role']
    score = audit['visibility_score']
    leak_pct = audit['leak_percentage']
    traffic_tax = audit['traffic_tax']
    hijackers = audit['hijackers']

    # Parse date
    try:
        dt = datetime.fromisoformat(audit['timestamp'].replace('Z', '+00:00'))
        date_str = dt.strftime('%B %d, %Y')
    except Exception:
        date_str = datetime.now().strftime('%B %d, %Y')

    # =========================================================================
    # HEADER - Solid Black Bar
    # =========================================================================
    header_height = 28
    pdf.set_fill_color(*COLORS['black'])
    pdf.rect(0, 0, PAGE_WIDTH, header_height, 'F')

    pdf.set_xy(MARGIN_LEFT, 10)
    pdf.set_font(FONT_FAMILY, 'B', 11)
    pdf.set_text_color(*COLORS['white'])
    pdf.cell(100, 8, 'OPENROLE INFRASTRUCTURE AUDIT')

    pdf.set_xy(PAGE_WIDTH - MARGIN_RIGHT - 80, 7)
    pdf.set_font(FONT_FAMILY, '', 9)
    pdf.cell(80, 5, date_str, align='R', new_x=XPos.RIGHT, new_y=YPos.NEXT)
    pdf.set_xy(PAGE_WIDTH - MARGIN_RIGHT - 80, 14)
    pdf.set_font(FONT_FAMILY, 'B', 9)
    pdf.cell(80, 5, domain.upper(), align='R')

    pdf.set_y(header_height + 12)

    # Role subtitle
    pdf.set_x(MARGIN_LEFT)
    pdf.set_font(FONT_FAMILY, '', 10)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.cell(0, 5, f'Role Analyzed: {role}', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(8)

    # =========================================================================
    # EXECUTIVE SUMMARY - Three Stat Boxes
    # =========================================================================
    pdf.set_font(FONT_FAMILY, '', 9)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.set_x(MARGIN_LEFT)
    pdf.cell(0, 5, 'EXECUTIVE SUMMARY', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)
    pdf.set_draw_color(*COLORS['dark_gray'])
    pdf.set_line_width(LINE_WEIGHT_HEAVY)
    pdf.line(MARGIN_LEFT, pdf.get_y(), PAGE_WIDTH - MARGIN_RIGHT, pdf.get_y())

    pdf.ln(8)

    box_width = (CONTENT_WIDTH - 10) / 3
    box_height = 38
    box_y = pdf.get_y()

    pdf.set_line_width(LINE_WEIGHT_LIGHT)
    pdf.set_draw_color(*COLORS['light_gray'])

    # Box A: Visibility Score
    box_a_x = MARGIN_LEFT
    pdf.rect(box_a_x, box_y, box_width, box_height)

    pdf.set_xy(box_a_x + 5, box_y + 4)
    pdf.set_font(FONT_FAMILY, '', 8)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.cell(box_width - 10, 4, 'AI VISIBILITY SCORE')

    pdf.set_xy(box_a_x + 5, box_y + 12)
    pdf.set_font(FONT_FAMILY, 'B', 28)
    if score < 50:
        pdf.set_text_color(*COLORS['critical_red'])
    else:
        pdf.set_text_color(*COLORS['dark_gray'])
    pdf.cell(box_width - 10, 12, str(score))

    if score < 50:
        pdf.set_xy(box_a_x + 5, box_y + 28)
        pdf.set_font(FONT_FAMILY, 'B', 9)
        pdf.set_text_color(*COLORS['critical_red'])
        pdf.cell(box_width - 10, 5, 'CRITICAL')

    # Box B: Traffic Leak
    box_b_x = MARGIN_LEFT + box_width + 5
    pdf.rect(box_b_x, box_y, box_width, box_height)

    pdf.set_xy(box_b_x + 5, box_y + 4)
    pdf.set_font(FONT_FAMILY, '', 8)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.cell(box_width - 10, 4, 'TRAFFIC LEAK')

    pdf.set_xy(box_b_x + 5, box_y + 12)
    pdf.set_font(FONT_FAMILY, 'B', 28)
    if leak_pct > 50:
        pdf.set_text_color(*COLORS['critical_red'])
    else:
        pdf.set_text_color(*COLORS['dark_gray'])
    pdf.cell(box_width - 10, 12, f'{leak_pct}%')

    pdf.set_xy(box_b_x + 5, box_y + 28)
    pdf.set_font(FONT_FAMILY, '', 9)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.cell(box_width - 10, 5, 'Leaked to 3rd Party')

    # Box C: Traffic Tax
    box_c_x = MARGIN_LEFT + (box_width + 5) * 2
    pdf.rect(box_c_x, box_y, box_width, box_height)

    pdf.set_xy(box_c_x + 5, box_y + 4)
    pdf.set_font(FONT_FAMILY, '', 8)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.cell(box_width - 10, 4, 'EST. TRAFFIC TAX')

    pdf.set_xy(box_c_x + 5, box_y + 12)
    pdf.set_font(FONT_FAMILY, 'B', 28)
    pdf.set_text_color(*COLORS['critical_red'])
    pdf.cell(box_width - 10, 12, f'${traffic_tax:,}')

    pdf.set_xy(box_c_x + 5, box_y + 28)
    pdf.set_font(FONT_FAMILY, '', 9)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.cell(box_width - 10, 5, 'per year')

    pdf.set_y(box_y + box_height + 20)

    # =========================================================================
    # TRAFFIC LEAK ANALYSIS
    # =========================================================================
    pdf.set_font(FONT_FAMILY, '', 9)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.set_x(MARGIN_LEFT)
    pdf.cell(0, 5, 'TRAFFIC LEAK ANALYSIS', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)
    pdf.set_draw_color(*COLORS['dark_gray'])
    pdf.set_line_width(LINE_WEIGHT_HEAVY)
    pdf.line(MARGIN_LEFT, pdf.get_y(), PAGE_WIDTH - MARGIN_RIGHT, pdf.get_y())

    pdf.ln(8)

    if hijackers:
        for hijacker_domain, count in hijackers.items():
            pdf.set_x(MARGIN_LEFT)
            pdf.set_text_color(*COLORS['dark_gray'])
            pdf.set_font(FONT_FAMILY, 'B', 10)

            # Capitalize domain nicely
            display_domain = hijacker_domain.replace('.com', '').replace('.io', '').replace('.co', '').title()
            pdf.cell(60, 7, display_domain)

            pdf.set_font(FONT_FAMILY, '', 10)
            pdf.set_text_color(*COLORS['critical_red'])
            citation_text = 'Citation' if count == 1 else 'Citations'
            pdf.cell(0, 7, f'{count} {citation_text} - Hijacking Candidate Traffic',
                     new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.ln(5)
        pdf.set_x(MARGIN_LEFT)
        pdf.set_font(FONT_FAMILY, 'I', 9)
        pdf.set_text_color(*COLORS['medium_gray'])
        pdf.multi_cell(CONTENT_WIDTH, 5,
            'These platforms are intercepting candidates who searched for your company. '
            'You are paying a "traffic tax" to third-party job boards.')
    else:
        pdf.set_x(MARGIN_LEFT)
        pdf.set_font(FONT_FAMILY, '', 10)
        pdf.set_text_color(*COLORS['pass_green'])
        pdf.cell(0, 7, 'No third-party traffic hijacking detected.',
                 new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(15)

    # =========================================================================
    # DATA INTEGRITY AUDIT
    # =========================================================================
    pdf.set_font(FONT_FAMILY, '', 9)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.set_x(MARGIN_LEFT)
    pdf.cell(0, 5, 'DATA INTEGRITY AUDIT', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)
    pdf.set_draw_color(*COLORS['dark_gray'])
    pdf.set_line_width(LINE_WEIGHT_HEAVY)
    pdf.line(MARGIN_LEFT, pdf.get_y(), PAGE_WIDTH - MARGIN_RIGHT, pdf.get_y())

    pdf.ln(5)

    # Table header
    col1 = 80
    col2 = 40
    col3 = 50

    pdf.set_font(FONT_FAMILY, 'B', 9)
    pdf.set_text_color(*COLORS['dark_gray'])
    pdf.set_x(MARGIN_LEFT)
    pdf.cell(col1, 8, 'DATA POINT')
    pdf.cell(col2, 8, 'STATUS', align='C')
    pdf.cell(col3, 8, 'IMPACT', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_line_width(LINE_WEIGHT_LIGHT)
    pdf.set_draw_color(*COLORS['light_gray'])
    pdf.line(MARGIN_LEFT, pdf.get_y(), PAGE_WIDTH - MARGIN_RIGHT, pdf.get_y())

    pdf.ln(2)

    data_rows = [
        ('Salary Structure', audit['has_salary'], 'Pay Transparency Risk', 'Compliant'),
        ('Remote Policy', audit['has_remote'], 'Candidate Drop-off', 'Clear Expectations'),
        ('Apply Link', audit['has_apply_url'], 'Conversion Loss', 'Direct Pipeline'),
        ('Official Source', audit['has_official_source'], 'Brand Dilution', 'Source of Truth'),
    ]

    pdf.set_font(FONT_FAMILY, '', 10)

    for label, status, fail_impact, pass_impact in data_rows:
        pdf.set_x(MARGIN_LEFT)
        pdf.set_text_color(*COLORS['dark_gray'])
        pdf.cell(col1, 10, label)

        if status:
            pdf.set_text_color(*COLORS['pass_green'])
            pdf.set_font(FONT_FAMILY, 'B', 10)
            pdf.cell(col2, 10, 'PASS', align='C')
            impact = pass_impact
        else:
            pdf.set_text_color(*COLORS['critical_red'])
            pdf.set_font(FONT_FAMILY, 'B', 10)
            pdf.cell(col2, 10, 'FAIL', align='C')
            impact = fail_impact

        pdf.set_font(FONT_FAMILY, '', 10)
        pdf.set_text_color(*COLORS['medium_gray'])
        pdf.cell(col3, 10, impact, align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.set_draw_color(*COLORS['light_gray'])
        pdf.line(MARGIN_LEFT, pdf.get_y(), PAGE_WIDTH - MARGIN_RIGHT, pdf.get_y())

    pdf.ln(20)

    # =========================================================================
    # RECOMMENDATION
    # =========================================================================
    pdf.set_font(FONT_FAMILY, '', 9)
    pdf.set_text_color(*COLORS['medium_gray'])
    pdf.set_x(MARGIN_LEFT)
    pdf.cell(0, 5, 'RECOMMENDATION', new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)
    pdf.set_draw_color(*COLORS['dark_gray'])
    pdf.set_line_width(LINE_WEIGHT_HEAVY)
    pdf.line(MARGIN_LEFT, pdf.get_y(), PAGE_WIDTH - MARGIN_RIGHT, pdf.get_y())

    pdf.ln(8)

    pdf.set_x(MARGIN_LEFT)
    pdf.set_font(FONT_FAMILY, '', 10)
    pdf.set_text_color(*COLORS['dark_gray'])

    if score < 50:
        rec = (
            'IMMEDIATE ACTION REQUIRED. Your employer brand infrastructure is critically exposed. '
            f'AI agents cannot find structured career data on {domain}, causing {leak_pct}% of '
            'candidate traffic to be redirected to third-party platforms. Deploy OpenRole Smart Pixel '
            'to establish data sovereignty and eliminate the traffic tax.'
        )
    elif score < 80:
        rec = (
            'ACTION RECOMMENDED. Your employer brand has partial AI visibility. '
            'Missing structured data is causing traffic leakage to job boards. '
            'Deploy OpenRole Smart Pixel to complete your employer data infrastructure '
            'and reclaim candidate traffic.'
        )
    else:
        rec = (
            'MAINTAIN VIGILANCE. Your employer brand infrastructure meets baseline requirements. '
            'Continue monitoring for data drift and third-party hijacking. Consider OpenRole '
            'BrandShield for automated compliance monitoring and hallucination detection.'
        )

    pdf.multi_cell(CONTENT_WIDTH, 6, rec)

    # =========================================================================
    # SAVE
    # =========================================================================
    if not output_path:
        safe_domain = domain.replace('.', '_').replace('/', '_')
        ts = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_path = f'forensic_audit_{safe_domain}_{ts}.pdf'

    pdf.output(output_path)
    return output_path


# ============================================================================
# CLI
# ============================================================================

def print_banner():
    print()
    print("=" * 60)
    print("  OPENROLE FORENSIC AUDIT")
    print("  Traffic Tax Analysis & Lead Generation")
    print("=" * 60)


def print_usage():
    print_banner()
    print()
    print("Usage: python generate_forensic_audit.py <domain> \"<role>\"")
    print()
    print("Examples:")
    print("  python generate_forensic_audit.py buffer.com \"Software Engineer\"")
    print("  python generate_forensic_audit.py stripe.com \"Product Designer\"")
    print("  python generate_forensic_audit.py notion.so \"Engineering Manager\"")
    print()
    print("Environment:")
    print("  PERPLEXITY_API_KEY - Required. Set in .env.local")
    print()


def main():
    if len(sys.argv) < 3:
        print_usage()
        sys.exit(1)

    domain = sys.argv[1]
    role = sys.argv[2]

    print_banner()
    print()
    print(f"  Target:  {domain}")
    print(f"  Role:    {role}")
    print()

    try:
        # Run analysis
        print("  [1/3] Running AI forensic analysis...")
        audit = run_analysis(domain, role)

        # Print summary
        print()
        print(f"  [2/3] Analysis complete")
        print(f"        Visibility Score: {audit['visibility_score']}/100", end='')
        if audit['visibility_score'] < 50:
            print(" (CRITICAL)")
        else:
            print()
        print(f"        Traffic Leak: {audit['leak_percentage']}%")
        print(f"        Traffic Tax: ${audit['traffic_tax']:,}/year")
        print(f"        Hijackers: {len(audit['hijackers'])} platforms")

        # Generate PDF
        print()
        print("  [3/3] Generating PDF report...")
        pdf_path = generate_pdf(audit)

        print()
        print("=" * 60)
        print(f"  [OK] Audit saved: {pdf_path}")
        print()
        print(f"  Open: open \"{pdf_path}\"")
        print("=" * 60)
        print()

        # Also save JSON for programmatic use
        json_path = pdf_path.replace('.pdf', '.json')
        with open(json_path, 'w') as f:
            json.dump(audit, f, indent=2)

    except requests.exceptions.RequestException as e:
        print()
        print(f"  [ERROR] API request failed: {e}")
        print()
        print("  Check:")
        print("    1. PERPLEXITY_API_KEY is set in .env.local")
        print("    2. Your API key is valid and has credits")
        print("    3. You have internet connectivity")
        sys.exit(1)

    except ValueError as e:
        print()
        print(f"  [ERROR] {e}")
        sys.exit(1)

    except KeyboardInterrupt:
        print()
        print("  Audit cancelled.")
        sys.exit(0)


if __name__ == '__main__':
    main()
