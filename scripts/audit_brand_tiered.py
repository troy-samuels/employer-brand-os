#!/usr/bin/env python3
"""
BrandOS - Two-Tier Reputation Audit System
OUTREACH mode: Free models for lead generation
CLIENT mode: Premium models for paying customers
"""

import os
import sys
import re
import json
import time
import random
from datetime import datetime
from openai import OpenAI
from duckduckgo_search import DDGS
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Configure OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# ============================================================================
# MODEL STACKS - Two Tiers for Cost Control
# ============================================================================

MODEL_STACKS = {
    "OUTREACH": [
        {
            "id": "google/gemini-1.5-flash",
            "name": "Google Gemini Flash",
            "perspective": "Google Perspective",
            "cost": "FREE"
        },
        {
            "id": "meta-llama/llama-3.3-70b-instruct",
            "name": "Meta Llama 3.3 70B",
            "perspective": "Meta/Open Perspective",
            "cost": "~$0.001"
        },
        {
            "id": "mistralai/mistral-small-24b-instruct-2501:free",
            "name": "Mistral Small",
            "perspective": "European Perspective",
            "cost": "FREE"
        }
    ],
    "CLIENT": [
        {
            "id": "google/gemini-3-pro",
            "name": "Google Gemini 1.5 Pro",
            "perspective": "Deep Google Analysis",
            "cost": "$$"
        },
        {
            "id": "openai/gpt-4o",
            "name": "OpenAI GPT-4o",
            "perspective": "Industry Standard",
            "cost": "$$$"
        },
        {
            "id": "anthropic/claude-3.5-sonnet",
            "name": "Anthropic Claude 3.5 Sonnet",
            "perspective": "Nuanced Reasoning",
            "cost": "$$$"
        },
        {
            "id": "perplexity/sonar-reasoning",
            "name": "Perplexity Sonar",
            "perspective": "Deep Search + Citations",
            "cost": "$$"
        },
        {
            "id": "meta-llama/llama-3.1-405b-instruct",
            "name": "Meta Llama 3.1 405B",
            "perspective": "Massive Open Intelligence",
            "cost": "$$"
        }
    ]
}

# ============================================================================
# SEARCH FUNCTION
# ============================================================================

def get_search_data(company_name: str) -> str:
    """
    Fetch recent search data about a company using DuckDuckGo.
    Returns combined snippets from reviews, news, and discussions.
    """
    queries = [
        f'"{company_name}" employee reviews',
        f'"{company_name}" workplace complaints reddit',
        f'"{company_name}" glassdoor reviews'
    ]

    all_snippets = []

    print(f"\n[SEARCH] Gathering intelligence on {company_name}...")

    for query in queries:
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=5))

            for r in results:
                snippet = f"- {r.get('title', '')}: {r.get('body', '')}"
                all_snippets.append(snippet)

            # Anti-rate-limit delay
            delay = random.uniform(3, 5)
            time.sleep(delay)

        except Exception as e:
            print(f"[!] Search warning: {e}")
            time.sleep(5)

    if not all_snippets:
        return "No search data available."

    print(f"[+] Collected {len(all_snippets)} data points")
    return "\n".join(all_snippets[:15])  # Cap at 15 snippets


# ============================================================================
# AUDIT FUNCTION
# ============================================================================

def query_model(model: dict, company_name: str, search_data: str) -> dict:
    """
    Query a single model for reputation analysis.
    Returns a dict with model info and response.
    """
    system_prompt = """You are a Reputation Risk Auditor for employer brands.
Based on the search results provided, identify the SINGLE BIGGEST reputation threat for this company.
Be specific (e.g., "Low wages" not "compensation issues").
If no significant threats found, respond with exactly: "Clean"
Keep your response under 100 words."""

    user_prompt = f"""Company: {company_name}

Search Intelligence:
{search_data}

What is the single biggest reputation threat for {company_name} as an employer?"""

    try:
        response = client.chat.completions.create(
            model=model["id"],
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=200
        )
        return {
            "model": model["name"],
            "perspective": model["perspective"],
            "cost": model["cost"],
            "response": response.choices[0].message.content,
            "status": "success"
        }

    except Exception as e:
        return {
            "model": model["name"],
            "perspective": model["perspective"],
            "cost": model["cost"],
            "response": f"Model unavailable: {str(e)[:50]}",
            "status": "error"
        }


def audit_company(company_name: str, mode: str = "OUTREACH") -> dict:
    """
    Run a full audit using the specified model stack.
    Returns a dict with all model responses.
    """
    if not os.getenv("OPENROUTER_API_KEY"):
        print("[!] ERROR: OPENROUTER_API_KEY not found in .env.local")
        sys.exit(1)

    models = MODEL_STACKS.get(mode, MODEL_STACKS["OUTREACH"])

    print(f"\n{'='*60}")
    print(f"  BRANDOS REPUTATION AUDIT")
    print(f"  Company: {company_name}")
    print(f"  Mode: {mode} ({len(models)} models)")
    print(f"{'='*60}")

    # Step 1: Gather search intelligence
    search_data = get_search_data(company_name)

    # Step 2: Query each model
    results = {
        "company": company_name,
        "mode": mode,
        "timestamp": datetime.now().isoformat(),
        "search_data": search_data,
        "model_responses": []
    }

    print(f"\n[ANALYSIS] Querying {len(models)} AI models...")

    for i, model in enumerate(models, 1):
        print(f"  [{i}/{len(models)}] {model['name']} ({model['cost']})...", end=" ")

        response = query_model(model, company_name, search_data)
        results["model_responses"].append(response)

        if response["status"] == "success":
            if "clean" in response["response"].lower():
                print("✅ Clean")
            else:
                print("🚩 Flag found")
        else:
            print("⚠️ Error")

        # Brief delay between models
        time.sleep(1)

    return results


# ============================================================================
# SAVE FUNCTIONS
# ============================================================================

def sanitize_filename(name: str) -> str:
    """Convert company name to safe filename."""
    return re.sub(r'[^\w\s-]', '', name).replace(' ', '_')


def save_outreach_report(results: dict) -> str:
    """Save a simple lead report for OUTREACH mode."""
    company = results["company"]
    filename = f"{sanitize_filename(company)}_lead.txt"
    filepath = os.path.join(os.path.dirname(__file__), 'leads', filename)

    with open(filepath, 'w') as f:
        f.write(f"LEAD INTEL: {company}\n")
        f.write(f"Generated: {results['timestamp']}\n")
        f.write("=" * 50 + "\n\n")

        # Quick summary
        flags = [r for r in results["model_responses"]
                if r["status"] == "success" and "clean" not in r["response"].lower()]

        if flags:
            f.write("🚩 PAIN POINTS DETECTED:\n\n")
            for r in flags:
                f.write(f"• {r['response']}\n\n")

            f.write("-" * 50 + "\n")
            f.write("OUTREACH ANGLE:\n")
            f.write(f"\"We found that AI systems are reporting negative data about {company}.\n")
            f.write("Would you like to see what candidates are being told?\"\n")
        else:
            f.write("✅ No major flags detected.\n")
            f.write("This company may not be a high-priority lead.\n")

    return filepath


def save_client_report(results: dict) -> str:
    """Save a detailed Markdown report for CLIENT mode."""
    company = results["company"]
    filename = f"{sanitize_filename(company)}_REPORT.md"
    filepath = os.path.join(os.path.dirname(__file__), 'reports', filename)

    with open(filepath, 'w') as f:
        f.write(f"# BrandOS Reputation Audit Report\n\n")
        f.write(f"**Client:** {company}\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%B %d, %Y')}\n\n")
        f.write(f"**Audit Level:** Premium (5-Model Analysis)\n\n")
        f.write("---\n\n")

        # Executive Summary
        f.write("## Executive Summary\n\n")

        flags = [r for r in results["model_responses"]
                if r["status"] == "success" and "clean" not in r["response"].lower()]
        clean = [r for r in results["model_responses"]
                if r["status"] == "success" and "clean" in r["response"].lower()]
        errors = [r for r in results["model_responses"] if r["status"] == "error"]

        total = len(results["model_responses"])
        f.write(f"- **Models Queried:** {total}\n")
        f.write(f"- **Flags Detected:** {len(flags)}\n")
        f.write(f"- **Clean Reports:** {len(clean)}\n")
        f.write(f"- **Errors:** {len(errors)}\n\n")

        if len(flags) >= 3:
            f.write("⚠️ **Risk Level: HIGH** - Multiple AI systems are reporting negative employer data.\n\n")
        elif len(flags) >= 1:
            f.write("🟡 **Risk Level: MEDIUM** - Some AI systems flagged concerns.\n\n")
        else:
            f.write("✅ **Risk Level: LOW** - No significant concerns detected.\n\n")

        f.write("---\n\n")

        # Detailed Findings
        f.write("## Detailed Model Analysis\n\n")

        for r in results["model_responses"]:
            status_icon = "✅" if r["status"] == "success" else "⚠️"
            f.write(f"### {status_icon} {r['model']}\n\n")
            f.write(f"**Perspective:** {r['perspective']}\n\n")
            f.write(f"**Finding:**\n\n")
            f.write(f"> {r['response']}\n\n")
            f.write("---\n\n")

        # Search Data Appendix
        f.write("## Appendix: Search Intelligence\n\n")
        f.write("```\n")
        f.write(results["search_data"])
        f.write("\n```\n\n")

        # Footer
        f.write("---\n\n")
        f.write("*Report generated by BrandOS Reputation Audit System*\n")

    return filepath


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    print("\n" + "="*60)
    print("  BRANDOS - TWO-TIER REPUTATION AUDIT")
    print("="*60)

    # Mode selection
    print("\nSelect Mode:")
    print("  1 = OUTREACH (Free models, for lead generation)")
    print("  2 = CLIENT  (Premium models, for paying clients)")
    print()

    mode_input = input("Enter mode (1 or 2): ").strip()

    if mode_input == "1":
        mode = "OUTREACH"
        print("\n✅ OUTREACH mode selected (low cost)")
    elif mode_input == "2":
        mode = "CLIENT"
        print("\n💎 CLIENT mode selected (premium analysis)")
        print("   ⚠️  This will use paid API credits!")
        confirm = input("   Continue? (y/n): ").strip().lower()
        if confirm != 'y':
            print("Cancelled.")
            return
    else:
        print("[!] Invalid mode. Using OUTREACH.")
        mode = "OUTREACH"

    # Company input
    company_name = input("\nEnter Company Name: ").strip()

    if not company_name:
        print("[!] No company name provided.")
        return

    # Run audit
    results = audit_company(company_name, mode)

    # Save report
    print(f"\n[SAVING] Generating report...")

    if mode == "OUTREACH":
        filepath = save_outreach_report(results)
        print(f"[+] Lead intel saved to: {filepath}")
    else:
        filepath = save_client_report(results)
        print(f"[+] Client report saved to: {filepath}")

    # Also save raw JSON for debugging
    json_path = filepath.replace('.txt', '.json').replace('.md', '.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)

    # Print summary
    print(f"\n{'='*60}")
    print("  AUDIT COMPLETE")
    print(f"{'='*60}")

    flags = [r for r in results["model_responses"]
            if r["status"] == "success" and "clean" not in r["response"].lower()]

    if flags:
        print(f"\n🚩 {len(flags)} reputation flag(s) detected:\n")
        for r in flags:
            print(f"  • [{r['model']}] {r['response'][:80]}...")
    else:
        print("\n✅ No major reputation flags detected.")

    print()


if __name__ == '__main__':
    main()
