import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "arquiluz-black": "#1a1a1a",
        "arquiluz-gray": "#f5f5f5",
        "arquiluz-accent": "#EF483D",
        "arquiluz-accent-light": "#BC382F",
      },
      fontFamily: {
        sans: ["var(--font-open-sans)", "Open Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-oswald)", "Oswald", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
