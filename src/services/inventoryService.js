/**
 * Inventory Service for MoMech
 * Handles all inventory-related API operations
 */

import apiService from './api.js';
import { objectToSnakeCase, objectToCamelCase } from '../utils/helpers.js';

export class InventoryService {
    constructor() {
        this.baseEndpoint = '/inventory';
    }
    
    /**
     * Get all inventory items with pagination and filtering
     * @param {object} params - Query parameters
     * @returns {Promise<object>} - Inventory data with pagination
     */
    async getInventoryItems(params = {}) {
        const response = await apiService.get(this.baseEndpoint, params);
        return {
            ...response,
            items: response.items.map(item => objectToCamelCase(item))
        };
    }
    
    /**
     * Get inventory item by ID
     * @param {number} id - Item ID
     * @returns {Promise<object>} - Item data
     */
    async getInventoryItem(id) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}`);
        return objectToCamelCase(response);
    }
    
    /**
     * Create new inventory item
     * @param {object} itemData - Item data
     * @returns {Promise<object>} - Created item
     */
    async createInventoryItem(itemData) {
        const data = objectToSnakeCase(itemData);
        const response = await apiService.post(this.baseEndpoint, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Update inventory item
     * @param {number} id - Item ID
     * @param {object} itemData - Updated item data
     * @returns {Promise<object>} - Updated item
     */
    async updateInventoryItem(id, itemData) {
        const data = objectToSnakeCase(itemData);
        const response = await apiService.put(`${this.baseEndpoint}/${id}`, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Delete inventory item
     * @param {number} id - Item ID
     * @returns {Promise<object>} - Delete confirmation
     */
    async deleteInventoryItem(id) {
        return await apiService.delete(`${this.baseEndpoint}/${id}`);
    }
    
    /**
     * Get low stock items
     * @param {object} params - Query parameters
     * @returns {Promise<array>} - Low stock items
     */
    async getLowStockItems(params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/low-stock`, params);
        return response.map(item => objectToCamelCase(item));
    }
    
    /**
     * Adjust inventory stock
     * @param {number} id - Item ID
     * @param {object} adjustmentData - Adjustment data
     * @returns {Promise<object>} - Updated item
     */
    async adjustStock(id, adjustmentData) {
        const data = objectToSnakeCase(adjustmentData);
        const response = await apiService.post(`${this.baseEndpoint}/${id}/adjust`, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Get inventory categories
     * @returns {Promise<array>} - Categories
     */
    async getCategories() {
        const response = await apiService.get(`${this.baseEndpoint}/categories`);
        return response.map(category => objectToCamelCase(category));
    }
    
    /**
     * Search inventory items
     * @param {string} query - Search query
     * @param {object} params - Additional parameters
     * @returns {Promise<array>} - Search results
     */
    async searchItems(query, params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/search`, { q: query, ...params });
        return response.map(item => objectToCamelCase(item));
    }
}

// Create singleton instance
const inventoryService = new InventoryService();
export default inventoryService;