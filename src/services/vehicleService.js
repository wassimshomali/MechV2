/**
 * Vehicle Service for MoMech
 * Handles all vehicle-related API operations
 */

import apiService from './api.js';
import { objectToSnakeCase, objectToCamelCase } from '../utils/helpers.js';

export class VehicleService {
    constructor() {
        this.baseEndpoint = '/vehicles';
    }
    
    /**
     * Get all vehicles with pagination and filtering
     * @param {object} params - Query parameters
     * @returns {Promise<object>} - Vehicles data with pagination
     */
    async getVehicles(params = {}) {
        const response = await apiService.get(this.baseEndpoint, params);
        return {
            ...response,
            vehicles: response.vehicles.map(vehicle => objectToCamelCase(vehicle))
        };
    }
    
    /**
     * Get vehicle by ID
     * @param {number} id - Vehicle ID
     * @returns {Promise<object>} - Vehicle data
     */
    async getVehicle(id) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}`);
        return objectToCamelCase(response);
    }
    
    /**
     * Create new vehicle
     * @param {object} vehicleData - Vehicle data
     * @returns {Promise<object>} - Created vehicle
     */
    async createVehicle(vehicleData) {
        const data = objectToSnakeCase(vehicleData);
        const response = await apiService.post(this.baseEndpoint, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Update vehicle
     * @param {number} id - Vehicle ID
     * @param {object} vehicleData - Updated vehicle data
     * @returns {Promise<object>} - Updated vehicle
     */
    async updateVehicle(id, vehicleData) {
        const data = objectToSnakeCase(vehicleData);
        const response = await apiService.put(`${this.baseEndpoint}/${id}`, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Delete vehicle
     * @param {number} id - Vehicle ID
     * @returns {Promise<object>} - Delete confirmation
     */
    async deleteVehicle(id) {
        return await apiService.delete(`${this.baseEndpoint}/${id}`);
    }
    
    /**
     * Get vehicle service history
     * @param {number} id - Vehicle ID
     * @param {object} params - Query parameters
     * @returns {Promise<array>} - Service history
     */
    async getVehicleServiceHistory(id, params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}/service-history`, params);
        return response.map(record => objectToCamelCase(record));
    }
    
    /**
     * Get vehicle appointments
     * @param {number} id - Vehicle ID
     * @param {object} params - Query parameters
     * @returns {Promise<array>} - Vehicle appointments
     */
    async getVehicleAppointments(id, params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}/appointments`, params);
        return response.map(appointment => objectToCamelCase(appointment));
    }
    
    /**
     * Search vehicles
     * @param {string} query - Search query
     * @param {object} params - Additional parameters
     * @returns {Promise<array>} - Search results
     */
    async searchVehicles(query, params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/search`, { q: query, ...params });
        return response.map(vehicle => objectToCamelCase(vehicle));
    }
}

// Create singleton instance
const vehicleService = new VehicleService();
export default vehicleService;