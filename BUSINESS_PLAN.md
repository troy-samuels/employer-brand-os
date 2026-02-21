# OpenRole: Strategic Business Plan (2026)

**One-Line Pitch:** OpenRole is the employment data infrastructure layer for the AI age—a "Smart Pixel" that makes every job **visible** to AI agents, **compliant** with pay transparency laws, and **sanitized** for public consumption.

---

## 1. Executive Summary

**The Shift:** In 2026, the "Apply" button is dying. 40% of job searches now happen via AI Agents (ChatGPT, Perplexity, Gemini) or Aggregators. These systems do not read "Career Sites"—they read **structured data**.

**The Problem:** Most companies are "Invisible and Illegal."
1. **Invisible:** Their ATS (Applicant Tracking System) outputs messy HTML that AI agents cannot read, causing a 40% drop in traffic.
2. **Illegal:** New 2026 Pay Transparency laws (EU Directive, NY/CA/CO) require strict salary disclosures that legacy systems fail to automate.

**The Solution:** OpenRole is the **"Stripe for Employer Truth."** We provide a Smart Pixel that overlays a company's existing site. It intercepts messy data, sanitizes it, and injects a verified "Truth Layer" (JSON-LD) that ensures jobs rank higher and meet legal standards automatically.

**The Unfair Advantage:** We launch with a proprietary database of **460,000 employer contacts** and a "Wholesale Channel" strategy targeting Recruitment Agencies to scale without a massive sales team.

---

## 2. Market Analysis: The "Zero to One" Thesis

*Applying Peter Thiel's Principle: "What important truth do very few people agree with you on?"*

- **The Contrarian Truth:** The Applicant Tracking System (ATS) is a database for *storage*, not *discovery*. ATS giants (Workday, Greenhouse) will not solve the AI data problem because their data is internal, messy, and unstructured.
- **The Opportunity:** A "Neutral Standardization Layer" is required between the messy Internal ATS and the public AI Web. OpenRole is that layer.
- **The "Hair on Fire" Pain:** In 2026, companies don't care about "Brand Reputation." They care about **Compliance Fines** (Regulatory Risk) and **Ghosting** (Traffic Risk). We sell the cure to these immediate pains.

---

## 3. Product Architecture: The 4-Layer Platform

### Layer 1: Infrastructure (The Smart Pixel & Sanitization)
*The "Fix It" Wedge.*

- **Tech:** A JavaScript tag installed via Google Tag Manager.
- **ATS Defense:** The **"Sanitization Engine."** We don't just display data; we translate it.
  - *Example:* Internal Code `L4-Eng-NY` → Public Title `Senior Software Engineer`.
  - *Benefit:* Keeps internal mess private while making public data pristine for AI.
- **CSP Fallback:** If a client's security blocks our script, we auto-provision a **"Hosted Truth Mirror"** (`jobs.openrole.co.uk/client`) that guarantees visibility regardless of IT settings.

### Layer 2: Compliance (Automated Guardrails & Safety)
*The "Moat" & Retention.*

- **Automated Guardrails:** Scans job listings by IP location. If a NY job is missing salary data, we auto-flag it or inject the legally required range from our "Truth Store."
- **Hallucination Radar:** Weekly scans of OpenAI/Perplexity to detect if AI models are inventing fake salaries or toxic culture myths.

### Layer 3: Intelligence (The "Proof of Life" Dashboard)
*The Churn Killer.*

- **Problem:** Infrastructure is invisible. CFOs cancel what they can't see.
- **Solution:** The **"Monday Morning Visibility Report."** An automated email sent to stakeholders:
  - *"This week, OpenRole served 14,000 structured data points to Google/OpenAI."*
  - *"We auto-corrected 3 non-compliant job posts, preventing potential fines."*
  - *"Your 'Senior Dev' role is now ranking #1 on Google Jobs."*

### Layer 4: Network (Live Benchmarking)
*The Upsell.*

- **Live Benchmarking:** Using our network of verified pixels, we tell clients exactly where their salary offers sit compared to the real-time market (not self-reported Glassdoor guesses).

---

## 4. Go-To-Market Strategy

**The Asset:** 460,000 "Problem-Aware" Contacts.

### Primary Motion: The "Visibility Audit" (Direct Sales)

*Target: High-Volume Franchises & Retail (The "Desperate Middle").*

1. **The Hook:** Automate a scan of their site.
2. **The Pitch:** "You are invisible to 40% of candidates because your ATS blocks AI agents. I ran a scan: Google Jobs is hiding your listings. OpenRole fixes the code instantly."
3. **The Close:** "This also automates your EU/NY Pay Transparency compliance."

### Accelerator Motion: The "Agency Partner" Channel

*Target: Recruitment Marketing Agencies (RMAs) managing 50+ locations.*

- **The Problem:** Agencies are being fired because their clients aren't getting applicants.
- **The Pitch:** "Whitelabel OpenRole for your 50 clients. You get credit for 'Fixing their AI Strategy' and ensuring compliance. You buy at wholesale, sell at retail."
- **Why this wins:** We sell to 1 Agency → We acquire 50 Clients. This solves the "Solo Founder Sales Bottleneck."

---

## 5. Technical Architecture (Solo + AI)

*Designed for "100-Developer Standards" with a team of one.*

- **Stack:** Next.js 15, Supabase (Postgres), Tailwind CSS (Monochrome/Enterprise).
- **Integration:**
  - **Primary:** Google Tag Manager (Zero-IT deployment).
  - **Fallback:** Hosted Subdomain (for strict CSP environments).
- **Security:**
  - **Public Keys:** Read-Only access for the Pixel.
  - **Sanitization:** Strict filtering of internal data before it hits the API.
- **Documentation:** A strict `.docs/` folder (`PROJECT_RULES.md`, `ARCHITECTURE.md`) ensures the AI builder maintains architectural integrity.

---

## 6. Business Model & Pricing

| Tier | Price | Target | Value Proposition |
| :--- | :--- | :--- | :--- |
| **Visibility** | **$299/mo** | SMB / Franchise | **"Get Found."** Smart Pixel + Basic Schema. Hosted Truth Page. |
| **Compliance** | **$899/mo** | Mid-Market | **"Stay Safe."** Visibility + Auto-Compliance Checks + The "Monday Morning Report." |
| **Agency** | **$150/mo per location** | **Agency Partners** | **"Scale."** Wholesale rate per location. Minimum 10 locations. Whitelabel reporting. |

---

## 7. Execution Roadmap (Q1 2026)

### Phase 1: The Build (Weeks 1-4)

- **Goal:** A working product that proves the pain.
- **Actions:**
  - Finalize the **Sanitization Engine** logic (ATS → Public Schema).
  - Build the **Visibility Audit Script** (The Sales Tool).
  - Implement the **CSP Fallback** pages.

### Phase 2: The Pilot (Weeks 5-8)

- **Goal:** 10 Direct Clients + 1 Agency Partner.
- **Actions:**
  - Run the audit on 100 direct targets.
  - Identify 20 boutique Recruitment Agencies. Pitch the "Whitelabel AI Solution."
  - Manual onboarding for the first batch.

### Phase 3: Automation (Weeks 9-12)

- **Goal:** Operational maturity.
- **Actions:**
  - Automate the **"Monday Morning Report"** (Critical for retention).
  - Hire VAs to run the Audit Script at scale.
  - Shift purely to "Inbound via Audit" and "Channel Sales."

---

## 8. Defensibility (The Moat)

1. **The "Sanitization" Moat:** ATS data is messy. By building the rules engine that cleans it, we become the indispensable translator between the Enterprise and the AI.
2. **The Agency Lock-In:** Once an agency deploys us across 50 clients, they cannot rip us out without breaking their own value proposition.
3. **Active Retention:** The "Monday Morning Report" constantly reminds the buyer of the fines we avoided and the traffic we generated.

---

## Summary of Key Differentiators

- **ATS Defense:** We are now the "Translator," not just a "Publisher."
- **Retention:** We proactively prove value via weekly reports.
- **Scale:** We use Agencies to multiply our sales efforts.
- **Resilience:** We have a technical fallback (Hosted Pages) if IT security blocks us.
