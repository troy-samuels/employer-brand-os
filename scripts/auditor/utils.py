"""
Utility functions for BrandOS Auditor.
"""

import re
from urllib.parse import urlparse


def extract_domain(url: str) -> str:
    """
    Extract the base domain from a URL.

    Examples:
        https://stripe.com/jobs/123 -> stripe.com
        https://jobs.lever.co/stripe -> lever.co
        https://boards.greenhouse.io/stripe -> greenhouse.io
    """
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        # Remove www. prefix
        if domain.startswith('www.'):
            domain = domain[4:]
        return domain
    except Exception:
        return ''


def normalize_domain(domain: str) -> str:
    """
    Normalize a domain for comparison.
    Removes protocol, www, and trailing slashes.
    """
    domain = domain.lower().strip()
    # Remove protocol
    domain = re.sub(r'^https?://', '', domain)
    # Remove www.
    if domain.startswith('www.'):
        domain = domain[4:]
    # Remove trailing slash
    domain = domain.rstrip('/')
    return domain


def is_official_source(url: str, company_domain: str) -> bool:
    """
    Check if a URL belongs to the company's official domain.

    Args:
        url: The full URL to check
        company_domain: The company's domain (e.g., 'stripe.com')

    Returns:
        True if the URL is from the company's domain
    """
    url_domain = extract_domain(url)
    normalized_company = normalize_domain(company_domain)

    # Direct match
    if url_domain == normalized_company:
        return True

    # Subdomain match (e.g., jobs.stripe.com matches stripe.com)
    if url_domain.endswith('.' + normalized_company):
        return True

    return False


def detect_salary(text: str) -> bool:
    """
    Detect if salary information is present in the text.
    Looks for currency symbols and salary-related patterns.
    """
    # Currency symbols
    if '$' in text or '£' in text or '€' in text:
        return True

    # Salary keywords with numbers
    salary_patterns = [
        r'\b\d{2,3}[kK]\b',  # 80k, 150K
        r'\bsalary\s*:?\s*\d',
        r'\bcompensation\s*:?\s*\d',
        r'\bpay\s+range',
        r'\bbase\s+salary',
        r'\bOTE\b',  # On Target Earnings
    ]

    for pattern in salary_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def detect_remote_policy(text: str) -> bool:
    """
    Detect if remote work policy is mentioned in the text.
    """
    remote_patterns = [
        r'\bremote\b',
        r'\bhybrid\b',
        r'\bon-?site\b',
        r'\bin-?office\b',
        r'\bwork\s+from\s+home\b',
        r'\bWFH\b',
        r'\bfully\s+distributed\b',
    ]

    for pattern in remote_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True

    return False


def detect_application_url(text: str, company_domain: str) -> bool:
    """
    Detect if a direct application URL is present.
    Looks for URLs that appear to be job application links.
    """
    # Look for URLs in the text
    url_pattern = r'https?://[^\s<>"\']+(?:apply|job|career|position|opening)[^\s<>"\']*'

    matches = re.findall(url_pattern, text, re.IGNORECASE)
    if matches:
        return True

    # Also check for application-related keywords with URLs
    if re.search(r'apply\s+(?:here|now|at|via)', text, re.IGNORECASE):
        return True

    return False


def calculate_visibility_score(
    is_official: bool,
    salary_found: bool,
    remote_found: bool,
    application_url_found: bool
) -> int:
    """
    Calculate a visibility score from 0-100 based on data quality.

    Scoring:
        - Official source: 40 points (most important for trust)
        - Salary found: 20 points
        - Remote policy found: 20 points
        - Application URL found: 20 points

    Returns:
        Integer score from 0 to 100
    """
    score = 0

    if is_official:
        score += 40
    if salary_found:
        score += 20
    if remote_found:
        score += 20
    if application_url_found:
        score += 20

    return score


def categorize_citations(citations: list, company_domain: str) -> list:
    """
    Categorize a list of citation URLs as official or third-party.

    Args:
        citations: List of URL strings
        company_domain: The company's domain

    Returns:
        List of dicts with 'url' and 'is_official' keys
    """
    categorized = []

    for url in citations:
        categorized.append({
            'url': url,
            'is_official': is_official_source(url, company_domain)
        })

    return categorized


def has_any_official_source(citations: list, company_domain: str) -> bool:
    """
    Check if any citation is from the official company domain.
    """
    for url in citations:
        if is_official_source(url, company_domain):
            return True
    return False
