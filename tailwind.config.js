/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'compliance-orange': '#D97706',
        'compliance-peach': '#FB923C',
        'compliance-blue-dark': '#475569',
        'compliance-blue': '#64748B',
        'compliance-slate': '#6B7280',
        'compliance-warm': '#78716C',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-compliance': 'linear-gradient(135deg, #475569 0%, #64748B 50%, #6B7280 100%)',
        'gradient-orange': 'linear-gradient(135deg, #D97706, #FB923C)',
        'gradient-blue': 'linear-gradient(135deg, #475569, #64748B)',
        'gradient-blue-dark': 'linear-gradient(135deg, #334155, #475569)',
      },
      boxShadow: {
        'compliance': '0 4px 14px 0 rgba(217, 119, 6, 0.3)',
        'compliance-hover': '0 6px 20px 0 rgba(217, 119, 6, 0.4)',
      }
    },
  },
  plugins: [],
}