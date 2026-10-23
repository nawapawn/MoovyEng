/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['EB Garamond', 'serif'],
        vocab: ['Fredoka', 'Itim', 'cursive', 'sans-serif'],
        thai: ['Itim', 'Prompt', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
