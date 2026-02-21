#!/usr/bin/env python3
"""
OpenRole - Multi-Model Reputation Check
Interrogates 3 AI model families via OpenRouter to detect hallucinations
and bad data about a company's employer brand.
"""

import os
import sys
import re
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from root .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Configure OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# The Council: 3 AI model families to interrogate
MODEL_COUNCIL = [
    {
        "id": "google/gemini-1.5-flash",
        "name": "Google Gemini",
        "perspective": "The Google Perspective"
    },
    {
        "id": "meta-llama/llama-3.3-70b-instruct",
        "name": "Meta Llama",
        "perspective": "The Meta/Open Perspective"
    },
    {
        "id": "mistralai/mistral-small-24b-instruct-2501:free",
        "name": "Mistral AI",
        "perspective": "The European Perspective"
    }
]


def check_model(model: dict, company_name: str) -> str:
    """
    Interrogate a single AI model about a company's reputation.
    Returns the model's response or error message.
    """
    prompt = f"""You are a career counselor. A candidate asks:
'What are the biggest red flags or negative rumors about working at {company_name}?'

List the top 3 negatives you know of. Be specific and concise.
If you don't know any, say 'No data'."""

    try:
        response = client.chat.completions.create(
            model=model["id"],
            messages=[
                {
                    "role": "system",
                    "content": "You are an honest career counselor who provides candid advice about companies. Be direct and factual."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=500
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"[ERROR] Model unavailable: {str(e)}"


def sanitize_filename(name: str) -> str:
    """Convert company name to safe filename."""
    return re.sub(r'[^\w\s-]', '', name).replace(' ', '_')


def run_consensus_check(company_name: str) -> dict:
    """
    Run the multi-model reputation check.
    Returns a dict with all model responses.
    """
    if not os.getenv("OPENROUTER_API_KEY"):
        print("[!] ERROR: OPENROUTER_API_KEY not found in .env.local")
        sys.exit(1)

    results = {}

    print(f"\n{'='*60}")
    print(f"  MULTI-MODEL REPUTATION CHECK: {company_name}")
    print(f"  Interrogating {len(MODEL_COUNCIL)} AI Models...")
    print(f"{'='*60}\n")

    for i, model in enumerate(MODEL_COUNCIL, 1):
        print(f"[{i}/{len(MODEL_COUNCIL)}] Checking {model['name']}...")

        response = check_model(model, company_name)
        results[model['name']] = {
            "perspective": model['perspective'],
            "model_id": model['id'],
            "response": response
        }

        # Show quick status
        if "[ERROR]" in response:
            print(f"    ⚠️  Model unavailable")
        elif "no data" in response.lower():
            print(f"    ✅ No flags detected")
        else:
            print(f"    🚩 Flags found")

    return results


def save_consensus_report(company_name: str, results: dict) -> str:
    """Save the consensus report to a file."""
    filename = f"{sanitize_filename(company_name)}_AI_CONSENSUS.txt"
    audits_dir = os.path.join(os.path.dirname(__file__), 'audits')

    # Ensure audits directory exists
    os.makedirs(audits_dir, exist_ok=True)

    filepath = os.path.join(audits_dir, filename)

    with open(filepath, 'w') as f:
        f.write("=" * 70 + "\n")
        f.write(f"  OPENROLE AI CONSENSUS REPORT\n")
        f.write(f"  Company: {company_name}\n")
        f.write(f"  Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"  Models Queried: {len(MODEL_COUNCIL)}\n")
        f.write("=" * 70 + "\n\n")

        f.write("METHODOLOGY:\n")
        f.write("-" * 40 + "\n")
        f.write("Each AI model was asked: 'What are the biggest red flags\n")
        f.write(f"or negative rumors about working at {company_name}?'\n\n")

        for model_name, data in results.items():
            f.write("=" * 70 + "\n")
            f.write(f"MODEL: {model_name}\n")
            f.write(f"Perspective: {data['perspective']}\n")
            f.write(f"Model ID: {data['model_id']}\n")
            f.write("-" * 40 + "\n\n")
            f.write(data['response'])
            f.write("\n\n")

        # Summary section
        f.write("=" * 70 + "\n")
        f.write("CONSENSUS ANALYSIS\n")
        f.write("-" * 40 + "\n")

        # Count flags
        flags_found = sum(1 for d in results.values()
                        if "no data" not in d['response'].lower()
                        and "[ERROR]" not in d['response'])

        if flags_found == 0:
            f.write("✅ CLEAN: No AI models reported negative data.\n")
        elif flags_found == len(MODEL_COUNCIL):
            f.write("🚨 ALERT: ALL models reported negative data. Investigate immediately.\n")
        else:
            f.write(f"⚠️  MIXED: {flags_found}/{len(MODEL_COUNCIL)} models reported issues.\n")

        f.write("\n" + "=" * 70 + "\n")

    return filepath


def print_summary(company_name: str, results: dict):
    """Print a summary to the console."""
    print(f"\n{'='*60}")
    print("  AI CONSENSUS SUMMARY")
    print(f"{'='*60}\n")

    for model_name, data in results.items():
        print(f"📊 {model_name} ({data['perspective']})")
        print("-" * 40)

        # Truncate long responses for console
        response = data['response']
        if len(response) > 300:
            response = response[:300] + "..."
        print(response)
        print()

    # Overall verdict
    flags_found = sum(1 for d in results.values()
                    if "no data" not in d['response'].lower()
                    and "[ERROR]" not in d['response'])

    print("=" * 60)
    if flags_found == 0:
        print("✅ VERDICT: CLEAN - No AI models reported concerns.")
    elif flags_found == len(MODEL_COUNCIL):
        print("🚨 VERDICT: HIGH RISK - All models flagged issues!")
    else:
        print(f"⚠️  VERDICT: MIXED - {flags_found}/{len(MODEL_COUNCIL)} models found issues.")
    print("=" * 60)


def main():
    if len(sys.argv) < 2:
        print("\n" + "="*60)
        print("  OPENROLE - MULTI-MODEL REPUTATION CHECK")
        print("="*60)
        print("\nUsage: python audit_brand.py 'Company Name'")
        print("Example: python audit_brand.py \"McDonald's\"")
        print("\nThis tool interrogates 3 AI models to check what they")
        print("'believe' about a company's employer reputation.\n")
        sys.exit(1)

    company_name = sys.argv[1]

    # Run the consensus check
    results = run_consensus_check(company_name)

    # Save report
    filepath = save_consensus_report(company_name, results)
    print(f"\n[+] Full report saved to: {filepath}")

    # Print summary
    print_summary(company_name, results)


if __name__ == '__main__':
    main()
