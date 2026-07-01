/** @type {import('tailwindcss').Config} */
const tokens = require('./src/design-tokens');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
    './server/views/**/*.{html,ejs,hbs}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ...tokens.colors,
        brand: tokens.colors.primary,
        accent: tokens.colors.secondary,
        surface: {
          primary: 'var(--color-surface-primary)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          DEFAULT: 'var(--color-border-default)',
          focus: 'var(--color-border-focus)',
        },
      },
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
      borderRadius: {
        ...tokens.radii,
      },
      boxShadow: tokens.shadows,
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in': 'fadeIn var(--animation-duration) var(--ease-out)',
        'fade-up': 'fadeUp var(--animation-duration) var(--ease-out) forwards',
        'slide-in': 'slideIn var(--animation-duration) var(--ease-out)',
        'slide-in-right': 'slideInRight var(--animation-duration) var(--ease-out)',
        'scale-in': 'scaleIn var(--animation-duration) var(--ease-out)',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
      screens: {
        xs: '475px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('@tailwindcss/typography'),
    function ({ addComponents, theme }) {
      addComponents({
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
          height: '2.5rem',
          padding: `0 ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.button'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm')[0],
          lineHeight: theme('lineHeight.5'),
          transition: 'all var(--transition-duration) var(--ease-out)',
          cursor: 'pointer',
          '&:active': { transform: 'scale(0.98)' },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.primary.500')}40`,
          },
          '&:disabled': { opacity: '0.5', cursor: 'not-allowed' },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.600'),
          color: theme('colors.white'),
          boxShadow: theme('boxShadow.sm'),
          '&:hover': {
            backgroundColor: theme('colors.primary.700'),
            boxShadow: theme('boxShadow.md'),
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.white'),
          color: theme('colors.gray.700'),
          border: `1px solid ${theme('colors.gray.200')}`,
          '&:hover': { backgroundColor: theme('colors.gray.50') },
        },
        '.btn-ghost': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.600'),
          '&:hover': { backgroundColor: theme('colors.primary.50') },
        },
        '.btn-icon': {
          width: '2.5rem',
          height: '2.5rem',
          padding: '0',
          borderRadius: theme('borderRadius.lg'),
        },
        '.card': {
          backgroundColor: 'var(--color-surface-primary)',
          borderRadius: theme('borderRadius.card'),
          border: '1px solid var(--color-border-subtle)',
          boxShadow: theme('boxShadow.card'),
        },
        '.card-interactive': {
          transition: 'all var(--transition-duration) var(--ease-out)',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: theme('boxShadow.card-hover'),
            transform: 'translateY(-2px)',
          },
        },
        '.badge': {
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${theme('spacing.0.5')} ${theme('spacing.2.5')}`,
          borderRadius: theme('borderRadius.full'),
          fontSize: theme('fontSize.xs')[0],
          fontWeight: theme('fontWeight.medium'),
        },
        '.nav-overline': {
          fontSize: '0.6875rem',
          fontWeight: theme('fontWeight.semibold'),
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: theme('colors.secondary.400'),
        },
        '.stat-value': {
          fontSize: theme('fontSize.3xl')[0],
          fontWeight: theme('fontWeight.semibold'),
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--color-text-primary)',
        },
      });
    },
  ],
  safelist: [
    'text-success-600',
    'text-warning-600',
    'text-error-600',
    'text-info-600',
    'bg-success-50',
    'bg-success-100',
    'bg-warning-50',
    'bg-warning-100',
    'bg-error-50',
    'bg-error-100',
    'bg-primary-50',
    'bg-primary-100',
    'border-success-500',
    'border-warning-500',
    'border-error-500',
    'border-primary-500',
    'dark:bg-gray-900',
    'dark:bg-gray-800',
    'dark:border-gray-700',
    'dark:text-gray-100',
    'dark:text-gray-300',
  ],
};
