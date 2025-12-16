/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 淡紫色模式自定义颜色
        'purple': {
          'primary': 'var(--bg-primary-purple)',
          'secondary': 'var(--bg-secondary-purple)',
          'tertiary': 'var(--bg-tertiary-purple)',
          'text-primary': 'var(--text-primary-purple)',
          'text-secondary': 'var(--text-secondary-purple)',
          'text-tertiary': 'var(--text-tertiary-purple)',
          'border': 'var(--border-purple)',
        },
        // 暗色模式自定义颜色
        'dark': {
          'primary': 'var(--bg-primary-dark)',
          'secondary': 'var(--bg-secondary-dark)',
          'tertiary': 'var(--bg-tertiary-dark)',
          'text-primary': 'var(--text-primary-dark)',
          'text-secondary': 'var(--text-secondary-dark)',
          'text-tertiary': 'var(--text-tertiary-dark)',
          'border': 'var(--border-dark)',
        },
        // 粉色模式自定义颜色
        'pink': {
          'primary': 'var(--bg-primary-pink)',
          'secondary': 'var(--bg-secondary-pink)',
          'tertiary': 'var(--bg-tertiary-pink)',
          'text-primary': 'var(--text-primary-pink)',
          'text-secondary': 'var(--text-secondary-pink)',
          'text-tertiary': 'var(--text-tertiary-pink)',
          'border': 'var(--border-pink)',
        },
      },
    },
  },
  plugins: [],
}