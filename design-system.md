# BrandOS: Visual Identity of Trust

## Design Philosophy

**"Stripe for Employer Branding"** — Professional, authoritative, and infrastructure-focused.

BrandOS is invisible infrastructure, like SSL certificates. The design should communicate:
1. **Trust:** We're the source of truth
2. **Compliance:** Pay Transparency laws are handled
3. **Simplicity:** Zero-IT deployment, anyone can use it

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Deep Trust Navy** | `#0F172A` | Primary backgrounds, headers, navigation |
| **Verification Blue** | `#3B82F6` | Action buttons, verified badges, links |
| **Signal Green** | `#10B981` | Accurate data, compliance passed, success states |
| **Warning Amber** | `#F59E0B` | Hallucination alerts, data decay, attention needed |
| **Critical Red** | `#EF4444` | Compliance violations, critical hallucinations |
| **Neutral Gray** | `#64748B` | Secondary text, borders, disabled states |

---

## The "Verified" Motif

The core visual element across BrandOS is the **Verified Badge**. It signals "this data is true."

### Badge Variations

| State | Icon | Color | Usage |
|-------|------|-------|-------|
| **Verified** | Shield + Check | Signal Green | Fact confirmed, Smart Pixel active |
| **Pending** | Shield + Clock | Warning Amber | Fact awaiting verification |
| **Hallucinated** | Shield + X | Critical Red | AI is misquoting this data |
| **Compliant** | Shield + Scale | Verification Blue | Meets Pay Transparency laws |

### Badge Usage

```
┌─────────────────────────────────────┐
│  Base Salary Range                  │
│  $65,000 - $85,000                  │
│  🛡️✓ Verified  •  📍 NYC  •  CO Compliant │
└─────────────────────────────────────┘
```

---

## UI Components (Phase 1)

### 1. Smart Pixel Status Card

Shows whether the pixel is active and what data is being injected.

```
┌─────────────────────────────────────────┐
│  🟢 Smart Pixel Active                  │
│                                         │
│  Last ping: 2 minutes ago               │
│  Facts injected: 12                     │
│  Schema version: v2.1                   │
│                                         │
│  [View JSON-LD]  [Refresh Status]       │
└─────────────────────────────────────────┘
```

### 2. Hallucination Alert Card

Displays detected AI inaccuracies with severity.

```
┌─────────────────────────────────────────┐
│  ⚠️ HIGH: Salary Misquote               │
│                                         │
│  ChatGPT says: "$50,000 average"        │
│  Verified fact: "$72,000 - $95,000"     │
│                                         │
│  Source: Glassdoor (2023 data)          │
│  Detected: 3 days ago                   │
│                                         │
│  [Mark Resolved]  [View Details]        │
└─────────────────────────────────────────┘
```

### 3. Compliance Tracker

Pay Transparency law compliance status by location.

```
┌─────────────────────────────────────────┐
│  Pay Transparency Compliance            │
│                                         │
│  🟢 New York      All roles compliant   │
│  🟢 California    All roles compliant   │
│  🟡 Colorado      2 roles missing data  │
│  ⚪ EU Directive  Not applicable        │
│                                         │
│  [View Details]  [Export Report]        │
└─────────────────────────────────────────┘
```

### 4. Facts Management Table

CRUD interface for company facts.

```
┌──────────────────────────────────────────────────────────────┐
│  Fact             │ Value           │ Location │ Status      │
├───────────────────┼─────────────────┼──────────┼─────────────┤
│  Base Salary      │ $65k - $85k     │ NYC      │ 🛡️ Verified │
│  Remote Policy    │ Hybrid (3 days) │ All      │ 🛡️ Verified │
│  PTO Days         │ 20 days         │ All      │ ⏳ Pending  │
│  401k Match       │ 4%              │ All      │ 🛡️ Verified │
└──────────────────────────────────────────────────────────────┘
```

---

## Module-Specific UI

### BrandCore (Dashboard Home)

- Smart Pixel status prominently displayed
- Quick stats: Facts verified, JSON-LD requests/day, last crawl date
- "Install Pixel" CTA for new clients

### BrandShield (Monitoring)

- Hallucination feed (newest first)
- Severity filters: Critical, High, Medium, Low
- Compliance status by jurisdiction
- "Run Audit Now" button

### BrandPulse (Benchmarking) — Phase 2

- Salary comparison charts (anonymized)
- Industry percentile indicators
- "Your data vs. market" visualizations

---

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings | Geist Sans | 600 | 24px / 20px / 16px |
| Body | Geist Sans | 400 | 14px |
| Mono (code) | Geist Mono | 400 | 13px |
| Labels | Geist Sans | 500 | 12px |

---

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'trust-navy': '#0F172A',
        'verify-blue': '#3B82F6',
        'signal-green': '#10B981',
        'warning-amber': '#F59E0B',
        'critical-red': '#EF4444',
        'neutral-gray': '#64748B',
      },
    },
  },
}
```

---

## Icon Library

Use **Lucide React** for all icons. Key icons:

| Concept | Icon |
|---------|------|
| Verified | `ShieldCheck` |
| Pending | `ShieldAlert` |
| Hallucination | `ShieldX` |
| Compliance | `Scale` |
| Smart Pixel | `Code2` |
| Dashboard | `LayoutDashboard` |
| Facts | `Database` |
| Settings | `Settings` |

---

## Accessibility

- All interactive elements must have visible focus states
- Color contrast must meet WCAG AA (4.5:1 for text)
- Status indicators must not rely solely on color (use icons + text)
- Forms must have proper labels and error messages
