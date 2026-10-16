/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      // Xanh dương đậm cho thương hiệu (nước, sạch sẽ), cam cho nút kêu gọi đặt lịch.
      colors: {
        primary: {
          DEFAULT: '#0b4ea2',
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
          500: '#2f74d0', 600: '#1d5fbf', 700: '#0b4ea2', 800: '#0a3f82', 900: '#0b2f5e', 950: '#071d3b',
        },
        accent: {
          DEFAULT: '#f97316',
          50: '#fff7ed', 100: '#ffedd5', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
