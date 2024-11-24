import type { Config } from "tailwindcss";
const colors = require("tailwindcss/colors");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/rizzui/dist/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: colors.gray[600],
    
         /*
         * border, default flat bg color for input components, tab & dropdown hover color
         */
         muted: colors.gray[200],
 
         /*
         * primary colors
         */
         primary: {
           lighter: colors.gray[200],
           DEFAULT: colors.gray[800],
           dark: colors.gray[950],
           foreground: colors.white,
         },
 
         /*
         * secondary colors
         */
         secondary: {
           lighter: colors.indigo[200],
           DEFAULT: colors.indigo[500],
           dark: colors.indigo[700],
           foreground: colors.gray[800],
         },
 
         /*
         * danger colors
         */
         red: {
           lighter: colors.rose[200],
           DEFAULT: colors.rose[500],
           dark: colors.rose[700],
         },
 
         /*
         * warning colors
         */
         orange: {
           lighter: colors.amber[200],
           DEFAULT: colors.amber[500],
           dark: colors.amber[700],
         },
 
         /*
         * info colors
         */
         blue: {
           lighter: colors.sky[200],
           DEFAULT: colors.sky[500],
           dark: colors.sky[700],
         },
 
         /*
         * success colors
         */
         green: {
           lighter: colors.emerald[200],
           DEFAULT: colors.emerald[500],
           dark: colors.emerald[700],
         },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
