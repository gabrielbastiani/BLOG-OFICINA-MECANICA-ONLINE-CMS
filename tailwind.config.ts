import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes:{
        slideIn:{
          from: { width: "0" },
          to: { width: 'var(--radix-collapsible-content-width)' }
        },
        slideOut:{
          from: { width: 'var(--radix-collapsible-content-width)' },
          to: { width: "0" }
        }
      },
      animation:{
        slideIn: 'slideIn 0.28s',
        slideOut: 'slideOut 0.28s',
      }
    },
  },
  plugins: [],
};

export default config;