/**
 * Payment List Component
 */

import { DataTable } from '../common/table.js';
import financialService from '../../services/financialService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader } from '../../utils/pageHelpers.js';

export class PaymentList {
    constructor() {
        this.table = null;
        this.currentPage = 1;
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader('Payments', 'Payment history')}
                <div id="payments-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'payments-table',
            columns: [
                { key: 'clientName', label: 'Client', formatter: v => v || '-' },
                { key: 'invoiceNumber', label: 'Invoice', formatter: v => v || '-' },
                { key: 'paymentDate', label: 'Date', formatter: v => formatDate(v, 'short') },
                { key: 'amount', label: 'Amount', formatter: v => formatCurrency(v) },
                { key: 'paymentMethod', label: 'Method', formatter: v => v || '-' },
                { key: 'referenceNumber', label: 'Reference', formatter: v => v || '-' },
            ],
            searchable: false,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            emptyMessage: 'No payments recorded.',
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            const response = await financialService.getPayments({ page: this.currentPage, limit: 20 });
            this.table.update(response.payments, response.pagination);
        } catch (error) {
            window.showNotification('Error loading payments', 'error');
            this.table.setLoading(false);
        }
    }

    destroy() { if (this.table) this.table.destroy(); }
}
