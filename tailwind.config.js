/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs', // Scan all EJS files in the views directory
    './public/**/*.js', // You can add other paths here if needed
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}