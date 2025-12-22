/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
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
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          hover: "hsl(var(--accent-hover))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "var(--radius-xl)",
        organic: "var(--radius)",
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['DM Sans', 'Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      spacing: {
        '13': '3.25rem',
        '21': '5.25rem',
        '34': '8.5rem',
        '55': '13.75rem',
        '89': '22.25rem',
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-organic": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "spring": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "breathe": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.1)", opacity: "0.7" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.15)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.3)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "accordion-up": "accordion-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-organic": "fade-in-organic 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in": "slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-up": "slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "spring": "spring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "breathe": "breathe 2s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "scale-in": "scale-in 0.2s ease-out",
      },
      boxShadow: {
        'organic-sm': 'var(--shadow-sm)',
        'organic': 'var(--shadow-md)',
        'organic-lg': 'var(--shadow-lg)',
        'organic-xl': 'var(--shadow-xl)',
        'glow-warm': '0 0 20px hsl(var(--primary) / 0.15), 0 0 40px hsl(var(--primary) / 0.08)',
        'glow-warm-sm': '0 0 10px hsl(var(--primary) / 0.12), 0 0 20px hsl(var(--primary) / 0.06)',
        'inner-organic': 'inset 0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      transitionTimingFunction: {
        'organic': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'organic-in': 'cubic-bezier(0.32, 0, 0.67, 0)',
        'organic-out': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
      backgroundImage: {
        'organic-gradient': 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--background-secondary)) 50%, hsl(var(--primary) / 0.03) 100%)',
        'organic-mesh': 'radial-gradient(at 0% 0%, hsl(var(--primary) / 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, hsl(var(--secondary) / 0.08) 0px, transparent 50%), radial-gradient(at 50% 50%, hsl(var(--accent) / 0.05) 0px, transparent 50%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
