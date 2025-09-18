/** @type {import('tailwindcss').Config} */
const { colors } = require('./config/colors');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./server/views/**/*.{html,ejs,hbs}",
  ],
  theme: {
    extend: {
      colors: {
        // Import our centralized color scheme
        ...colors,
        
        // Alias common colors for easier use
        brand: colors.primary,
        accent: colors.secondary,
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'dropdown': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
      
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))',
      },
      
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: colors.gray[700],
            a: {
              color: colors.primary[600],
              '&:hover': {
                color: colors.primary[700],
              },
            },
            h1: {
              color: colors.gray[900],
            },
            h2: {
              color: colors.gray[900],
            },
            h3: {
              color: colors.gray[900],
            },
            h4: {
              color: colors.gray[900],
            },
            code: {
              color: colors.primary[600],
              backgroundColor: colors.gray[100],
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              borderRadius: '0.25rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // Use class strategy to avoid conflicts
    }),
    require('@tailwindcss/typography'),
    
    // Custom plugin for component utilities
    function({ addComponents, theme }) {
      addComponents({
        // Button components
        '.btn': {
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.button'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm'),
          lineHeight: theme('lineHeight.tight'),
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.primary.500')}33`,
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        
        '.btn-primary': {
          backgroundColor: theme('colors.primary.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.primary.700'),
          },
        },
        
        '.btn-secondary': {
          backgroundColor: theme('colors.gray.200'),
          color: theme('colors.gray.900'),
          '&:hover': {
            backgroundColor: theme('colors.gray.300'),
          },
        },
        
        '.btn-success': {
          backgroundColor: theme('colors.success.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.success.700'),
          },
        },
        
        '.btn-warning': {
          backgroundColor: theme('colors.warning.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.warning.700'),
          },
        },
        
        '.btn-error': {
          backgroundColor: theme('colors.error.600'),
          color: theme('colors.white'),
          '&:hover': {
            backgroundColor: theme('colors.error.700'),
          },
        },
        
        // Card components
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.card'),
          boxShadow: theme('boxShadow.card'),
          padding: theme('spacing.6'),
          transition: 'all 0.3s ease-in-out',
        },
        
        '.card-hover': {
          '&:hover': {
            boxShadow: theme('boxShadow.card-hover'),
            transform: 'translateY(-2px)',
          },
        },
        
        // Form components
        '.form-input': {
          borderColor: theme('colors.gray.300'),
          borderRadius: theme('borderRadius.md'),
          '&:focus': {
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.500')}33`,
          },
        },
        
        '.form-select': {
          borderColor: theme('colors.gray.300'),
          borderRadius: theme('borderRadius.md'),
          '&:focus': {
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.500')}33`,
          },
        },
        
        // Status indicators
        '.status-indicator': {
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
          borderRadius: theme('borderRadius.full'),
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          textTransform: 'uppercase',
          letterSpacing: theme('letterSpacing.wider'),
        },
        
        '.status-success': {
          backgroundColor: theme('colors.success.100'),
          color: theme('colors.success.800'),
        },
        
        '.status-warning': {
          backgroundColor: theme('colors.warning.100'),
          color: theme('colors.warning.800'),
        },
        
        '.status-error': {
          backgroundColor: theme('colors.error.100'),
          color: theme('colors.error.800'),
        },
        
        '.status-info': {
          backgroundColor: theme('colors.info.100'),
          color: theme('colors.info.800'),
        },
        
        // Loading states
        '.loading': {
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '20px',
            height: '20px',
            marginTop: '-10px',
            marginLeft: '-10px',
            borderRadius: '50%',
            border: `2px solid ${theme('colors.gray.300')}`,
            borderTopColor: theme('colors.primary.600'),
            animation: 'spin 1s linear infinite',
          },
        },
        
        // Sidebar styles
        '.sidebar': {
          transition: 'all 0.3s ease-in-out',
        },
        
        '.sidebar-collapsed': {
          width: '80px',
        },
        
        // Table styles
        '.table': {
          width: '100%',
          borderCollapse: 'collapse',
          '& th': {
            backgroundColor: theme('colors.gray.50'),
            padding: theme('spacing.3'),
            textAlign: 'left',
            fontWeight: theme('fontWeight.medium'),
            color: theme('colors.gray.900'),
            borderBottom: `1px solid ${theme('colors.gray.200')}`,
          },
          '& td': {
            padding: theme('spacing.3'),
            borderBottom: `1px solid ${theme('colors.gray.200')}`,
          },
          '& tr:hover': {
            backgroundColor: theme('colors.gray.50'),
          },
        },
      });
    },
  ],
  
  // Dark mode configuration
  darkMode: 'class',
  
  // Safelist for dynamic classes
  safelist: [
    'text-success-600',
    'text-warning-600',
    'text-error-600',
    'text-info-600',
    'bg-success-100',
    'bg-warning-100',
    'bg-error-100',
    'bg-info-100',
    'border-success-500',
    'border-warning-500',
    'border-error-500',
    'border-info-500',
  ],
};
