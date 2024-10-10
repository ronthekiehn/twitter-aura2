/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
       'mono': ['ui-monospace', 'SFMono-Regular']
      }
    },
  },
  plugins: [],
}

