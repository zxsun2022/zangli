import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',
        secondary: '#CD853F',
        accent: '#FF6B35',
        text: '#2C1810',
        bg: '#FFF8F0',
        'card-bg': '#FFFFFF',
        border: '#E5D5C8',
        'today-bg': '#FFE4B5',
        'today-border': '#FF8C00',
        'lunar-eclipse': '#E6E6FF',
        'solar-eclipse': '#FFE6E6',
      },
      boxShadow: {
        custom: '0 2px 10px rgba(139, 69, 19, 0.1)',
        'custom-hover': '0 4px 20px rgba(139, 69, 19, 0.15)',
      },
    },
  },
  plugins: [],
}
export default config 