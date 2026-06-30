/**
 * Invoice List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import financialService from '../../services/financialService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton, statusBadge } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class InvoiceList {
    constructor() {
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader(t('financial.invoicesTitle'), t('financial.invoicesSubtitle'), `
                    ${renderPrimaryButton('/financial/payments', t('financial.paymentsTitle'), 'dollar-sign')}
                    ${renderPrimaryButton('/financial/reports', t('nav.reports'), 'bar-chart-2')}
                    ${renderPrimaryButton('/financial/invoices/new', t('financial.createInvoice'))}
                `)}
                <div id="invoices-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'invoices-table',
            columns: [
                { key: 'invoiceNumber', label: t('financial.invoiceNumber') },
                { key: 'clientName', label: t('financial.client'), formatter: v => v || '-' },
                { key: 'invoiceDate', label: t('financial.date'), formatter: v => formatDate(v, 'short') },
                { key: 'totalAmount', label: t('financial.amount'), formatter: v => formatCurrency(v) },
                { key: 'balanceDue', label: t('financial.balance'), formatter: v => formatCurrency(v) },
                { key: 'status', label: t('fields.status'), formatter: v => statusBadge(v) },
                {
                    key: 'actions',
                    label: t('common.actions'),
                    actions: [
                        { name: 'view', icon: 'eye', label: t('common.view'), color: 'blue', handler: (row) => window.location.hash = `/financial/invoices/${row.id}` },
                        { name: 'delete', icon: 'trash-2', label: t('common.delete'), color: 'red', handler: (row) => this.confirmDelete(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            onRowClick: (row) => window.location.hash = `/financial/invoices/${row.id}`,
            emptyMessage: t('financial.emptyInvoices'),
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            const response = await financialService.getInvoices({ page: this.currentPage, limit: 20, search: this.currentSearch });
            this.table.update(response.invoices, response.pagination);
        } catch (error) {
            window.showNotification(t('financial.errorLoadingInvoices'), 'error');
            this.table.setLoading(false);
        }
    }

    confirmDelete(invoice) {
        Modal.confirm(t('financial.deleteInvoiceTitle'), t('financial.deleteInvoiceMessage', { number: invoice.invoiceNumber }), async () => {
            await financialService.deleteInvoice(invoice.id);
            window.showNotification(t('financial.invoiceDeleted'), 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}
