import type { Config } from "tailwindcss";

const green = {
  DEFAULT: "#12b76a",
  50: "#edfdf3",
  100: "#d3f9df",
  200: "#aaf1c5",
  300: "#72e5a6",
  400: "#3ad183",
  500: "#12b76a",
  600: "#159558",
  700: "#15774b",
  800: "#155e3e",
  900: "#134e35",
};
const orange = {
  DEFAULT: "#ffa800",
  50: "#fefbeb",
  100: "#fff6c9",
  200: "#ffec8f",
  300: "#ffdb58",
  400: "#ffca3e",
  500: "#ffa800",
  600: "#df7e00",
  700: "#b85700",
  800: "#934207",
  900: "#77360a",
};

const red = {
  DEFAULT: "#ff6b00",
  50: "#fff7ee",
  100: "#ffecd6",
  200: "#ffd6aa",
  300: "#ffb874",
  400: "#ff8e38",
  500: "#ff6b00",
  600: "#ee5009",
  700: "#c53c11",
  800: "#9b3217",
  900: "#7c2c17",
};

const blue = {
  DEFAULT: "#176ae5",
  50: "#eff6ff",
  100: "#dbebfe",
  200: "#bfddfe",
  300: "#92c8fc",
  400: "#5ea9f7",
  500: "#3487f1",
  600: "#176ae5",
  700: "#0454d4",
  800: "#0f44ad",
  900: "#143c8a",
};

const neutral = {
  50: "#fafafa",
  100: "#f3f5f8",
  200: "#e2e7ed",
  300: "#ced6de",
  400: "#9ba5af",
  500: "#697581",
  600: "#485663",
  700: "#334352",
  800: "#192a39",
  900: "#071a2b",
};

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        brand: blue.DEFAULT,
        bg: neutral[100],
        text: {
          dark: neutral[900],
          lighter: neutral[600],
          light: neutral[400],
        },
        neutral,
        green,
        orange,
        red,
        blue,
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/container-queries")],
};

export default config;
