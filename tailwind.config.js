/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0A0A',
          secondary: '#111111',
          tertiary: '#1A1A1A',
        },
        borderCustom: {
          subtle: '#222222',
          medium: '#2E2E2E',
        },
        accent: {
          base: '#639922',
          bright: '#72A926',
          muted: '#4A7219',
          surface: '#1A2410',
        },
        textCustom: {
          primary: '#FFFFFF',
          secondary: '#888888',
          tertiary: '#555555',
          accent: '#8EC934',
        },
        semantic: {
          success: '#639922',
          error: '#E05252',
          warning: '#D97706',
          info: '#378ADD',
        },
        platform: {
          tiktok: '#FFFFFF',
          instagram: '#E1306C',
        }
      },
      fontFamily: {
        syne: ['PlusJakartaSans_700Bold', 'PlusJakartaSans_800ExtraBold', 'sans-serif'],
        dmsans: ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'sans-serif'],
        inter: ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'Inter_700Bold', 'sans-serif'],
        plusJakarta: ['PlusJakartaSans_600SemiBold', 'PlusJakartaSans_700Bold', 'PlusJakartaSans_800ExtraBold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
