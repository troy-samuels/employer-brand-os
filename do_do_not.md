# OpenRole: Development Guardrails

## Core Principle

OpenRole is **infrastructure, not marketing software**. Every feature must support the "SSL Certificate" metaphor: invisible, essential, and impossible to remove without breaking something.

---

## DO's

### Data & Schema

- **DO** write "Flexible Schema." Ensure a Tech company can add "Equity" and a Hospital can add "Shift Differentials."
- **DO** prioritize "Data Exportability." The brand data belongs to the user; it should be easy to push to LinkedIn, Indeed, or their own site.
- **DO** use "Audit Logs" for every data change (Crucial for the "Trust" mission).
- **DO** track Pay Transparency compliance per location (NY, CA, CO, EU Directive).

### Deployment & Access

- **DO** build for "Zero-IT" deployment. HR/Marketing must be able to install the Smart Pixel via Google Tag Manager without IT tickets.
- **DO** support hosted Truth Pages (`openrole.com/verify/[company]`) for franchises who can't modify their website.
- **DO** build for "Multi-Persona" access: Corporate HQ, Location Managers, and HR Admins.
- **DO** make the pixel installation copy-paste simple (like Meta Pixel or Google Analytics).

### Architecture

- **DO** use serverless functions (Supabase Edge) over traditional backends.
- **DO** host the Smart Pixel SDK on a CDN (Cloudflare) for global performance.
- **DO** version JSON-LD schema exports for debugging and rollback.
- **DO** cache API responses aggressively (facts don't change often).

### Security

- **DO** implement Row Level Security (RLS) on all database tables.
- **DO** use API keys that can be revoked per client (churn = instant cutoff).
- **DO** store all secrets in `.env` files, never in code.

---

## DON'T's

### Phase 1 Scope

- **DON'T** build voice/video features in Phase 1. Content creation is low-value; focus on infrastructure.
- **DON'T** implement C2PA content authenticity yet. Complexity without clear ROI.
- **DON'T** build employee referral features in Phase 1. Focus on the Smart Pixel first.
- **DON'T** integrate with ATS/HRIS (Merge.dev/Rutter) until Enterprise tier.

### Technical

- **DON'T** require IT involvement for pixel deployment. The whole point is "Zero-IT."
- **DON'T** hardcode industry-specific labels. Use variables that can be customized (e.g., `brand_entity` instead of `restaurant`).
- **DON'T** build features that can't be "Verified." If we can't prove it's true, it doesn't belong in OpenRole.
- **DON'T** create mobile apps. Use responsive web for all features.

### Business

- **DON'T** offer free trials longer than 30 days. If the value isn't obvious by then, they're not the right customer.
- **DON'T** build custom integrations for individual clients. Standardize or defer.
- **DON'T** compete with Glassdoor on reviews. We compete on **data structure**, not content volume.

---

## Decision Framework

When evaluating a feature request, ask:

1. **Does it support the Smart Pixel?** If not, defer to Phase 2+.
2. **Can HR deploy it without IT?** If not, simplify until they can.
3. **Does it create switching costs?** If removing it breaks their AI SEO, it's valuable.
4. **Is it verifiable?** If we can't prove it's true, don't build it.

---

## Red Flags (Stop and Ask)

If you're about to do any of these, stop and confirm with the Founder:

- Adding a dependency that requires a new monthly bill
- Building a feature that requires IT deployment
- Creating content that competes with employee-generated content
- Hardcoding any industry-specific assumptions
- Storing API keys anywhere except `.env` files
