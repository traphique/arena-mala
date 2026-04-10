/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border-color)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        accent: 'var(--accent-color)',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius)',
      },
      boxShadow: {
        glass: 'var(--shadow-md), var(--shadow-glow)',
      },
    },
  },
  plugins: [],
}

