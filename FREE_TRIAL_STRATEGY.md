# Free Trial & Pixel Friction Strategy

**The problem:** Asking companies to pay you AND put code on their website is a double-friction sell. Each is a barrier on its own. Together, they kill conversion.

**Troy's instinct is right:** Some form of free trial is essential to reduce the trust gap.

---

## The Friction Stack (what a prospect faces today)

1. Run free audit → ✅ zero friction, this works
2. See score and results → ✅ this creates urgency
3. Decide to fix it → 🟡 needs budget approval
4. Pick a plan and pay → 🟡 needs procurement
5. Install the pixel → 🔴 needs IT approval, security review, change management
6. Configure employer facts → 🟡 needs HR time
7. Wait for results → 🟡 patience required

Steps 4 and 5 together are the killer. Paying AND installing code = two separate approval workflows in most companies. HR says yes, IT says "let me review the code first" and it sits in a queue for 6 weeks.

---

## Strategy: Separate the Money from the Pixel

### The Insight

Don't ask them to do both at once. Split the journey into two trust-building stages:

**Stage 1: Pay for intelligence (no pixel needed)**
- Full LLM monitoring across 3-6 models
- Weekly reports on what AI says about you
- Citation mapping, hallucination detection
- Competitor comparison
- Auto-fix generator (recommendations + copy-paste code)
- This is pure SaaS — nothing to install, just a dashboard

**Stage 2: Install pixel for control (when they're ready)**
- Deploy Patch functionality
- Real-time crawler data
- Structured data serving to AI bots
- Citation engineering
- Compliance audit trail

This means a company can be a paying customer for months, seeing value from the monitoring and intelligence, before they ever touch their website. The pixel becomes an upgrade, not a prerequisite.

---

## Proposed Trial Structure

### Option A: "Monitor Free, Fix Paid" (Recommended)

| Tier | Price | Pixel Required? | What You Get |
|------|-------|-----------------|-------------|
| **Free** | £0 | No | AI Visibility Score audit (unlimited) |
| **Monitor** | £0 for 30 days, then £29/mo | No | 3 LLM monitoring, weekly email digest, basic alerts |
| **Starter** | £49/mo | Optional | 3 LLMs + auto-fix generator + recommendations |
| **Growth** | £149/mo | Optional | 4 LLMs + citations + crawler analytics + prompt intelligence |
| **Scale** | £399/mo | Recommended | 6 LLMs + deploy patch + competitor benchmarking + audit trail |

**The "Monitor" tier is the wedge.** Free for 30 days, just enter your domain. No pixel, no installation, no IT approval. You get weekly emails showing what AI says about your company. After 30 days, it's £29/mo — cheap enough that a Head of TA can expense it without procurement.

Once they're hooked on the data (and sharing those weekly reports with their VP), upgrading to Starter/Growth for the fixes is natural. And by then, the pixel conversation happens with context — they've seen the problems, they want the solution, IT approval is easier with evidence.

### Option B: "Full Free Trial, Time-Limited"

- 14-day free trial of any paid plan
- No credit card required
- Pixel optional during trial
- Full access to all features at the chosen tier level
- After 14 days, downgrades to Free (audit only) unless they convert

**Pros:** Standard SaaS pattern, easy to understand
**Cons:** 14 days isn't enough time to get a pixel installed and see results; companies may trial and churn before getting value

### Option C: "Freemium Intelligence, Paid Infrastructure"

| | Intelligence (Monitor) | Infrastructure (Fix) |
|---|---|---|
| Free | Basic audit | — |
| Paid | Full monitoring, citations, prompts, comparisons | Pixel, deploy patch, crawler analytics, audit trail |

Two product lines: one for knowing, one for doing. Both have value independently. Price intelligence at £49-149/mo, infrastructure at £149-399/mo, bundle for discount.

**Pros:** Clear separation of value
**Cons:** Complex pricing, confusing for prospects

---

## Recommendation: Option A with Tweaks

Go with the Monitor tier as the free trial wedge:

1. **Free audit** — always free, always available (lead gen)
2. **Free monitoring trial (30 days)** — just enter your domain, get weekly AI reports. No pixel, no card, no IT. This is the "aha" moment that creates urgency.
3. **Paid plans** — Starter/Growth/Scale as currently priced
4. **Pixel is "recommended" not "required"** — all plans work without it, but the pixel unlocks Deploy Patch, crawler analytics, and citation engineering

### The Pitch Becomes:

> "See what AI says about your company — free for 30 days. No installation, no credit card. Just your domain name."

That's frictionless. HR director enters their company, gets weekly reports showing ChatGPT hallucinating their salary. After 4 weeks of sharing those reports internally, the budget conversation is easy.

### What This Means for the Product:

- The monitoring engine must work WITHOUT a pixel (it already does — we query LLM APIs independently)
- The pixel features become a premium upgrade path
- The auto-fix generator works without a pixel (generates code they can install themselves)
- Deploy Patch requires the pixel (this is the upgrade trigger)

### Email Sequence During Trial:

**Week 1:** "Here's what AI says about [Company] this week" — first report, shock value
**Week 2:** "3 things AI got wrong about [Company]" — specific hallucinations highlighted
**Week 3:** "How [Company] compares to [Competitor]" — competitive pressure
**Week 4:** "Your trial ends in 7 days — here's what you'd lose" — loss aversion

---

## The Pixel Conversation (When It Happens)

Once a company is paying for monitoring and sees the problems, the pixel sell becomes much easier:

**Before (cold):** "Install our code on your website to fix your AI presence."
→ "Who are you? Why would I do that?"

**After (warm):** "You've seen ChatGPT hallucinate your salary for 3 weeks. The pixel fixes that automatically. Here's the SRI hash, here's the security page, here's the DPA."
→ "Let me send this to IT."

The pixel also needs some trust-building features:
- **Pixel preview mode:** Shows what the pixel WOULD serve to AI bots, without actually installing it. "Here's what crawlers would see if you install. Happy with it? Then install."
- **One-line install:** Single script tag, async/deferred, no impact on page load
- **Instant verification:** After installing, a "Verify installation" button confirms it's working
- **Open source:** Pixel code is public and inspectable (already done)
- **SRI verification:** Independent hash check (already done)
- **Removal guarantee:** "Remove the script tag and it's gone. No residual data, no callbacks."

---

## Summary

| Current | Proposed |
|---------|----------|
| Free audit → pay → install pixel | Free audit → free monitoring trial → pay for intelligence → install pixel when ready |
| Double friction (pay + install) | Single friction at each stage |
| Pixel is required for paid value | Pixel is an upgrade, not a prerequisite |
| HR needs IT approval before paying | HR can pay without IT involvement |
| "Install our code" (cold) | "Fix the hallucinations you've been seeing" (warm) |

The 30-day free monitoring trial is the unlock. It builds trust, creates urgency, and separates the money decision from the technical decision.

---

*Strategy: Malcolm — 11 Feb 2026*
