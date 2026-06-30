/**
 * Invoice List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import financialService from '../../services/financialService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton, statusBadge } from '../../utils/pageHelpers.js';

export class InvoiceList {
    constructor() {
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader('Invoices', 'Billing and payments', `
                    ${renderPrimaryButton('/financial/payments', 'Payments', 'dollar-sign')}
                    ${renderPrimaryButton('/financial/reports', 'Reports', 'bar-chart-2')}
                    ${renderPrimaryButton('/financial/invoices/new', 'Create Invoice')}
                `)}
                <div id="invoices-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'invoices-table',
            columns: [
                { key: 'invoiceNumber', label: 'Invoice #' },
                { key: 'clientName', label: 'Client', formatter: v => v || '-' },
                { key: 'invoiceDate', label: 'Date', formatter: v => formatDate(v, 'short') },
                { key: 'totalAmount', label: 'Amount', formatter: v => formatCurrency(v) },
                { key: 'balanceDue', label: 'Balance', formatter: v => formatCurrency(v) },
                { key: 'status', label: 'Status', formatter: v => statusBadge(v) },
                {
                    key: 'actions',
                    label: 'Actions',
                    actions: [
                        { name: 'view', icon: 'eye', label: 'View', color: 'blue', handler: (row) => window.location.hash = `/financial/invoices/${row.id}` },
                        { name: 'delete', icon: 'trash-2', label: 'Delete', color: 'red', handler: (row) => this.confirmDelete(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            onRowClick: (row) => window.location.hash = `/financial/invoices/${row.id}`,
            emptyMessage: 'No invoices found.',
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            const response = await financialService.getInvoices({ page: this.currentPage, limit: 20, search: this.currentSearch });
            this.table.update(response.invoices, response.pagination);
        } catch (error) {
            window.showNotification('Error loading invoices', 'error');
            this.table.setLoading(false);
        }
    }

    confirmDelete(invoice) {
        Modal.confirm('Delete Invoice', `Delete invoice ${invoice.invoiceNumber}?`, async () => {
            await financialService.deleteInvoice(invoice.id);
            window.showNotification('Invoice deleted', 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}
