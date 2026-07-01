import api from './api.js';
import { ENDPOINTS } from '../config/api.js';

export async function fetchDashboardStats() {
  return api.get(ENDPOINTS.DASHBOARD.STATS);
}

export async function fetchRecentActivity(limit = 10) {
  return api.get(ENDPOINTS.DASHBOARD.RECENT_ACTIVITY, { limit });
}

export async function fetchUpcomingAppointments(limit = 5) {
  return api.get(ENDPOINTS.DASHBOARD.UPCOMING_APPOINTMENTS, { limit });
}

export async function fetchDashboardAlerts() {
  return api.get(ENDPOINTS.DASHBOARD.ALERTS);
}
