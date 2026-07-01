/**
 * Browser-safe API configuration (generated from config/ports.js)
 */
import { RUNTIME } from './runtime.js';

export const API_BASE = RUNTIME.API_BASE;
export const TIMEOUT = 10000;

export const ENDPOINTS = {
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
    UPCOMING_APPOINTMENTS: '/dashboard/upcoming-appointments',
    ALERTS: '/dashboard/alerts',
  },
  CLIENTS: {
    BASE: '/clients',
    BY_ID: (id) => `/clients/${id}`,
  },
  VEHICLES: {
    BASE: '/vehicles',
    SERVICE_HISTORY: '/vehicles/service-history',
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    TODAY: '/appointments/today',
  },
  INVENTORY: {
    BASE: '/inventory',
    LOW_STOCK: '/inventory/low-stock',
  },
  FINANCIAL: {
    INVOICES: '/financial/invoices',
    PAYMENTS: '/financial/payments',
  },
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'An internal server error occurred.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
};

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};
