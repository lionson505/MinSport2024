/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx}"],
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
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      fontSize: {
        xtiny: "0.5rem",   // Extra tiny (8px)
        tiny: "0.625rem",  // Tiny (10px)
        sm: "0.875rem",    // Small (14px)
        base: "1rem",      // Base (16px)
        md: "1.125rem",    // Medium (18px)
        lg: "1.25rem",     // Large (20px)
        xl: "1.5rem",      // Extra large (24px)
        '2xl': "1.875rem", // 2X large (30px)
        '3xl': "2.25rem",  // 3X large (36px)
        '4xl': "3rem",     // 4X large (48px)
        '5xl': "3.75rem",  // 5X large (60px)
        '6xl': "4.5rem",   // 6X large (72px)
        '7xl': "5rem",     // 7X large (80px)
        '8xl': "6rem",     // 8X large (96px)
        '9xl': "8rem",     // 9X large (128px)
      },
    },
    plugins: [
      require('tailwind-scrollbar'),
    ],
  }
  }; 