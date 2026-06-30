/**
 * Client Service for MoMech
 * Handles all client-related API operations
 */

import apiService from './api.js';
import { objectToSnakeCase, objectToCamelCase } from '../utils/helpers.js';

export class ClientService {
    constructor() {
        this.baseEndpoint = '/clients';
    }
    
    /**
     * Get all clients with pagination and filtering
     * @param {object} params - Query parameters
     * @returns {Promise<object>} - Clients data with pagination
     */
    async getClients(params = {}) {
        const response = await apiService.get(this.baseEndpoint, params);
        return {
            ...response,
            clients: response.clients.map(client => objectToCamelCase(client))
        };
    }
    
    /**
     * Get client by ID
     * @param {number} id - Client ID
     * @returns {Promise<object>} - Client data
     */
    async getClient(id) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}`);
        return objectToCamelCase(response);
    }
    
    /**
     * Create new client
     * @param {object} clientData - Client data
     * @returns {Promise<object>} - Created client
     */
    async createClient(clientData) {
        const data = objectToSnakeCase(clientData);
        const response = await apiService.post(this.baseEndpoint, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Update client
     * @param {number} id - Client ID
     * @param {object} clientData - Updated client data
     * @returns {Promise<object>} - Updated client
     */
    async updateClient(id, clientData) {
        const data = objectToSnakeCase(clientData);
        const response = await apiService.put(`${this.baseEndpoint}/${id}`, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Delete client
     * @param {number} id - Client ID
     * @returns {Promise<object>} - Delete confirmation
     */
    async deleteClient(id) {
        return await apiService.delete(`${this.baseEndpoint}/${id}`);
    }
    
    /**
     * Get client's vehicles
     * @param {number} id - Client ID
     * @returns {Promise<array>} - Client's vehicles
     */
    async getClientVehicles(id) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}/vehicles`);
        return response.map(vehicle => objectToCamelCase(vehicle));
    }
    
    /**
     * Get client's appointments
     * @param {number} id - Client ID
     * @param {object} params - Query parameters
     * @returns {Promise<array>} - Client's appointments
     */
    async getClientAppointments(id, params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}/appointments`, params);
        return response.map(appointment => objectToCamelCase(appointment));
    }
    
    /**
     * Search clients
     * @param {string} query - Search query
     * @param {object} params - Additional parameters
     * @returns {Promise<array>} - Search results
     */
    async searchClients(query, params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/search`, { q: query, ...params });
        return response.map(client => objectToCamelCase(client));
    }
    
    /**
     * Get client statistics
     * @param {number} id - Client ID
     * @returns {Promise<object>} - Client statistics
     */
    async getClientStats(id) {
        // This would be a custom endpoint for client statistics
        // For now, we'll calculate from existing data
        const client = await this.getClient(id);
        const vehicles = await this.getClientVehicles(id);
        const appointments = await this.getClientAppointments(id, { limit: 100 });
        
        const totalSpent = client.serviceHistory?.totalSpent || 0;
        const totalServices = client.serviceHistory?.totalServices || 0;
        const lastServiceDate = client.serviceHistory?.lastServiceDate;
        
        return {
            totalVehicles: vehicles.length,
            totalAppointments: appointments.length,
            totalSpent,
            totalServices,
            lastServiceDate,
            averageSpentPerService: totalServices > 0 ? totalSpent / totalServices : 0,
            customerSince: client.createdAt
        };
    }
}

// Create singleton instance
const clientService = new ClientService();
export default clientService;