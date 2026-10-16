import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0b1020",
        surface: "#141a2e",
        primary: "#e6ecff",
        secondary: "#8b98c4",
        accent: "#6d8bff",
        line: "#232c47",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
