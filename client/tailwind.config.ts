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
        background: "var(--bg-main)",
        primary: "var(--brand-primary)",
        accent: "var(--brand-accent)",
        soft: "var(--brand-soft)",
        muted: "var(--brand-muted)",
        surface: "var(--bg-surface)",
        card: "var(--bg-card)",
        success: "var(--status-success)",
        warning: "var(--status-warning)",
        error: "var(--status-error)",
        info: "var(--status-info)",
      }

    }
  },

  plugins: []

}

export default config