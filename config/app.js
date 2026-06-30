/**
 * Application Configuration for MoMech
 * Central configuration for the entire application
 */

const APP_CONFIG = {
  // Application metadata
  APP_NAME: 'MoMech',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Digital transformation tool for small garage mechanics',
  COMPANY_NAME: 'MoMech Solutions',
  
  // Environment settings
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG === 'true' || false,
  
  // Server configuration
  SERVER: {
    PORT: process.env.PORT || 3001,
    HOST: process.env.HOST || 'localhost',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // Database configuration
  DATABASE: {
    TYPE: 'sqlite',
    PATH: process.env.DB_PATH || './database/momech.db',
    BACKUP_PATH: process.env.DB_BACKUP_PATH || './database/backups/',
    MAX_CONNECTIONS: 10,
    TIMEOUT: 30000,
    ENABLE_FOREIGN_KEYS: true,
    ENABLE_WAL_MODE: true // Write-Ahead Logging for better performance
  },

  // Security settings
  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    BCRYPT_ROUNDS: 12,
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100,
    ENABLE_HELMET: true,
    ENABLE_CORS: true
  },

  // Email configuration
  EMAIL: {
    SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: process.env.EMAIL_PORT || 587,
    SECURE: process.env.EMAIL_SECURE === 'true' || false,
    USER: process.env.EMAIL_USER || '',
    PASS: process.env.EMAIL_PASS || '',
    FROM_NAME: process.env.EMAIL_FROM_NAME || 'MoMech System',
    FROM_EMAIL: process.env.EMAIL_FROM || 'noreply@momech.com'
  },

  // File upload settings
  UPLOADS: {
    DESTINATION: process.env.UPLOAD_PATH || './public/uploads/',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'],
    IMAGE_QUALITY: 85,
    THUMBNAIL_SIZE: { width: 200, height: 200 },
    ENABLE_IMAGE_PROCESSING: true
  },

  // Logging configuration
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    FILE_PATH: process.env.LOG_FILE || './logs/app.log',
    MAX_SIZE: '10m',
    MAX_FILES: 5,
    ENABLE_CONSOLE: true,
    ENABLE_FILE: true,
    DATE_PATTERN: 'YYYY-MM-DD'
  },

  // Business rules and defaults
  BUSINESS: {
    // Default working hours
    WORKING_HOURS: {
      MONDAY: { start: '08:00', end: '17:00' },
      TUESDAY: { start: '08:00', end: '17:00' },
      WEDNESDAY: { start: '08:00', end: '17:00' },
      THURSDAY: { start: '08:00', end: '17:00' },
      FRIDAY: { start: '08:00', end: '17:00' },
      SATURDAY: { start: '08:00', end: '12:00' },
      SUNDAY: { start: null, end: null } // Closed
    },
    
    // Appointment settings
    APPOINTMENTS: {
      DEFAULT_DURATION: 60, // minutes
      MIN_DURATION: 30,
      MAX_DURATION: 480, // 8 hours
      BUFFER_TIME: 15, // minutes between appointments
      MAX_ADVANCE_BOOKING: 90, // days
      REMINDER_TIME: 24 // hours before appointment
    },
    
    // Inventory settings
    INVENTORY: {
      LOW_STOCK_THRESHOLD: 5,
      CRITICAL_STOCK_THRESHOLD: 2,
      DEFAULT_SUPPLIER_LEAD_TIME: 7, // days
      AUTO_REORDER: false,
      ENABLE_BARCODE_SCANNING: true
    },
    
    // Financial settings
    FINANCIAL: {
      DEFAULT_CURRENCY: 'USD',
      CURRENCY_SYMBOL: '$',
      TAX_RATE: 0.08, // 8% default tax rate
      PAYMENT_TERMS: 30, // days
      LATE_FEE_RATE: 0.015, // 1.5% per month
      INVOICE_NUMBER_PREFIX: 'INV-',
      ENABLE_ONLINE_PAYMENTS: false
    },
    
    // Service categories
    SERVICE_CATEGORIES: [
      'Oil Change',
      'Brake Service',
      'Transmission',
      'Engine Repair',
      'Electrical',
      'Suspension',
      'Cooling System',
      'Exhaust System',
      'Tire Service',
      'Body Work',
      'Diagnostic',
      'Maintenance',
      'Other'
    ],
    
    // Vehicle makes (common ones)
    VEHICLE_MAKES: [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan',
      'Hyundai', 'Kia', 'Volkswagen', 'BMW', 'Mercedes-Benz',
      'Audi', 'Mazda', 'Subaru', 'Jeep', 'Ram',
      'GMC', 'Cadillac', 'Lexus', 'Acura', 'Infiniti',
      'Volvo', 'Jaguar', 'Land Rover', 'Porsche', 'Tesla',
      'Other'
    ]
  },

  // Feature flags
  FEATURES: {
    ENABLE_QR_SCANNING: true,
    ENABLE_EMAIL_NOTIFICATIONS: true,
    ENABLE_SMS_NOTIFICATIONS: false,
    ENABLE_ONLINE_BOOKING: true,
    ENABLE_CUSTOMER_PORTAL: false,
    ENABLE_MOBILE_APP: false,
    ENABLE_MULTI_LOCATION: false,
    ENABLE_ANALYTICS: true,
    ENABLE_BACKUP_AUTOMATION: true,
    ENABLE_API_VERSIONING: true
  },

  // UI/UX Settings
  UI: {
    THEME: 'light', // light, dark, auto
    SIDEBAR_COLLAPSED: false,
    ITEMS_PER_PAGE: 20,
    DATE_FORMAT: 'MM/DD/YYYY',
    TIME_FORMAT: '12', // 12 or 24 hour
    TIMEZONE: process.env.TZ || 'America/New_York',
    LANGUAGE: 'en',
    ENABLE_ANIMATIONS: true,
    SHOW_TOOLTIPS: true
  },

  // Performance settings
  PERFORMANCE: {
    ENABLE_CACHING: true,
    CACHE_TTL: 300, // 5 minutes
    ENABLE_COMPRESSION: true,
    ENABLE_MINIFICATION: process.env.NODE_ENV === 'production',
    MAX_REQUEST_SIZE: '50mb',
    TIMEOUT: 30000 // 30 seconds
  },

  // Monitoring and analytics
  MONITORING: {
    ENABLE_ERROR_TRACKING: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_USER_ANALYTICS: false,
    HEALTH_CHECK_INTERVAL: 60000, // 1 minute
    METRICS_RETENTION_DAYS: 30
  },

  // Backup settings
  BACKUP: {
    ENABLE_AUTO_BACKUP: true,
    BACKUP_INTERVAL: 24, // hours
    RETENTION_DAYS: 30,
    BACKUP_LOCATION: process.env.BACKUP_LOCATION || './backups/',
    INCLUDE_UPLOADS: true,
    COMPRESSION: true
  },

  // Notification templates
  NOTIFICATION_TEMPLATES: {
    APPOINTMENT_CONFIRMATION: {
      subject: 'Appointment Confirmation - {{appointmentDate}}',
      template: 'appointment-confirmation'
    },
    APPOINTMENT_REMINDER: {
      subject: 'Reminder: Your appointment tomorrow at {{time}}',
      template: 'appointment-reminder'
    },
    INVOICE_SENT: {
      subject: 'Invoice {{invoiceNumber}} - {{amount}}',
      template: 'invoice-sent'
    },
    PAYMENT_RECEIVED: {
      subject: 'Payment Received - Thank You!',
      template: 'payment-received'
    },
    SERVICE_COMPLETED: {
      subject: 'Service Completed - {{vehicleMake}} {{vehicleModel}}',
      template: 'service-completed'
    }
  }
};

// Environment-specific overrides
if (APP_CONFIG.ENVIRONMENT === 'production') {
  // Production-specific settings
  APP_CONFIG.DEBUG = false;
  APP_CONFIG.LOGGING.LEVEL = 'warn';
  APP_CONFIG.SECURITY.RATE_LIMIT_MAX_REQUESTS = 50;
  APP_CONFIG.PERFORMANCE.ENABLE_MINIFICATION = true;
} else if (APP_CONFIG.ENVIRONMENT === 'development') {
  // Development-specific settings
  APP_CONFIG.DEBUG = true;
  APP_CONFIG.LOGGING.LEVEL = 'debug';
  APP_CONFIG.SECURITY.RATE_LIMIT_MAX_REQUESTS = 1000;
}

// Validation function
const validateConfig = () => {
  const errors = [];
  
  // Check required environment variables in production
  if (APP_CONFIG.ENVIRONMENT === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be set in production');
    }
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'your-session-secret-change-in-production') {
      errors.push('SESSION_SECRET must be set in production');
    }
  }
  
  // Check database path
  if (!APP_CONFIG.DATABASE.PATH) {
    errors.push('Database path must be configured');
  }
  
  return errors;
};

// Export configuration
const config = {
  ...APP_CONFIG,
  validate: validateConfig
};

// Export configuration
module.exports = config;
