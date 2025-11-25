/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        'pink': {
          400: '#ff69b4',
          500: '#ec4899',
          600: '#db2777',
        },
      },
    },
  },
  plugins: [],
}

