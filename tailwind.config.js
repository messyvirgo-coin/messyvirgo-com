/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./*.njk",
    "./about/**/*.html",
    "./legal/**/*.html",
    "./dapps/**/*.html",
    "./blog/**/*.njk",
    "./updates/**/*.njk",
    "./_blog/**/*.md",
    "./_includes/**/*.njk",
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
        // Canonical design tokens — mirror of --mv-* CSS variables in css/base.css.
        // Keep these in sync with the :root block in base.css.
        'mv': {
          'pink': '#ff69b4',
          'gold': '#ffd700',
          'bg-dark': '#0a0a0a',
          'text-primary': '#e5e7eb',
          'text-secondary': '#b3b3b3',
          'text-muted': '#9ca3af',
          'glass': 'rgba(255, 255, 255, 0.05)',
          'glass-hover': 'rgba(255, 255, 255, 0.08)',
          'glass-border': 'rgba(255, 255, 255, 0.1)',
        },
      },
      maxWidth: {
        // Two-tier container scale — mirror of design-system spec D2.
        'content': '80rem',
        'prose': '48rem',
      },
    },
  },
  plugins: [],
}

