#!/usr/bin/env python3
"""
BrandOS - Guerilla Stack Brand Audit Tool
Low-cost employer brand audit using DuckDuckGo (free) + OpenRouter (free AI models).
"""

import os
import re
import random
import time
from datetime import datetime

from duckduckgo_search import DDGS
from openai import OpenAI
from fake_useragent import UserAgent
from dotenv import load_dotenv

# Load environment variables from root .env.local
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# Configure OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# Initialize fake user agent for stealth
ua = UserAgent()


def get_web_data(company_name: str) -> str:
    """
    Search DuckDuckGo for employee complaints about a company.
    Returns combined search snippets.
    """
    query = f'"{company_name}" employee reviews complaints site:reddit.com OR site:glassdoor.com OR site:indeed.com'

    print(f"[*] Searching for: {company_name}")

    def do_search():
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=10))
        return results

    # Try search with retry on rate limit
    try:
        results = do_search()
    except Exception as e:
        print(f"[!] Search error: {e}")
        print("[*] Waiting 10 seconds before retry...")
        time.sleep(10)
        try:
            results = do_search()
        except Exception as e2:
            print(f"[!] Retry failed: {e2}")
            return ""

    if not results:
        print("[!] No search results found.")
        return ""

    # Extract title and body (snippet) from results
    combined_text = []
    for i, result in enumerate(results, 1):
        title = result.get('title', '')
        body = result.get('body', '')
        combined_text.append(f"[{i}] {title}\n{body}\n")

    print(f"[+] Found {len(results)} results.")
    return "\n".join(combined_text)


def analyze_with_ai(search_text: str, company_name: str) -> str:
    """
    Analyze search results using OpenRouter's free Gemini model.
    """
    if not search_text:
        return "No data found. Unable to perform audit."

    if not os.getenv("OPENROUTER_API_KEY"):
        return "ERROR: OPENROUTER_API_KEY not set in .env.local"

    system_prompt = """You are a corporate spy. Read these search snippets about a company.
Identify the top 3 specific complaints or negative sentiment themes (e.g., 'Low Pay', 'Toxic Management', 'RTO Mandate').
Be extremely concise. Format as a numbered list.
If no negative sentiment is found, reply 'No flags detected'."""

    user_prompt = f"""Company: {company_name}

Search Results:
{search_text}

Analyze and list the top 3 complaints:"""

    print("[*] Analyzing with AI...")

    try:
        response = client.chat.completions.create(
            model="google/gemini-3-pro",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        # Fallback to alternative free model
        print(f"[!] Primary model failed: {e}")
        print("[*] Trying fallback model...")
        try:
            response = client.chat.completions.create(
                model="google/gemini-1.5-flash",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e2:
            return f"AI Analysis Error: {e2}"


def sanitize_filename(name: str) -> str:
    """Convert company name to safe filename."""
    return re.sub(r'[^\w\s-]', '', name).replace(' ', '_')


def save_audit(company_name: str, search_data: str, analysis: str):
    """Save audit results to file."""
    filename = f"{sanitize_filename(company_name)}_audit.txt"
    filepath = os.path.join(os.path.dirname(__file__), 'audits', filename)

    with open(filepath, 'w') as f:
        f.write(f"{'='*60}\n")
        f.write(f"BRAND AUDIT: {company_name}\n")
        f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"{'='*60}\n\n")

        f.write("## AI ANALYSIS - TOP COMPLAINTS\n")
        f.write("-" * 40 + "\n")
        f.write(analysis)
        f.write("\n\n")

        f.write("## RAW SEARCH DATA\n")
        f.write("-" * 40 + "\n")
        f.write(search_data if search_data else "No data collected.\n")

    print(f"[+] Saved to: audits/{filename}")
    return filepath


def main():
    print("\n" + "="*60)
    print("  BRANDOS - GUERILLA BRAND AUDIT TOOL")
    print("  DuckDuckGo + OpenRouter (Free Stack)")
    print("="*60 + "\n")

    # Get company name from user
    company_name = input("Enter Company Name (or 'quit' to exit): ").strip()

    if company_name.lower() == 'quit':
        print("Goodbye!")
        return

    if not company_name:
        print("[!] No company name provided.")
        return

    # Step 1: Search
    print("\n[STEP 1] Web Search...")
    search_data = get_web_data(company_name)

    # Anti-ban delay
    delay = random.uniform(3, 7)
    print(f"[*] Waiting {delay:.1f}s (anti-ban delay)...")
    time.sleep(delay)

    # Step 2: Analyze
    print("\n[STEP 2] AI Analysis...")
    analysis = analyze_with_ai(search_data, company_name)

    # Step 3: Save
    print("\n[STEP 3] Saving Results...")
    save_audit(company_name, search_data, analysis)

    # Print results
    print("\n" + "="*60)
    print("AUDIT RESULTS")
    print("="*60)
    print(analysis)
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
