#!/usr/bin/env python3
"""
BrandOS - Diagnostic Audit Script (Balanced Option A)
Two-phase approach:
1. Research: Perplexity Sonar for live web search with citations
2. Diagnosis: GPT-4o-mini to map pain points to BrandOS products

Outputs ready-to-use email hooks for outreach.
"""

import os
import sys
import json
import time
from datetime import datetime
from openai import OpenAI
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Configure OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# Model Configuration
RESEARCH_MODEL = "perplexity/sonar-small-online"  # Live search with citations
DIAGNOSIS_MODEL = "openai/gpt-4o-mini"  # Fast, cheap reasoning

# Timeout settings
API_TIMEOUT = 60  # seconds


# ============================================================================
# PHASE 1: RESEARCH (Perplexity Sonar - Live Search)
# ============================================================================

def research_target(company_name: str) -> str:
    """
    Use Perplexity Sonar to search for recent employee sentiment.
    Returns research findings with source URLs.
    """
    prompt = f"""Search for recent employee sentiment (2024-2025) for {company_name}.

Look for specific complaints about:
- Salary/Pay/Compensation
- Culture/Toxicity/Management
- Interview process/Candidate experience
- Competitors being better employers

Provide exactly 3 specific bullet points with their source URLs.
Format each as: "• [Finding] (Source: [URL])"

If no recent complaints found, state "No significant complaints found in 2024-2025"."""

    try:
        response = client.chat.completions.create(
            model=RESEARCH_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a research analyst specializing in employer reputation. Provide factual, cited findings."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=600,
            timeout=API_TIMEOUT
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"[RESEARCH ERROR] {str(e)[:100]}"


# ============================================================================
# PHASE 2: DIAGNOSIS (GPT-4o-mini - Pain Point Mapping)
# ============================================================================

def diagnose_pain(company_name: str, research_text: str) -> dict:
    """
    Analyze research findings and map to BrandOS product solutions.
    Returns a structured diagnosis with email hook.
    """
    if "[RESEARCH ERROR]" in research_text or "No significant complaints" in research_text:
        return {
            "primary_pain": "None detected",
            "recommended_product": "BrandGraph",
            "email_hook": f"Hi, I noticed {company_name} doesn't have structured employer data for AI systems. Want to ensure candidates get accurate info about you?",
            "confidence": "low"
        }

    system_prompt = """You are a Sales Strategist for 'BrandOS', an employer branding platform.

Map the research findings to the correct BrandOS Product:
- Salary/Pay/Compensation complaints → Assign 'BrandGraph' (Verified data layer)
- Toxicity/Management/Culture complaints → Assign 'BrandSignal' (Reputation monitoring)
- Competitors being better employers → Assign 'BrandSpy' (Competitive intelligence)
- Boring/Generic/Outdated employer brand → Assign 'BrandVoice' (Employee storytelling)

Return ONLY a valid JSON object with these exact keys:
{
  "primary_pain": "[The single most pressing complaint - be specific]",
  "recommended_product": "[BrandGraph|BrandSignal|BrandSpy|BrandVoice]",
  "email_hook": "[A compelling one-sentence opening that references THEIR specific problem and hints at the solution. Make it personal and urgent.]",
  "confidence": "[high|medium|low]"
}"""

    user_prompt = f"""Company: {company_name}

Research Findings:
{research_text}

Analyze and provide the JSON diagnosis:"""

    try:
        response = client.chat.completions.create(
            model=DIAGNOSIS_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=400,
            timeout=API_TIMEOUT
        )

        content = response.choices[0].message.content

        # Extract JSON from response (handle markdown code blocks)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        return json.loads(content.strip())

    except json.JSONDecodeError:
        return {
            "primary_pain": "Analysis parsing failed",
            "recommended_product": "BrandGraph",
            "email_hook": f"Hi, I found some interesting AI perception data about {company_name}. Worth a quick call?",
            "confidence": "low"
        }
    except Exception as e:
        return {
            "primary_pain": f"Error: {str(e)[:50]}",
            "recommended_product": "Unknown",
            "email_hook": "Error generating hook",
            "confidence": "error"
        }


# ============================================================================
# MAIN PROCESSING
# ============================================================================

def process_company(company_name: str) -> dict:
    """
    Full diagnostic pipeline for a single company.
    """
    print(f"\n{'─'*50}")
    print(f"📊 Processing: {company_name}")
    print(f"{'─'*50}")

    # Phase 1: Research
    print("  [1/2] Researching with Perplexity Sonar...", end=" ")
    research = research_target(company_name)

    if "[RESEARCH ERROR]" in research:
        print("⚠️ Error")
    else:
        print("✅ Done")

    # Brief delay
    time.sleep(2)

    # Phase 2: Diagnosis
    print("  [2/2] Diagnosing with GPT-4o-mini...", end=" ")
    diagnosis = diagnose_pain(company_name, research)
    print("✅ Done")

    return {
        "company": company_name,
        "research": research,
        "diagnosis": diagnosis,
        "timestamp": datetime.now().isoformat()
    }


def run_batch_audit(csv_path: str = None):
    """
    Process multiple companies from CSV.
    """
    script_dir = os.path.dirname(__file__)

    # Load companies
    if csv_path:
        df = pd.read_csv(csv_path)
    else:
        default_path = os.path.join(script_dir, 'companies.csv')
        if os.path.exists(default_path):
            df = pd.read_csv(default_path)
        else:
            print("[!] No companies.csv found. Creating sample...")
            df = pd.DataFrame({
                'company_name': ["McDonald's", "Wendy's", "Starbucks"],
                'industry': ['QSR', 'QSR', 'QSR'],
                'priority': ['high', 'high', 'medium']
            })
            df.to_csv(default_path, index=False)

    print(f"\n{'='*60}")
    print(f"  BRANDOS DIAGNOSTIC AUDIT")
    print(f"  Companies to process: {len(df)}")
    print(f"{'='*60}")

    results = []

    for idx, row in df.iterrows():
        company = row['company_name']
        result = process_company(company)
        results.append(result)

        # Print email hook immediately
        hook = result['diagnosis'].get('email_hook', 'N/A')
        product = result['diagnosis'].get('recommended_product', 'N/A')
        print(f"\n  📧 Email Hook: {hook}")
        print(f"  🎯 Product: {product}")

        # Rate limit protection
        if idx < len(df) - 1:
            print("\n  ⏳ Cooling down (5s)...")
            time.sleep(5)

    # Build output DataFrame
    output_data = []
    for r in results:
        output_data.append({
            'company': r['company'],
            'primary_pain': r['diagnosis'].get('primary_pain', ''),
            'recommended_product': r['diagnosis'].get('recommended_product', ''),
            'email_hook': r['diagnosis'].get('email_hook', ''),
            'confidence': r['diagnosis'].get('confidence', ''),
            'research_summary': r['research'][:500] if r['research'] else '',
            'timestamp': r['timestamp']
        })

    output_df = pd.DataFrame(output_data)

    # Save to CSV
    output_path = os.path.join(script_dir, 'leads_with_strategy.csv')
    output_df.to_csv(output_path, index=False)

    # Also save full JSON for debugging
    json_path = os.path.join(script_dir, 'leads_with_strategy.json')
    with open(json_path, 'w') as f:
        json.dump(results, f, indent=2)

    return output_path, results


def run_single_audit(company_name: str):
    """
    Process a single company interactively.
    """
    result = process_company(company_name)

    print(f"\n{'='*60}")
    print("  DIAGNOSTIC RESULTS")
    print(f"{'='*60}")

    print(f"\n📋 Research Findings:")
    print(result['research'])

    print(f"\n🎯 Diagnosis:")
    print(f"  Primary Pain: {result['diagnosis'].get('primary_pain', 'N/A')}")
    print(f"  Recommended Product: {result['diagnosis'].get('recommended_product', 'N/A')}")
    print(f"  Confidence: {result['diagnosis'].get('confidence', 'N/A')}")

    print(f"\n📧 Ready-to-Use Email Hook:")
    print(f"  \"{result['diagnosis'].get('email_hook', 'N/A')}\"")

    return result


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

def main():
    if not os.getenv("OPENROUTER_API_KEY"):
        print("[!] ERROR: OPENROUTER_API_KEY not found in .env.local")
        sys.exit(1)

    print("\n" + "="*60)
    print("  BRANDOS - DIAGNOSTIC AUDIT (Balanced Option A)")
    print("  Research: Perplexity Sonar | Diagnosis: GPT-4o-mini")
    print("="*60)

    print("\nSelect mode:")
    print("  1 = Single company (interactive)")
    print("  2 = Batch mode (from companies.csv)")
    print()

    mode = input("Enter mode (1 or 2): ").strip()

    if mode == "1":
        company = input("\nEnter Company Name: ").strip()
        if company:
            run_single_audit(company)
        else:
            print("[!] No company name provided.")

    elif mode == "2":
        print("\n📁 Loading from companies.csv...")
        output_path, results = run_batch_audit()

        print(f"\n{'='*60}")
        print("  BATCH AUDIT COMPLETE")
        print(f"{'='*60}")
        print(f"\n✅ Processed {len(results)} companies")
        print(f"📄 Output saved to: {output_path}")

        # Summary stats
        products = [r['diagnosis'].get('recommended_product', '') for r in results]
        print(f"\n📊 Product Recommendations:")
        for p in set(products):
            if p:
                count = products.count(p)
                print(f"  • {p}: {count} companies")

    else:
        print("[!] Invalid mode selected.")


if __name__ == '__main__':
    main()
