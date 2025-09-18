/**
 * Financial Service for MoMech
 * Handles all financial-related API operations (invoices, payments, reports)
 */

import apiService from './api.js';
import { objectToSnakeCase, objectToCamelCase } from '../utils/helpers.js';

export class FinancialService {
    constructor() {
        this.baseEndpoint = '/financial';
    }
    
    /**
     * Get all invoices with pagination and filtering
     * @param {object} params - Query parameters
     * @returns {Promise<object>} - Invoices data with pagination
     */
    async getInvoices(params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/invoices`, params);
        return {
            ...response,
            invoices: response.invoices.map(invoice => objectToCamelCase(invoice))
        };
    }
    
    /**
     * Get invoice by ID
     * @param {number} id - Invoice ID
     * @returns {Promise<object>} - Invoice data
     */
    async getInvoice(id) {
        const response = await apiService.get(`${this.baseEndpoint}/invoices/${id}`);
        return objectToCamelCase(response);
    }
    
    /**
     * Create new invoice
     * @param {object} invoiceData - Invoice data
     * @returns {Promise<object>} - Created invoice
     */
    async createInvoice(invoiceData) {
        const data = objectToSnakeCase(invoiceData);
        const response = await apiService.post(`${this.baseEndpoint}/invoices`, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Update invoice
     * @param {number} id - Invoice ID
     * @param {object} invoiceData - Updated invoice data
     * @returns {Promise<object>} - Updated invoice
     */
    async updateInvoice(id, invoiceData) {
        const data = objectToSnakeCase(invoiceData);
        const response = await apiService.put(`${this.baseEndpoint}/invoices/${id}`, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Delete invoice
     * @param {number} id - Invoice ID
     * @returns {Promise<object>} - Delete confirmation
     */
    async deleteInvoice(id) {
        return await apiService.delete(`${this.baseEndpoint}/invoices/${id}`);
    }
    
    /**
     * Send invoice to client
     * @param {number} id - Invoice ID
     * @returns {Promise<object>} - Updated invoice
     */
    async sendInvoice(id) {
        const response = await apiService.post(`${this.baseEndpoint}/invoices/${id}/send`);
        return objectToCamelCase(response);
    }
    
    /**
     * Get all payments with pagination and filtering
     * @param {object} params - Query parameters
     * @returns {Promise<object>} - Payments data with pagination
     */
    async getPayments(params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/payments`, params);
        return {
            ...response,
            payments: response.payments.map(payment => objectToCamelCase(payment))
        };
    }
    
    /**
     * Record new payment
     * @param {object} paymentData - Payment data
     * @returns {Promise<object>} - Created payment
     */
    async recordPayment(paymentData) {
        const data = objectToSnakeCase(paymentData);
        const response = await apiService.post(`${this.baseEndpoint}/payments`, data);
        return objectToCamelCase(response);
    }
    
    /**
     * Get revenue reports
     * @param {object} params - Query parameters
     * @returns {Promise<object>} - Revenue report data
     */
    async getRevenueReport(params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/reports/revenue`, params);
        return {
            ...response,
            data: response.data.map(item => objectToCamelCase(item))
        };
    }
    
    /**
     * Get outstanding invoices report
     * @param {object} params - Query parameters
     * @returns {Promise<object>} - Outstanding invoices report
     */
    async getOutstandingReport(params = {}) {
        const response = await apiService.get(`${this.baseEndpoint}/reports/outstanding`, params);
        return {
            ...response,
            invoices: response.invoices.map(invoice => objectToCamelCase(invoice))
        };
    }
}

// Create singleton instance
const financialService = new FinancialService();
export default financialService;