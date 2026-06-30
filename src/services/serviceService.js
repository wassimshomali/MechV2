/**
 * Service Template Service for MoMech
 */

import apiService from './api.js';
import { objectToSnakeCase, objectToCamelCase } from '../utils/helpers.js';

class ServiceTemplateService {
    constructor() {
        this.baseEndpoint = '/services';
    }

    async getServices(params = {}) {
        const response = await apiService.get(this.baseEndpoint, params);
        return {
            ...response,
            services: response.services.map(s => objectToCamelCase(s))
        };
    }

    async getService(id) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}`);
        return objectToCamelCase(response);
    }

    async createService(data) {
        const response = await apiService.post(this.baseEndpoint, objectToSnakeCase(data));
        return objectToCamelCase(response);
    }

    async updateService(id, data) {
        const response = await apiService.put(`${this.baseEndpoint}/${id}`, objectToSnakeCase(data));
        return objectToCamelCase(response);
    }

    async deleteService(id) {
        return apiService.delete(`${this.baseEndpoint}/${id}`);
    }

    async getCategories() {
        const response = await apiService.get(`${this.baseEndpoint}/categories`);
        return response.map(c => objectToCamelCase(c));
    }
}

export default new ServiceTemplateService();
