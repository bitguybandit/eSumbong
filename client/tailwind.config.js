/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
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
        ink: {
          DEFAULT: '#1a2332',
          500: '#4a5568',
          400: '#8a94a6',
        },
        canvas: '#f4f6f8',
        hairline: {
          DEFAULT: '#e8ecf0',
          strong: '#d5dbe3',
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
