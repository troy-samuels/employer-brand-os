# BrandOS Design System

## Design Intent

BrandOS sells trust to non-technical buyers — HR leaders, marketing directors, C-suite. The interface must feel like a premium product these people already use (Notion, Linear, Pitch) — not like a developer dashboard with a coat of paint.

Every design decision answers one question: **does this make a busy VP of Talent feel confident spending £299/month?**

---

## Principles

**1. Clarity over cleverness.**
No glassmorphism, no gradients-for-the-sake-of-gradients, no floating orbs. Information hierarchy does the heavy lifting. If someone can't understand the screen in 3 seconds, it's wrong.

**2. Warmth over coldness.**
Zinc, slate, and cool grays signal developer tools. BrandOS should feel approachable and authoritative — warm neutrals that invite rather than intimidate.

**3. Density appropriate for the audience.**
HR teams don't want 47 metrics on a dashboard. Show them 3 numbers that matter and let them drill down if they choose. White space is a feature, not waste.

**4. Typography carries the design.**
No decorative elements needed when the type hierarchy is strong. Headlines that command, body text that breathes, labels that orient.

**5. Motion is functional, not decorative.**
Page transitions, loading states, and micro-interactions should feel responsive and natural — never performative. No bouncing logos. No animated backgrounds.

---

## Colour Palette

### Brand Colours

| Token | Hex | Role |
|---|---|---|
| `--brand-deep` | `#1B2559` | Primary brand colour. Headers, primary buttons, sidebar active states. Dark enough to anchor the page, warm enough to avoid feeling corporate. |
| `--brand-accent` | `#4F6BF6` | Interactive accent. Links, hover states, focus rings, selected items. Distinct from generic blue — sits between indigo and blue for a modern feel. |
| `--brand-accent-hover` | `#3D56D6` | Hover/pressed state for accent elements. |
| `--brand-accent-light` | `#EEF1FE` | Light tint for backgrounds. Selected rows, active nav items, soft highlights. |
| `--brand-accent-subtle` | `#F6F7FF` | Barely-there tint for section backgrounds, alternating rows. |

### Neutral Palette (Warm)

Moving away from zinc/slate. These are stone-warm neutrals with a slight yellow undertone — they feel human, not machine-generated.

| Token | Hex | Role |
|---|---|---|
| `--neutral-950` | `#1C1917` | Primary text. Headlines, body copy, critical data. |
| `--neutral-800` | `#3D3833` | Strong secondary text. Subheadings, labels in emphasis. |
| `--neutral-600` | `#6B6560` | Secondary text. Descriptions, metadata, timestamps. |
| `--neutral-500` | `#8A8480` | Tertiary text. Placeholders, disabled states, captions. |
| `--neutral-300` | `#CCC7C1` | Borders, dividers, subtle separators. |
| `--neutral-200` | `#E8E4DF` | Input borders, card strokes, table lines. |
| `--neutral-100` | `#F4F2EF` | Surface background. Cards, sidebar, elevated areas. |
| `--neutral-50` | `#FAFAF8` | Page background. The base canvas. |
| `--white` | `#FFFFFF` | Card backgrounds, modals, popovers. |

### Status Colours

| Token | Hex | Role |
|---|---|---|
| `--status-verified` | `#16A34A` | Verified data, compliance passed, active pixel. Clean green, not neon. |
| `--status-verified-light` | `#F0FDF4` | Background for verified badges and success messages. |
| `--status-warning` | `#D97706` | Attention needed. Stale data, pending verification, minor compliance gaps. Amber, not yellow — reads as urgent without alarm. |
| `--status-warning-light` | `#FFFBEB` | Background for warning states. |
| `--status-critical` | `#DC2626` | Compliance violations, critical hallucinations, system errors. |
| `--status-critical-light` | `#FEF2F2` | Background for critical states. |
| `--status-info` | `#4F6BF6` | Matches brand accent. Informational badges, tips, neutral alerts. |
| `--status-info-light` | `#EEF1FE` | Background for informational states. |

---

## Typography

### Font Stack

**Primary:** Plus Jakarta Sans — geometric humanist sans-serif. Warmer than Inter, more distinctive than DM Sans, excellent readability at small sizes. Wide language support. Available on Google Fonts.

**Monospace:** JetBrains Mono — only used for API keys, code snippets in the integration page, and pixel script tags. Never for UI text.

```tsx
// layout.tsx
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `display` | 48px / 3rem | 700 | 1.1 | -0.025em | Landing page hero headline only |
| `h1` | 32px / 2rem | 700 | 1.2 | -0.02em | Page titles, major section headers |
| `h2` | 24px / 1.5rem | 600 | 1.3 | -0.015em | Section headers, card titles |
| `h3` | 18px / 1.125rem | 600 | 1.4 | -0.01em | Subsection headers, feature titles |
| `body-lg` | 16px / 1rem | 400 | 1.6 | 0 | Landing page body, descriptions |
| `body` | 14px / 0.875rem | 400 | 1.6 | 0 | Dashboard body text, form labels |
| `body-sm` | 13px / 0.8125rem | 400 | 1.5 | 0 | Table cells, secondary information |
| `caption` | 11px / 0.6875rem | 500 | 1.4 | 0.04em | Overline labels, category tags, timestamps |
| `overline` | 10px / 0.625rem | 600 | 1.3 | 0.08em | Section overlines, status labels. Always uppercase. |

### Type Rules

- Headlines use `--neutral-950`. No exceptions.
- Body text uses `--neutral-600` for secondary, `--neutral-950` for primary emphasis.
- Never use font-weight alone for emphasis in body text — pair with colour change or size change.
- Overline labels are always uppercase with wide tracking. Used sparingly to categorise sections.
- No text smaller than 11px anywhere in the product.

---

## Spacing & Layout

### Spacing Scale

Based on an 8px grid with a 4px half-step for fine adjustments.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Tight gaps: icon-to-label, badge padding |
| `--space-2` | 8px | Standard gap between inline elements |
| `--space-3` | 12px | Input padding, compact card padding |
| `--space-4` | 16px | Standard card padding, form field gaps |
| `--space-5` | 20px | Section gaps within a card |
| `--space-6` | 24px | Standard card padding (comfortable) |
| `--space-8` | 32px | Section gaps on dashboard, card margin |
| `--space-10` | 40px | Major section gaps |
| `--space-12` | 48px | Page section gaps (landing page) |
| `--space-16` | 64px | Landing page section padding |
| `--space-20` | 80px | Hero section vertical padding |

### Layout Containers

| Context | Max Width | Padding |
|---|---|---|
| Landing page | 1200px | 24px (mobile) / 48px (desktop) |
| Dashboard content | 960px | 32px |
| Narrow forms | 560px | 32px |
| Verify/truth page | 640px | 24px |

### Dashboard Layout

- **Sidebar:** 240px fixed, `--white` background, `--neutral-200` right border
- **Top bar:** 64px height, `--white` background, `--neutral-200` bottom border
- **Content area:** `--neutral-50` background, 32px padding
- **Sidebar collapses to icon-only (56px) at < 1024px, hidden below 768px with hamburger menu**

---

## Components

### Cards

Cards are the primary container in the dashboard. Three tiers:

**Standard Card**
- Background: `--white`
- Border: 1px `--neutral-200`
- Border radius: 12px
- Padding: 24px
- No shadow by default

**Elevated Card**
- Same as standard plus `box-shadow: 0 1px 3px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04)`
- Used for: modals, popovers, floating elements

**Metric Card**
- Standard card with internal structure:
  - Overline label (10px, uppercase, `--neutral-500`)
  - Metric value (32px, 700 weight, `--neutral-950`)
  - Optional change indicator (caption size, green/red with arrow)
- Used for: dashboard KPIs, Monday Report highlights

### Buttons

**Primary**
- Background: `--brand-accent` (#4F6BF6)
- Text: white, 14px, 600 weight
- Padding: 10px 20px
- Border radius: 8px
- Hover: `--brand-accent-hover`
- Active: darken 8%
- Focus: 2px ring `--brand-accent` at 3px offset

**Secondary**
- Background: `--white`
- Border: 1px `--neutral-300`
- Text: `--neutral-950`, 14px, 500 weight
- Hover: background `--neutral-50`

**Ghost**
- Background: transparent
- Text: `--neutral-600`, 14px, 500 weight
- Hover: background `--neutral-100`

**Destructive**
- Background: `--status-critical`
- Text: white
- Hover: darken 8%

**Button sizes:**
- `sm`: 8px 14px, 13px text
- `md`: 10px 20px, 14px text (default)
- `lg`: 12px 28px, 16px text

### Badges & Status Indicators

**Verified Badge**
- Dot (6px circle, `--status-verified`) + label
- Background: `--status-verified-light`
- Border: 1px `--status-verified` at 20% opacity
- Text: `--status-verified`, caption size, 600 weight
- Border radius: pill (9999px)

**Warning Badge**
- Same structure, `--status-warning` colours

**Critical Badge**
- Same structure, `--status-critical` colours

**Compensation Confidence Score Badge**
- Unique component. Larger than standard badges.
- Pill shape, `--brand-accent-light` background
- Inner content: Shield icon (16px) + "Confidence: Competitive" text
- Freshness line below: "Verified 3 days ago" in caption/neutral-500
- This is a key brand element — should feel proprietary, not like a standard badge

### Inputs

- Height: 40px
- Background: `--white`
- Border: 1px `--neutral-200`
- Border radius: 8px
- Padding: 0 12px
- Text: `--neutral-950`, body size
- Placeholder: `--neutral-500`
- Focus: border `--brand-accent`, ring 2px `--brand-accent` at 15% opacity
- Error: border `--status-critical`, error text below in caption size

### Tables

- Header: `--neutral-100` background, overline text style, uppercase
- Rows: `--white` background, 48px height, `--neutral-200` bottom border
- Hover: `--neutral-50` background
- Selected: `--brand-accent-light` background
- No zebra striping. Borders are sufficient.

### Navigation (Sidebar)

- Items: 36px height, 8px border radius, 12px horizontal padding
- Default: `--neutral-600` text, transparent background
- Hover: `--neutral-100` background, `--neutral-950` text
- Active: `--brand-accent-light` background, `--brand-accent` text, 600 weight
- Icon: 18px, same colour as text
- Badge (notification count): 18px pill, `--status-critical` background, white text

---

## Iconography

**Library:** Lucide React (already in the project)

**Icon size rules:**
- Navigation: 18px
- Inline with body text: 16px
- Card headers: 20px
- Feature sections (landing): 24px
- Hero/marketing: 32px

**Icon colour follows text colour.** Never use coloured icons in navigation — they compete with the active state indicator. Status icons (verified, warning, critical) are the only exception.

---

## Landing Page Specifics

The landing page has different density and scale than the dashboard.

**Hero section:**
- `--neutral-50` background (not gradient, not white — subtle distinction)
- Display headline in `--neutral-950`
- One accent-coloured word or phrase per headline (using `--brand-accent`)
- Body text in `--neutral-600`, body-lg size
- Generous vertical padding: 80px top, 64px bottom
- Single primary CTA button + ghost secondary link (not two buttons of equal weight)

**Feature sections:**
- Three-column grid on desktop
- Each feature: icon (24px, `--brand-accent`) + h3 + body text
- No cards/borders. Just clean typography and spacing. Let the grid do the work.

**Social proof section (replacing fake testimonials):**
- Before/After comparison showing real AI responses
- Split layout: left side (red-tinted, "What AI says now") / right side (green-tinted, "After BrandOS")
- This is more convincing than any testimonial for a product with no customers yet

**Pricing section:**
- Three cards, centre one elevated with `--brand-accent` top border (2px)
- Price in display size
- Features as a simple list with check icons in `--status-verified`
- No feature comparison table at this stage — too much cognitive load for three tiers

**CTA section:**
- `--brand-deep` background, white text
- Single headline, single button (white background, `--brand-deep` text)
- This is the only dark section on the page. Creates visual punctuation.

---

## Verify Page (Hosted Truth Pages)

These are public-facing and may be the first BrandOS page a candidate sees.

- `--neutral-50` background (matches landing page)
- Cards in `--white` with `--neutral-200` border, 12px radius
- Overline labels for each fact category
- Compensation Confidence Score badge prominently placed
- Verified badge at the top of the page
- "Powered by BrandOS" link in header — subtle, not competing with the employer's brand
- The employer's brand is the star. BrandOS is the infrastructure.

---

## Motion

| Interaction | Duration | Easing | Property |
|---|---|---|---|
| Button hover | 150ms | ease-out | background-color |
| Card hover (if applicable) | 200ms | ease-out | box-shadow, transform |
| Sidebar nav item | 150ms | ease-out | background-color, color |
| Page transition | 200ms | ease-in-out | opacity |
| Modal open | 250ms | ease-out | opacity, transform (scale from 0.95) |
| Modal close | 150ms | ease-in | opacity, transform |
| Tooltip | 100ms | ease-out | opacity |
| Loading spinner | 700ms | linear | rotation (continuous) |

No spring animations. No parallax. No scroll-triggered animations on the dashboard. The landing page may use subtle fade-in-up on scroll for feature sections (200ms, ease-out, 12px translate) — but only if it doesn't delay content visibility.

---

## Responsive Breakpoints

| Token | Width | Context |
|---|---|---|
| `sm` | 640px | Mobile landscape, small tablets |
| `md` | 768px | Tablets, sidebar collapses |
| `lg` | 1024px | Small desktop, sidebar icon-only |
| `xl` | 1280px | Standard desktop |
| `2xl` | 1440px | Large desktop, max content width |

---

## Do Not

- Use zinc, slate, or cool gray palettes
- Use glassmorphism or backdrop-blur on UI elements (header blur is acceptable)
- Use gradient backgrounds on sections (the CTA dark section is a solid colour)
- Use decorative illustrations or abstract SVG backgrounds
- Use animated emojis or playful illustrations (this is infrastructure, not a to-do app)
- Use more than 2 font weights on a single component
- Use shadow-lg or shadow-xl on cards — keep shadows subtle
- Put technical terms in user-facing UI (no "JSON-LD", "pixel", "schema", "API" in the dashboard nav)
- Use a colour as the sole indicator of status — always pair with icon and/or text

---

## Reference Aesthetic

If someone asks "what should this feel like?":
- **Notion's marketing site** — clean, generous, typography-driven
- **Linear's UI** — information density done right, beautiful at every viewport
- **Pitch** — warm, premium, designed for creative/business audiences
- **Stripe's dashboard** — not the marketing site; the actual dashboard. Clear hierarchy, no noise.

These are references, not templates. BrandOS should have its own identity — grounded in trust, warmth, and clarity.
