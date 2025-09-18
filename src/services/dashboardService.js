/**
 * Dashboard Service for MoMech
 * Handles all dashboard-related API operations
 */

import apiService from './api.js';
import { objectToCamelCase } from '../utils/helpers.js';

export class DashboardService {
    constructor() {
        this.baseEndpoint = '/dashboard';
    }
    
    /**
     * Get dashboard statistics
     * @returns {Promise<object>} - Dashboard stats
     */
    async getStats() {
        const response = await apiService.get(`${this.baseEndpoint}/stats`);
        return objectToCamelCase(response);
    }
    
    /**
     * Get recent activity
     * @param {object} params - Query parameters
     * @returns {Promise<array>} - Recent activity
     */
    async getRecentActivity(params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/recent-activity`, params);
        return response.map(activity => objectToCamelCase(activity));
    }
    
    /**
     * Get upcoming appointments
     * @param {object} params - Query parameters
     * @returns {Promise<array>} - Upcoming appointments
     */
    async getUpcomingAppointments(params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/upcoming-appointments`, params);
        return response.map(appointment => objectToCamelCase(appointment));
    }
    
    /**
     * Get revenue chart data
     * @param {string} period - Time period ('week', 'month', 'year')
     * @returns {Promise<object>} - Revenue chart data
     */
    async getRevenueChart(period = 'month') {
        const response = await apiService.get(`${this.baseEndpoint}/revenue-chart`, { period });
        return {
            ...response,
            data: response.data.map(item => objectToCamelCase(item))
        };
    }
    
    /**
     * Get system alerts
     * @returns {Promise<array>} - System alerts
     */
    async getAlerts() {
        const response = await apiService.get(`${this.baseEndpoint}/alerts`);
        return response.map(alert => objectToCamelCase(alert));
    }
    
    /**
     * Get performance metrics
     * @param {string} period - Time period
     * @returns {Promise<object>} - Performance metrics
     */
    async getMetrics(period = 'month') {
        const response = await apiService.get(`${this.baseEndpoint}/metrics`, { period });
        return objectToCamelCase(response);
    }
}

// Create singleton instance
const dashboardService = new DashboardService();
export default dashboardService;