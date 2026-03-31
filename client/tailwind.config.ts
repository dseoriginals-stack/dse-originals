import type { Config } from "tailwindcss"

const config: Config = {

  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    extend: {

      colors: {

        background: "#E7ECEF",

        primary: "#274C77",

        accent: "#6096BA",

        soft: "#A3CEF1",

        muted: "#8B8C89",

        surface: "#FFFFFF",

        card: "#F4F7FA"

      }

    }
  },

  plugins: []

}

export default config