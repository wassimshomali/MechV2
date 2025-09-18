/**
 * API Configuration for MoMech
 * Centralized API endpoints and configuration
 */

const API_CONFIG = {
  // Base configuration
  BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  API_VERSION: 'v1',
  TIMEOUT: 10000, // 10 seconds
  
  // API Base paths
  get API_BASE() {
    return `${this.BASE_URL}/api/${this.API_VERSION}`;
  },

  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },

  // Client management endpoints
  CLIENTS: {
    BASE: '/clients',
    BY_ID: (id) => `/clients/${id}`,
    SEARCH: '/clients/search',
    VEHICLES: (id) => `/clients/${id}/vehicles`,
    APPOINTMENTS: (id) => `/clients/${id}/appointments`,
    INVOICES: (id) => `/clients/${id}/invoices`,
    HISTORY: (id) => `/clients/${id}/history`,
    EXPORT: '/clients/export'
  },

  // Vehicle management endpoints
  VEHICLES: {
    BASE: '/vehicles',
    BY_ID: (id) => `/vehicles/${id}`,
    SEARCH: '/vehicles/search',
    BY_CLIENT: (clientId) => `/vehicles/client/${clientId}`,
    SERVICE_HISTORY: (id) => `/vehicles/${id}/service-history`,
    MAINTENANCE_SCHEDULE: (id) => `/vehicles/${id}/maintenance-schedule`,
    DOCUMENTS: (id) => `/vehicles/${id}/documents`,
    QR_CODE: (id) => `/vehicles/${id}/qr-code`
  },

  // Appointment management endpoints
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id) => `/appointments/${id}`,
    TODAY: '/appointments/today',
    WEEK: '/appointments/week',
    MONTH: '/appointments/month',
    CALENDAR: (date) => `/appointments/calendar/${date}`,
    BY_CLIENT: (clientId) => `/appointments/client/${clientId}`,
    BY_VEHICLE: (vehicleId) => `/appointments/vehicle/${vehicleId}`,
    AVAILABLE_SLOTS: '/appointments/available-slots',
    RESCHEDULE: (id) => `/appointments/${id}/reschedule`,
    CANCEL: (id) => `/appointments/${id}/cancel`,
    COMPLETE: (id) => `/appointments/${id}/complete`
  },

  // Inventory management endpoints
  INVENTORY: {
    BASE: '/inventory',
    BY_ID: (id) => `/inventory/${id}`,
    SEARCH: '/inventory/search',
    LOW_STOCK: '/inventory/low-stock',
    CATEGORIES: '/inventory/categories',
    SUPPLIERS: '/inventory/suppliers',
    MOVEMENTS: '/inventory/movements',
    BULK_UPDATE: '/inventory/bulk-update',
    EXPORT: '/inventory/export',
    IMPORT: '/inventory/import'
  },

  // Financial management endpoints
  FINANCIAL: {
    // Invoices
    INVOICES: {
      BASE: '/invoices',
      BY_ID: (id) => `/invoices/${id}`,
      BY_CLIENT: (clientId) => `/invoices/client/${clientId}`,
      PENDING: '/invoices/pending',
      OVERDUE: '/invoices/overdue',
      GENERATE: '/invoices/generate',
      SEND: (id) => `/invoices/${id}/send`,
      DOWNLOAD: (id) => `/invoices/${id}/download`,
      MARK_PAID: (id) => `/invoices/${id}/mark-paid`
    },
    
    // Payments
    PAYMENTS: {
      BASE: '/payments',
      BY_ID: (id) => `/payments/${id}`,
      BY_INVOICE: (invoiceId) => `/payments/invoice/${invoiceId}`,
      METHODS: '/payments/methods',
      PROCESS: '/payments/process',
      REFUND: (id) => `/payments/${id}/refund`
    },
    
    // Reports
    REPORTS: {
      REVENUE: '/reports/revenue',
      EXPENSES: '/reports/expenses',
      PROFIT_LOSS: '/reports/profit-loss',
      TAX_SUMMARY: '/reports/tax-summary',
      CUSTOM: '/reports/custom'
    }
  },

  // Service management endpoints
  SERVICES: {
    BASE: '/services',
    BY_ID: (id) => `/services/${id}`,
    CATEGORIES: '/services/categories',
    TEMPLATES: '/services/templates',
    PRICING: '/services/pricing',
    LABOR_RATES: '/services/labor-rates'
  },

  // User management endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    PROFILE: '/users/profile',
    SETTINGS: '/users/settings',
    PERMISSIONS: '/users/permissions',
    ACTIVITY_LOG: '/users/activity-log'
  },

  // File upload endpoints
  UPLOADS: {
    BASE: '/uploads',
    IMAGES: '/uploads/images',
    DOCUMENTS: '/uploads/documents',
    AVATARS: '/uploads/avatars',
    VEHICLE_PHOTOS: '/uploads/vehicle-photos',
    INVOICES: '/uploads/invoices'
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    SEND_EMAIL: '/notifications/email',
    SEND_SMS: '/notifications/sms',
    TEMPLATES: '/notifications/templates',
    SETTINGS: '/notifications/settings'
  },

  // QR Code endpoints
  QR_CODES: {
    GENERATE: '/qr/generate',
    SCAN: '/qr/scan',
    VEHICLE: (id) => `/qr/vehicle/${id}`,
    CLIENT: (id) => `/qr/client/${id}`
  },

  // Dashboard and analytics endpoints
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
    UPCOMING_APPOINTMENTS: '/dashboard/upcoming-appointments',
    REVENUE_CHART: '/dashboard/revenue-chart',
    ALERTS: '/dashboard/alerts'
  },

  // System endpoints
  SYSTEM: {
    HEALTH: '/system/health',
    VERSION: '/system/version',
    BACKUP: '/system/backup',
    RESTORE: '/system/restore',
    LOGS: '/system/logs'
  }
};

// HTTP Methods
const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
};

// Request headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Response status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error messages
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An internal server error occurred.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.'
};

// API rate limiting
const RATE_LIMITS = {
  DEFAULT: {
    requests: 100,
    window: 15 * 60 * 1000 // 15 minutes
  },
  AUTH: {
    requests: 10,
    window: 15 * 60 * 1000 // 15 minutes
  },
  UPLOADS: {
    requests: 20,
    window: 60 * 60 * 1000 // 1 hour
  }
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// File upload limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES_PER_REQUEST: 5
};

// Export configuration
const config = {
  API_CONFIG,
  HTTP_METHODS,
  DEFAULT_HEADERS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  RATE_LIMITS,
  PAGINATION,
  UPLOAD_LIMITS
};

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = config;
} else {
  // Browser environment
  window.MoMechAPI = config;
}

export default config;
