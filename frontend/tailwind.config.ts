import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-family-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-family-mono)", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        /* Semantic */
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--brand-accent)",
        background: "var(--background)",
        foreground: "var(--text-primary)",
        surface: "var(--surface)",

        primary: {
          DEFAULT: "var(--brand-accent)",
          foreground: "var(--white)",
        },
        secondary: {
          DEFAULT: "var(--neutral-100)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--status-critical)",
          foreground: "var(--white)",
        },
        muted: {
          DEFAULT: "var(--neutral-100)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--neutral-100)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--white)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--white)",
          foreground: "var(--text-primary)",
        },

        /* Brand */
        "brand-deep": "var(--brand-deep)",
        "brand-accent": "var(--brand-accent)",
        "brand-accent-hover": "var(--brand-accent-hover)",
        "brand-accent-light": "var(--brand-accent-light)",
        "brand-accent-subtle": "var(--brand-accent-subtle)",

        /* Legacy aliases */
        "brand-primary": "var(--brand-accent)",
        "brand-primary-hover": "var(--brand-accent-hover)",
        "brand-primary-light": "var(--brand-accent-light)",

        /* Warm Neutrals */
        "neutral-950": "var(--neutral-950)",
        "neutral-800": "var(--neutral-800)",
        "neutral-600": "var(--neutral-600)",
        "neutral-500": "var(--neutral-500)",
        "neutral-300": "var(--neutral-300)",
        "neutral-200": "var(--neutral-200)",
        "neutral-100": "var(--neutral-100)",
        "neutral-50": "var(--neutral-50)",

        /* Status */
        "status-verified": "var(--status-verified)",
        "status-verified-light": "var(--status-verified-light)",
        "status-warning": "var(--status-warning)",
        "status-warning-light": "var(--status-warning-light)",
        "status-critical": "var(--status-critical)",
        "status-critical-light": "var(--status-critical-light)",
        "status-info": "var(--status-info)",
        "status-info-light": "var(--status-info-light)",

        /* Legacy gray aliases — maps to warm neutrals */
        success: "var(--status-verified)",
        "success-light": "var(--status-verified-light)",
        warning: "var(--status-warning)",
        "warning-light": "var(--status-warning-light)",
        error: "var(--status-critical)",
        "error-light": "var(--status-critical-light)",
        "gray-50": "var(--neutral-50)",
        "gray-100": "var(--neutral-100)",
        "gray-200": "var(--neutral-200)",
        "gray-300": "var(--neutral-300)",
        "gray-400": "var(--neutral-500)",
        "gray-500": "var(--neutral-600)",
        "gray-600": "var(--neutral-600)",
        "gray-700": "var(--neutral-800)",
        "gray-800": "var(--neutral-800)",
        "gray-900": "var(--neutral-950)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "9999px",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04)",
        "card-hover": "0 4px 12px rgba(28, 25, 23, 0.08), 0 2px 4px rgba(28, 25, 23, 0.04)",
        "elevated": "0 8px 24px rgba(28, 25, 23, 0.1), 0 2px 8px rgba(28, 25, 23, 0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
} satisfies Config

export default config