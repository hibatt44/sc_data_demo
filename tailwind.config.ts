import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sc-navy':        '#0C1F3F',
        'sc-navy-dark':   '#071628',
        'sc-blue':        '#1B4D8E',
        'sc-blue-light':  '#E4EEF9',
        'sc-gold':        '#C8860A',
        'sc-gold-light':  '#FDF4E0',
        'sc-cream':       '#FAF7F2',
        'sc-white':       '#FFFFFF',
        'sc-gray':        '#F3F4F6',
        'sc-text':        '#0C1F3F',
        'sc-muted':       '#4A5568',
        'sc-teal':        '#147A7A',
        'sc-rust':        '#A63A2C',
      },
      fontFamily: {
        display: ['var(--font-bitter)', 'Georgia', 'serif'],
        sans:    ['var(--font-public-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
