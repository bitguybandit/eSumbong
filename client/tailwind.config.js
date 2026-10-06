/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2ff',
          100: '#e0e7ff',
          600: '#25377a',
          700: '#1e2e66',
          800: '#18264f',
          900: '#111a3a',
        },
        // ── Officer portal tokens ──────────────────────────────────────
        shell: {
          500: '#33486b',
          600: '#2a3d5c',
          700: '#1e2f4a',
          800: '#16233a',
          900: '#0f1b2d',
        },
        crimson: {
          50: '#fdf2f4',
          500: '#a31a31',
          600: '#8b1528',
          700: '#6f1020',
        },
        // ── Theme-driven tokens ────────────────────────────────────────
        // Light values live on :root, dark values on `.dark`. Both are set in
        // index.css, so a single `.dark` wrapper re-skins the officer portal
        // without touching any markup. Alpha modifiers work because the vars
        // hold bare `R G B` triplets.
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          500: 'rgb(var(--c-ink-500) / <alpha-value>)',
          400: 'rgb(var(--c-ink-400) / <alpha-value>)',
        },
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        hairline: {
          DEFAULT: 'rgb(var(--c-hairline) / <alpha-value>)',
          strong: 'rgb(var(--c-hairline-strong) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--c-surface) / <alpha-value>)',
          soft: 'rgb(var(--c-surface-soft) / <alpha-value>)',
          hover: 'rgb(var(--c-surface-hover) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.08)',
        // ── Officer portal tokens ──────────────────────────────────────
        soft: '0 1px 2px rgba(15, 27, 45, 0.06)',
        raise: '0 4px 12px rgba(15, 27, 45, 0.08)',
        lift: '0 8px 24px rgba(15, 27, 45, 0.12)',
        glow: '0 0 0 1px rgba(20, 184, 166, 0.15), 0 4px 12px rgba(15, 118, 110, 0.12)',
      },
    },
  },
  plugins: [],
};
