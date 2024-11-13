/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      "dm-sans": ["DM Sans", "sans-serif"],
      "dm-serif-display": ["DM Serif Display", "serif"],
    },
    extend: {
      colors: {
        "text-color-primary": "#E1E4F1",
        "text-color-highlight": "#915BFE",
        "background-color-primary": "#000319",
        "background-color-secondary": "#0B1024",
      },
    },
  },
	plugins: [],
};
