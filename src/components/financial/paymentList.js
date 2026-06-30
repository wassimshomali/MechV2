/**
 * Payment List Component
 */

import { DataTable } from '../common/table.js';
import financialService from '../../services/financialService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class PaymentList {
    constructor() {
        this.table = null;
        this.currentPage = 1;
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader(t('financial.paymentsTitle'), t('financial.paymentsSubtitle'))}
                <div id="payments-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'payments-table',
            columns: [
                { key: 'clientName', label: t('financial.client'), formatter: v => v || '-' },
                { key: 'invoiceNumber', label: t('financial.invoice'), formatter: v => v || '-' },
                { key: 'paymentDate', label: t('financial.date'), formatter: v => formatDate(v, 'short') },
                { key: 'amount', label: t('financial.amount'), formatter: v => formatCurrency(v) },
                { key: 'paymentMethod', label: t('financial.method'), formatter: v => v || '-' },
                { key: 'referenceNumber', label: t('financial.reference'), formatter: v => v || '-' },
            ],
            searchable: false,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            emptyMessage: t('financial.emptyPayments'),
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            const response = await financialService.getPayments({ page: this.currentPage, limit: 20 });
            this.table.update(response.payments, response.pagination);
        } catch (error) {
            window.showNotification(t('financial.errorLoadingPayments'), 'error');
            this.table.setLoading(false);
        }
    }

    destroy() { if (this.table) this.table.destroy(); }
}
