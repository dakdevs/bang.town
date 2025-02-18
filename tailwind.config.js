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
        background: "#fff1ec",
        surface: "#ffffff",
        foreground: "#1a1a1a",
        primary: {
          DEFAULT: "#f05423",
          light: "#ff7a50",
          dark: "#d23c00",
          foreground: "white"
        },
        secondary: {
          DEFAULT: "white",
          foreground: "#f05423",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "white",
        },
        muted: {
          DEFAULT: "#f4f4f4",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "#ffe4d9",
          foreground: "#1a1a1a",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.98)",
          foreground: "#1a1a1a",
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

