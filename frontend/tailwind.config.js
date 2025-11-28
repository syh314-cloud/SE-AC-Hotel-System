/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-brand-primary)",
          muted: "var(--color-brand-muted)",
          accent: "var(--color-brand-accent)",
        },
        surface: {
          base: "var(--color-surface-base)",
          card: "var(--color-surface-card)",
          elevated: "var(--color-surface-elevated)",
        },
        morandi: {
          sage: "var(--color-morandi-sage)",
          rose: "var(--color-morandi-rose)",
          blue: "var(--color-morandi-blue)",
          gray: "var(--color-morandi-gray)",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "'SF Pro Display'", "'SF Pro Text'", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        card: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [],
};
