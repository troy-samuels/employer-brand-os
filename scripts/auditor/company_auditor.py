"""
OpenRole Company Auditor
Forensic tool to analyze how AI agents view a company's career data.
Uses Perplexity API (sonar-reasoning-pro) for real-time web search.
"""

import os
import json
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

from .utils import (
    detect_salary,
    detect_remote_policy,
    detect_application_url,
    calculate_visibility_score,
    categorize_citations,
    has_any_official_source,
)

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env.local'))


class CompanyAuditor:
    """
    Auditor class that interrogates Perplexity AI to analyze
    how AI agents perceive a company's career/job data.
    """

    def __init__(self, api_key: str = None):
        """
        Initialize the CompanyAuditor.

        Args:
            api_key: Perplexity API key. If not provided, reads from
                     PERPLEXITY_API_KEY environment variable.
        """
        self.api_key = api_key or os.getenv("PERPLEXITY_API_KEY")
        self.base_url = "https://api.perplexity.ai/chat/completions"
        self.model = "sonar-reasoning-pro"

        if not self.api_key:
            raise ValueError(
                "Perplexity API key required. Set PERPLEXITY_API_KEY in .env.local "
                "or pass api_key to constructor."
            )

    def _build_system_prompt(self, company_domain: str, role_name: str) -> str:
        """
        Build the system prompt for the Perplexity API.
        Uses the exact prompt specified for forensic job data extraction.
        """
        return (
            f"Act as a highly qualified job seeker. Search specifically on the domain "
            f"{company_domain} for the {role_name} position. Extract the following verbatim: "
            f"1) Salary Range, 2) Remote Policy, 3) The Direct Application URL. "
            f"If you cannot find this data on the official domain, look for it on "
            f"third-party sites and explicitly state the source."
        )

    def _call_perplexity(self, company_domain: str, role_name: str) -> dict:
        """
        Make the API call to Perplexity.

        Returns:
            Raw API response as dict
        """
        system_prompt = self._build_system_prompt(company_domain, role_name)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"Find the {role_name} position at {company_domain}"
                }
            ],
            "temperature": 0.2,
            "max_tokens": 1500,
        }

        response = requests.post(
            self.base_url,
            headers=headers,
            json=payload,
            timeout=60
        )

        response.raise_for_status()
        return response.json()

    def audit_role(self, company_domain: str, role_name: str) -> dict:
        """
        Audit a specific role at a company.

        Analyzes how AI agents (via Perplexity) perceive the company's
        job posting data, checking for salary, remote policy, and
        application URLs.

        Args:
            company_domain: The company's domain (e.g., 'stripe.com')
            role_name: The job title to search for (e.g., 'Software Engineer')

        Returns:
            Structured dict with audit results:
            {
                "company_domain": str,
                "role_name": str,
                "visibility_score": int (0-100),
                "is_official_source": bool,
                "salary_found": bool,
                "remote_found": bool,
                "application_url_found": bool,
                "citations_list": [{"url": str, "is_official": bool}, ...],
                "ai_summary": str,
                "audit_timestamp": str (ISO format)
            }
        """
        try:
            # Call Perplexity API
            response = self._call_perplexity(company_domain, role_name)

            # Extract the AI response text
            ai_summary = ""
            if response.get("choices"):
                ai_summary = response["choices"][0].get("message", {}).get("content", "")

            # Extract citations (URLs the AI referenced)
            citations = response.get("citations", [])

            # Analyze the response
            salary_found = detect_salary(ai_summary)
            remote_found = detect_remote_policy(ai_summary)
            application_url_found = detect_application_url(ai_summary, company_domain)
            is_official = has_any_official_source(citations, company_domain)

            # Calculate visibility score
            visibility_score = calculate_visibility_score(
                is_official=is_official,
                salary_found=salary_found,
                remote_found=remote_found,
                application_url_found=application_url_found
            )

            # Categorize citations
            citations_list = categorize_citations(citations, company_domain)

            return {
                "company_domain": company_domain,
                "role_name": role_name,
                "visibility_score": visibility_score,
                "is_official_source": is_official,
                "salary_found": salary_found,
                "remote_found": remote_found,
                "application_url_found": application_url_found,
                "citations_list": citations_list,
                "ai_summary": ai_summary,
                "audit_timestamp": datetime.now(timezone.utc).isoformat(),
            }

        except requests.exceptions.RequestException as e:
            return {
                "company_domain": company_domain,
                "role_name": role_name,
                "visibility_score": 0,
                "is_official_source": False,
                "salary_found": False,
                "remote_found": False,
                "application_url_found": False,
                "citations_list": [],
                "ai_summary": f"Error: API request failed - {str(e)}",
                "audit_timestamp": datetime.now(timezone.utc).isoformat(),
                "error": str(e),
            }

    def audit_role_json(self, company_domain: str, role_name: str) -> str:
        """
        Audit a role and return results as a JSON string.

        Args:
            company_domain: The company's domain
            role_name: The job title to search for

        Returns:
            JSON string with audit results
        """
        result = self.audit_role(company_domain, role_name)
        return json.dumps(result, indent=2)
