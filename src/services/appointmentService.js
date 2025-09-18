/**
 * Appointment Service for MoMech
 * Handles all appointment-related API operations
 */

import apiService from './api.js';
import { objectToSnakeCase, objectToCamelCase } from '../utils/helpers.js';

export class AppointmentService {
    constructor() {
        this.baseEndpoint = '/appointments';
    }
    
    /**
     * Get all appointments with pagination and filtering
     * @param {object} params - Query parameters
     * @returns {Promise<object>} - Appointments data with pagination
     */
    async getAppointments(params = {}) {
        const response = await apiService.get(this.baseEndpoint, params);
        return {
            ...response,
            appointments: response.appointments.map(appointment => objectToCamelCase(appointment))
        };
    }
    
    /**
     * Get appointment by ID
     * @param {number} id - Appointment ID
     * @returns {Promise<object>} - Appointment data
     */
    async getAppointment(id) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}`);
        return objectToCamelCase(response);
    }
    
    /**
     * Create new appointment
     * @param {object} appointmentData - Appointment data
     * @returns {Promise<object>} - Created appointment
     */
    async createAppointment(appointmentData) {
        const data = objectToSnakeCase(appointmentData);
        const response = await apiService.post(this.baseEndpoint, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Update appointment
     * @param {number} id - Appointment ID
     * @param {object} appointmentData - Updated appointment data
     * @returns {Promise<object>} - Updated appointment
     */
    async updateAppointment(id, appointmentData) {
        const data = objectToSnakeCase(appointmentData);
        const response = await apiService.put(`${this.baseEndpoint}/${id}`, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Cancel appointment
     * @param {number} id - Appointment ID
     * @returns {Promise<object>} - Cancellation confirmation
     */
    async cancelAppointment(id) {
        return await apiService.delete(`${this.baseEndpoint}/${id}`);
    }
    
    /**
     * Get today's appointments
     * @returns {Promise<array>} - Today's appointments
     */
    async getTodayAppointments() {
        const response = await apiService.get(`${this.baseEndpoint}/today`);
        return response.map(appointment => objectToCamelCase(appointment));
    }
    
    /**
     * Get calendar data for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} view - Calendar view ('week' or 'month')
     * @returns {Promise<object>} - Calendar data
     */
    async getCalendarData(date, view = 'month') {
        const response = await apiService.get(`${this.baseEndpoint}/calendar/${date}`, { view });
        return {
            ...response,
            appointments: response.appointments.map(appointment => objectToCamelCase(appointment))
        };
    }
    
    /**
     * Update appointment status
     * @param {number} id - Appointment ID
     * @param {string} status - New status
     * @param {string} notes - Optional notes
     * @returns {Promise<object>} - Updated appointment
     */
    async updateAppointmentStatus(id, status, notes = null) {
        const response = await apiService.put(`${this.baseEndpoint}/${id}/status`, { status, notes });
        return objectToCamelCase(response);
    }
}

// Create singleton instance
const appointmentService = new AppointmentService();
export default appointmentService;