/**
 * Centralized Color Configuration for MoMech
 * This file defines the complete color palette used throughout the application
 */

const colors = {
  // Primary brand colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },

  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a'
  },

  // Status colors
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f'
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },

  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63'
  },

  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },

  // Specialized colors for automotive context
  automotive: {
    engine: '#dc2626',      // Red for engine-related
    transmission: '#f59e0b', // Orange for transmission
    brakes: '#ef4444',      // Red for brakes
    electrical: '#3b82f6',  // Blue for electrical
    suspension: '#8b5cf6',  // Purple for suspension
    cooling: '#06b6d4',     // Cyan for cooling system
    fuel: '#10b981',        // Green for fuel system
    exhaust: '#6b7280',     // Gray for exhaust
    body: '#f97316',        // Orange for body work
    interior: '#a855f7'     // Purple for interior
  },

  // Inventory status colors
  inventory: {
    inStock: '#10b981',     // Green
    lowStock: '#f59e0b',    // Orange/Yellow
    outOfStock: '#ef4444',  // Red
    discontinued: '#6b7280' // Gray
  },

  // Appointment status colors
  appointment: {
    scheduled: '#3b82f6',   // Blue
    inProgress: '#f59e0b',  // Orange
    completed: '#10b981',   // Green
    cancelled: '#ef4444',   // Red
    noShow: '#6b7280'       // Gray
  },

  // Financial status colors
  financial: {
    paid: '#10b981',        // Green
    pending: '#f59e0b',     // Orange
    overdue: '#ef4444',     // Red
    partial: '#8b5cf6'      // Purple
  }
};

// CSS Custom Properties for easy use in stylesheets
const cssVariables = {
  // Generate CSS custom properties
  toCSSVariables() {
    let cssVars = ':root {\n';
    
    Object.keys(colors).forEach(colorGroup => {
      if (typeof colors[colorGroup] === 'object') {
        Object.keys(colors[colorGroup]).forEach(shade => {
          cssVars += `  --color-${colorGroup}-${shade}: ${colors[colorGroup][shade]};\n`;
        });
      } else {
        cssVars += `  --color-${colorGroup}: ${colors[colorGroup]};\n`;
      }
    });
    
    cssVars += '}';
    return cssVars;
  }
};

// Utility functions for color manipulation
const colorUtils = {
  // Get color with fallback
  getColor(path, fallback = '#6b7280') {
    const pathArray = path.split('.');
    let current = colors;
    
    for (const key of pathArray) {
      if (current[key] === undefined) {
        return fallback;
      }
      current = current[key];
    }
    
    return current;
  },

  // Get status color based on type and status
  getStatusColor(type, status) {
    if (colors[type] && colors[type][status]) {
      return colors[type][status];
    }
    return colors.gray[500];
  },

  // Generate gradient
  generateGradient(startColor, endColor, direction = 'to right') {
    return `linear-gradient(${direction}, ${startColor}, ${endColor})`;
  }
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { colors, cssVariables, colorUtils };
} else {
  // Browser environment
  window.MoMechColors = { colors, cssVariables, colorUtils };
}

export { colors, cssVariables, colorUtils };
