/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stripe/Vercel dark slate values
        blueprint: {
          bg: '#09090B',
          card: '#0D0D0F',
          panel: '#121214',
          border: '#1E1E22',
          borderHover: '#2E2E35'
        }
      },
      borderRadius: {
        '10': '10px',
        '12': '12px',
        '14': '14px',
        '16': '16px',
        '18': '18px',
        '20': '20px',
      },
      fontSize: {
        '10': '10px',
        '11': '11px',
        '13': '13px',
      }
    },
  },
  plugins: [],
}