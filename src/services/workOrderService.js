/**
 * Work Order Service for MoMech
 */

import apiService from './api.js';
import { objectToSnakeCase, objectToCamelCase } from '../utils/helpers.js';

class WorkOrderService {
    constructor() {
        this.baseEndpoint = '/work-orders';
    }

    async getWorkOrders(params = {}) {
        const response = await apiService.get(this.baseEndpoint, params);
        return {
            ...response,
            workOrders: response.workOrders.map(wo => objectToCamelCase(wo))
        };
    }

    async getWorkOrder(id) {
        const response = await apiService.get(`${this.baseEndpoint}/${id}`);
        return objectToCamelCase(response);
    }

    async createWorkOrder(data) {
        const response = await apiService.post(this.baseEndpoint, objectToSnakeCase(data));
        return objectToCamelCase(response);
    }

    async updateWorkOrder(id, data) {
        const response = await apiService.put(`${this.baseEndpoint}/${id}`, objectToSnakeCase(data));
        return objectToCamelCase(response);
    }

    async deleteWorkOrder(id) {
        return apiService.delete(`${this.baseEndpoint}/${id}`);
    }
}

export default new WorkOrderService();
