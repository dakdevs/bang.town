/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#ff7657",
        surface: "#fff5f2",
        foreground: "#2d3436",
        primary: {
          DEFAULT: "#ff5733",
          light: "#ff8c69",
          dark: "#e64a19",
          foreground: "white"
        },
        secondary: {
          DEFAULT: "white",
          foreground: "#ff5733",
        },
        destructive: {
          DEFAULT: "#ff3b3b",
          foreground: "white",
        },
        muted: {
          DEFAULT: "#f1f1f1",
          foreground: "#4a4a4a",
        },
        accent: {
          DEFAULT: "#ffdfd7",
          foreground: "#2d3436",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.9)",
          foreground: "#2d3436",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 135, 103, 0.3)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

