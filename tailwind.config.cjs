/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  prefix: 'sc-',
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        surface: 'var(--card)',
        surfaceMuted: 'var(--bg)',
        ink: 'var(--ink)',
        muted: 'var(--mut)',
        line: 'var(--line)',
        brand: 'var(--sec)',
        success: 'var(--tea)',
        warning: 'var(--amb)',
        danger: 'var(--red)',
        chip: 'var(--chip)'
      }
    }
  },
  plugins: []
};
