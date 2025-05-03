import type { Config } from "tailwindcss"
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        twitch: {
          purple: {
            DEFAULT: "#9146FF",
            50: "#F0E6FF",
            100: "#E0CCFF",
            200: "#C299FF",
            300: "#A366FF",
            400: "#9146FF", // Twitch primary purple
            500: "#7D32E6",
            600: "#6A1FCC",
            700: "#5714A6",
            800: "#450E80",
            900: "#33095A",
          },
          dark: {
            DEFAULT: "#0E0E10", // Twitch background
            100: "#18181B", // Twitch card background
            200: "#1F1F23", // Twitch secondary background
            300: "#26262C", // Twitch tertiary background
            400: "#323239", // Twitch border color
            500: "#3A3A44", // Twitch hover state
          },
          light: {
            DEFAULT: "#EFEFF1", // Twitch light text
            100: "#DEDEE3", // Twitch muted text
            200: "#ADADB8", // Twitch secondary text
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
