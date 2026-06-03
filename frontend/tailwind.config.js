/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Cyber blue scale ──────────────────────────────────────────────
        cyber: {
          50:  '#edfcff',
          100: '#d6f7ff',
          200: '#a5f0ff',
          300: '#5ce5ff',
          400: '#0dd4f5',
          500: '#00b8db',
          600: '#0092b8',
          700: '#007595',
          800: '#005f79',
          900: '#004f66',
        },

        // ── Neon accent scale (each needs a DEFAULT so /opacity works) ────
        // Defined as full scales so bg-neon-red/10, text-neon-green, etc. all work.
        'neon-blue':   '#00d4ff',
        'neon-purple': '#7c3aed',
        'neon-green':  '#00ff88',
        'neon-red':    '#ff3366',
        'neon-orange': '#ff6b35',

        // Keep the nested neon object too for gradient/shadow references
        neon: {
          blue:   '#00d4ff',
          purple: '#7c3aed',
          green:  '#00ff88',
          red:    '#ff3366',
          orange: '#ff6b35',
        },

        // ── Dark background scale ─────────────────────────────────────────
        dark: {
          50:  '#0a0a0f',
          100: '#0f0f1a',
          200: '#141428',
          300: '#1a1a35',
          400: '#252545',
          500: '#3a3a5c',
          600: '#5a5a8a',
          700: '#8888bb',
          800: '#b0b0d0',
          900: '#e0e0f0',
        },
      },

      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        'hero-gradient':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,255,0.15) 0%, transparent 60%)',
        'glow-cyan':
          'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)',
        'glow-purple':
          'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },

      backgroundSize: {
        grid: '40px 40px',
      },

      animation: {
        'pulse-slow':     'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':           'glow 2s ease-in-out infinite',
        'scan':           'scan 2s linear infinite',
        'float':          'float 6s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'border-glow':    'borderGlow 2s ease-in-out infinite',
        'fade-up':        'fadeUp 0.6s ease-out forwards',
        'fade-in':        'fadeIn 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'count-up':       'countUp 1s ease-out forwards',
        'spin-slow':      'spin 3s linear infinite',
        'ping-slow':      'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },

      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%':       { opacity: '0.7', filter: 'brightness(1.3)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        borderGlow: {
          '0%, 100%': { borderColor: 'rgba(0,212,255,0.3)' },
          '50%':       { borderColor: 'rgba(0,212,255,0.8)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },

      boxShadow: {
        'cyber':       '0 0 20px rgba(0,212,255,0.3)',
        'cyber-lg':    '0 0 40px rgba(0,212,255,0.4)',
        'neon-red':    '0 0 20px rgba(255,51,102,0.4)',
        'neon-green':  '0 0 20px rgba(0,255,136,0.4)',
        'neon-purple': '0 0 20px rgba(124,58,237,0.4)',
        'glass':       '0 8px 32px rgba(0,0,0,0.4)',
        'card':        '0 4px 24px rgba(0,0,0,0.3)',
        'inner-glow':  'inset 0 0 20px rgba(0,212,255,0.1)',
      },

      backdropBlur: {
        xs: '2px',
      },

      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
