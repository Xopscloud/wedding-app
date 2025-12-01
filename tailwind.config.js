/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './pages/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        floral: '#F8F0EB',
        blush: '#F6D1D1',
        sage: '#CFE8D9',
        gold: '#DCC48E'
      }
    }
  },
  plugins: []
}
