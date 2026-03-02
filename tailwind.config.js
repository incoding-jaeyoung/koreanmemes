/** @type {import('tailwindcss').Config} */
export default {
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
        brand: {
          yellow: "var(--brand-yellow)", // globals.css에서 관리
          red: "var(--brand-red)",
          dark: "#141414",
          gray: "#444444",
          light: "#D6D6D6",
          silver: "#979797",
        }
      },
      keyframes: {
        'spin-center': {
          from: { transform: 'translate(-50%, -50%) rotate(0deg)' },
          to: { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        'bg-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '-200% 50%' },
        },
        'bg-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)', filter: 'brightness(100%)' },
          '50%': { opacity: '1', transform: 'scale(1.05)', filter: 'brightness(130%)' },
        }
      },
      animation: {
        'spin-center': 'spin-center 3s linear infinite',
        'bg-pan': 'bg-pan 2s linear infinite',
        'bg-pulse': 'bg-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
