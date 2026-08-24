import type { Config } from "tailwindcss";
import colors from "./design/tokens/colors.json";
import typography from "./design/tokens/typography.json";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        action: colors.actionBlue,
        slate: colors.slateNeutrals,
        semantic: colors.semantic,
        background: colors.actionBlue.background,
        foreground: colors.slateNeutrals.neutral,
      },
      fontFamily: {
        sans: [typography.fontFamily],
      },
      fontSize: {
        "display-lg": [
          typography.scales["display-lg"].fontSize,
          {
            lineHeight: typography.scales["display-lg"].lineHeight,
            fontWeight: typography.scales["display-lg"].fontWeight,
          },
        ],
        "headline-lg": [
          typography.scales["headline-lg"].fontSize,
          {
            lineHeight: typography.scales["headline-lg"].lineHeight,
            fontWeight: typography.scales["headline-lg"].fontWeight,
          },
        ],
        "title-md": [
          typography.scales["title-md"].fontSize,
          {
            lineHeight: typography.scales["title-md"].lineHeight,
            fontWeight: typography.scales["title-md"].fontWeight,
          },
        ],
        "body-md": [
          typography.scales["body-md"].fontSize,
          {
            lineHeight: typography.scales["body-md"].lineHeight,
            fontWeight: typography.scales["body-md"].fontWeight,
          },
        ],
        "label-sm": [
          typography.scales["label-sm"].fontSize,
          {
            lineHeight: typography.scales["label-sm"].lineHeight,
            fontWeight: typography.scales["label-sm"].fontWeight,
            letterSpacing: typography.scales["label-sm"].letterSpacing,
          },
        ],
      },
    },
  },
  plugins: [],
};
export default config;
